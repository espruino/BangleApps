# Weather

This allows your Bangle.js to display weather reports from the Gadgetbridge app on an Android phone.

It adds a widget with a weather pictogram and the temperature.   
You can view the full report through the app:   
![Screenshot](screenshot.png)

## Setup

1. Install [Gadgetbridge for Android](https://f-droid.org/packages/nodomain.freeyourgadget.gadgetbridge/) on your phone.
2. Set up [Gadgetbridge weather reporting](https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Weather).

If using the `Bangle.js Gadgetbridge` app on your phone (as opposed to the standard F-Droid `Gadgetbridge`) you need to set the package name
to `com.espruino.gadgetbridge.banglejs` in the settings of the weather app (`settings -> gadgetbridge support -> package name`).

## Settings

* Expiration timespan can be set after which the local weather data is considered as invalid
* Widget can be hidden

## Controls

BTN2: opens the launcher (Bangle.js 1)
BTN: opens the launcher (Bangle.js 2)
