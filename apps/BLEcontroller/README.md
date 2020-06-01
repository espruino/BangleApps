# BLE Customisable Controller with Joystick A

A highly customisable state machine driven user interface that will communicate with another BLE device.  The controller uses the three buttons and the left and right hand side of the watch to provide a flexible and attractive BLE interface.  

Amaze your friends by controlling your robot, your house or any other BLE device from your watch!

To keep the messages small, commands are sent from the Controller to the BLE target in a text string.  This is made up of a comma delimited string of the following elements:
* message number (3 characters)
* screen name (3 characters)
* object name (3 characters)
* value/status (3 characters)

The combination of these variables will uniquely identify the status change requested from the watch to the target device that can then be programmed to respond appropriately.

Gordon Williams' EspruinoHub is an excellent way to transform BLE advertisements into MQTT messages for further processing.

## Usage

The application can be configured at will by changing the definitions of the screens, events, icons and buttons.

Most changes are possible via data, rather than code change.

## Features

The default package contains three configurations:
* a simple home light and sockets controller UI (app.js)
* a robot controller UI with joystick (app-joy.js)
* a simple static assistant controller (app-ass.js)

You can try out the other configurations by deleting app.js and renaming the file you want to app.js.

## Controls

The controls will vary by screen, but I suggest a convention of using BTN3 (the bottom button) for moving backwards up the menu stack.

I have used the convention of red/green for buttons that are switches and blue buttons that provide single function operation (such as navigating a menu or executing a on-off activity)

## Requests

In the first instance, please consult my blog post on this application here.

## Creator

Richard Hopkins, FIET CEng
May 2020
