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
* `Overwrite GPS` - when GPS is requested by an app, this doesn't use Bangle.js's GPS
but instead asks Gadgetbridge on the phone to use the phone's GPS
* `Messages` - launches the messages app, showing a list of messages

## How it works

Gadgetbridge on Android connects to Bangle.js, and sends commands over the
BLE UART connection. These take the form of `GB({ ... JSON ... })\n` - so they
call a global function called `GB` which then interprets the JSON.

Responses are sent back to Gadgetbridge simply as one line of JSON.

More info on message formats on http://www.espruino.com/Gadgetbridge

## Functions provided

The boot code also provides some useful functions:

* `Bangle.messageResponse = function(msg,response)` - send a yes/no response to a message. `msg` is a message object, and `response` is a boolean.
* `Bangle.musicControl = function(cmd)` - control music, cmd = `play/pause/next/previous/volumeup/volumedown`
* `Bangle.http = function(url,options)` - make an HTTPS request to a URL and return a promise with the data. Requires the [internet enabled `Bangle.js Gadgetbridge` app](http://www.espruino.com/Gadgetbridge#http-requests). `options` can contain:
  * `id` - a custom (string) ID
  * `timeout` - a timeout for the request in milliseconds (default 30000ms)
  * `xpath` an xPath query to run on the request (but right now the URL requested must be XML - HTML is rarely XML compliant)
  * `return`  for xpath, if not specified, one result is returned. If `return:"array"` an array of results is returned.
  * `method` HTTP method (default is `get`) - `get/post/head/put/patch/delete`
  * `body` the body of the HTTP request
  * `headers` an object of headers, eg `{HeaderOne : "headercontents"}`

`Bangle.http` returns a promise which contains:

```JS
{
  t:"http",
  id: // the ID of this HTTP request
  resp: "...." // a string containing the response
}
```

eg:

```JS
Bangle.http("https://pur3.co.uk/hello.txt").then(data=>{
  console.log("Got ",data.resp);
});
```

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
