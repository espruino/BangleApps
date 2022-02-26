# Timer Widget

This is a fork of the Chrono Widget, but implements a
simpler UI. Additionally, it exposes functions for other
apps or clocks such that they can easily implement a timer.
Currently, it is used by lcars and notanalog.

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
- setTime(t) -> void
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
  // Set to zero if alarm was disabled before. Otherwise
  // it starts from the last setting made by the user.
  if(!isAlarmEnabled()){
    WIDGETS["widtmr"].setTime(0);
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

You can find implementations and usages in the lcars or notanalog app.


# Creator
[David Peer](https://github.com/peerdavid)


# Thanks to...
Forked from Chrono Widget of [Purple-Tentacle](https://github.com/Purple-Tentacle)

Time icon created by <a href="https://www.flaticon.com/free-icons/time" title="time icons">CreativeCons - Flaticon</a>