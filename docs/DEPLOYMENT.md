# Hosting and deployment

## Vercel

Source: [PatrykBr/afterglow-led](https://github.com/PatrykBr/afterglow-led), a private GitHub repository. The cleanup is committed as `dd1cf0a`; Vercel configuration is committed as `61a47e9`.

Public URL: [afterglow-led.vercel.app](https://afterglow-led.vercel.app).

Vercel project: `prj_YB2BCglvFie3rWOWxXXWH5IcOLM9`, in the `patrykbrs-projects` team. GitHub is connected; pushes to `main` trigger production builds.

The first verified Vercel deployment on 2026-10-22 is `dpl_7b1PVVNWwr2CDa6QAgQDvCay5aCQ`, from source `4635a1cf1bf04f71a2a52adec6ee6bbb84d13adf`. It reached READY, passed formatting, types and all 86 tests, and built the static assets using Bun 1.4.4. The public production URL and its JavaScript, CSS and icon returned HTTP 200 without login. Bluetooth and nosniff headers were present. A Chromium browser flow against this URL passed with simulated Bluetooth. Actual iPhone/Bluefy delivery remains to be checked.

The repository-root `vercel.json` selects a static build:

- Framework: Other.
- Install: the official Bun installer selects `bun-v1.4.4`, then `bun ci` installs the lockfile.
- Build: `bun run check`, including formatting, types, tests and production bundling.
- Output: `dist`.
- Headers: `Permissions-Policy: bluetooth=(self)` and `X-Content-Type-Options: nosniff`.

The build commands select Bun 1.4.4 explicitly and prepend its installation directory to PATH. Vercel's default Bun 1.4.1 image did not provide `bun fmt`; selecting the pinned executable preserves the local checks. This adds no application dependency. Local development still uses the installed Bun directly. The app needs no backend, functions, database or runtime secrets.

Vercel minifies `vercel.json` before invoking the build command. The build restores that file from Git HEAD before running the formatting checks, so validation checks the committed source rather than Vercel's generated copy.

Use the public production URL in Bluefy. Publish updates by pushing reviewed commits to `main`; the build uses the Git checkout to validate the tracked configuration. Preview URLs may require Vercel authentication.

After publication, verify the HTTPS page, all hashed assets and the Bluetooth permission header. Then complete the [physical acceptance checklist](VALIDATION.md) on the actual iPhone.

## Saved preferences when changing hosts

Preferences belong to the browser and site origin. A new Vercel URL has separate local storage and Bluetooth permissions. Existing favourites do not transfer automatically. Keep the old URL available while recreating any saved lights you need, and update the Bluefy bookmark after checking the new site.

## Previous Sites deployment

The previous URL is [afterglow-led.gardenmelon35.chatgpt.site](https://afterglow-led.gardenmelon35.chatgpt.site). Initial publication on 2026-10-21 was public and passed desktop HTTPS and Bluetooth-policy checks. This does not establish actual iPhone BLE delivery.

The archived Sites identity is `appgprj_6ad931265480819183506ff58bd7f9f4`, retained in `.openai/hosting.json`. The `sites` Git remote records its original source repository; `origin` now points to GitHub.

Initial tested source: `c022d30081ea078db852a6471ad2b71c179aeecb`.
Initial saved version: `appgprj_6ad931265480819183506ff58bd7f9f4~appgver_025ee1a9a53081918b0d510ddd157068`.
Initial deployment: `appgdep_6ad935b8cb348191bf16c3e33e836065`.

The Vercel migration does not delete or republish this older deployment. No source credentials belong in Git, documentation or client assets.
