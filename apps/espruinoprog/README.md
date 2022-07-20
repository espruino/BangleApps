# Espruino Programmer

Finds Bluetooth devices with a specific name (eg `Puck.js`), connects and uploads code. Great for programming many devices at once!

**WARNING:** This will reprogram **any matching Espruino device within range** while
the app is running. Unless you are careful to remove other devices from the area or
turn them off, you could find some of your devices unexpectedly get programmed!

## Customising

Click on the Customise button in the app loader to set up the programmer.

* First you need to choose the kind of devices you want to upload to. This is
the text that should match the Bluetooth advertising name. So `Puck.js` for Puck.js
devices, or `Bangle.js` for Bangles.
* Now paste in the code you want to write to the device. This is automatically
written to flash (`.bootcde`). See https://www.espruino.com/Saving#save-on-send-to-flash-
for more information.
* Now enter the code that should be sent **after** programming. This code
should make the device so it doesn't advertise on Bluetooth with the Bluetooth
name you entered for the first item. It may also help if it indicates to you that
the device is programmed properly.
  * You could turn advertising off with `NRF.sleep()`
  * You could change the advertising name with `NRF.setAdvertising({},{name:"Ok"});`
  * On a Bangle, you could turn it off with `Bangle.off()`
* Finally scroll down and click `Upload`
* Now you can run the new `Programmer` app on the Bangle.

## Usage

Just run the app, and as soon as it starts it'll start scanning for
devices to upload to!

To stop scanning, long-press the button to return to the clock.

## Notes

* Right now the Espruino Tools used here are unaware of the device they're writing to,
and as a result they don't use Storage and so the size of the files you can
write to the device are quite limited. You should be find with up to 4k of code.
* Currently, code is not minified before upload (so you need to supply pre-minified
  code if you want that)
