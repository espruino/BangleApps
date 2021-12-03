# Settings

This is Bangle.js's settings menu

* **Make Connectable** regardless of the current Bluetooth settings, makes Bangle.js so you can connect to it (while the window is up)
* **App/Widget Settings** settings specific to installed applications
* **BLE** Bluetooth Settings menu - see below.
* **Debug Info** should debug info be shown on the watch's screen or not?
* **Beep** most Bangle.js do not have a speaker inside, but they can use the vibration motor to beep in different pitches. You can change the behaviour here to use a Piezo speaker if one is connected
* **Vibration** enable/disable the vibration motor
* **Quiet Mode** prevent notifications/alarms from vibrating/beeping/turning the screen on - see below
* **Locale** set time zone/whether the clock is 12/24 hour (for supported clocks)
* **Select Clock** if you have more than one clock face, select the default one
* **HID** When Bluetooth is enabled, Bangle.js can appear as a Bluetooth Keyboard/Joystick/etc to send keypresses to a connected device.
  * **NOTE:** on some platforms enabling HID can cause you problems when trying to connect to Bangle.js to upload apps.
* **Set Time** Configure the current time - Note that this can be done much more easily by choosing 'Set Time' from the App Loader
* **LCD** Configure settings about the screen. How long it stays on, how bright it is, and when it turns on - see below.
* **Theme** Adjust the colour scheme
* **Reset Settings** Reset the settings to defaults
* **Turn Off** Turn Bangle.js off

## BLE - Bluetooth Settings

* **BLE** is Bluetooth LE enabled and the watch connectable?
* **Programmable** if BLE is on, can the watch be connected to in order to program/upload apps? As long as your watch firmware is up to date, Gadgetbridge will work even with `Programmable` set to `Off`.
* **Passkey BETA** allows you to set a passkey that is required to connect and pair to Bangle.js. **Note:** This is Beta and you will almost certainly encounter issues connecting with Web Bluetooth using this option.
* **Whitelist** allows you to specify only specific devices that you will let connect to your Bangle.js. Simply choose the menu item, then `Add Device`, and then connect to Bangle.js with the device you want to add. If you are already connected you will have to disconnect first. Changes will take effect when you exit the `Settings` app.
  * **NOTE:** iOS devices and newer Android devices often implement Address Randomisation and change their Bluetooth address every so often. If you device's address changes, you will be unable to connect until you update the whitelist again.

## LCD

* **LCD Brightness** set how bright the LCD is. Due to hardware limitations in the LCD backlight, you may notice flicker if the LCD is not at 100% brightness.
* **LCD Timeout** how long should the LCD stay on for if no activity is detected. 0=stay on forever
* **Wake on X** should the given activity wake up the Bangle.js LCD?
* **Twist X** these options adjust the sensitivity of `Wake on Twist` to ensure Bangle.js wakes up with just the right amount of wrist movement.


## Quiet Mode

Quiet Mode is a hint to apps and widgets that you do not want to be disturbed.   
The exact effects depend on the app.  In general the watch will not wake up by itself, but will still respond to button presses.

* **Quiet Mode**
  - Off: Normal operation
  - Alarms: Stops notifications, but "alarm" apps will still work
  - Silent: Blocks even alarms
  