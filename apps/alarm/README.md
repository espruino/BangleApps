# Alarms & Timers

This app allows you to add/modify any alarms, timers and events.

Optional: When a keyboard app is detected, you can add a message to display when any of these is triggered.  If a datetime input app (e.g. datetime_picker) is detected, it will be used for the selection of the date+time of events.

It uses the [`sched` library](https://github.com/espruino/BangleApps/blob/master/apps/sched) to handle the alarm scheduling in an efficient way that can work alongside other apps.

## Menu overview

- `New...`
  - `New Alarm` &rarr; Configure a new alarm (triggered based on time and day of week)
    - `Repeat` &rarr; Select when the alarm will fire. You can select a predefined option (_Once_, _Every Day_, _Workdays_ or _Weekends_ or you can configure the days freely)
  - `New Timer` &rarr; Configure a new timer (triggered based on amount of time elapsed in hours/minutes/seconds)
  - `New Event` &rarr; Configure a new event (triggered based on time and date)
    - `Repeat` &rarr; Alarm can be fired only once or repeated (every X number of _days_, _weeks_, _months_ or _years_)
- `Advanced`
  - `Scheduler settings` &rarr; Open the [Scheduler](https://github.com/espruino/BangleApps/tree/master/apps/sched) settings page, see its [README](https://github.com/espruino/BangleApps/blob/master/apps/sched/README.md) for details
  - `Enable All` &rarr; Enable _all_ disabled alarms & timers
  - `Disable All` &rarr; Disable _all_ enabled alarms & timers
  - `Delete All` &rarr; Delete _all_ alarms & timers

## Creator

- [Gordon Williams](https://github.com/gfwilliams)

## Main Contributors

- [Alessandro Cocco](https://github.com/alessandrococco) - New UI, full rewrite, new features
- [Sabin Iacob](https://github.com/m0n5t3r) - Auto snooze support
- [storm64](https://github.com/storm64) - Fix redrawing in submenus

## Attributions

All icons used in this app are from [icons8](https://icons8.com).
