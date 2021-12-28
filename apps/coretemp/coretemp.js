// Simply listen for core events and show data

Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);

var btm = g.getHeight() - 1;
var corelogo = {
  width : 146,
  height : 48,
  bpp : 4,
  transparent : 0,
  palette : new Uint16Array([ 65535, 65535, 2854, 1419 ]),
  buffer :
      require("heatshrink")
          .decompress(atob(
              "AEUDmczmBD/I4xJ/AAMCkBHFAAJG8kQABJAJHFSVURAAUQRphHCkQGBJAySngJHDJRhHEJALZDAgiSBEQ0RPBIAKHAwQQI4xIEaoQFEEZpIULSRHFkDZDBwZIMEYhITa44SKSAxIDSARIDJ4IjKJCpHNEoiQGJDA2CJCQSOCYaQGJDBsCGiKQGTZIJCI4xBEJBAAEFpQAPDQoMGBQyOGIJJPGF6AALC5glCbJAQEgZCEAoowTSBypJBwKQMIQaSBAgZIJWw5ITB5RTDSBLbEAAjDOPRIVabIiQFJBCQKPYhIVCRxIEBg7WDSBpIVbJ5IQJIqQBgZIiCh7ZLJIriDbhJI3JoxIebIZITI6BIjCZ5IRI4RIPHAYAJJH4AIUAJIzHIhI/SAwzBJH6QGJH5HIHApI2HCIAJL4pITkATOJQJIMHCJeFJD8zaZCQHJCEBJCUCJCKPBJBhWGJEcia5oACJBSfHJB4QMJA6SLI4ZIKPAg3QJCUAJCbbBJETbPJAbbKbIhIBYJpIQbZ5UDbZzZFPBxIVSRIOBJA5JISAhIIF4ZIUfQpJHEwQKDJAhJHbJbBJJCIZECY4KGSQoABBIZOBSBbbIJC6IEBQqSJJoyQLbZBIRbYoAKJAaSHJAjbCF541RSRISLSRkgJAKQKbY5ISJJyQDSRyQMbYxITChhHFSRhGMbY5IUCpRHHJJZITiBIVbpBHJbpJHPFhBITfI4ANIwcgI6AAV"))
};

first = true;
function onCore(c) {
  var core = "Core: " + c.core + c.unit;
  var skin = "Skin: " + c.skin + c.unit;

  var px = g.getWidth() / 2;
  g.setFontAlign(0, 0);
  if (first) {
    g.clearRect(0, 24, g.getWidth(), g.getHeight() - 24);
    g.drawImage(corelogo, px - 146 / 2, 30);
    first = false;
  } else {
    g.clearRect(0, 48 + 48, g.getWidth(), 48 + 48 + 24 * 2);
  }
  g.setColor(0xC618); // Light gray
  g.setFont("6x8", 3).drawString(core, px, 48 + 48);
  g.setFont("6x8", 3).drawString(skin, px, 48 + 48 + 24);
}

Bangle.on('CoreTemp', onCore);

g.clear();

Bangle.loadWidgets();
Bangle.drawWidgets();

// Background task will activate if settings are enabled.
function enableSensor() {
  settings = require("Storage").readJSON("coretemp.json", 1) || {};

  if (!settings.enabled) {

    settings.enabled = true;
    require("Storage").write("coretemp.json", settings);

    Bangle.loadWidgets();
    Bangle.drawWidgets();
  }
}

function drawMessage() {
  settings = require("Storage").readJSON("coretemp.json", 1) || {};
  g.clearRect(0, 24, g.getWidth(), g.getHeight() - 24);

  if (!settings.enabled) {
    g.reset().setFont("6x8", 2).setFontAlign(0, 0);
    g.drawString("Disabled, press BTN2\nto enable.", g.getWidth() / 2,
                 g.getHeight() / 2 - 16);
  } else {
    g.reset().setFont("6x8", 2).setFontAlign(0, 0);
    g.drawString("Please wait...\nWaiting for data", g.getWidth() / 2,
                 g.getHeight() / 2 - 16);
  }
}

setWatch(() => { enableSensor(); }, BTN2, {repeat : false});

drawMessage();
