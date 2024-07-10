# Canned Replies Library

A library that handles replying to messages received from Gadgetbridge/Messages apps.

## Replying to a message
The user can define a set of canned responses via the customise page after installing the app, or alternatively if they have a keyboard installed, they can type a response back. The requesting app will receive either an object containing the full reply for GadgetBridge, or a string with the response from the user, depending on how they wish to handle the response.

## Integrating in your app
To use this in your app, simply call

```js
require("reply").reply(/*options*/{...}).then(result => ...);
```

The ```options``` object can contain the following:

- ```msg```: A message object containing a field ```id```, the ID to respond to. If this is included in options, the result of the promise will be an object as follows: ```{t: "notify", id: msg.id, n: "REPLY", msg: "USER REPLY"}```. If not included, the result of the promise will be an object, ```{msg: "USER REPLY"}```
- ```shouldReply```: Whether or not the library should send the response over Bluetooth with ```Bluetooth.println(...```. Useful if the calling app wants to handle the response a different way. Default is true.
- ```title```: The title to show at the top of the menu. Defaults to ```"Reply with:"```.
- ```fileOverride```: An override file to read canned responses from, which is an array of objects each with a ```text``` property. Default is ```replies.json```. Useful for apps which might want to make use of custom canned responses.

## Known Issues
Emojis are currently not supported.