# Lighting app research

The owner chose the colour wheel in version 1.5. Palette and dimmer alternatives were removed. Named quick colours remain under Edit colour; saved combinations are accessible on the main screen.

Research recorded on 2026-10-22 used the vendors' guides and product pages. It was not a usability study or popularity ranking. Some regional Hue screenshots showed an older interface.

| Source | Recorded pattern | Selected adaptation |
| --- | --- | --- |
| [Apple Home](https://support.apple.com/en-gb/guide/iphone/iph0a717a8fd/ios) | Quick power actions are distinct from detailed accessory controls. | Keep explicit On/Off visible and exact RGB behind Edit colour. |
| [Philips Hue](https://www.philips-hue.com/en-us/philips-hue-app) | Scenes, dimming and power share the everyday screen. | Keep brightness and power beside colour, with direct saved-light shortcuts. |
| [LIFX](https://www.lifx.com/pages/app) | A wheel selects colour, alongside brightness and saturation. | Use one large hue/saturation wheel and a substantial brightness slider. |
| [LIFX dashboard guide](https://support.lifx.com/hc/en-us/articles/14508927729815-Getting-Around-the-LIFX-App) | Dimmer interactions and favourites support frequent tasks. | Retain quick brightness levels and saved combinations. |
| [Nanoleaf](https://nanoleaf.me/en-jp/pages/nanoleaf-mobile-app) | Presets and custom scenes address different tasks. | Offer named quick colours as well as exact colour editing. |

## Decisions for one Bluetooth strip

These adaptations are project design decisions; they do not imply vendor endorsement. The noninteractive colour preview became a direct control. The owner selected one layout, so comparison navigation and layout preferences no longer belong in the app.

Power remains an explicit request because the strip does not acknowledge its state. Brightness has a 1% floor; Off is separate. Controls submit on release, opening sheets never submits, and edits after Off prepare the next On. Unverified effects, timers, white temperature and remote control are excluded.

The [current design](DESIGN.md) defines layout, colours and accessibility. Earlier comparison sketches remain in Git history.
