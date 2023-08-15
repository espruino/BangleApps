# Cards

Basic viewer for loyalty cards synced from Catima through GadgetBridge.
The app can display the cards' info (balance, expiration, note, etc.) and tapping on the appropriate field will display the code, if the type is supported.

Double tapping on the code will come back to the visualization of the card's details.

Beware that the small screen of the Banglejs 2 cannot render properly complex barcodes (in fact the resolution is very limited to render most barcodes).

### Supported codes types

* `CODE_39`
* `CODABAR`
* `QR_CODE`

### How to sync

_WIP: we currently cannot synchronize cards_

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
