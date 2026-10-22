import { encode, packetHex, type Command } from '../protocol/bojia';
import { bounded, CancelledError, delay } from './async';
import type { Diagnostics } from '../diagnostics';

export type Outcome = {
  status: 'submitted' | 'cancelled' | 'uncertain' | 'failed';
  command: Command;
  message?: string;
};
type Job = { command: Command; resolve: (outcome: Outcome) => void };
type Writer = (bytes: Uint8Array<ArrayBuffer>) => Promise<void>;

/** The only writer. Each activation has its own generation and cancellation signal. */
export class CommandScheduler {
  private queue: Job[] = [];
  private writer?: Writer;
  private generation = 0;
  private abort = new AbortController();
  private activeRun?: number;
  private rawWrite?: Promise<void>;
  lastActivity: number | null = null;
  private lastCompletion = -Infinity;
  constructor(
    private diagnostics: Diagnostics,
    private fault: (message: string) => void,
    private changed: (pending: number) => void = () => {},
  ) {}

  activate(writer: Writer) {
    this.stop();
    this.rawWrite = undefined;
    this.lastActivity = null;
    this.lastCompletion = -Infinity;
    this.writer = writer;
    this.abort = new AbortController();
  }

  stop() {
    this.generation++;
    this.writer = undefined;
    this.abort.abort();
    this.queue
      .splice(0)
      .forEach((job) => job.resolve({ status: 'cancelled', command: job.command }));
    this.changed(0);
  }

  enqueue(command: Command): Promise<Outcome> {
    if (!this.writer)
      return Promise.resolve({
        status: 'failed',
        command,
        message: 'Connect before sending a command.',
      });
    if (command.kind === 'off') this.cancelColours();
    const tail = this.queue.at(-1);
    if (command.kind === 'colour' && tail?.command.kind === 'colour') {
      this.queue.pop()!.resolve({ status: 'cancelled', command: tail.command });
    }
    if (this.queue.length >= 40)
      return Promise.resolve({
        status: 'failed',
        command,
        message: 'Too many pending commands. Wait for the current commands to finish.',
      });
    return new Promise((resolve) => {
      this.queue.push({ command, resolve });
      this.changed(this.queue.length + (this.rawWrite ? 1 : 0));
      void this.drain();
    });
  }

  private cancelColours() {
    this.queue = this.queue.filter((job) => {
      if (job.command.kind !== 'colour') return true;
      job.resolve({ status: 'cancelled', command: job.command });
      return false;
    });
  }

  async settle() {
    // Cancellation cannot cancel a browser write already in progress.
    if (this.rawWrite) await bounded(this.rawWrite, 8000).catch(() => {});
  }

  private async drain() {
    const generation = this.generation;
    if (this.activeRun === generation || !this.writer) return;
    this.activeRun = generation;
    const signal = this.abort.signal;
    while (generation === this.generation && this.queue.length) {
      // Leave a waiting job in the queue so Off can remove it during spacing.
      try {
        await bounded(delay(Math.max(0, this.lastCompletion + 80 - Date.now())), 1000, signal);
      } catch {
        break;
      }
      if (generation !== this.generation || !this.writer) break;
      const job = this.queue.shift();
      if (!job) break;
      let started = false;
      try {
        const bytes = encode(job.command);
        started = true;
        this.lastActivity = Date.now();
        this.diagnostics.add('write-start', `${job.command.kind}: ${packetHex(bytes)}`);
        const raw = Promise.resolve(this.writer(bytes));
        this.rawWrite = raw;
        // Track actual completion for a normal disconnect, including cancelled writes.
        const completed = () => {
          if (this.rawWrite === raw) {
            this.lastActivity = Date.now();
            this.rawWrite = undefined;
          }
        };
        void raw.then(completed, completed);
        await bounded(raw, 8000, signal);
        if (generation !== this.generation) throw new CancelledError();
        this.lastCompletion = Date.now();
        this.diagnostics.add('write-submitted', job.command.kind);
        job.resolve({ status: 'submitted', command: job.command });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Write failed.';
        job.resolve({ status: started ? 'uncertain' : 'failed', command: job.command, message });
        if (generation === this.generation) {
          this.diagnostics.add('write-uncertain', message);
          this.stop();
          this.fault(
            'The command may have reached the strip. Check the lights before reconnecting. No automatic retry was made.',
          );
        }
        break;
      }
      if (generation === this.generation) this.changed(this.queue.length);
    }
    if (this.activeRun === generation) this.activeRun = undefined;
  }
}
