# Hosting and deployment

## Vercel

Source: [PatrykBr/afterglow-led](https://github.com/PatrykBr/afterglow-led), a private GitHub repository. The cleanup is committed as `dd1cf0a`; Vercel configuration is committed as `61a47e9`.

Vercel deployment is being set up in the connected `patrykbrs-projects` team. A new production URL has not yet been verified. The existing public site below remains available.

The repository-root `vercel.json` selects a static build:

- Framework: Other.
- Install: the official Bun installer selects `bun-v1.4.4`, then `bun ci` installs the lockfile.
- Build: `bun run check`, including formatting, types, tests and production bundling.
- Output: `dist`.
- Headers: `Permissions-Policy: bluetooth=(self)` and `X-Content-Type-Options: nosniff`.

The build commands select Bun 1.4.4 explicitly and prepend its installation directory to PATH. Vercel's default Bun 1.4.1 image did not provide `bun fmt`; selecting the pinned executable preserves the local checks. This adds no application dependency. Local development still uses the installed Bun directly. The app needs no backend, functions, database or runtime secrets.

Once the GitHub repository is linked to Vercel, pushes to `main` can build and publish automatically. Use the public production URL in Bluefy. Preview URLs may require Vercel authentication. A local CLI deployment uses `vercel link`, verifies the linked project, then `vercel --prod`. CLI login is separate from the connected Vercel tool.

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
