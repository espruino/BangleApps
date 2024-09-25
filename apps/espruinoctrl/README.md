# Espruino Control

Send commands to other Espruino devices via the Bluetooth UART interface.

## Customising

Click the customise button and you can customise your commands
with 4 options:


* **Title** - The title of the menu item that will be displayed
* **Command** - The JS command to execute, eg. `LED.toggle()`
* **MAC Address** - If specified, of the form `aa:bb:cc:dd:ee:ff`. The device
with this address will be connected to directly. If not specified a menu
showing available Espruino devices is popped up.
* **RX** - If checked, the app will display any data received from the
device being connected to (waiting 500ms after the last data before disconnecting).
Use this if you want to print data - eg: `print(E.getBattery())`

When done, click 'Upload'. Your changes will be saved to local storage
so they'll be remembered next time you upload from the same device.

## Usage

Simply load the app and you'll see a menu with the menu items
you defined. Select one and you'll be able to connect to the device
and send the command.

The Bangle will connect to the device, send the command, and if:

* `RX` isn't set it will disconnect immediately and return to the menu
* `RX` is set it will listen for a response and write it to the screen, before
disconnecting after 500ms of inactivity. To return to the menu after this, press the button.

