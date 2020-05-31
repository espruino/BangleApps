# BLE Robot Controller with Joystick

A highly customisable state machine driven user interface that will communicate with another BLE device.  The controller uses the three buttons and the left and right hand side of the watch to provide a flexible and attractive BLE interface.  Amaze your friends by controlling your robot from your watch!

To keep the messages small, commands are sent from the Controller to the BLE robot in a text string.  This is made up of a comma delimited string of the following elements:
* message number (3 characters)
* screen name (3 characters)
* object name (3 characters)
* value/status (3 characters)

The combination of these variables will uniquely identify the status change requested from the watch to the robot that can then be programmed to respond appropriately.

## Usage

The application can be configured at will by changing the definitions of the screens, events, icons and buttons.

Most changes are possible via data, rather than code change.

## Features

In its default state, it has nine screens that provide the ability to:
* select which robot to interact with (dog or dalek)
    * for the dog the following functions are available:
        * control movement via a joystick (forwards, backwards, spin left, spin right)
        * turn on/off follow mode
        * start a game of chess
        * wake or sleep the robot
        * wag its tail in two directions
    * for the dalek, the user can:
        * turn on or off face recognition
        * make it say random phrases
        * control the dalek's iris light and servo
        * turn the dalek hover lights on or off
        * turn the speaker on or off

## Controls

The controls will vary by screen, but I suggest a convention of using BTN3 (the bottom button) for moving backwards up the menu stack.

I have used the convention of red/green for buttons that are switches and blue buttons that provide single function operation (such as navigating a menu or executing a on-off activity)

## Requests

In the first instance, please consult my blog post on this application here.

## Creator

Richard Hopkins, FIET CEng
May 2020
