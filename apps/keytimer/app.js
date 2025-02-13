const storage = require('Storage');
const common = require("keytimer-com.js");

const keypad = require("keytimer-keys.js");
const timerView = require("keytimer-tview.js");

Bangle.KEYTIMER = true;

Bangle.loadWidgets();
Bangle.drawWidgets();

E.on('kill', () => {
  storage.writeJSON('keytimer.json', common.state);
});

// Handle touch here. I would implement these separately in each view, but I can't figure out how to clear the event listeners.
Bangle.on('touch', (button, xy) => {
  if (common.timerExists()) timerView.touch(button, xy);
  else keypad.touch(button, xy);
});

Bangle.on('swipe', dir => {
  if (!common.timerExists()) keypad.swipe(dir);
});

if (common.timerExists()) timerView.show(common);
else keypad.show(common);
