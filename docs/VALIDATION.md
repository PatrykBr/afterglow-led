# Validation record

## Vercel hosting, 2026-10-22

The cleanup and hosting configuration are committed and pushed to the private GitHub repository. The production site is [afterglow-led.vercel.app](https://afterglow-led.vercel.app). GitHub pushes to `main` trigger Vercel builds. See [deployment details](DEPLOYMENT.md) for project and initial verified deployment identifiers.

Vercel passed formatting, type checking, all 86 tests and production bundling using the pinned Bun 1.4.4. The public HTTPS page and its hashed JavaScript, CSS and icon returned HTTP 200 without authentication. Response headers include `Permissions-Policy: bluetooth=(self)` and `X-Content-Type-Options: nosniff`.

The production Chromium flow with a simulated peripheral passed connection without writes, cancelled-slider handling, keyboard edits, invalid and valid colour entry, Off/prepared edits/On, favourite validation and renaming, and reload restoration. There were no unhandled page errors or horizontal overflow at widths 280, 320, 390 and 1280 pixels. T3 snapshot automation timed out twice, so the test used the existing local Playwright installation. No new physical iPhone or LED result is claimed.

## Codebase audit, 2026-10-22

The audit covered every tracked source, test, script, dependency declaration, configuration file and document. Afterglow remains a static browser app with one Bluetooth session owner. All declared dependencies have current uses; no dependency was added or removed.

Implemented changes:

- Reset write promises and timing when a new connection activates. Late writes from the old connection cannot delay a later disconnect or update its hold time. Normal disconnect still waits for the current write and preserves the three-second hold.
- Disconnect a late GATT connection to an old device without tearing down a newer device connection.
- Count queued and in-flight jobs accurately. Preserve the 40-request limit, power ordering, colour coalescing and cancellation.
- Keep cancelled range edits local when the input later loses focus.
- Skip repeated storage writes for unchanged selections, while preserving explicit repeat commands and retrying failed saves on commit.
- Remove unused icons, redundant characteristic state, duplicate favourite validation, feedback-string parsing and unused CSS fallbacks. Power styling uses its existing aria-pressed state.
- Enable unused-local and unused-parameter checks. Shorten obsolete interface and deployment instructions.

### Automated checks

The baseline passed 78 tests. The updated suite passes 86 tests. New regressions cover old-device cleanup, unresolved and late write completion across reconnects, pending counts, queue capacity, storage-write deduplication, quota recovery and reconnect guidance. The three lifecycle regressions were observed failing before the fixes.

Formatting, strict type checking with unused-code checks, tests with coverage and production bundling pass with Bun 1.4.4. Coverage measures imported tested modules; it does not represent the complete React UI. Bun audit reports no vulnerabilities among 15 checked packages.

### Browser checks

Local Chromium with a simulated Web Bluetooth peripheral exercised the production bundle. The T3 collaborative browser opened, but both snapshot attempts timed out; verification used a temporary Playwright installation outside the repository.

A cancelled brightness edit followed by blur originally submitted one lighting command and wrote preferences twice. The fixed flow submits zero commands and writes preferences once.

The checked flow connects with one chooser and zero initial writes; rejects black Hex input; submits the expected colour frame for valid Hex; sends the exact Off frame; holds subsequent brightness edits; saves and renames a favourite without writes; reports invalid names for both rename and replacement; and sends the latest unscaled RGB/brightness in the full On frame. Reload restores the saved favourite and brightness while disconnected, with requested power unknown and no writes.

Keyboard brightness edits submit once per key release, without an extra write when the input loses focus. Opening the colour sheet focuses its heading.

The main screen and saved-light sheet have no page horizontal overflow at widths 280, 320, 390 and 1280 pixels. The tested flow produced no unhandled page errors.

These are software checks with simulated transport. They do not verify actual iPhone Bluetooth delivery.

## Physical evidence and acceptance

The [protocol evidence](../PROTOCOL_EVIDENCE.md) retains the owner's earlier successful Bluefy discovery, colour packets and three-second hold. No new physical results have been recorded for this app. In particular, On and Off packets recovered from the Android app still require confirmation on the owner's strip.

The earlier error about a missing verified service was reproduced with a simulated bridge returning short EEA0/EE01 UUIDs. UUID normalization fixes that software case; the phone's original raw UUID was not captured, so the cause of that report remains unconfirmed.

After publishing the tested assets, check on the actual iPhone:

- [ ] Open the production HTTPS URL in Bluefy and connect to BJ_LED_M. Confirm no light change on connect.
- [ ] Select red at 25%, then other colours and brightness levels. Confirm one connection and no repeated chooser.
- [ ] Confirm physical Off. Edit colour and brightness and verify the strip stays off.
- [ ] Confirm On applies the newly prepared colour and brightness.
- [ ] Send a final colour, disconnect and wait. Confirm the light retains the setting after the three-second hold.
- [ ] Reconnect without sending, then explicitly apply a selection. Confirm no replay.
- [ ] Reload and confirm preferences restore without sending. Select the device again if Bluefy requests it.
- [ ] Remove strip power or move out of range. Check loss/timeout feedback and no automatic retry; restore, reconnect and apply explicitly.
- [ ] Save, rename, replace and delete a favourite. Reopen the Bluefy bookmark and check persistence.
- [ ] Background and return to Bluefy. Check connection state and no replay.
- [ ] Check touch cancellation, sheet dismissal, keyboard controls and reduced-motion/transparency settings.

Record the date, iPhone model, iOS and Bluefy versions, controller name, action, visible output and copied diagnostics. Preserve exact bytes and timing for any unexpected result. Earlier software validation and interface history remain in Git.
