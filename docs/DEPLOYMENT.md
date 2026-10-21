# Independent deployment

This app has its own Sites project and source repository. It has no dependency on the earlier experimental site.

Project ID: `appgprj_6ad931265480819183506ff58bd7f9f4`.

Expected origin: `https://afterglow-led.gardenmelon35.chatgpt.site`.

The expected origin is not proof of a successful publication. The deployment result and any access requirements will be recorded here after publication.

## Publish an update from Windows

1. Open this source repository in Codex with the Sites plugin connected to the owner account.
2. Run `npm ci` if needed and `npm run check`. The normal Windows commands do not require a Mac.
3. Ask Sites to publish this existing project, retaining the project ID in `.openai/hosting.json`. The Sites source workflow commits and pushes source, packages the matching `dist` directory with the hosting manifest, then deploys that saved version.
4. Retain the returned source commit, version, production URL and terminal deployment result. Do not call create_site again for this project.
5. Open the resulting URL in Bluefy. Re-test the relevant checklist in `VALIDATION.md` after transport changes.

Source credentials are short-lived and should be entered only through the supported Sites helper. They do not belong in a shell command, README, Git remote, committed file or client bundle. No runtime credential is needed by the app.

For another static host, run `npm run build` and upload all files from `dist` at the website root. Serve over HTTPS and allow the `bluetooth` Permissions-Policy for the site itself. The page must open as a top-level page in Bluefy. Do not embed it in a cross-origin frame that blocks Bluetooth.
