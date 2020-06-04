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
// or display lots of text, with a phone icon
require("notify").show({
  title:"Hello",
  src:"Test",
  body:"This is a really really really long bit of text that has to be wrapped",
  icon:require("heatshrink").decompress(atob("jEYxH+ACcejwUUAAYWVjESCqoABCqoYNCpQXLCxgXJQowtTA4ZbSZiwW/C4gWWjAXVZwIuVWhxFIC6z6OLpIXSCywXYDAIWVAAYXTA=="))
});
// remove it (can also be removed by tapping)
require("notify").hide();
```
