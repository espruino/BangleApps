# Settings

This is Bangle.js's settings menu

* **App/Widget Settings** settings specific to installed applications
* **BLE** Bluetooth Settings menu - see below.
* **Beep** most Bangle.js do not have a speaker inside, but they can use the vibration motor to beep in different pitches. You can change the behaviour here to use a Piezo speaker if one is connected
* **Vibration** enable/disable the vibration motor
* **Quiet Mode** prevent notifications/alarms from vibrating/beeping/turning the screen on - see below
* **Locale** set time zone, the time format (12/24h, for supported clocks) and the first day of the week
* **Select Clock** if you have more than one clock face, select the default one
* **Date & Time** Configure the current time - Note that this can be done much more easily by choosing 'Set Time' from the App Loader
* **LCD** Configure settings about the screen. How long it stays on, how bright it is, and when it turns on - see below.
* **Theme** Adjust the colour scheme
* **Utils** Utilities - including resetting settings (see below)

## BLE - Bluetooth Settings

* **Make Connectable** regardless of the current Bluetooth settings, makes Bangle.js so you can connect to it (while the window is up)
* **BLE** is Bluetooth LE enabled and the watch connectable?
* **Programmable** if BLE is on, can the watch be connected to in order to program/upload apps? As long as your watch firmware is up to date, Gadgetbridge will work even with `Programmable` set to `Off`.
* **HID** When Bluetooth is enabled, Bangle.js can appear as a Bluetooth Keyboard/Joystick/etc to send keypresses to a connected device.
  * **NOTE:** on some platforms enabling HID can cause you problems when trying to connect to Bangle.js to upload apps.
* **Passkey** allows you to set a passkey that is required to connect and pair to Bangle.js.
* **Whitelist** allows you to specify only specific devices that you will let connect to your Bangle.js. Simply choose the menu item, then `Add Device`, and then connect to Bangle.js with the device you want to add. If you are already connected you will have to disconnect first. Changes will take effect when you exit the `Settings` app.
  * **NOTE:** iOS devices and newer Android devices often implement Address Randomisation and change their Bluetooth address every so often. If you device's address changes, you will be unable to connect until you update the whitelist again.

## LCD

* **LCD Brightness** set how bright the LCD is. Due to hardware limitations in the LCD backlight, you may notice flicker if the LCD is not at 100% brightness.
* **LCD Timeout** how long should the LCD stay on for if no activity is detected. 0=stay on forever
* **Rotation** allows you to rotate (or mirror) what's displayed on the screen, eg. for left-handed wearers (needs 2v16 or 2v15 cutting edge firmware to work reliably)
* **Wake on X** should the given activity wake up the Bangle.js LCD?
  * On Bangle.js 2 when locked the touchscreen is turned off to save power. Because of this,
    `Wake on Touch` actually uses the accelerometer, and you need to actually tap the display to wake Bangle.js (we recently renamed the menu item to `Wake on Tap`).
* **Twist X** these options adjust the sensitivity of `Wake on Twist` to ensure Bangle.js wakes up with just the right amount of wrist movement.
* **Calibrate** on Bangle.js 2, pop up a screen allowing you to calibrate the touchscreen (calibration only works on 2v16 or 2v15 cutting edge builds)

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
