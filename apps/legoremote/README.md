# LEGO Remote control

This app allows you to control LEGO models from Bangle.js

Right now the only supported control device is the Mould King M-0006
Bluetooth remote for LEGO Power Functions: http://www.espruino.com/LEGO+Power+Functions+Clone

LEGO Power Functions does not have an official Bluetooth remote controller. Hopefully
in the future this app will be able to support other types of remote (see below).

## Usage

Run the app, then choose the type of controls you want and ensure you're not connected
to your watch via Bluetooth (a warning will pop up if so).

Linear mode controls A/B axes individually, and allows you to vary the speed of the
motors based on the distance you drag from the centre. Other modes just use on/off
buttons.

| Mode       | up   | down | left | right |
|------------|------|------|------|-------|
| **Linear** | +A   | -A   |  -B  |  +B   |
| **Normal** | +A   | -A   |  -B  |  +B   |
| **Tank**   | -A+B | +A-B | +A+B | -A-B  |
| **Merged** | -A-B | +A+B | +A-B | -A+B  |

In all cases pressing the C/D buttons will turn on C/D outputs

Now press the arrow keys on the screen to control the robot.

It is expected that the robot is controlled by two motors, one on the left
side (connected to the `A` output) and one on the right (connected to the `B` output).

## Future additions

In the future it would be great to add:

* Recording a series of movements and playing them back
* Support for official LEGO bluetooth remotes (via [Pybricks](https://pybricks.com/))
* Support for different robot styles and configurations
* Using the Bangle's compass (or even GPS) to allow better robot control.
