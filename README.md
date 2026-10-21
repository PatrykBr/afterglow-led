# Afterglow

A new personal RGB strip controller for Bluefy on iPhone. The phone sends binary commands directly to the nearby BJ_LED_M controller. There is no application backend, account system, telemetry, database or cloud Bluetooth relay.

The accepted iPhone route is an HTTPS page opened in Bluefy. Safari and an untested home-screen launch are not substitutes. No Mac, Xcode, signing or local iOS build is involved.

## Windows setup

Install Node.js 24 LTS with npm and Git. In PowerShell, open this repository folder:

```powershell
npm ci
npm run dev
```

Open the printed localhost URL on the Windows computer for development. A phone's localhost is the phone itself. A plain HTTP LAN address is not the accepted Bluetooth delivery route; use the deployed HTTPS URL in Bluefy.

```powershell
npm test
npm run build
npm run preview
```

`npm run check` runs tests and the production build. Production assets are in `dist`. The lockfile pins the tested installation. Vite 7 and Vitest 4 use WebAssembly Rollup and esbuild variants through npm overrides because this Windows machine blocks unsigned native Node modules. This needs no policy change and also works on ordinary Windows installations. Keep these overrides when upgrading tooling. Node may print a toolchain warning; do not disable security protections to build the app.

The production JavaScript target is Safari 15 syntax. Compilation does not supply Web Bluetooth. Actual iPhone support still depends on Bluefy, its permissions, iOS and the controller.

## iPhone use

See [the short Bluefy guide](docs/IPHONE.md). Open the deployment URL from [the deployment record](docs/DEPLOYMENT.md) in Bluefy. Tap Connect and choose BJ_LED_M. Connect leaves the lights unchanged. Colour and brightness controls send on release. Tap On to use the prepared colour and brightness explicitly.

Version 1.2 uses one screen with glass styling and no Apply action or bottom navigation. Saved combinations open from the bookmark beside Presets. Help and diagnostics are behind the header options button. Exact colour and device details also open in sheets. Sheets reuse the same session and never send commands on their own. Blur has opaque and reduced-transparency fallbacks.

On and Off are explicit command requests. The strip does not acknowledge its physical power state. After requesting Off, edits prepare the next On selection. A reload restores settings and favourites, with power treated as unknown; it sends nothing.

## Source layout

- `src/domain/lighting.ts` validates settings and converts colour representations.
- `src/protocol/bojia.ts` is the pure encoder for EE01 packets.
- `src/bluetooth/session.ts` owns discovery, the selected device, fresh GATT objects and the connection state machine.
- `src/bluetooth/scheduler.ts` is the single writer, with generation cancellation, queue ordering, timeout uncertainty and spacing.
- `src/controller.ts` separates selected settings, requested power and last submitted settings. React components subscribe to this store.
- `src/persistence/preferences.ts` validates versioned local data and handles blocked or full storage.
- `src/diagnostics.ts` retains at most 100 events in memory. Export is explicit and contains packet bytes but no device identifiers.
- `src/components` contains the touch and keyboard controls. Renders and subscriptions never send commands.

See [architecture decisions](docs/ARCHITECTURE.md), [protocol evidence](PROTOCOL_EVIDENCE.md) and [validation record](docs/VALIDATION.md).

## Maintenance and hosting

The app is static. Any HTTPS host that serves `dist/index.html` and `dist/assets` at the site root can host it. No API keys or environment variables are required. The Sites manifest in `.openai/hosting.json` identifies this app's independent deployment. Source and deployment publication use the connected Sites workflow, described in the deployment record.

After a change, run `npm ci` when dependencies changed, then `npm run check`. Publish the complete `dist` directory from the tested source commit. Keep HTML fresh and cache content-hashed assets normally. The app has no service worker or persistent offline cache to hide updates.

Keep the lockfile in source control. Review dependency updates and run the test suite before publication. Re-test Bluefy on the actual phone after Bluetooth, transport or build-target changes. Use `npm audit` to review advisories. Hosting costs depend on the account and provider plan; no paid upgrade or custom domain was purchased for this project. There is no app-server or database bill. Local favourites are specific to this browser and site origin; clearing website data removes them, and changing the host will not migrate them.

Effects, unattended schedules, music sync and remote control are not implemented. A cloud server alone cannot reach the strip through a closed iPhone page.
