# Gadgetbridge Debug

This is useful if your Bangle isn't responding to the Gadgetbridge
Android app properly.

This app disables all existing Gadgetbridge handlers and then displays the
messages that come from Gadgetbridge on the screen
of the watch. It also saves the last 10 messages in a variable
called `history`.

More info on Gadgetbridge at http://www.espruino.com/Gadgetbridge

## Usage

* Run the `GB Debug` app on your Bangle
* Connect your Bangle to Gadgetbridge
* Do whatever was causing you problems (eg receiving a call)
* The Gadgetbridge message should now be displayed on-screen

If you want to get the *actual* data rather than copying it from the screen.

* Ensure the `GB Debug` app is kept running after the above steps
* Disconnect Gadgetbridge from the Bangle
* Connect the Web IDE on your PC
* Type `show()` on the left-hand side of the IDE and the
last 10 messages from Gadgetbridge will be shown.
