# Description

A music control widget based on [Swipe Bluetooth Music Controls] (based on [Bluetooth Music Controls]).
By operating as a widget, you can control music without leaving your current app (e.g. on a run, bike ride or just watching the clock).


[Swipe Bluetooth Music Controls]: https://github.com/espruino/BangleApps/tree/master/apps/hidmsicswipe
[Bluetooth Music Controls]: https://github.com/espruino/BangleApps/tree/master/apps/hidmsic

# Usage

Swipe down to enable - note the icon changes from blue to orange, indicating it's listening for your instruction. Then drag up/down for volume, left/right for previous and next and tap for play/pause.

All other watch interaction is disabled for 3 seconds, to prevent clashing taps/drags - this period is extended as you continue to alter the volume, play/pause and jump between tracks.

Requires espruino firmware > 2v17 to avoid event handler clashes.

# Setup / Technical details

Note that HID must be enabled in settings. Then provided you're paired with your phone/computer, the widget icon will appear and you can control music from your clock face!

The app disables all other drag and tap handlers while this widget is "active" (in a similar manner to [`backswipe`](https://github.com/espruino/BangleApps/pull/2524#issuecomment-1406230564) and [`lightswitch`](https://github.com/espruino/Espruino/issues/2151#issuecomment-1042423211)).
