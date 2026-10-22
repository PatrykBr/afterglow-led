export type Diagnostic = { time: string; event: string; detail?: string };
export class Diagnostics {
  private entries: Diagnostic[] = [];
  add(event: string, detail?: string) {
    this.entries.push({ time: new Date().toISOString(), event, detail });
    this.entries = this.entries.slice(-100);
  }
  export() {
    return JSON.stringify(
      {
        app: 'Afterglow 1.5.0',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'test',
        note: 'Commands are submitted without device acknowledgement. No device identifiers are recorded.',
        entries: this.entries,
      },
      null,
      2,
    );
  }
}
