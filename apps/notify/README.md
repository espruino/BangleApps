# Notifications

Notifications adds the ability for other apps to display fullscreen notifications.

## Usage for app developers

For this to be available in your app you either need to display widgets using `Bangle.loadWidgets();` or specifically loading the notify widget with `eval(require("Storage").read("notify.app.js"))`.

```js
ShowFullscreenNotification(
  "Source of notification",
  "Title of notification",
  "Notification body text"
);
```
