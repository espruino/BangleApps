g.clear();

let settings = require('Storage').readJSON("poweroff.json", true) || {};
let showPrompt;
showPrompt = def(settings.showPrompt, true);

if (showPrompt) {
 E.showPrompt('Are you sure?', {
  title: 'Power off',
  buttons: { Yes: true, No: false },
 }).then((confirm) => {
  if (!confirm) {
    setTimeout(load, 100);
    return;
  }
}
  g.setFont("6x8",2).setFontAlign(0,0);
  var x = g.getWidth()/2;
  var y = g.getHeight()/2 + 10;
  g.drawString("Powering off...", x, y);

  setTimeout(function() {
    if (Bangle.softOff) Bangle.softOff(); else Bangle.off();
  }, 1000);
});

Bangle.loadWidgets();
Bangle.drawWidgets();
