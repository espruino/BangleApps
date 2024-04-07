# Messages overlay app

This app handles the display of messages and message notifications as an overlay pop up. 

It is a GUI replacement for the `messagesgui` app.

Messages are ephemeral and not stored on the Bangle.

## Usage

Close app by tapping the X and scroll by swiping. The border of the pop up changes color if the Bangle is locked. The color depends on your currently active theme.

## Theme support

Using the system theme needs more RAM since it uses a 16 bit color buffer for normal message display. Selecting the "low RAM" theme reduces that to a 4 bit buffer.

## Low memory mode

If free memory is below a configured number of blocks (default is 4000), the overlay automatically only uses 1 bit depth. Default mode uses roundabout 1300 blocks, while low memory mode uses about 600.

## Creator

[halemmerich](https://github.com/halemmerich)
Forked from messages_light by Rarder44

