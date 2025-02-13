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

We can synchronize cards with GadgetBridge and Catima, refer to those projects for further information.
The feature is currently available on nightly builds only.
It should be released from version 0.77 (not yet out at the time of writing).

GadgetBridge syncronizes all cards at once, if you have too many cards you may want to explicitly select which ones to syncronize, keep in mind the limitations of the Banglejs.

### Credits

Barcode generation adapted from [lindell/JsBarcode](https://github.com/lindell/JsBarcode)

QR code generation adapted from [ricmoo/QRCode](https://github.com/ricmoo/QRCode)
