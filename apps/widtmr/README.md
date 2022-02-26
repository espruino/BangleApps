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


# Library for other Apps
Different functions are exposed to integrate a timer
into your own app.

The following functions are available:
- isStarted() -> boolean
- setStarted(boolean) -> void
- resetTimer() -> void
- increaseTimer(int) -> void
- decreaseTimer(int) -> void
- getRemainingMinutes() -> int
- getRemainingTime() -> DateTime
- getRemainingTimeStr() -> str

For example if we want to increase the timer by +5 minutes each time
the touch event is fired:
```Javascript
Bangle.loadWidgets();
...
Bangle.on('touch', function(btn, e){
  // Set to zero if alarm was disabled before
  if(!isAlarmEnabled()){
    WIDGETS["widtmr"].resetTimer();
  }

  WIDGETS["widtmr"].increaseTimer(5);
  WIDGETS["widtmr"].setStarted(true);
});
```

Example to decrease the timer by 5 and stop if 0 is reached:
```Javascript
Bangle.loadWidgets();
...
Bangle.on('touch', function(btn, e){
    WIDGETS["widtmr"].decreaseTimer(5);
}
```

# Creator

[David Peer](https://github.com/peerdavid)


# Thanks to...
Forked from Chrono Widget of [Purple-Tentacle](https://github.com/Purple-Tentacle)

Time icon created by <a href="https://www.flaticon.com/free-icons/time" title="time icons">CreativeCons - Flaticon</a>