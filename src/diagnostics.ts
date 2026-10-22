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
        app: 'Afterglow 1.5.1',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'test',
        note: 'The strip does not confirm command delivery. Device identifiers are not recorded.',
        entries: this.entries,
      },
      null,
      2,
    );
  }
}
