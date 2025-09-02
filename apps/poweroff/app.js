{ // must be inside our own scope here so that when we are unloaded everything disappears
g.clear();

// Helper function default setting
let def = function(value, def) {
	return value !== undefined ? value : def;
};
let settings = require('Storage').readJSON("poweroff.json", true) || {};
let showPrompt;
showPrompt = def(settings.showPrompt, true);

if (showPrompt) {
 Bangle.setLocked(false); // handy when debugging via IDE
 E.showPrompt('Are you sure?', {
  title: 'Power off',
  buttons: { Yes: true, No: false },
 }).then((confirm) => {
  if (!confirm) {
    setTimeout(load, 100);
    return;
  }
  
  E.showMessage("Powering off...");

  setTimeout(function() {
    if (Bangle.softOff) Bangle.softOff(); else Bangle.off();
  }, 1000);
 });
} else {
  E.showMessage("Powering off...");
  
  setTimeout(function() {
    if (Bangle.softOff) Bangle.softOff(); else Bangle.off();
  }, 1000);
}

Bangle.loadWidgets();
Bangle.drawWidgets();
}
