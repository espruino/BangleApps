# Messages library

This library handles the passing of messages. It can storess a list of messages 
and allows them to be retrieved by other apps.

## Example

Assuming you are using GadgetBridge and "overlay notifications":

1. Gadgetbridge sends an event to your watch for an incoming message
2. The `android` app parses the message, and calls `require("messages").pushMessage({/** the message */})`
3. `require("messages")` calls `Bangle.emit("message", "text", {/** the message */})`
4. Overlay Notifications shows the message in an overlay, and marks it as `handled`
5. The default UI app (Message UI, `messagegui`) sees the event is marked as `handled`, so does nothing.
6. The default widget (`widmessages`) does nothing with `handled`, and shows a notification icon.
7. You tap the notification, in order to open the full GUI: Overlay Notifications
   calls `require("messages").openGUI({/** the message */})`
8. `openGUI` calls `require("messagegui").open(/** copy of the message */)`.
9. The `messagegui` library loads the Message UI app.



## Events

When a new message arrives, a `"message"` event is emitted, you can listen for
it like this:

```js
myMessageListener = Bangle.on("message", (type, message)=>{
  if (message.handled) return; // another app already handled this message
  // <type> is one of "text", "call", "alarm", "map", or "music"
  // see `messages/lib.js` for possible <message> formats
  // message.t could be "add", "modify" or "remove"
  E.showMessage(`${message.title}\n${message.body}`, `${message.t} ${type} message`);
  // You can prevent the default `message` app from loading by setting `message.handled = true`:
  message.handled = true;
});
```

Apps can launch the full GUI by calling `require("messages").openGUI()`, if you
want to write your own GUI, it should include boot code that listens for
`"messageGUI"` events:

```js
Bangle.on("messageGUI", message=>{
  if (message.handled) return; // another app already opened it's GUI
  message.handled = true; // prevent other apps form launching
  Bangle.load("my_message_gui.app.js");
})

```


## Requests

Please file any issues on https://github.com/espruino/BangleApps/issues/new?title=[messages]%20library

## Creator

Gordon Williams

## Contributors

[Jeroen Peters](https://github.com/jeroenpeters1986)

## Attributions

Icons used in this app are from https://icons8.com
