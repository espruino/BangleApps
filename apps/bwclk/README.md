# BW Clock
A very minimalistic clock with date and time in focus.

![](screenshot.png)

## Features
Altough date and time is the most important thing, the BW clock provides many features
as well as 3rd party integtations. The following things are integrated:
- Bangle: Steps, Heart rate, Battery (including charging state)
- Timer: +/- 5 min. Note: The Scheduler library must be installed, otherwise it's hidden
- Weather: Temperature, Wind. Note:  The Weather app must be installed, otherwise it's hidden.
- HomeAssistant - All triggers are shown. Note: The HomeAssistant app must be installed, otherwise it's hidden.


## Menu
2D menu allows you to display lots of different data including data from 3rd party apps and it's also possible to control things e.g. to set a timer or send a HomeAssistant trigger.

Simply click left / right to go through the menu entries such as Bangle, Timer etc.
and click up/down to move into this sub-menu. You can then click in the middle of the screen
to e.g. send a trigger via HomeAssistant once you selected it.

```
   Bpm               ...
    |                 |
  Steps            10 min.          ...                     ...
    |                 |              |                       |
  Battery           5 min          Temp.                 Trigger1
    |                 |              |                       |
  Bangle   -- Timer[Optional] -- Weather[Optional] -- HomeAssistant [Optional]
```

## Settings
- Fullscreen on/off (widgets are still loaded).
- Enable/disable lock icon in the settings. Useful if fullscreen is on.
- The colon (e.g. 7:35 = 735) can be hidden in the settings for an even larger time font to improve readability further.
- There are no design settings, as your bangle sys settings are used.


## Thanks to
<a href="https://www.flaticon.com/free-icons/" title="Icons">Icons created by Flaticon</a>


## Creator
- [David Peer](https://github.com/peerdavid)
