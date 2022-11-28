/* Called when we have a new message when we're in the clock...
BUZZ_ON_NEW_MESSAGE is set so when messagegui.app.js loads it knows
that it should buzz */
global.BUZZ_ON_NEW_MESSAGE = true;
eval(require("Storage").read("messagegui.app.js"));
