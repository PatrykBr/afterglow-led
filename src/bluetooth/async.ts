export class DeadlineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeadlineError';
  }
}
export class CancelledError extends Error {
  constructor() {
    super('Cancelled');
    this.name = 'CancelledError';
  }
}
export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));

export function bounded<T>(work: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => finish(() => reject(new DeadlineError('The operation timed out.'))),
      ms,
    );
    const abort = () => finish(() => reject(new CancelledError()));
    const finish = (callback: () => void) => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      callback();
    };
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    work.then(
      (value) => finish(() => resolve(value)),
      (error) => finish(() => reject(error)),
    );
  });
}
