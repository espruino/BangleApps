# BTHome

This uses BTHome (https://bthome.io/) to allow easy control of [Home Assistant](https://www.home-assistant.io/) via Bluetooth advertisements.

Other apps like [the Home Assistant app](https://banglejs.com/apps/?id=ha) communicate with Home Assistant
via your phone so work from anywhere, but require being in range of your phone.

## Usage

When the app is installed, go to the `BTHome` app and click Settings.

Here, you can choose if you want to advertise your Battery status, but can also click `Add Button`.

You can then add a custom button event:

* `Icon` - the picture for the button
* `Name` - the name associated with the button
* `Action` - the action that Home Assistant will see when this button is pressed
* `Button #` - the button event 'number' - keep this at 0 for now

Once you've saved, you will then get your button shown in the BTHome app. Tapping it will make Bangle.js advertise via BTHome that the button has been pressed.

## ClockInfo

When you've added one or more buttons, they will appear in a ClockInfo under the main `Bangle.js` heading. You can just tap to select the ClockInfo, scroll down until a BTHome one is visible and then tap again. It will immediately send the Advertisement.

