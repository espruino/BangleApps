# Messages overlay app

This app handles the display of messages and message notifications as an overlay pop up. 

It is a GUI replacement for the `messagesgui` app.

Messages are ephemeral and not stored on the Bangle.

## Usage

Close app by tapping the X and scroll by swiping. The title background of the pop up changes color if the Bangle is locked. The color depends on your currently active theme.

## Theme support

Using the system theme needs more RAM since it uses a 16 bit color buffer for normal message display. Selecting the "low RAM" theme reduces that to a 4 bit buffer.
16 bit buffer with a small message takes ~4K RAM blocks while 4 bit buffer only needs about 1.5K.

## Low memory mode

If the overlay estimates that showing the next message would get under the configured minimum free memory limit it automatically only tries to use 1 bit depth. Low memory mode uses about 0.8K blocks plus memory needed for messages. If dropping to 1 bit depth is not enough the oldest messages are discarded to keep the overlay working.

## Creator

[halemmerich](https://github.com/halemmerich)

Forked from messages_light by Rarder44

