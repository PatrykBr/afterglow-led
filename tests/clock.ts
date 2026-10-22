import { install } from '@sinonjs/fake-timers';

export type TestClock = ReturnType<typeof install>;

// Bun's native runner owns mocks and assertions. This clock also flushes Promise
// continuations between timers, which the BLE deadline/hold tests require.
export function installClock(): TestClock {
  return install({ now: 0, toFake: ['Date', 'setTimeout', 'clearTimeout'] });
}
