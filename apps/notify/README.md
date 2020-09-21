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
  id // optional notification ID, used with hide()
  src : string, // optional source name
  body : string, // optional body text
  icon : string, // optional icon (image string)
  render function(area) {} // function callback to render in area{x,y,w,h} 
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

// Use ID to only hide a specific notification if it is still visible
require("notify").show({id:1, title:"Test", body:"Some Alert"});
require("notify").show({id:"msg", title:"Message", body:"Incoming Message"}); // replaces Test Alert
require("notify").hide({id:1}); // does nothing, because the Test Alert was already replaced
require("notify").hide({id:"msg"}); // hides Message
require("notify").hide(); // hides current notification, whatever it was
```
