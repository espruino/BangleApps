Bangle.keytimer_ACTIVE = true;
const common = require("keytimer-com.js");
const storage = require("Storage");

const keypad = require("keytimer-keys.js");
const timerView = require("keytimer-tview.js");

Bangle.loadWidgets();
Bangle.drawWidgets();

//Save our state when the app is closed
E.on('kill', () => {
  storage.writeJSON(common.STATE_PATH, common.state);
});

//Handle touch here. I would implement these separately in each view, but I can't figure out how to clear the event listeners.
Bangle.on('touch', (button, xy) => {
  if (common.state.wasRunning) timerView.touch(button, xy);
  else keypad.touch(button, xy);
});

Bangle.on('swipe', dir => {
  if (!common.state.wasRunning) keypad.swipe(dir);
});

if (common.state.wasRunning) timerView.show(common);
else keypad.show(common);
