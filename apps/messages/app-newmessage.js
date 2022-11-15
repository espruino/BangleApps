/* Called when we have a new message when we're in the clock...
BUZZ_ON_NEW_MESSAGE is set so when messages.app.js loads it knows
that it should buzz */
global.BUZZ_ON_NEW_MESSAGE = true;
__FILE__="messages.app.js"; // used by widget to check if app is active
eval(require("Storage").read("messages.app.js"));
