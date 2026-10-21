# Design direction, version 1.4

The owner asked for more options and research into established lighting apps. The current plan and sources are in [UX_RESEARCH.md](UX_RESEARCH.md). Three layouts change the primary interaction: a direct colour wheel, a named palette on a light surface, and a large dimmer. Shared brightness, power and saved actions use the same controller. The noninteractive colour disc and equal-weight main hue/saturation sliders are removed. A visible layout chooser allows comparison within the active session. These are alternatives for owner evaluation, not a claim of measured usability superiority.

## Previous direction, version 1.3

The owner rejected the enclosing containers and the latest visual treatment as tacky. Keep the app structure and Bluetooth behavior, but replace the broad rainbow panel, blue ambient gradients, shiny swatches and repeated icon bubbles with a quiet lighting remote.

Tokens: graphite #19191b for the page, smoked glass #29292c for sheets, pearl #f1f0ed for primary text and active controls, silver #aaa9ad for secondary text, subtle edge #ffffff14 and soft error #f1b9be. The selected colour appears in its preview and functional tracks. There is no decorative page gradient.

Type: iPhone system typography with Segoe UI on Windows. A 23-pixel medium-weight brand, 16-pixel section headings, 13 to 15-pixel labels and matching tabular slider values. No oversized numbers or multicolour brand text.

Layout: brand/options row, connection row, selected-colour preview and exact-colour access, hue and saturation, brightness, named presets, then explicit power actions within thumb reach. Left-aligned labels and right-aligned values share one edge. Controls sit on the page, separated by space. The flat 88-pixel colour disc is the single visual focal point and represents the selection, not measured device output. It grows to 120 pixels on desktop.

```text
Afterglow                              …
Not connected                    Connect

            selected colour
Colour                           #FF8E5C
Hue                            spectrum
Saturation                           64%

Brightness                           50%
10%          25%          50%        100%

Presets                  Saved     Save
Ember   Rose   Lilac   Ocean   Mint   Warm

Power                         On    Off
feedback
```

Review: a glowing orb, glossy rainbow wheel or decorative dashboard would repeat the excess the owner rejected. Use a flat colour disc, thin functional tracks and quiet swatches. Limit glass to actual touch surfaces and temporary sheets. Keep plain X buttons, swipe dismissal, keyboard focus and 44-pixel targets. No Apply, enclosing card, bottom bar or new Bluetooth ownership. Colour, saturation and brightness submit on release; Off holds edits for the next On.

## Previous direction, version 1.2.1

Afterglow is one lighting remote screen. The owner requested removal of Apply and bottom navigation, with an iOS 26 inspired glass appearance. Controls continue sending on release. Connection never sends a command. After connecting, adjust a control or tap On to use the prepared setting. Off continues holding colour edits for the next On request.

Palette: midnight #101b32, deep glass #1b2d4d, pearl #f5f8ff, mist #c7d3e8, cool blue #a9c9ff and error rose #ffd0d4. The selected colour adds a soft, static background glow. White edges and restrained inset highlights define translucent controls. System sans typography uses a 28-pixel title, 17-pixel section headings and 14-pixel controls. No remote fonts or decorative images.

Layout: the header contains connection status, Connect or the device button, and a small options button. Power, the colour pad, brightness and presets sit directly on the ambient background. Glass belongs to individual touch controls and temporary sheets. Remove enclosing cards and nested pill surrounds. Saved lights and Save are small actions beside Presets. Saved settings, exact RGB/hue/saturation, device controls and help open only as sheets. There are no page tabs, bottom bar or Apply action. Alignment is left except centred touch controls.

Revision sketch: header / power actions / wide colour pad / brightness / presets / feedback. The colour pad remains the main visual element. Spacing separates controls without card borders. Sheets have a plain X with a 44-pixel hit target, initial focus on their title, and downward drag dismissal from the header or noninteractive content at scroll top. Keyboard focus remains visible on interactive controls. This removes the extra framing the owner disliked while retaining the established palette and typography.

Review: glass is a material treatment around the existing compact controls, not another navigation layer. A power toggle would claim device knowledge the protocol cannot provide, so On and Off stay explicit. The active style means last requested. Native modal sheets preserve focus handling and explicit Close actions. Touch targets are at least 44 pixels. Opening sheets and restoring data send nothing. Blur has a more opaque fallback, including reduced-transparency preferences. Motion does not run unattended. This is a CSS treatment inspired by Apple's materials, not a claim to use native Liquid Glass rendering.

References: [Apple materials](https://developer.apple.com/design/human-interface-guidelines/materials) and [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter).
