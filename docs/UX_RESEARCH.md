# Lighting app research and alternatives

Research date: 2026-10-22. These are established app patterns, not a usability study of this owner or a popularity ranking. Sources are the vendors' own guides and product pages. Some Hue regional screenshots show an older interface; use them as historical examples, not proof of the latest screen layout.

| App | Observed pattern | Adaptation for one Bluetooth strip |
| --- | --- | --- |
| [Apple Home](https://support.apple.com/en-gb/guide/iphone/iph0a717a8fd/ios) | A quick power action is distinct from opening detailed accessory controls. | Keep explicit On/Off visible and advanced RGB behind an obvious Edit colour action. Do not add a room dashboard for one strip. |
| [Philips Hue](https://www.philips-hue.com/en-us/philips-hue-app) | Scenes, dimming and power share the everyday control screen. Saved looks can be recalled directly. | Keep brightness and power beside the colour choice; expose named saved combinations without requiring exact RGB entry. |
| [LIFX](https://www.lifx.com/pages/app) | A wheel selects colour, with brightness and saturation controls. Saved scenes recall colour/brightness combinations. | Offer a large wheel that combines hue and saturation spatially, plus a substantial brightness slider. |
| [LIFX dashboard guide](https://support.lifx.com/hc/en-us/articles/14508927729815-Getting-Around-the-LIFX-App) | Large dimmer interactions and favourites are available for frequent tasks. | Offer a dimmer-first layout for daily brightness changes and keep colour editing available. |
| [Nanoleaf](https://nanoleaf.me/en-jp/pages/nanoleaf-mobile-app) | Presets and custom scenes serve different levels of involvement. | Offer a palette-first layout for tapping a named colour, with custom colour behind one action. |

## Design interpretation

The rejected interface presented a noninteractive colour disc, three equal-weight technical sliders, small controls, then power at the end. Aesthetic restraint did not fix that hierarchy. Replace the disc with an actual control and compare different task priorities. This is our design inference from the research, not a claim that a vendor endorses this application.

- Wheel: dark graphite, one large hue/saturation wheel, strong brightness control, explicit power. Default recommendation for exploring custom colours.
- Palette: cool light background, large named swatches, substantial brightness control. Fewer drag gestures for everyday choices.
- Dimmer: dark blue-grey, a tall brightness control and a short colour row. Best candidate when the usual task is dimming a colour already chosen.

No enclosing cards or bottom navigation. All three use the same session, selected setting, saved favourites and protocol. The layout chooser is an ordinary sheet. Changing layout never submits or retries a lighting command. Deep links are available for comparing designs; opening one reloads the page and may require Bluetooth selection again. The in-app chooser avoids that reload.

The strip provides no state acknowledgement, so a vendor-style power toggle would imply knowledge we do not have. Retain separate On and Off requests, with an honest last-request caption. Brightness stays at 1% minimum; Off is explicit. Do not copy Wi-Fi, cloud, white-temperature, effects, timers or remote-control features whose protocols are not verified here.

## Tokens and layout before implementation

Shared type: the iPhone system face, 26-pixel device heading, 16-pixel control labels, 14-pixel actions and readable preset names. Touch targets are at least 44 pixels; main actions are 50 pixels. Labels align left and values right. Colour is concentrated in functional controls.

Wheel palette: graphite #171b20, raised material #242b33, pearl #f3f5f7, muted silver #aab3bf, focus #dbe8ff. Palette variant: mist #f1f4f8, ink #202b39, slate #5c6a7c, white #ffffff, focus #31547e. Dimmer variant: deep slate #14242d, smoked material #233740, pearl #eef5f5, muted #abbfc6, focus #cee9f0.

```text
Wheel                    Palette                  Dimmer
connection / layout      connection / layout      connection / layout
LED strip                LED strip                LED strip
large colour wheel       named colour swatches    large vertical dimmer
brightness slider        brightness slider        colour swatches / Edit
saved shortcuts          saved shortcuts          saved shortcuts
On / Off                 On / Off                 On / Off
feedback                 feedback                 feedback
```

Review: three recolours of the same slider form would not test the owner's UX objection. These variants change the primary interaction, not only the material. Functional control shapes are allowed; decorative panel containers remain absent. Saved combinations remain editable in their sheet. A consistent layout chooser allows direct comparison without reconnecting.
