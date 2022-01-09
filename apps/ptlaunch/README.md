# Pattern Launcher

Directly launch apps from the clock screen with custom patterns.

## Installation and Usage

Install Pattern Launcher alongside your main laucher app.
_Do not delete that launcher!_
Pattern Launcher is designed as an additional app launching utility, not as a replacement for the main launcher.

In the main launcher, start Pattern Launcher in the app menu to assign the pattern configuration (see below).
Note that this actually among the applications, _not_ in the application settings!

Create patterns and link them to apps in the Pattern Launcher app.

Then launch the linked apps directly from the clock screen by simply drawing the desired pattern.
Note that this does only work in the clock screen, not if other applications run.

## Add Pattern Screenshots

![](main_menu_add_light.png)
![](add_pattern_light.png)
![](select_app_light.png)

![](main_menu_add_dark.png)
![](add_pattern_dark.png)
![](select_app_dark.png)

## Manage Pattern Screenshots

![](main_menu_manage_light.png)
![](manage_patterns_light.png)

![](main_menu_manage_dark.png)
![](manage_patterns_dark.png)

## Detailed Steps

The main menu of Pattern Launcher is accessible from the _application_ starter of the main launcher.
From there you can:

- Add a new pattern and link it to an app (first entry)
  - To create a new pattern first select "Add Pattern"
  - Now draw any pattern you like, this will later launch the linked app from the clock screen
  - You can also draw a single-circle pattern (meaning a single tap on one circle) instead of drawing a 'complex' pattern
  - If you don't like the pattern, simply re-draw it. The previous pattern will be discarded.
  - If you are happy with the pattern press the button to continue
  - Now select the app you want to launch with the pattern.
  - Note, you can bind multiple patterns to the same app.
- Manage created patterns (second entry)
  - To manage your patterns first select "Manage Patterns"
  - You will now see a scrollabe list of patterns + linked apps
  - If you want to deletion a pattern (and unlink the app) simply tap on it, and confirm the deletion
- Disable the lock screen on the clock screen from the settings (third entry)
  - To launch the app from the pattern on the clock screen the watch must be unlocked.
  - If this annoys you, you can disable the lock on the clock screen from the setting here

## FAQ

1. Nothing happens when I draw on the clock screen!

Please double-check if you actually have a pattern linked to an app.

2. I have a pattern linked to an app and still nothing happens when I draw on the clock screen!

Make sure the watch is unlocked before you start drawing. If this bothers you, you can permanently disable the watch-lock from within the Pattern Launcher app (via the Settings).

3. I have done all that and still nothing happens!

Please note that drawing on the clock screen will not visually show the pattern you drew. It will start the app as soon as the pattern was recognized - this might take 1 or 2 seconds! If still nothing happens, that might be a bug, sorry!

4. Where can I configure the patterns?

You have to start the "Pattern Launcher" app from the main app launcher's app selection.

5. Do I have to delete my former app launcher so that Pattern Launcher is the only installed launcher?

No! Pattern Launcher works alongside another "main" launcher.
If you have deleted that one, you do not have a general purpose app launcher any more and cannot access Pattern Launcher's configuration.
If you already have deleted your main launcher accidentially, just reinstall it from the app loader.

## Authors

Initial creation: [crazysaem](https://github.com/crazysaem)

Improve pattern detection code readability: [PaddeK](http://forum.espruino.com/profiles/117930/)

Improve pattern rendering: [HughB](http://forum.espruino.com/profiles/167235/)

Doc additions: [dirkhillbrecht](http://forum.espruino.com/profiles/182498/)
