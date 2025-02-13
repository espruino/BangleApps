# Icons Library

This library contains a set of icons that might be useful in your application, as well as a chooser for those icons:

```JS
// get a list of available icons
require("icons").getIconNames()

// draw an icon
g.drawImage(require("icons").getIcon("light"),0,0);

// Allow the user to request an icon
require("icons").showIconChooser().then(function(iconName) {
  console.log("User chose "+iconName);
}, function() {
  console.log("User Cancelled");
});
```

To ensure the app loader auto-installs this module along with your app, just add the line
```"dependencies" : { "messageicons":"module" },``` to your `metadata.json` file.