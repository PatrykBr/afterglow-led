# Use Afterglow in Bluefy

1. Open the HTTPS URL in [the deployment record](DEPLOYMENT.md) inside Bluefy on your iPhone.
2. Enable Bluetooth and allow Bluefy to use it in iPhone Settings. Keep the powered strip nearby. Close BojiaLed or another controller if it holds the connection.
3. Tap Connect. Choose BJ_LED_M in Bluefy's device selection window. Wait for the connected status. The lights have not been changed by connecting.
4. Choose a colour, adjust saturation and brightness, or tap a named preset. Disconnected edits are saved locally. After connecting, tap Apply selection to send a prepared setting. Further slider edits send when released.
5. Use Turn off and Turn on for power. After Off, colour edits prepare the next On setting and do not send colour writes. Turn on sends the full selected colour and brightness. Check the physical strip; power packet behavior is awaiting owner confirmation.
6. Tap Save to name a favourite. Its edit button lets you rename it, replace it with the current selection or delete it. Saving or managing favourites sends no commands. Selecting a favourite follows the same colour rules as other edits.
7. To leave cleanly, tap Disconnect and wait for Not connected. After the most recent write, the app holds the connection for at least three seconds before disconnecting. It may take longer while an in-flight write settles.
8. Tap Reconnect after disconnect or link loss. It reuses the selected device where possible. It does not change the lights; apply your selection explicitly. Use Choose a device again if selection must be renewed.
9. Bookmark the page through Bluefy's bookmark menu for future use. A reload or a new page session may require device selection again. Bluefy controls permissions; this app cannot promise permanent access.

Keep Bluefy in the foreground while controlling the light. Closing, backgrounding or locking the phone can interrupt the page or connection. On return, check the connection status. No uncertain command is retried automatically.

If Bluetooth is unavailable, verify you are opening the HTTPS page in Bluefy, not Safari or an untested home-screen context. Modern compiled JavaScript cannot add an absent Bluetooth API.

If you cancel the chooser, tap Connect again when ready. If permission was denied, allow Bluefy in iPhone Settings. If the strip does not appear or connection times out, move closer, check power and close other controllers. A timeout may leave the last command's result uncertain. Check the light before explicitly sending another command.

Diagnostics & troubleshooting contains an export button. If the clipboard is unavailable, select and copy the displayed history. It contains recent timing and command bytes, but no device identifiers.

References: [Bluefy's connection guide](https://bluefy.app/guide.html) and [MDN Web Bluetooth security requirements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API).
