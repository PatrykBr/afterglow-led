# Architecture decisions

## One session owner

`app-service.ts` constructs the controller and session outside React. `useSyncExternalStore` reads cached immutable snapshots. StrictMode, renders, subscriptions and local preference restoration cannot open a device or submit a command. Only explicit event handlers request permission or send lighting commands.

The connection states are disconnected, connecting, connected and disconnecting. Queue depth is separate. Permission selection has no artificial deadline while the owner is choosing a device. Connection and discovery have a 15-second deadline after selection. Reconnect retains the browser device object when available and discovers new GATT objects. Connect and reconnect never replay lighting intent.

Service and characteristic identities are compared after UUID normalization. Equivalent 16-bit, zero-padded 32-bit and full 128-bit forms resolve to the same Bluetooth identity. This accommodates native browser bridges without changing the requested EEA0 service or EE01 characteristic. Wrong identities, malformed UUIDs and missing write-without-response capability still fail closed. Diagnostics record the reported and normalized service and characteristic UUIDs.

## Intent and delivery

Selected RGB and brightness, requested power, last submitted settings and connection state are separate. Only selection and favourites are persisted. Requested power starts unknown on every page load because it is not a device reading. While Off is requested, all colour interactions prepare settings locally. On explicitly includes the current selection. There is no Apply action.

One scheduler serializes writes, leaves at least 80 ms after a completed write, and replaces only trailing unsent colour work. Off removes all unsent colour jobs. It preserves the order of power requests and cannot unsend an in-flight browser write. The queue is limited to 40 pending requests; excess input gets feedback instead of silently dropping power commands. The UI sends slider values on release, keyboard release or blur, once per edit. It does not continuously stream drag updates.

Each session and scheduler activation has a generation. Stop, link loss, timeout and explicit disconnect invalidate it, abort bounded waits and cancel the queue. A late browser completion cannot submit another write or change the new connection state. The browser cannot cancel an already submitted without-response write, so that result is uncertain. There are no automatic lighting retries. A stale connection completion is disconnected when there is no newer attempt; it cannot tear down a newer active connection.

New activations clear old write promises and activity times. A completed browser write updates timing only while it is the current tracked write. A late connection to a different, previously selected device is disconnected even if the new device is connected.

## Teardown

Normal disconnect stops new work, cancels pending jobs, waits for an in-flight browser write to settle with an 8-second bound, then preserves a 3-second hold after the last observed write activity. It waits up to 1.2 seconds for the disconnect event. An error or lost link invalidates immediately. The normal hold cannot guarantee delivery of a browser write that never completes. Closing or suspending iOS can interrupt any JavaScript timer. `pagehide` requests a best-effort normal disconnect; returning to the page checks the GATT link and never replays commands.

## Local data and hosting

The local schema has version 1, validated selected settings and at most 30 uniquely identified favourites. Names have 1 to 40 characters. Invalid, inaccessible or full storage produces a notice and leaves in-memory controls usable. No saved state can trigger transport work.

Unchanged selections do not rewrite storage, including release after a saved draft. Explicit repeated commands still submit. A commit retries a failed save. Cancelled pointer edits remain saved locally and do not submit later on blur.

The HTTPS host serves assets. All Bluetooth work stays in the phone browser. There is no backend or service worker, no account-dependent favourites and no background scheduling claim. The bounded diagnostic log is kept only in page memory and exported when requested.

## Toolchain and selected interface

The owner chose the colour wheel. The alternative views, layout state and chooser are removed. Existing lighting preferences retain their version 1 schema. Bun 1.4.4 owns installation, scripts, development serving, production bundling, native type checking, formatting, tests and coverage. Test-only async fake timers preserve lifecycle timing semantics. See BUN_TOOLCHAIN.md for implementation and runtime boundaries.
