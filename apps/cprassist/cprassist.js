const SETTINGS_FILE = 'cprassist.settings.json';
const SHORT_BUZZ_PERIOD = 80;
const LONG_BUZZ_PERIOD = 800;

Bangle.setLCDTimeout(undefined);  // do not deaktivate display while running this app

let settings;

function setting(key) {
  const DEFAULTS = {
    'compression_count': 30,
    'breath_count': 2,
    'compression_rpm': 100,
    'breath_period_sec': 4
  };
  if (!settings) {
    const storage = require("Storage");
    settings = storage.readJSON(SETTINGS_FILE, 1) || {};
  }
  return (key in settings)
    ? settings[key]
    : DEFAULTS[key];
}

let counter = setting('compression_count');

function provideFeedback() {
  let period = counter > 0
    ? SHORT_BUZZ_PERIOD
    : LONG_BUZZ_PERIOD;
  try {
    Bangle.buzz(period, 1.0);
  } catch(err) {
  }
}

function drawHeart() {
  g.fillCircle(40, 92, 12);
  g.fillCircle(60, 92, 12);
  g.fillPoly([29, 98, 50, 120, 71, 98]);
}

function updateScreen() {
  const colors = [0xFFFF, 0x9492];
  g.reset().clearRect(0, 50, 250, 150);
  if (counter > 0) {
    g.setFont("Vector", 40).setFontAlign(0, 0);
    g.setColor(colors[counter%2]);
    drawHeart();
    g.drawString(counter + "", g.getWidth()/2, 100);
  } else {
    g.setFont("Vector", 20).setFontAlign(0, 0);
    g.drawString("RESCUE", g.getWidth()/2, 70);
    g.drawString("BREATHS", g.getWidth()/2, 120);
  }
}

function tick() {
  provideFeedback();
  updateScreen();
  if (counter == 0) {
    var reset = function() {
      counter = setting('compression_count');
      clearInterval(interval);
      interval = setInterval(tick, 60000/setting('compression_rpm'));
    };
    clearInterval(interval);
    interval = setInterval(reset, setting('breath_period_sec')*1000);
  }
  counter -= 1;
}

interval = setInterval(tick, 60000/setting('compression_rpm'));

g.clear(1).setFont("6x8");
g.drawString(setting('compression_count') + ' / ' + setting('breath_count'), 30, 200);

Bangle.loadWidgets();
Bangle.drawWidgets();
