# BangTurn

A Bangle.js 2 app that tells you when to turn around on an out-and-back walk (an hour, or the length you set).

Tap the screen to start (the button never starts a walk). At 30 minutes the watch buzzes hard and shows
**TURN AROUND**. On the way back it buzzes 1, 2 and 3 times when half, a
quarter and an eighth of the way back is left (15, 7.5 and 3.75 minutes on
an hour walk), and the walk ends quietly at an hour. The screen shows the
countdown and your average speed out and back (GPS), each with the time it
would take to get back to the start at that speed, and a bottom row with
the speed you need to be back as the countdown reaches 0 (target symbol),
your speed now (speedometer) and the difference between them.
The way back is measured along the path you walked, with loops and detours
cut out. A widget shows the
minutes left in other apps. Press the button during a walk for **Resume**,
**-1 min** (if you started late) and **Cancel walk**.

## Settings

Press the button on the start screen for a menu:

- **Length**: the length of the walk. Drag the hours and minutes wheels. The
  countdown shows the total in minutes, so 1 h 30 starts at `90:00`. A new
  length applies to the next walk.
- **Info**: where the GPS comes from and the battery (see below).
- **Units**: tap to switch the speeds between kph and mph.
- **GPS log**: off by default. When on, each walk records every GPS fix the
  watch gets, so the speeds can be checked against what GPS really sent (see
  below).
- **Use watch GPS**: yes by default. Set it to **no** to keep the watch's own
  GPS chip (the big battery drain) off: walks then use only the phone's GPS
  (see Battery below), and if the phone's fixes stop, the speeds and the way
  home wait for them rather than switching to the watch. Without the phone's
  GPS set up, a walk then has no GPS at all: the timer and buzzes still work,
  and the speeds show `--`. It applies at once, also during a walk.

Length, Units, GPS log and Use watch GPS are also in Settings > Apps > BangTurn, and Info,
Units and Use watch GPS in the menu during a walk.

## GPS log

Switch **GPS log** on before a walk. The walk then saves each GPS fix as it
arrives (from the phone or the watch) to `bangturn.log` on the watch, about
250 KB an hour, up to 1 MB. Info shows its size. The log of the last walk
stays on the watch until the next walk starts a new one.

To download it after the walk: open the App Loader you installed BangTurn
from (on a computer, disconnect the watch from Gadgetbridge first), connect,
go to **My Apps**, and press the download button next to BangTurn.
Gadgetbridge's own App Loader on the phone works too, without disconnecting.
**Download GPS log** saves it as a CSV file. The same page can delete it.

## Leaving the app

The walk keeps running when you leave the app: swipe right or long-press the
button to go back to the clock. The widget by the battery shows the minutes
left, and tapping it (with the watch unlocked) opens BangTurn again. If
BangTurn is open when a walk ends, it goes back to the clock 8 minutes later.

If you use the Alarms app: BangTurn's entries are hidden there, but its
Advanced menu's Disable All and Delete All also switch off or remove the
entries of a walk that's running.

## Phone GPS and battery

BangTurn costs nothing when no walk is running: no timers, no GPS, no
wake-ups left in the scheduler. During a walk it keeps GPS on for the speeds and
the widget redraws once a minute; GPS goes off at the end, on Cancel walk,
and by itself shortly after the end if anything else misses it.

What to expect (rough figures):

- **No walks:** a Bangle.js 2 on a plain clock, connected to Gadgetbridge,
  usually lasts one to two weeks, so a few percent a day. Heart rate
  monitoring set to continuous or frequent, a long backlight timeout, or lots
  of notifications cut that a lot.
- **A walk with the watch's own GPS:** the GPS chip draws about 20 mA, so
  roughly 10 to 20% of the battery per hour.
- **A walk with the phone's GPS** (Android Integration, "Overwrite GPS" on):
  the watch's GPS chip goes off once the phone's fixes arrive, so the walk
  should cost the watch much less. The phone's battery pays instead. If the
  phone stops sending fixes, the watch's own GPS takes over, unless **Use
  watch GPS** is set to no.

To use the phone's GPS, all three of these are needed (otherwise every
walk runs the watch's own GPS):

- On the watch: Settings > Apps > Android Integration > **Overwrite GPS** on.
- In Gadgetbridge on the phone: the Bangle.js device's settings (the gear on
  its card) > Location > **Use phone gps data** on. It is off by default;
  while it's off, Gadgetbridge shows "Phone gps data update is deactivated
  in the settings" on the phone when a walk starts.
- Gadgetbridge allowed to use the phone's location: in Gadgetbridge's own
  Settings > Location, press **Acquire location** (it asks for the location
  permission) and leave **Keep location
  updated** on (Gadgetbridge drops phone fixes while it's off). The phone's
  location must be on too.

Info's **Phone GPS** row (below) says which of these is missing. During a
walk, the symbol left of the time of day (top row) shows it at a glance: a phone
when the speeds come from the phone's GPS, a red crosshair while the watch's
own GPS chip is on (the battery drain), blank before any GPS.

Android Integration switches to the watch's own GPS as soon as one phone
fix is a second later than the gap between the last two, and a phone's fixes
are irregular (more so when it sits still), so left alone the watch's GPS
flaps on and off all walk. During a walk BangTurn steps in: while the phone
is connected over Bluetooth, the watch's GPS only comes on after a minute
with no phone fix (Info's Phone GPS reads "waiting" meanwhile), and goes off
again at the phone's next one. If Bluetooth drops, it comes on at once. The
same applies when you change app during a walk, if the phone sent a fix in
the last two minutes.

To tell BangTurn from a faulty watch:

1. Check phone GPS is set up as above, if you mean the phone to supply GPS.
2. Charge to 100% and leave the watch on the clock for a day with no walk.
   BangTurn does nothing then, so a big drop (say over 15 to 20% in a day)
   isn't BangTurn: check the Health app's heart rate setting and the
   backlight timeout. To be sure, uninstall BangTurn and repeat.
3. Note the battery before and after one walk to see what a walk costs.
4. Press the button and choose **Info** (during a walk, or from the start
   screen's menu). **GPS via**
   says where the last GPS fix came from (phone, or watch for its own GPS)
   and **Watch GPS** says whether the watch's GPS chip is powered, asked of
   the firmware itself. **Phone GPS** checks the phone GPS setup: "working",
   "setting off" (Overwrite GPS is off on the watch), "no Bluetooth" (not
   connected to Gadgetbridge), "waiting" (the phone's fixes have stopped
   and the watch's GPS is held off for up to a minute) or "no fixes" (asked, but Gadgetbridge sends
   nothing: turn on Use phone gps data, and press Acquire location in
   Gadgetbridge's Settings > Location).
   With the phone supplying GPS it should read phone
   and off, a few seconds after the walk starts or you open BangTurn (the
   watch's GPS runs until the phone's first fix arrives). **Last fix** says
   how long ago GPS last gave a position, and **Battery** the charge left.
   **GPS apps** lists every app that has asked for GPS (BangTurn shows as
   bangturn), from the firmware's own list. If an app other than bangturn
   is there, it's keeping GPS on too. With phone GPS an app can be listed
   while the chip is off: Watch GPS says whether the chip itself is on.
   Tap a row to refresh it. If it says watch and ON, the phone isn't
   supplying GPS.
5. The Power Manager app's logging can show which code keeps waking the
   watch.

A watch that still drains fast with nothing installed beyond the defaults
may be faulty: Espruino's forum and support can help.


## More

- Source, issues and development builds: [github.com/cbishopvelti/bangturn](https://github.com/cbishopvelti/bangturn)
- How it works in detail: [the spec](https://github.com/cbishopvelti/bangturn/blob/main/docs/spec.md)
- Developing and testing: [docs/DEVELOPMENT.md](https://github.com/cbishopvelti/bangturn/blob/main/docs/DEVELOPMENT.md)
