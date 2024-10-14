# Clock Info module

Module that allows for loading of clock 'info' displays
that can be scrolled through on the clock face.

## Usage

In most clocks that use Clock Info, you can interact with it the following way:

* Tap on an info menu to 'focus' it (this will highlight it in some way)
* Swipe up/down to change which info is displayed within the category
* Tap to activate (if supported), eg for a Stopwatch, Home Assistant, etc
* Swipe left/right to change between categories (Bangle.js/Agenda/etc)
* Tap outside the area of the Clock Info to 'defocus' it

## Extensions

By default Clock Info provides:

* Battery
* Steps
* Heart Rate (HRM)
* Altitude

But by installing other apps that are tagged with the type `clkinfo` you can
add extra features. For example [Sunrise Clockinfo](http://banglejs.com/apps/?id=clkinfosunrise)

A full list is available at https://banglejs.com/apps/?c=clkinfo

## Settings

Available from `Settings -> Apps -> Clock Info`

* `Defocus on Lock` - (default=on) when the watch screen auto-locks, defocus
and previously focussed Clock Infos
* `HRM` - (default=always) when does the HRM stay on?
  * `Always` - When a HRM ClockInfo is shown, keep the HRM on
  * `Tap` - When a HRM ClockInfo is shown, turn HRM on for 1 minute. Turn on again when tapped.
* `Max Altitude` - on clocks like [Circles Clock](https://banglejs.com/apps/?id=circlesclock) a
  progress/percent indicator may be shown. The percentage for altitude will be how far towards
  the Max Altitude you are. If you go higher than `Max Altitude` the correct altitude will still
  be shown - the percent indicator will just read 100%

## API (Software development)

See http://www.espruino.com/Bangle.js+Clock+Info for details on using
this module inside your apps (or generating your own Clock Info
extensions).

`load()` returns an array of menu objects, where each object contains a list of menu items:
* `name` : text to display and identify menu object (e.g. weather)
* `img` : a 24x24px image
* `dynamic` : if `true`, items are not constant but are sorted (e.g. calendar events sorted by date). This is only used by a few clocks, for example `circlesclock`
* `items` : menu items such as temperature, humidity, wind etc.

Note that each item is an object with:

* `item.name` : friendly name to identify an item (e.g. temperature)
* `item.hasRange` : if `true`, `.get` returns `v/min/max` values (for progress bar/guage)
* `item.get` : function that returns an object:

```JS
{
  'text'  // the text to display for this item
  'short' // optional: a shorter text to display for this item (at most 6 characters)
  'img'   // optional: a 24x24px image to display for this item
  'color' // optional: a color string (like "#f00") to color the icon in compatible clocks
  'v'     // (if hasRange==true) a numerical value
  'min','max' // (if hasRange==true) a minimum and maximum numerical value (if this were to be displayed as a guage)
}
```

* `item.show` : called when item should be shown. Enables updates. Call BEFORE 'get'. Passed the clockinfo options (same as what's returned from `addInteractive`).
* `item.hide` : called when item should be hidden. Disables updates. Passed the clockinfo options.
* `.on('redraw', ...)` : event that is called when 'get' should be called again (only after 'item.show')
* `item.run` : (optional) called if the info screen is tapped - can perform some action. Return true if the caller should feedback the user.
* `item.focus` : called when the item is focussed (the user has tapped on it). Passed the clockinfo options.
* `item.blur` : called when the item is unfocussed (the user has tapped elsewhere, the screen has locked, etc). Passed the clockinfo options.

See the bottom of `lib.js` for example usage...

example.clkinfo.js :

```JS
(function() {
  return {
    name: "Bangle",
    img: atob("GBiBAAD+AAH+AAH+AAH+AAH/AAOHAAYBgAwAwBgwYBgwYBgwIBAwOBAwOBgYIBgMYBgAYAwAwAYBgAOHAAH/AAH+AAH+AAH+AAD+AA==") }),
    items: [
      { name : "Item1",
        get : () => ({ text : "TextOfItem1", v : 10, min : 0, max : 100,
                      img : atob("GBiBAAD+AAH+AAH+AAH+AAH/AAOHAAYBgAwAwBgwYBgwYBgwIBAwOBAwOBgYIBgMYBgAYAwAwAYBgAOHAAH/AAH+AAH+AAH+AAD+AA==")
                    }),
        show : () => {},
        hide : () => {}
        // run : () => {} optional (called when tapped)
      }
    ]
  };
}) // must not have a semi-colon!
```
