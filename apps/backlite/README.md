# BackLite
This app greatly conserves battery life by only turning the backlight on when you long press the button from a locked state.

Modern watches have a dedicated button to turn the backlight on, so as not to waste battery in an already light environment. This app recreates that functionality for the Bangle.js, which only has one button.
#### Warning: This app overwrites the LCD brightness setting in settings. Do not change it, or the app will stop functioning. To fix, just reboot.
# Usage
When you unlock with a press of the button, or any other way you unlock the watch, the backlight will not turn on, as most of the time you are able to read it, due to the transreflective display on the Bangle.js 2. 

If you press and hold the button to unlock the watch (for around half a second), the backlight will turn on for the `LCD backlight` timeout you set in settings. After that, it will turn off again.

Some apps like `Light Switch Widget` will prevent this working.
# Creator
RKBoss6
