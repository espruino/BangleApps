# Notifications (default)

A handler for displaying notifications that displays them in a bar at the top of the screen

This is not an app, but instead it is a library that can be used by
other applications or widgets to display messages.

## Usage

```JS
options = {
  on : bool, // turn screen on, default true
  size : int, // height of notification, default 80 (max)  
  title : string, // optional title
  src : string, // optional source name
  body : string, // optional body text
  icon : string, // optional icon (image string)
  render function(y) {} // function callback to render
};
// eg... show notification
require("notify").show({title:"Test", body:"Hello"});
// remove it (can also be removed by tapping)
require("notify").hide();
```
