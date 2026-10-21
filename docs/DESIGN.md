# Design direction, version 1.1

Afterglow should work like a small lighting remote. The original interface made the owner scroll through a large dial, setup copy, sliders, presets and favourites. This revision puts everyday controls together and moves occasional tasks into separate views.

Palette: ink #191b21, raised charcoal #24272f, warm paper #f4f2ed, muted silver #a7a9b3, peach #f2b99a and error pink #ffc3bd. The selected colour appears in a small preview and a functional colour pad. System sans typography uses a 26-pixel app title, 18-pixel section headings and 14-pixel control labels. No remote fonts.

Layout: the shared header shows connection status and opens device details. Light is the default view, with explicit On, Off and Apply actions, a wide colour pad, brightness, quick levels and compact presets. Bottom navigation switches between Light, Saved and More without recreating the Bluetooth session. Saved contains named settings and edit actions. More contains help and diagnostics. Exact RGB, hue and saturation live in a bottom sheet opened from the colour value. Alignment is left except centred touch controls.

Review: a room illustration, giant dial or descriptive hero would displace the controls again. The colour pad is the visual focus and a large touch target. A power toggle would claim device knowledge the protocol cannot provide, so On and Off stay explicit. The active style means last requested, never device-reported state. Native modal sheets handle focus and have explicit Close actions. Touch targets are at least 44 pixels. Switching views, opening sheets and restoring data send nothing.
