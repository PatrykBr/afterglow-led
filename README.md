# Afterglow

Control a BJ_LED_M RGB strip over Bluetooth in Bluefy on iPhone.

Open [afterglow-led.vercel.app](https://afterglow-led.vercel.app) in Bluefy, tap Connect and choose BJ_LED_M. Connecting leaves the lights unchanged. Controls send on release. After Off, edits wait until you tap On.

## Development

Use Bun 1.4.4.

```sh
bun ci
bun run dev
bun run check
```

Development runs at http://localhost:5173. To preview the production build, run `bun run preview` after `bun run check` and open http://localhost:4173.

Pushes to `main` build and deploy on Vercel. The build restores the tracked `vercel.json` before checking formatting because Vercel minifies its working copy.

See [PROTOCOL.md](PROTOCOL.md) for packet formats, connection handling and hardware evidence.
