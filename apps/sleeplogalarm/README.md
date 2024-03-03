# Sleep Log Alarm

This widget searches for active alarms and raises an own alarm event up to the defined time earlier, if in light sleep or awake phase. Optional the earlier alarm will only be triggered if comming from or in consecutive sleep. The settings of the earlier alarm can be adjusted and it is possible to filter the targeting alarms by time and message. The widget is only displayed if an active alarm is detected. The time of the targeting alarm is displayed inside the widget, too. The time or the complete widget can be hidden in the options.

_This widget does not detect sleep on its own and can not create alarms. It requires the [sleeplog](/apps/?id=sleeplog) app and any alarm app that uses [sched](/apps/?id=sched) to be installed._

---
### Settings
---

  - __earlier__ | duration to trigger alarm earlier  
    _10min_ / _20min_ / __30min__ / ... / _120min_
  - __from Consec.__ | only trigger if comming from consecutive sleep  
    _on_ / __off__
  - __vib pattern__ | vibration pattern for the earlier alarm  
    __..__ / ...
  - __msg__ | customized message for the earlier alarm  
    __...__ / ...
  - __msg as prefix__ | use the customized message as prefix to the original message or replace it comlpetely if disabled  
    __on__ / _off_
  - __disable alarm__ | if enabled the original alarm will be disabled  
    _on_ / __off__
  - __auto snooze__ | auto snooze option for the earlier alarm  
    __on__ / _off_
  - __Filter Alarm__ submenu
    - __time from__ | exclude alarms before this time  
      _0:00_ / _0:15_ / ... / __3:00__ / ... / _24:00_
    - __time to__ | exclude alarms after this time  
      _0:00_ / _0:15_ / ... / __12:00__ / ... / _24:00_
    - __msg includes__ | include only alarms including this string in msg  
      __""__ / ...
  - __Widget__ submenu
    - __hide always__ | completely hide the widget  
      _on_ / __off__
    - __show time__ | show the time of the targeting alarm  
      __on__ / _off_
    - __color__ | color of the widget
      _red_ / __yellow__ / ... / _white_
  - __Enabled__ | completely en-/disables the background service
    __on__ / _off_

---
### Worth Mentioning
---

#### Requests, Bugs and Feedback
Please leave requests and bug reports by raising an issue at [github.com/storm64/BangleApps](https://github.com/storm64/BangleApps) (or send me a [mail](mailto:banglejs@storm64.de)).

#### Creator
Storm64 ([Mail](mailto:banglejs@storm64.de), [github](https://github.com/storm64))

#### Attributions
The app icon is downloaded from [https://icons8.com](https://icons8.com).

#### License
[MIT License](LICENSE)
