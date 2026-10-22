# Independent deployment

This app has its own Sites project and source repository. It has no dependency on the earlier experimental site.

Project ID: `appgprj_6ad931265480819183506ff58bd7f9f4`.

Live URL: **https://afterglow-led.gardenmelon35.chatgpt.site**.

Publication succeeded on 2026-10-21. The site is public and opens without ChatGPT sign-in, as required for account-free use in Bluefy. Opening the production page in the QA browser returned HTTP 200, a secure context and a Bluetooth Permissions-Policy that allowed this page to use Bluetooth. This verifies hosting, not actual iPhone BLE access.

The initial tested application source commit is `c022d30081ea078db852a6471ad2b71c179aeecb`. Initial saved version: `appgprj_6ad931265480819183506ff58bd7f9f4~appgver_025ee1a9a53081918b0d510ddd157068`. Public deployment: `appgdep_6ad935b8cb348191bf16c3e33e836065`. Subsequent documentation commits do not alter the tested application assets.

The fresh hosted source repository is `https://git.chatgpt-team.site/77e8427c-4b69-4ebf-a960-50470b171b5a/appgprj_6ad931265480819183506ff58bd7f9f4.git`. Its access is separate from the public application URL. Use the Sites source workflow for short-lived repository authorization. This directory also contains the complete local Git repository and dependency lockfile.

## Publish an update from Windows

Version 1.5.0 keeps the owner's chosen colour wheel as the only layout and uses Bun 1.4.4 for dependency management, development, production bundling, type checking, formatting and tests. Open `https://afterglow-led.gardenmelon35.chatgpt.site/?v=1.5.0` in Bluefy. Old layout query parameters are ignored; the comparison links below are historical. The HTTPS origin and stored lighting preferences are unchanged. See [BUN_TOOLCHAIN.md](BUN_TOOLCHAIN.md) for the tooling boundaries and Windows commands.

Version 1.4.0 adds three working layouts informed by research into Apple Home, Hue, LIFX and Nanoleaf. Open `https://afterglow-led.gardenmelon35.chatgpt.site/?v=1.4.0&layout=wheel`, `...?v=1.4.0&layout=palette` or `...?v=1.4.0&layout=dimmer`. The in-app layout chooser switches without reloading or changing the lights. Direct links reload the page and may require Bluetooth selection again. All layouts use this same public HTTPS origin, local lighting preferences and session implementation.

Version 1.3.0 replaces the broad rainbow pad and blue ambient background with charcoal, a selected-colour disc, slim hue/saturation controls and quieter typography. Open `https://afterglow-led.gardenmelon35.chatgpt.site/?v=1.3.0` in Bluefy. This keeps the same origin, saved preferences, session service and BLE packets.

Version 1.2.1 removes the enclosing panel and nested control surrounds, adds downward swipe dismissal and removes automatic close-button focus and its circular decoration. Open `https://afterglow-led.gardenmelon35.chatgpt.site/?v=1.2.1` in Bluefy to load this revision. Preferences remain on the same origin.

Version 1.2.0 removes Apply and bottom navigation, adds the glass styling, and keeps saved lights and options in sheets. The entry URL `https://afterglow-led.gardenmelon35.chatgpt.site/?v=1.2.0` uses the same storage origin and favourites as earlier versions.

The version 1.1.0 interface revision keeps this same origin and stored settings. It adds Light, Saved and More views without changing Bluetooth packet formats, timing or session ownership. A cache-busting entry URL is `https://afterglow-led.gardenmelon35.chatgpt.site/?v=1.1.0`; this is the same storage origin as the original URL.

1. Open this source repository in Codex with the Sites plugin connected to the owner account.
2. Run `bun ci` if needed and `bun run check`. The normal Windows commands do not require a Mac.
3. Ask Sites to publish this existing project, retaining the project ID in `.openai/hosting.json`. The Sites source workflow commits and pushes source, packages the matching `dist` directory with the hosting manifest, then deploys that saved version.
4. Retain the returned source commit, version, production URL and terminal deployment result. Do not call create_site again for this project.
5. Open the resulting URL in Bluefy. Re-test the relevant checklist in `VALIDATION.md` after transport changes.

Source credentials are short-lived and should be entered only through the supported Sites helper. They do not belong in a shell command, README, Git remote, committed file or client bundle. No runtime credential is needed by the app.

For another static host, run `bun run build` and upload all files from `dist` at the website root. Serve over HTTPS and allow the `bluetooth` Permissions-Policy for the site itself. The page must open as a top-level page in Bluefy. Do not embed it in a cross-origin frame that blocks Bluetooth.
