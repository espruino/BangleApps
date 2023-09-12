# Cards

Simple app to display loyalty cards synced from Catima through GadgetBridge.
The app can display the cards' info (balance, expiration, note, etc.) and tapping on the appropriate field will display the code, if the type is supported.

To come back to the visualization of the card's details from the code view, simply press the button.

Beware that the small screen of the Banglejs 2 cannot render properly complex barcodes (in fact the resolution is very limited to render most barcodes).

### Supported codes types

* `CODE_39`
* `CODABAR`
* `QR_CODE`

### Disclaimer

This app is a proof of concept, many codes are too complex to be rendered by the bangle's screen or hardware (at least with the current logic), keep that in mind.

### How to sync

_WIP: we currently cannot synchronize cards, a PR is under review in GadgetBridge repo, soon we will see support on nightly builds_

You can test it by sending on your bangle a file like this:

_android.cards.json_

```json
[
  {
    "id": 1,
    "name": "First card",
    "value": "01234",
    "note": "Some stuff",
    "type": "CODE_39",
    "balance": "15 EUR",
    "expiration": "1691102081"
  },
  {
    "id": 2,
    "name": "Second card",
    "value": "Hello world",
    "note": "This is a qr generated on the bangle!",
    "type": "QR_CODE",
    "balance": "2 P"
  }
]
```

### Credits

Barcode generation adapted from [lindell/JsBarcode](https://github.com/lindell/JsBarcode)

QR code generation adapted from [ricmoo/QRCode](https://github.com/ricmoo/QRCode)
