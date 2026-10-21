# Protocol evidence and limits

This fresh implementation uses the hardware findings supplied in the commission. The older experiment's source and detailed evidence file were not present in this new workspace. No additional reverse engineering or physical validation is claimed here.

## Owner-confirmed research background

- Bluefy on the owner's iPhone discovered and connected to BJ_LED_M.
- EEA0 and EE01 were observed and used for successful colour writes.
- Red at 25% used `69 96 05 02 3F 00 00 3F`. The owner also reported a successful colour/brightness flow.
- A three-second connection hold after a write worked. Immediate disconnect previously did nothing.

## Implemented baseline

Discovery uses the BJ_LED name prefix and optional EEA0 service permission because the observed controller did not advertise a service list. The app validates EEA0 and the EE01 write-without-response capability. It writes binary Uint8Array values, with no reads or subscriptions.

Colour frame: `69 96 05 02 floor(R*f) floor(G*f) floor(B*f) floor(255*f)`, where `f = brightness / 100`. The final scalar is preserved without assigning it an unverified white-channel meaning. Brightness is 1 to 100, integer channels are 0 to 255, and black is rejected.

Off frame: `69 96 02 01 00`.

On frame: `69 96 06 01 01 R G B floor(255*f)`. RGB is unscaled in On. The full frame is required. No checksum, terminator or generic short On toggle is added.

The power formats came from the described BojiaLed Android 1.0.3 inspection and software checks. Their actual behavior on the owner's strip is still unconfirmed. Persistent connection behavior in this new app also awaits physical testing.

EE02 and older seven-byte instructions are excluded. The reported unsuccessful tests and temporary loss of normal lighting control did not establish a causal relationship. Similar-looking strips with other controllers are not supported by assumption.

## Software policy, not measured firmware constraints

The 15-second connection deadline, 8-second write deadline, 80 ms minimum spacing and 1.2-second disconnect confirmation bound are conservative application policy. The three-second hold preserves the successful physical test. It is not a required interval between each write.

Writes without response are submissions, not application acknowledgements. See [Apple's Core Bluetooth write documentation](https://developer.apple.com/documentation/corebluetooth/cbperipheral/writevalue(_:for:type:)). The app reports command sent, failed, cancelled or uncertain and never claims that the strip reported its output.

## Not verified or advertised

Effects, music sync, firmware variants, timers and unattended scheduling have no validated implementation. A closed iPhone cannot act as a reliable cloud BLE gateway.

Record the new app's physical results in [the validation record](docs/VALIDATION.md), independently of software test results.
