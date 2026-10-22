# Bun toolchain

Version 1.5.0 uses stable Bun 1.4.4 on native Windows. The release ZIP was checked against the SHA-256 digest in the official GitHub release metadata before running. The standard user installation is `%USERPROFILE%\.bun\bin\bun.exe`; open a new terminal after installation so `bun` is on PATH. The repository pins the version in `.bun-version` and `packageManager`.

| Task | Implementation |
| --- | --- |
| Dependency installation | `bun ci` and the text `bun.lock`; `bun install` updates declarations/lock together. |
| Script runtime and shell | Bun executes TypeScript scripts directly and handles the cross-platform script chains. |
| Development | `Bun.serve` imports `index.html`, bundles TSX/CSS/icon assets and enables HMR and browser console forwarding. |
| Production build | `Bun.build` bundles the HTML entrypoint with browser targeting, production React, minification, hashed assets and linked source maps. |
| Type checking | Stable Bun's native `bun check --no-script`, including browser code, test code and build/server scripts. |
| Formatting | Native `bun fmt`; `bun run format:check` is part of verification. |
| Tests | `bun:test` assertions and mocks, watch mode and native text/LCOV coverage reports. |
| Production preview | `Bun.serve`, `Bun.Glob` and `Bun.file` serve only enumerated build files. Request paths cannot select arbitrary disk files. |
| Build file operations | `Bun.file` inspects the built HTML. Bun's Node-compatible filesystem API removes only the verified generated `dist` directory. |
| Maintenance | `bun audit`, `bun outdated`, `bun why`, `bun prune` and frozen installs. |

The app no longer needs Vite, its React plugin, Vitest, TypeScript's separate executable, Rollup, esbuild, their Windows overrides or npm's lockfile. Bun's native type checker and formatter were verified on this machine. Its linter is canary-only in this release, so this project stays on stable Bun and does not add a nonworking `bun lint` command.

## Deterministic Bluetooth timing tests

Bun's native timer API does not implement the async advancement used by the lifecycle suite. The tests run under `bun:test` with `@sinonjs/fake-timers` for `Date`, `setTimeout` and `clearTimeout`. `clock.tickAsync` allows Promise callbacks to finish between deadlines. This preserves the existing checks for 80 ms write spacing, 8/15 second deadlines, 1.2 second confirmation and the 3 second disconnect hold. Each test installs and uninstalls its own clock. Production timing code is unchanged. The clock is a development dependency and is absent from browser bundles.

## Runtime boundaries

Production is still static HTTPS assets. Bun runs on the Windows development computer; it is not installed on the iPhone or required by the hosting request path. Bluefy owns Bluetooth permissions and the browser talks directly to the strip. No database, Redis, server API, native executable distribution, cloud Bluetooth relay or unattended scheduler was introduced.

Vercel's GitHub integration checks out the committed source and builds the static `dist` directory. The deployment does not require a locally authenticated Vercel CLI.

Browser targeting is not a guarantee of a particular old Safari syntax level. The built production page must still be checked on the actual iPhone/Bluefy after this migration. A modern bundler cannot add missing Web Bluetooth access.

Vercel's build image initially supplied Bun 1.4.1, which lacked `bun fmt`. The `vercel.json` install command uses Bun's official installer with `bun-v1.4.4`; both install and build commands prepend that installation to PATH. Local development commands still run the installed Bun directly. No Node.js server is deployed.

## HMR ownership

The React root is stored in `import.meta.hot.data` through direct API access, as required by Bun's HMR transform. Module replacement removes old page lifecycle listeners and requests a normal disconnect of the old session. Component refreshes do not request another device or submit lighting commands. No uncertain write is replayed after an update.

References: [Bun HTML bundling](https://bun.com/docs/bundler/html-static), [HMR](https://bun.com/docs/bundler/hot-reloading), [type checking](https://bun.com/docs/runtime/check), [formatter](https://bun.com/docs/format), [test runner](https://bun.com/docs/test), [fake-timers](https://github.com/sinonjs/fake-timers).
