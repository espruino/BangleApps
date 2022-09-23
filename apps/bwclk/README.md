# BW Clock
A very minimalistic clock.

![](screenshot.png)

## Features
The BW clock implements features that are exposed by other apps through the `clkinfo` module.
For example, if you install the HomeAssistant app, this menu item will be shown if you click right
and additionally allows you to send triggers directly from the clock (select triggers via up/down and
send via click center). Here are examples of other apps that are integrated:

- Bangle data such as steps, heart rate, battery or charging state.
- Show agenda entries. A timer for an agenda entry can also be set by simply clicking in the middle of the screen. This can be used to not forget a meeting etc. Note that only one agenda-timer can be set at a time. *Requirement: Gadgetbridge calendar sync enabled*
- Weather temperature as well as the wind speed can be shown. *Requirement: Weather app*
- HomeAssistant triggers can be executed directly. *Requirement: HomeAssistant app*

Note: If some apps are not installed (e.gt. weather app), then this menu item is hidden.

## Settings
- Screen: Normal (widgets shown), Dynamic (widgets shown if unlocked) or Full (widgets are hidden).
- Enable/disable lock icon in the settings. Useful if fullscreen mode is on.
- The colon (e.g. 7:35 = 735) can be hidden in the settings for an even larger time font to improve readability further.
- Your bangle uses the sys color settings so you can change the color too.

## Menu structure
2D menu allows you to display lots of different data including data from 3rd party apps and it's also possible to control things e.g. to trigger HomeAssistant.

Simply click left / right to go through the menu entries such as Bangle, Weather etc.
and click up/down to move into this sub-menu. You can then click in the middle of the screen
to e.g. send a trigger via HomeAssistant once you selected it. The actions really depend
on the app that provide this sub-menu through the `clkinfo` module.

```
  Bangle  -- Agenda  --  Weather  --  HomeAssistant
    |           |           |               |
 Battery     Entry 1   Temperature      Trigger1
    |           |           |               |
  Steps        ...         ...             ...
    |
   ...
```


## Thanks to
- Thanks to Gordon Williams not only for the great BangleJs, but specifically also for the implementation of `clkinfo` which simplified the BWClock a lot and moved complexety to the apps where it should be located.
- <a href="https://www.flaticon.com/free-icons/" title="Icons">Icons created by Flaticon</a>

## Creator
[David Peer](https://github.com/peerdavid)
