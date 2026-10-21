# Use Afterglow in Bluefy

1. Open the HTTPS URL in [the deployment record](DEPLOYMENT.md) inside Bluefy on your iPhone.
2. Enable Bluetooth and allow Bluefy to use it in iPhone Settings. Keep the powered strip nearby. Close BojiaLed or another controller if it holds the connection.
3. Tap Connect. Choose BJ_LED_M in Bluefy's device selection window. Wait for the connected status. The lights have not been changed by connecting.
4. Drag the colour pad to choose a hue. Lower positions give softer colours. Adjust Brightness or use a quick level or preset. Tap the colour value to open Exact colour, with hue and saturation sliders, Hex and RGB fields. Disconnected edits are saved locally. After connecting, adjust a control to send a change or tap On to use the prepared setting. Colour and slider edits send when released. There is no Apply step.
5. Use On and Off for power. After Off, colour edits prepare the next On setting and do not send colour writes. On sends the full selected colour and brightness. A highlighted power action is the last request, not a device reading. Check the physical strip; power packet behavior is awaiting owner confirmation.
6. Tap the plus button beside Presets to save this light. The bookmark opens Saved lights, with your named colour/brightness combinations. Each light's menu lets you rename it, replace it with the current selection or confirm deletion. Saving or managing favourites sends no commands. Selecting a favourite closes the sheet and follows the same colour rules as other edits.
7. To leave cleanly, tap the connection status or Bluetooth button in the header to open Your strip, then tap Disconnect and wait for Not connected. After the most recent write, the app holds the connection for at least three seconds before disconnecting. It may take longer while an in-flight write settles.
8. Tap Reconnect after disconnect or link loss. It reuses the selected device where possible. It does not change the lights; apply your selection explicitly. Use Choose a device again if selection must be renewed.
9. Bookmark the page through Bluefy's bookmark menu for future use. A reload or a new page session may require device selection again. Bluefy controls permissions; this app cannot promise permanent access.

Keep Bluefy in the foreground while controlling the light. Closing, backgrounding or locking the phone can interrupt the page or connection. On return, check the connection status. No uncertain command is retried automatically.

If Bluetooth is unavailable, verify you are opening the HTTPS page in Bluefy, not Safari or an untested home-screen context. Modern compiled JavaScript cannot add an absent Bluetooth API.

If you cancel the chooser, tap Connect again when ready. If permission was denied, allow Bluefy in iPhone Settings. If the strip does not appear or connection times out, move closer, check power and close other controllers. A timeout may leave the last command's result uncertain. Check the light before explicitly sending another command.

The options button in the header opens the Bluefy guide, connection help and Diagnostics & protocol notes. Use Copy diagnostics to export history. If the clipboard is unavailable, select and copy the displayed history. It contains recent timing and command bytes, but no device identifiers. Opening and closing these sheets keeps the active Bluetooth session and sends no commands.

References: [Bluefy's connection guide](https://bluefy.app/guide.html) and [MDN Web Bluetooth security requirements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API).
