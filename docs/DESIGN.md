# Design direction

Afterglow controls one RGB strip. The owner chose the colour wheel as the only layout. Power sits above colour, followed by brightness, saved lights and feedback. Exact colour, saved-light editing, device details and help open in sheets.

## Controls and feedback

- On and Off are explicit requests. The moving highlight and caption show the last request, since the strip reports no power state. Neither action is selected on page load.
- The wheel selects hue and saturation. Brightness ranges from 1 to 100%, with quick levels at 10, 25, 50 and 100%.
- Drag controls send once on release or keyboard completion. A cancelled gesture leaves a local selection and sends nothing on later blur.
- After Off, edits prepare the next On. Connect, reconnect, restoration and opening sheets send no lighting commands.
- Edit colour provides separate hue/saturation sliders, named colours and validated Hex/RGB fields.
- Saved lights stores up to 30 combinations; up to three appear as shortcuts. Saving, renaming, replacement and deletion do not change the strip.

The page has no enclosing cards, bottom navigation, layout chooser or Apply step. Spacing separates the controls. Graphite #171b20, raised material #242b33, pearl #f3f5f7 and muted silver #aab3bf use system typography. Selected colour appears in the wheel marker, brightness track and saved swatches.

## Accessibility and sheets

Interactive targets are at least 44 pixels high. Keyboard focus is visible; the wheel supports arrow keys and has instructions pointing to the separate sliders. Native modal sheets focus their heading and restore focus to the opener. Close, Escape, backdrop tap and a downward swipe from noninteractive content at scroll top dismiss a sheet. Sliders, fields, buttons and scrolling retain their own gestures.

The power highlight slides in 280 ms; reduced motion disables transitions. Sheets have an opaque base and apply blur when supported. Reduced-transparency preferences disable their blur.

The [research notes](UX_RESEARCH.md) explain the selected interaction patterns. Earlier design alternatives remain in Git history.
