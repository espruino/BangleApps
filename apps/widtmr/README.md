# Timer Widget

This is a fork of the Chrono Widget, but implements a
simpler UI which to be able to set a timer faster with
less interaction. Additionally, it exposes some functions
that can be used by other apps or clocks to easily
implement a timer. It is used e.g. by lcars or notanalog.

# Overview
If you open the app, you can simply control the timer
by clicking on top, bottom, left or right of the screen.
If you tab at the middle of the screen, the timer is
started / stopped.

![](description.png)


# Lib
Different functions are exposed to integrate a timer
into your own app.

The following functions are available:
- isStarted() -> boolean
- setStarted(boolean) -> void
- increaseTimer(int) -> void
- decreaseTimer(int) -> void
- getRemainingMinutes() -> int

Example to increase the timer by 5 and ensure that its started:
```Javascript
WIDGETS["widtmr"].increaseTimer(5);
WIDGETS["widtmr"].setStarted(true);
```

Example to decrease the timer. This also disables the timer if time <= 0.:
```Javascript
WIDGETS["widtmr"].decreaseTimer(5);
```

# Creator

[David Peer](https://github.com/peerdavid)
 forked from [Purple-Tentacle](https://github.com/Purple-Tentacle)
