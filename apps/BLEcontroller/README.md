# BLE Customisable Controller with Joystick

A highly customisable state machine driven user interface that will communicate with another BLE device.  The controller uses the three buttons and the left and right hand side of the watch to provide a flexible and attractive BLE interface.  

Amaze your friends by controlling your robot, your house or any other BLE device from your watch!

<iframe width="560" height="315" src="https://www.youtube.com/embed/acQxcoFe0W0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

To keep the messages small, commands are sent from the Controller to the BLE target in a text string.  This is made up of a comma delimited string of the following elements:
* message number (up to the least significant four digits)
* screen name (up to four characters)
* object name (up to four characters)
* value/status (up to four characters)

The combination of these variables will uniquely identify the status change requested from the watch to the target device that can then be programmed to respond appropriately.

Gordon Williams' EspruinoHub is an excellent way to transform thse BLE advertisements into MQTT messages for further processing.  They can be subscribed to via the following MQTT topic (change the watchaddress, to the MAC address of your Bangle.js)
/ble/advertise/wa:tc:ha:dd:re:ss/espruino/#

## Usage

The application can be configured at will by changing the definitions of the screens, events, icons and buttons.

Most changes are possible via data, rather than code change.

## Features

The default package contains three configurations:
* a simple home light and sockets controller UI (app.js)
* a robot controller UI with joystick (app-joy.js)
* a simple static assistant controller (app-ex2.js)

You can try out the other configurations by deleting app.js and renaming the file you want to try as app.js.

I have tested out the application to as many as eight screens without problems, but four screens are usually enough for most situations.

## Controls

The controls will vary by screen, but I suggest a convention of using BTN3 (the bottom button) for moving backwards up the menu stack.

I have used the convention of red/green for buttons that are switches and blue buttons that provide single function operation (such as navigating a menu or executing a on-off activity)

## Requests

In the first instance, please consult my blog post on this application [here](https://k9-build.blogspot.com/2020/05/controlling-k9-using-bluetooth-ble-from.html)

## Creator

Richard Hopkins, FIET CEng
May 2020
