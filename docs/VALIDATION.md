# Validation record

Date: 2026-10-21.

## Software checks

Windows, Node.js 24.19.0. `npm run check` passed 45 tests and built production assets with Vite 7.3.7. Tests use a simulated GATT peripheral and controlled Vitest timers. They do not verify radio delivery or LED output.

Covered: golden colour, Off and full On bytes; floor rounding; invalid RGB and brightness; colour conversions; validated preferences; corrupt or unavailable storage; discovery options; verified write capability; connection without writes; repeated commands using one chooser; fresh GATT discovery after reconnect; no replay; queue spacing and coalescing; Off cancellation and power ordering; last-write hold; in-flight disconnect timing; asynchronous disconnect confirmation; write and connection deadlines; chooser cancellation and denial; link loss; late completion after a new session; disconnected selection; no restoration/subscription writes; favourites add, rename, replace and delete; Off prepares the next On selection.

The desktop browser QA tab used a simulated Web Bluetooth object. Connect generated one chooser request and zero writes. Apply, Off, colour and brightness edits while Off, then On generated exactly three frames. The On frame contained the latest prepared RGB and brightness, with no second chooser. A real browser permission prompt and actual BLE radio were not used in this QA test.

Browser checks at 320-pixel and 390-pixel phone widths, and a 1280-pixel desktop width, found no horizontal overflow. The app loaded without application console errors. Creating a named favourite stored it locally without an additional Bluetooth write. Quick levels and presets have at least 44-pixel touch targets. A keyboard arrow adjusts the hue and saves the new disconnected selection locally.

Production publication succeeded. The public HTTPS root returned HTTP 200 without sign-in, loaded the built application assets, and allowed Bluetooth under the browser's Permissions-Policy. This desktop QA browser exposing Bluetooth is not evidence about Bluefy's actual iPhone launch context. Actual phone and LED checks remain pending below.

## Physical acceptance still required

### Connection error report and version 1.0.1

The owner reported "The selected device does not expose the verified LED service." That error occurs after the service lookup returns. A simulated service reporting `EEA0` instead of its equivalent full 128-bit UUID reproduced the exact message in the real session code. The original comparison accepted only the full textual form. The phone's raw returned UUID was not captured, so short UUID formatting remains the likely explanation for the physical report, not a measured phone result.

Version 1.0.1 normalizes equivalent UUID representations for both EEA0 and EE01 and records the returned identities in diagnostics. The suite now passes 58 tests, including short, zero-padded, mixed-case and compact full UUIDs, rejection of different services and EE02, and exported discovery details. The Windows production build passes. The QA browser also connects to a simulated peripheral returning short `EEA0` / `EE01`, sends nothing on connect, and submits a colour frame only after Apply selection. Retry on the actual phone is pending.

No new physical results have been recorded for this app. The owner's earlier successful colour tests are research background, not new acceptance evidence.

- [ ] Open the deployed production URL in Bluefy on the actual iPhone.
- [ ] Connect and select BJ_LED_M. Confirm no light change on connect.
- [ ] Apply red at 25%, then several colours and brightness levels. Confirm one active connection and no repeated chooser.
- [ ] Physically confirm Off. Edit colour and brightness while Off; confirm the strip stays off.
- [ ] Physically confirm On restores the newly selected colour and brightness. Record whether the recovered packet works.
- [ ] Send a final colour, tap Disconnect and wait. Confirm the light retains the last command after the three-second hold.
- [ ] Reconnect without sending. Confirm no light change, then explicitly apply a selection.
- [ ] Reload the page. Confirm preferences restore with no command and choose the device again if Bluefy requests it.
- [ ] Move out of range or remove strip power. Confirm clear loss/timeout feedback and no automatic retry. Restore the strip, reconnect and apply explicitly.
- [ ] Save, rename, replace and delete a favourite. Revisit the Bluefy bookmark and check persistence.
- [ ] Background and return to Bluefy. Check honest connection state and no automatic command replay.

For each physical test, record date, iPhone model, iOS version, Bluefy version, controller name, action, visible outcome and any copied diagnostics. Keep power results explicit. If a packet behaves differently, retain the exact bytes and timing and do not substitute another controller's format.
