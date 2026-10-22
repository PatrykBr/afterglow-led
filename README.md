# Afterglow

A personal RGB strip controller for Bluefy on iPhone. The phone sends binary commands directly to the nearby BJ_LED_M controller. There is no application backend, account system, telemetry, database or cloud Bluetooth relay.

The accepted iPhone route is an HTTPS page opened in Bluefy. Safari and an untested home-screen launch are not substitutes. No Mac, Xcode, signing or local iOS build is involved.

## Windows setup

Install [Bun 1.4.4 for Windows](https://bun.com/docs/installation) and Git. This version is pinned in `.bun-version` and `package.json`. Open a new PowerShell window in this repository folder:

```powershell
bun ci
bun run dev
```

Open the printed localhost URL on the Windows computer for development. A phone's localhost is the phone itself. A plain HTTP LAN address is not the accepted Bluetooth delivery route; use the deployed HTTPS URL in Bluefy.

```powershell
bun test
bun run build
bun run preview
```

`bun run check` checks formatting and types, runs tests with coverage, and builds production assets in `dist`. `bun ci` installs the versions in the committed `bun.lock` and rejects a mismatched manifest. Development runs at `http://localhost:5173`; production preview runs at `http://localhost:4173`. Set `$env:PORT = '5175'` before either server to use another port. Node.js, npm, Vite, Rollup, esbuild and Vitest are not needed to develop, test or build this app.

Bun bundles HTML, React/TypeScript, CSS and the icon for a browser target. This is not a version-specific Safari transpilation guarantee, and compilation does not supply Web Bluetooth. Actual iPhone support still depends on Bluefy, its permissions, iOS and the controller. Re-check the phone after build-tool updates.

## iPhone use

See [the short Bluefy guide](docs/IPHONE.md). Open the deployment URL from [the deployment record](docs/DEPLOYMENT.md) in Bluefy. Tap Connect and choose BJ_LED_M. Connect leaves the lights unchanged. Colour and brightness controls send on release. Tap On to use the prepared colour and brightness explicitly.

Version 1.5 keeps the chosen colour-wheel interface. The palette, large dimmer and layout chooser have been removed. Old layout query parameters and saved layout choices are ignored; your stored colour, brightness and favourites keep their existing schema and origin. The wheel combines hue and saturation in one touch surface.

There are no enclosing cards, Apply action or bottom navigation. Saved lights and Save this light are labelled actions below brightness. Up to three saved combinations are available as direct shortcuts. Edit colour offers labelled hue/saturation sliders, named quick colours, Hex and RGB fields. Help and diagnostics are behind Options. Sheets keep the session and close with their plain X, Escape, backdrop tap or downward swipe from noninteractive content at the top. Cancelled drags keep a local selection without sending on later blur. See [the design research](docs/UX_RESEARCH.md) and [Bun tooling decisions](docs/BUN_TOOLCHAIN.md).

On and Off are explicit command requests. The strip does not acknowledge its physical power state. After requesting Off, edits prepare the next On selection. A reload restores settings and favourites, with power treated as unknown; it sends nothing.

Power sits above the colour wheel. The highlight slides between On and Off to show your last request, and stays unselected on opening. Reduced-motion preferences disable the animation.

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

The app is static. Any HTTPS host that serves every file in `dist` at the website root can host it. Bun's hashed JavaScript, CSS and icon files sit beside `index.html`. No API keys or production environment variables are required. The Sites manifest in `.openai/hosting.json` identifies this app's independent deployment. Source and deployment publication use the connected Sites workflow, described in the deployment record.

After a change, use `bun install` if dependency declarations changed, then commit `bun.lock`. For an unchanged manifest use `bun ci`. Run `bun run check` and publish the complete `dist` directory from the tested source commit. Keep HTML fresh and cache content-hashed assets normally. The app has no service worker or persistent offline cache to hide updates. `bun run test:watch`, `bun run test:coverage`, `bun run typecheck` and `bun run format` are available separately.

Keep the lockfile in source control. Review dependency updates and run the test suite before publication. Re-test Bluefy on the actual phone after Bluetooth, transport or build-target changes. Use `bun audit` to review advisories and `bun outdated` to inspect updates. Hosting costs depend on the account and provider plan; no paid upgrade or custom domain was purchased for this project. There is no app-server or database bill. Local favourites are specific to this browser and site origin; clearing website data removes them, and changing the host will not migrate them.

Effects, unattended schedules, music sync and remote control are not implemented. A cloud server alone cannot reach the strip through a closed iPhone page.
