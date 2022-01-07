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
  var lowestPoint = g.getHeight()*3/5;
  g.fillCircle(40, lowestPoint-29, 12);
  g.fillCircle(60, lowestPoint-29, 12);
  g.fillPoly([29, lowestPoint-22, 50, lowestPoint, 71, lowestPoint-22]);
}

function updateScreen() {
  const colors = [0xFFFF-g.getBgColor(), 0x9492];
  g.reset().clearRect(0, 24, g.getWidth(), g.getHeight()*5/6);
  if (counter > 0) {
    g.setFont("Vector", 40).setFontAlign(0, 0);
    g.setColor(colors[counter%2]);
    drawHeart();
    g.drawString(counter, 120, g.getHeight()*3/5-20);
  } else {
    g.setFont("Vector", 20).setFontAlign(0, 0);
    g.drawString("RESCUE", g.getWidth()/2, g.getHeight()/3);
    g.drawString("BREATHS", g.getWidth()/2, g.getHeight()*3/5);
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
g.drawString(setting('compression_count') + ' / ' + setting('breath_count'), 30, g.getHeight()*5/6);

Bangle.loadWidgets();
Bangle.drawWidgets();
