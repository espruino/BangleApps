# Timer Widget

This is a fork of the Chrono Widget, but implements a
simpler UI which to be able to set a timer faster with
less interaction. Additionally, it exposes some functions
that can be used by other apps or clocks to easily
implement a timer. It is used e.g. by lcars or notanalog.

# Lib
Different functions are exposed to integrate a timer
into your own app.

Example:
```Javascript
WIDGETS["widtmr"].isStarted();
WIDGETS["widtmr"].reload();
WIDGETS["widtmr"].getRemainingMinutes();
```
# Creator

[David Peer](https://github.com/peerdavid)
 forked from [Purple-Tentacle](https://github.com/Purple-Tentacle)
