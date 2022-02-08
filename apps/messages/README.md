# Messages app

This app handles the display of messages and message notifications. It stores
a list of currently received messages and allows them to be listed, viewed,
and responded to.

It is a replacement for the old `notify`/`gadgetbridge` apps.

## Settings

You can change settings by going to the global `Settings` app, then `App Settings`
and `Messages`:

* `Vibrate` - This is the pattern of buzzes that should be made when a new message is received
* `Repeat` - How often should buzzes repeat - the default of 4 means the Bangle will buzz every 4 seconds
* `Unread Timer` - when a new message is received we go into the Messages app.
If there is no user input for this amount of time then the app will exit and return
to the clock where a ringing bell will be shown in the Widget bar.

## New Messages

When a new message is received:

* If you're in an app, the Bangle will buzz and a 'new message' icon appears in the Widget bar. You can tap this bar to view the message.
* If you're in a clock, the Messages app will automatically start and show the message

When a message is shown, you'll see a screen showing the message title and text.

* The 'back-arrow' button (or physical button on Bangle.js 2) goes back to Messages, marking the current message as read.
* The top-left icon shows more options, for instance deleting the message of marking unread
* On Bangle.js 2 you can tap on the message body to view a scrollable version of the title and text (or can use the top-left icon + `View Message`)
* If shown, the 'tick' button:
   * **Android** opens the notification on the phone
   * **iOS** responds positively to the notification (accept call/etc)
* If shown, the 'cross' button:
   * **Android** dismisses the notification on the phone
   * **iOS** responds negatively to the notification (dismiss call/etc)

## Images
_1. Screenshot of a notification_

![](screenshot.png)

_2. What the notify icon looks like (it's touchable on Bangle.js2!)_

![](screenshot-notify.gif)



## Requests

Please file any issues on https://github.com/espruino/BangleApps/issues/new?title=messages%20app

## Creator

Gordon Williams

## Contributors

[Jeroen Peters](https://github.com/jeroenpeters1986)

## Attributions

Icons used in this app are from https://icons8.com
