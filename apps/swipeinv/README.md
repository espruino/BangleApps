# Swipe Inversion

Inverts swipe direction globally or per app, see settings. If global inversion is enabled, you can unselect the inversion per app and vice versa.

## Limitations

Swipe Inversion can only invert directions on apps that use `Bangle.setUI` to set up swipes. Swipes set up with `Bangle.on("swipe", ...)` is currently not managed.

Swiping behavior that uses the `drag` event is not altered either.

## TODO

- Try to handle swipes from `Bangle.on("swipe", ...)`
  - alternatively refactor apps using that to only use `Bangle.setUI` for setting up swipes.
    - Think about how to accommodate e.g. `touch` or `back` handlers set up in `Layout` library calls. They are removed if we refactor some `Bangle.on("swipe", ...)` to `Bangle.setUI`. (Is it maybe resolved if we call `Bangle.setUI` before the `Layout` call? - have not tested that yet.)
- Add bootloader apps and widgets to the list of apps that can be individually toggled in settings?

## Requests

Bug reports and feature requests should be done to the espruino/BangleApps github issue tracker.

## Creator

nxdefiant

## Contributors

