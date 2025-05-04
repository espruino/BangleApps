# Swipe Inversion

Inverts swipe direction globally or per app, see settings. If global inversion is enabled, you can unselect the inversion per app and vice versa.

## Limitations

Swipe Inversion can only invert directions on apps that use `Bangle.setUI` to set up swipes. Swipes set up with `Bangle.on("swipe", ...)` is currently not managed.

Swiping behavior that uses the `drag` event is not altered either.

## TODO

- Add bootloader apps and widgets to the list of apps that can be individually toggled in settings?
  - How? Right now we look at `global.__FILE__` to find the active app in order to determine which events to invert. That doesn't work for widgets and bootcode.
    - In fact they will probably be inverted along with the currently running app.
- Refactor to invert at time of registering the event listeners?
  - This would make it so `swipeinv` does not depend on being first in the call list of event listeners.
  - Some work towards this was done in [thyttan@5cbb72e](https://github.com/thyttan/BangleApps/commit/5cbb72ee55f7fb7d335ffba228575a862a0ae612) but it doesn't work yet.

## Requests

Bug reports and feature requests should be done to the espruino/BangleApps github issue tracker.

## Creator

nxdefiant

## Contributors

thyttan
