# BackLite
### This app needs the latest settings app update (v 0.80), to ensure that setting the brightness to `0` does not default to `1`.

BackLite is an app which greatly conserves battery life by only turning the backlight on when you long press the button from a locked state.

Modern watches have a dedicated button to turn the backlight on, so as not to waste battery in an already light environment. This app recreates that functionality for the Bangle.js, which only has one button.

#### Warning: This app overwrites the LCD brightness setting in `Bangle.js LCD settings`. If it is changed, the app will basically lose functionality. It auto-fixes itself every boot, so if you change the brightness, just reboot :)
# Usage
When you unlock with a press of the button, or any other way you unlock the watch, the backlight will not turn on, as most of the time you are able to read it, due to the transreflective display on the Bangle.js 2. 

If you press and hold the button to unlock the watch (for around half a second), the backlight will turn on for 5 seconds - just enough to see what you need to see. After that, it will turn off again.

Some apps like `Light Switch Widget` will prevent this app from working properly.
# Settings
`Brightness` - The LCD brightness when unlocked with a long press.
# Creator
RKBoss6

TODO: Add a setting for long press time, or light duration
