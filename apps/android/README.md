# Android Integration

This app allows your Bangle.js to receive notifications [from the Gadgetbridge app on Android](http://www.espruino.com/Gadgetbridge)

See [this link](http://www.espruino.com/Gadgetbridge) for notes on how to install
the Android app (and how it works).

It requires the `Messages` app on Bangle.js (which should be automatically installed) to
display any notifications that are received.

## Settings

You can access the settings menu either from the `Android` icon in the launcher,
or from `App Settings` in the `Settings` menu.

It contains:

* `Connected` - shows whether there is an active Bluetooth connection or not
* `Find Phone` - opens a submenu where you can activate the `Find Phone` functionality
of Gadgetbridge - making your phone make noise so you can find it.
* `Keep Msgs` - default is `Off`. When Gadgetbridge disconnects, should Bangle.js
keep any messages it has received, or should it delete them?
* `Messages` - launches the messages app, showing a list of messages

## How it works

Gadgetbridge on Android connects to Bangle.js, and sends commands over the
BLE UART connection. These take the form of `GB({ ... JSON ... })\n` - so they
call a global function called `GB` which then interprets the JSON.

Responses are sent back to Gadgetbridge simply as one line of JSON.

More info on message formats on http://www.espruino.com/Gadgetbridge

## Testing

Bangle.js can only hold one connection open at a time, so it's hard to see
if there are any errors when handling Gadgetbridge messages.

However you can:

* Use the `Gadgetbridge Debug` app on Bangle.js to display/log the messages received from Gadgetbridge
* Connect with the Web IDE and manually enter the Gadgetbridge messages on the left-hand side to
execute them as if they came from Gadgetbridge, for instance:

```
GB({"t":"notify","id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"})
```
