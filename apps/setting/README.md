# Settings

This is Bangle.js's main settings menu:

* **Apps** - Settings for installed apps/widgets
* **System** - Settings related to themes, default apps, date & time, etc
* **Bluetooth** - Bluetooth Settings menu - see below.
* **Alerts** - Set how Bangle.js alerts you (including Quiet mode)
* **Utils** - Utilities, including resetting settings

**New Users:** these are some settings you'll probably want to change right away:

* **Calibrate LCD** Make sure that the LCD touchscreen responds to touches where you expect them to
* **Locale** Set whether you want 12 hour time, and what day of the week the week starts on.

See below for options under each heading:

## Apps - App-specific settings

This is where you adjust settings for an individual app. (eg. Health app: Adjust how often heart rate tracking should fire.)

## System - System settings

* **Theme** Adjust the colour scheme. Choose between light mode, dark mode, or a custom theme. To adjust themes in more detail you can also use the [Theme Switcher App](https://banglejs.com/apps/?id=themesetter)
* **LCD** Configure settings about the screen. How long it stays on, how bright it is, and when it turns on - see below.
* **Locale** set time zone, the time format (12/24h, for supported clocks) and the first day of the week
* **Clock** if you have more than one clock face, select the default one
* **Launcher** if you have more than one app launcher, select the default one
* **Date & Time** Configure the current time - Note that this can be done much more easily by choosing 'Set Time' from the App Loader
* **Altitude** On Bangle.js 2, calibrate the altitude (which varies depending on Air Pressure). Tap `Adjust Up`/`Adjust Down` to move the reported altitude by around 10m

## Alerts

* **Beep** most Bangle.js do not have a speaker inside, but they can use the vibration motor to beep in different pitches. You can change the behaviour here to use a Piezo speaker if one is connected
* **Vibration** enable/disable the vibration motor
* **Quiet Mode** prevent notifications/alarms from vibrating/beeping/turning the screen on - see below

## Bluetooth

* **Make Connectable** regardless of the current Bluetooth settings, makes Bangle.js so you can connect to it (while the window is up)
* **BLE** is Bluetooth LE enabled and the watch connectable?
* **Programmable** if BLE is on, can the watch be connected to in order to program/upload apps? As long as your watch firmware is up to date, Gadgetbridge will work even with `Programmable` set to `Off`.
* **HID** When Bluetooth is enabled, Bangle.js can appear as a Bluetooth Keyboard/Joystick/etc to send keypresses to a connected device.
  * **NOTE:** on some platforms enabling HID can cause you problems when trying to connect to Bangle.js to upload apps.
* **Passkey** allows you to set a passkey that is required to connect and pair to Bangle.js.
* **Whitelist** allows you to specify only specific devices that you will let connect to your Bangle.js. Simply choose the menu item, then `Add Device`, and then connect to Bangle.js with the device you want to add. If you are already connected you will have to disconnect first. Changes will take effect when you exit the `Settings` app.
  * **NOTE:** iOS devices and newer Android devices often implement Address Randomisation and change their Bluetooth address every so often. If you device's address changes, you will be unable to connect until you update the whitelist again.
* **Privacy** - (Bangle.js 2 only) enables BLE privacy mode (see [NRF.setSecurity](https://www.espruino.com/Reference#l_NRF_setSecurity)). This randomises the Bangle's MAC address and can also
remove advertising of its name. **This can cause connection issues with apps that expect to keep a permanent connection like iOS/Gadgetbridge**

## LCD

* **LCD Brightness** set how bright the LCD is. Due to hardware limitations in the LCD backlight, you may notice flicker if the LCD is not at 100% brightness.
* **LCD Timeout** how long should the LCD stay on for if no activity is detected. 0=stay on forever
* **Rotation** allows you to rotate (or mirror) what's displayed on the screen, eg. for left-handed wearers (needs 2v16 or 2v15 cutting edge firmware to work reliably)
* **Wake on X** should the given activity wake up the Bangle.js LCD?
  * On Bangle.js 2 when locked the touchscreen is turned off to save power. Because of this,
    `Wake on Tap` actually uses the accelerometer, and you need to actually tap the display to wake Bangle.js.
* **Twist X** these options adjust the sensitivity of `Wake on Twist` to ensure Bangle.js wakes up with just the right amount of wrist movement.
* **Calibrate** on Bangle.js 2, pop up a screen allowing you to calibrate the touchscreen, ensuring your touches are mapped to the right place on the screen. (Highly reccomended for new users!)

## Locale

* **Time Zone** your current Time zone. This is usually set automatically by the App Loader
* **Time Format** whether you want a 24 or 12 hour clock. However not all clocks will honour this.
* **Start Week On** start the displayed week on Sunday, or Monday. This currently only applies to the Alarm app.

## Quiet Mode

Quiet Mode is a hint to apps and widgets that you do not want to be disturbed.
The exact effects depend on the app.  In general the watch will not wake up by itself, but will still respond to button presses.

* **Quiet Mode**
  - Off: Normal operation
  - Alarms: Stops notifications, but "alarm" apps will still work
  - Silent: Blocks even alarms

## Utils


* **Debug Info** should debug info be shown on the watch's screen or not?
  * `Off` (default) do not show debug information
  * `Display` Show on the Bangle's screen (when not connected to Bluetooth or `Programmable:off`)
  * `Log` Show on the Bangle's screen **and** write to a file called `log.txt` on Storage (when not connected to Bluetooth or `Programmable:off`). Warning - this file is appended to so may grow to be large if this is left enabled.
  * `Both` Log and display on Bangle's screen
* **Compact Storage** Removes deleted/old files from Storage - this will speed up your Bangle.js
* **Rewrite Settings** Should not normally be required, but if `.boot0` has been deleted/corrupted (and so no settings are being loaded) this will fix it.
* **Flatten Battery** Turns on all devices and draws as much power as possible, attempting to flatten the Bangle.js battery. This can still take 5+ hours.
* **Calibrate Battery** If you're finding your battery percentage meter isn't accurate, leave your Bangle.js on charge for at least 3 hours, and then choose this menu option. It will measure the battery voltage when full and will allow Bangle.js to report a more accurate battery percentage.
* **Reset Settings** Reset the settings (as set in this app) to defaults. Does not reset settings for other apps.
* **Factory Reset** (not available on Bangle.js 1) - wipe **everything** and return to a factory state
* **Turn Off** Turn Bangle.js off

# Development

The settings code uses `push/pop/restoreMenu` to navigate different levels of menus. These functions are used as follows:

- `pushMenu`: enter a new level of menu, one deeper than the current (e.g. a submenu)
- `popMenu`: return to the previous menu level, one more shallow than the current (e.g. returning from a submenu)
- `restoreMenu`: redraw the current menu (e.g. after an alert)

These functions will keep track of outer menu's scroll positions, to avoid the user being returned to the very first entry as they navigate.
