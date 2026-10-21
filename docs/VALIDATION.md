# Validation record

Date: 2026-10-21.

## Software checks

### Three researched control layouts, version 1.4.0, 2026-10-22

The research and tradeoffs are documented in UX_RESEARCH.md with primary sources from Apple, Hue, LIFX and Nanoleaf. The three alternatives are working app layouts, not static mockups. They share the existing controller and Bluetooth session. A separate validated layout preference leaves stored lighting preferences unchanged.

All 87 automated tests pass. The new tests cover cardinal wheel colours, saturation distance and clamping, centre hue retention, marker/touch round trips, dimmer bounds with a 1% floor, valid comparison-link precedence, preference round trips and corrupt/blocked layout storage. The Windows production build passes.

Shared-browser checks with a simulated peripheral show one chooser and zero writes on Connect and repeated layout changes. A dimmer tap and keyboard increment each submit one colour/brightness command. Off followed by colour and brightness edits submits only Off; explicit On submits the latest full unscaled RGB/brightness frame. Wheel taps, wheel keyboard edits and palette selections submit through the same session. A synthetic wheel drag with simulated pointer capture submits zero commands during draft, on cancellation or subsequent blur. This verifies application handlers, not a phone's touch or BLE delivery.

Main-screen screenshots for all three layouts were reviewed at 390 by 844. On/Off end at approximately 713, 705 and 732 pixels for Wheel, Palette and Dimmer with a saved favourite present; saved content below may scroll. At 320 by 640, all three have no horizontal overflow and tested buttons and sliders have at least 44-pixel hit regions. The layout sheet initially focuses its heading, preserves a plain X, shows keyboard focus on Tab, closes on Escape and returns focus to the layout action. Preference restoration keeps the strip disconnected and submits nothing. Actual iPhone/Bluefy usability and physical strip outcomes remain owner checks.

### Restrained interface revision, version 1.3.0, 2026-10-22

Replaced the rainbow pad with separate native hue and saturation sliders and a flat selected-colour preview. The page uses neutral charcoal, smaller consistent numeric values, quiet swatches and text actions. Power actions sit below presets. No enclosing cards, bottom navigation or Apply were added. The persistent Bluetooth service, protocol, scheduler and storage format are unchanged.

All 67 automated tests pass. The Windows production build succeeds. The shared browser's screenshot capture now works; main-screen and Options screenshots were reviewed at phone widths. At 390 by 844 the normal screen fits, and at 320 by 640 the page scrolls without horizontal overflow. Tested button and slider hit regions meet 44 by 44 pixels. Sheets retain their plain X, heading focus, swipe dismissal and focus return.

With a simulated peripheral, Connect sends zero writes and creates one selection request. Hue and saturation edits submit on release; one keyboard step followed by a separate slider click produces one write per action, without a blur duplicate. Off submits its exact five-byte frame. Subsequent hue and brightness changes submit nothing while Off is requested. On submits the latest selected unscaled RGB and brightness scalar in the full nine-byte frame. Sheet opening and swipe dismissal add no commands or chooser. These results are software checks; Bluefy touch feel and physical LED output remain owner checks.

### Open layout and sheet fixes, version 1.2.1, 2026-10-22

Removed the enclosing main glass panel and decorative pill surrounds. The X is now a plain icon with a 44-pixel target. Sheets initially focus their heading and restore focus to their opener; Tab still gives the close button a visible focus outline. A downward touch drag of at least 72 pixels dismisses from the header or noninteractive content at scroll top. Short, horizontal, upward, cancelled and multiple-touch gestures do not dismiss. Fields, sliders, buttons, links and already-scrolled content keep their own interactions.

The browser reproduced the original fault: a 110-pixel downward touch sequence left Options open, and the close button received initial focus with a circular border. The same sequence now dismisses. Native listener tests cover gesture thresholds, cancellation, scrolling, interactive targets and cleanup. All 67 tests and the Windows production build pass. Shared-browser checks confirm all five sheet entry points dismiss, focus returns to their opener, Escape and backdrop dismissal work, and sliders and scrolled content stay open. With a simulated peripheral, opening and dismissing these sheets produces zero writes and retains one device selection. At 320 and 390 pixels wide there is no horizontal overflow and tested buttons meet 44-pixel targets.

These are software and synthetic-touch checks in the desktop QA browser. Actual Bluefy swipe feel and iPhone rendering still require owner confirmation. No new screenshot review or physical LED result is claimed. Bluetooth protocol, session ownership and scheduling are unchanged.

Windows, Node.js 24.19.0. `npm run check` passed 45 tests and built production assets with Vite 7.3.7. Tests use a simulated GATT peripheral and controlled Vitest timers. They do not verify radio delivery or LED output.

Covered: golden colour, Off and full On bytes; floor rounding; invalid RGB and brightness; colour conversions; validated preferences; corrupt or unavailable storage; discovery options; verified write capability; connection without writes; repeated commands using one chooser; fresh GATT discovery after reconnect; no replay; queue spacing and coalescing; Off cancellation and power ordering; last-write hold; in-flight disconnect timing; asynchronous disconnect confirmation; write and connection deadlines; chooser cancellation and denial; link loss; late completion after a new session; disconnected selection; no restoration/subscription writes; favourites add, rename, replace and delete; Off prepares the next On selection.

The desktop browser QA tab used a simulated Web Bluetooth object. Connect generated one chooser request and zero writes. Apply, Off, colour and brightness edits while Off, then On generated exactly three frames. The On frame contained the latest prepared RGB and brightness, with no second chooser. A real browser permission prompt and actual BLE radio were not used in this QA test.

Browser checks at 320-pixel and 390-pixel phone widths, and a 1280-pixel desktop width, found no horizontal overflow. The app loaded without application console errors. Creating a named favourite stored it locally without an additional Bluetooth write. Quick levels and presets have at least 44-pixel touch targets. A keyboard arrow adjusts the hue and saves the new disconnected selection locally.

Production publication succeeded. The public HTTPS root returned HTTP 200 without sign-in, loaded the built application assets, and allowed Bluetooth under the browser's Permissions-Policy. This desktop QA browser exposing Bluetooth is not evidence about Bluefy's actual iPhone launch context. Actual phone and LED checks remain pending below.

## Physical acceptance still required

### Glass interface and direct controls, version 1.2.0

Apply and bottom navigation are removed. The single main screen uses translucent glass styling. Saved lights and Options open as sheets. Connecting still sends nothing; adjust a control or tap On to use the prepared setting. The controller's obsolete Apply method was removed and the prepared-setting test now asserts the full On packet. Protocol encoders, queue timing and connection ownership are unchanged.

All 58 tests pass. Mocked UI checks show one chooser, zero connect writes, automatic colour/brightness submissions on committed edits, no colour updates after Off, and the latest unscaled RGB/brightness in the full On frame. Saved lights and Options open without any extra writes or chooser. At 320 pixels there is no horizontal overflow, and all tested buttons meet 44 by 44 pixels. The QA browser computes the main panel blur at 28 pixels with a translucent background. Opaque CSS fallbacks exist when blur is unavailable or reduced transparency is requested. A new native screenshot capture again timed out; physical Bluefy rendering and LED results remain unverified by this QA browser.

### Mobile interface revision, version 1.1.0

The new Light view uses a wide hue/saturation pad, brightness, quick levels and presets. Saved and More are separate views. Exact colour, device controls and saved-light editing use native dialog sheets. Transport, scheduling, protocol and stored preference formats are unchanged.

All 58 automated tests pass and the Windows production build succeeds. In the shared browser, a mock peripheral returning short EEA0/EE01 UUIDs connects once and sends zero writes during view changes and sheet opening/closing. Apply, Off, prepared edits and On retain the correct command behavior. Saving, renaming and confirmed deletion add no writes. A keyboard brightness change sends exactly once; blurring it to open a sheet adds no duplicate. A colour-pad tap submits one colour write.

At 390 by 844 CSS pixels, presets end at pixel 724 and feedback at 764, above navigation at 777. At 320 pixels wide, no horizontal overflow or button targets below 44 by 44 pixels were found. Smaller viewports may scroll. Native modal focus enters the close control. Screenshot QA was unavailable: two T3 snapshot attempts timed out, the independent HTML capture timed out, and automatic approval review rejected launching a separate headless browser as "blocked by policy". Layout and interaction checks succeeded, but no new screenshot-based visual review is claimed. Actual Bluefy touch and physical LED confirmation remain owner checks.

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
