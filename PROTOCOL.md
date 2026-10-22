# LED protocol and Bluetooth

Afterglow sends binary commands from the phone browser to a BJ_LED_M controller. The app reads no power or colour state and receives no command acknowledgements. A completed write means the browser accepted the bytes; it does not confirm the strip changed.

## Connection

Open the HTTPS page in Bluefy on iPhone. Bluetooth permission belongs to the browser. Closing or suspending the page can interrupt the connection.

A Connect tap calls `navigator.bluetooth.requestDevice` with the name prefix `BJ_LED` and optional service EEA0. The observed controller did not advertise a service list, so discovery uses its name.

After selection, the app connects to GATT and discovers:

- Service EEA0: `0000eea0-0000-1000-8000-00805f9b34fb`.
- Characteristic EE01: `0000ee01-0000-1000-8000-00805f9b34fb`, with `writeWithoutResponse` support.

UUID comparison accepts equivalent short, zero-padded, full and compact forms returned by browser bridges. Different UUIDs and unsupported write channels fail the connection.

Reconnect reuses the selected device when available and discovers fresh GATT objects. Connect and reconnect send no lighting commands and do not replay earlier requests.

## Packets

All bytes below are hexadecimal. RGB channels are integers from 0 to 255. Brightness is an integer from 1 to 100%; black is rejected. Set `f = brightness / 100`.

### Colour and brightness

```text
69 96 05 02 floor(R*f) floor(G*f) floor(B*f) floor(255*f)
```

Red at 25%:

```text
69 96 05 02 3F 00 00 3F
```

The final scalar is retained as observed. Its hardware meaning has not been established.

### Off

```text
69 96 02 01 00
```

### On

```text
69 96 06 01 01 R G B floor(255*f)
```

On uses unscaled RGB. For blue at 25%:

```text
69 96 06 01 01 00 00 FF 3F
```

There is no added checksum or terminator. EE02 and older seven-byte formats are not supported.

## Sending and cancellation

Colour and brightness edits send once on release, keyboard completion or blur. Cancelled pointer edits remain local. After Off, edits update the selection without sending; On includes the current selection.

One scheduler serializes writes. It replaces trailing unsent colour requests with the latest selection. Off removes unsent colour requests and follows any write already in progress. Power requests retain their order. The queue holds at most 40 pending requests.

The app uses these timing limits:

- Connection and discovery have 15 seconds after device selection. The chooser itself has no deadline.
- Each write has an 8-second deadline.
- Writes are spaced at least 80 ms after the previous write completes.
- Normal disconnect waits for the current write with an 8-second bound, then holds the connection for 3 seconds after the last observed write activity.
- Disconnect confirmation has a 1.2-second limit.

These timings are application policy, apart from the 3-second hold retained from the owner's successful hardware test. They are not measured firmware limits. A write that never settles and a suspended page can prevent a clean disconnect.

Disconnect, link loss and timeout cancel queued work. The browser cannot cancel a write already in progress, so its outcome may be uncertain. The app never retries automatically. Check the physical strip before reconnecting and sending again.

Each connection attempt and scheduler activation has a generation. Old completions cannot change a newer connection or submit more commands. A late connection to a previously selected device is disconnected without affecting the current device.

## State and diagnostics

The app keeps selected settings, requested power and last submitted settings separately. Only settings and favourites persist in browser storage. Reload starts disconnected with power unknown and sends nothing. Moving to a different hostname creates separate browser storage.

Diagnostics retain the latest 100 events in page memory. Copy diagnostics exports timing, service/characteristic UUIDs and packet bytes. The app does not record device identifiers.

## Hardware evidence

The owner reported that Bluefy on their iPhone discovered BJ_LED_M and sent colour commands through EEA0/EE01. Red at 25% used the packet above. A 3-second connection hold worked; immediate disconnect had previously failed.

On and Off packet formats came from the reported BojiaLed Android 1.0.3 inspection. They pass software tests but still need physical confirmation on the owner's strip. Automated tests and browser checks use a simulated peripheral and do not establish radio delivery or LED output.

After transport changes, check the actual iPhone and strip: connect without changing the light, send colours, confirm Off and On, disconnect after a final write, reconnect without replay, and test link loss. Record the iPhone, iOS and Bluefy versions, exact packet bytes, timing and visible result.

## Implementation

- `src/protocol/bojia.ts` encodes packets.
- `src/bluetooth/session.ts` owns device selection, GATT discovery and connection state.
- `src/bluetooth/scheduler.ts` orders writes and handles cancellation, timeouts and spacing.
- `src/controller.ts` applies user actions to the selection and command queue.
