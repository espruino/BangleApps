# Waypoints

This app provides a common way to set up the `waypoints.json` file,
which several other apps rely on for navigation.

## Waypoint JSON file

When the app is loaded from the app loader, a file named
`waypoints.json` is loaded along with the javascript etc. The file
has the following contents:


```
[
  {
  "name":"NONE"
  },
  {
  "name":"No10",
  "lat":51.5032,
  "lon":-0.1269
  },
  {
  "name":"Stone",
  "lat":51.1788,
  "lon":-1.8260
  },
  { "name":"WP0" },
  { "name":"WP1" },
  { "name":"WP2" },
  { "name":"WP3" },
  { "name":"WP4" }
]
```

The file contains the initial NONE waypoint which is useful if you
just want to display course and speed. The next two entries are
waypoints to No 10 Downing Street and to Stone Henge - obtained from
Google Maps. The last five entries are entries which can be
*marked*. (Some applications support marking but do not support
creating/naming a waypoint).

You add and delete entries using the Web IDE to load and then save
the file from and to watch storage. The app itself does not limit the
number of entries although it does load the entire file into RAM
which will obviously limit this.


## Editing waypoints over web interface

Clicking on the download icon of `Waypoints` in the app loader invokes the
waypoint editor. The editor downloads and displays the current
`waypoints.json` file. Clicking the `Edit` button beside an entry
causes the entry to be deleted from the list and displayed in the
edit boxes. It can be restored - by clicking the `Add waypoint`
button. A new markable entry is created by using the `Add name`
button. The edited `waypoints.json` file is uploaded to the Bangle by
clicking the `Upload` button.

## Editing waypoints on the device

You can also edit waypoints on the device, just start the editor from
the app launcher.