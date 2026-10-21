# Independent deployment

This app has its own Sites project and source repository. It has no dependency on the earlier experimental site.

Project ID: `appgprj_6ad931265480819183506ff58bd7f9f4`.

Live URL: **https://afterglow-led.gardenmelon35.chatgpt.site**.

Publication succeeded on 2026-10-21. The site is public and opens without ChatGPT sign-in, as required for account-free use in Bluefy. Opening the production page in the QA browser returned HTTP 200, a secure context and a Bluetooth Permissions-Policy that allowed this page to use Bluetooth. This verifies hosting, not actual iPhone BLE access.

The initial tested application source commit is `c022d30081ea078db852a6471ad2b71c179aeecb`. Initial saved version: `appgprj_6ad931265480819183506ff58bd7f9f4~appgver_025ee1a9a53081918b0d510ddd157068`. Public deployment: `appgdep_6ad935b8cb348191bf16c3e33e836065`. Subsequent documentation commits do not alter the tested application assets.

The fresh hosted source repository is `https://git.chatgpt-team.site/77e8427c-4b69-4ebf-a960-50470b171b5a/appgprj_6ad931265480819183506ff58bd7f9f4.git`. Its access is separate from the public application URL. Use the Sites source workflow for short-lived repository authorization. This directory also contains the complete local Git repository and dependency lockfile.

## Publish an update from Windows

The version 1.1.0 interface revision keeps this same origin and stored settings. It adds Light, Saved and More views without changing Bluetooth packet formats, timing or session ownership. A cache-busting entry URL is `https://afterglow-led.gardenmelon35.chatgpt.site/?v=1.1.0`; this is the same storage origin as the original URL.

1. Open this source repository in Codex with the Sites plugin connected to the owner account.
2. Run `npm ci` if needed and `npm run check`. The normal Windows commands do not require a Mac.
3. Ask Sites to publish this existing project, retaining the project ID in `.openai/hosting.json`. The Sites source workflow commits and pushes source, packages the matching `dist` directory with the hosting manifest, then deploys that saved version.
4. Retain the returned source commit, version, production URL and terminal deployment result. Do not call create_site again for this project.
5. Open the resulting URL in Bluefy. Re-test the relevant checklist in `VALIDATION.md` after transport changes.

Source credentials are short-lived and should be entered only through the supported Sites helper. They do not belong in a shell command, README, Git remote, committed file or client bundle. No runtime credential is needed by the app.

For another static host, run `npm run build` and upload all files from `dist` at the website root. Serve over HTTPS and allow the `bluetooth` Permissions-Policy for the site itself. The page must open as a top-level page in Bluefy. Do not embed it in a cross-origin frame that blocks Bluetooth.
