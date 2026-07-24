var settings = require("Storage").readJSON("coretemp.json", 1) || {};
var OWNER = "COREAPP";
var coreStarted = false;
// Simply listen for core events and show data
//var btm = g.getHeight() - 1;
var px = g.getWidth() / 2;

// Dark or light logo
var col = (process.env.HWVERSION == 1) ? 65535 : 0;

var corelogo = {
  width : 146,
  height : 48,
  bpp : 4,
  transparent : 0,
  palette : new Uint16Array([ col, col, 2854, 1419 ]),
  buffer :
      require("heatshrink")
          .decompress(atob(
              "AEUDmczmBD/I4xJ/AAMCkBHFAAJG8kQABJAJHFSVURAAUQRphHCkQGBJAySngJHDJRhHEJALZDAgiSBEQ0RPBIAKHAwQQI4xIEaoQFEEZpIULSRHFkDZDBwZIMEYhITa44SKSAxIDSARIDJ4IjKJCpHNEoiQGJDA2CJCQSOCYaQGJDBsCGiKQGTZIJCI4xBEJBAAEFpQAPDQoMGBQyOGIJJPGF6AALC5glCbJAQEgZCEAoowTSBypJBwKQMIQaSBAgZIJWw5ITB5RTDSBLbEAAjDOPRIVabIiQFJBCQKPYhIVCRxIEBg7WDSBpIVbJ5IQJIqQBgZIiCh7ZLJIriDbhJI3JoxIebIZITI6BIjCZ5IRI4RIPHAYAJJH4AIUAJIzHIhI/SAwzBJH6QGJH5HIHApI2HCIAJL4pITkATOJQJIMHCJeFJD8zaZCQHJCEBJCUCJCKPBJBhWGJEcia5oACJBSfHJB4QMJA6SLI4ZIKPAg3QJCUAJCbbBJETbPJAbbKbIhIBYJpIQbZ5UDbZzZFPBxIVSRIOBJA5JISAhIIF4ZIUfQpJHEwQKDJAhJHbJbBJJCIZECY4KGSQoABBIZOBSBbbIJC6IEBQqSJJoyQLbZBIRbYoAKJAaSHJAjbCF541RSRISLSRkgJAKQKbY5ISJJyQDSRyQMbYxITChhHFSRhGMbY5IUCpRHHJJZITiBIVbpBHJbpJHPFhBITfI4ANIwcgI6AAV"))
};

function onCore(c) {
  if (!c) return;
  // Large or small font
  var sz = ((process.env.HWVERSION == 1) ? 3 : 2);
  g.reset();
  if (g.setBgColor) g.setBgColor(g.theme.bg);
  g.setFontAlign(0, 0);
  g.clearRect(0, 32 + 48, g.getWidth(), 32 + 48 + 24 * 4);
  g.setColor(g.theme.dark ? "#CCC" : "#333");  // gray
  g.setFont("6x8", sz).drawString("Core: " + ((c.core < 327) ? (c.core + c.unit) : 'n/a'), px, 48 + 48);
  g.setFont("6x8", sz).drawString("Skin: " + c.skin + c.unit, px, 48 + 48 + 14);
  var hrText = "n/a";
  if (c.hr && c.hr > 0) {
    hrText = c.hr + " BPM";
  }
  g.setFont("6x8", sz).drawString("HR: " + hrText, px, 48 + 48 + 28);
  g.setFont("6x8", sz).drawString("HSI: " + (c.hsiValid ? (c.hsi + "/10") : "n/a"), px, 48 + 48 + 42);
  g.setFont("6x8", sz).drawString("BATT: " + c.battery+ "%", px, 48 + 48 + 56);
}

function drawBackground(message) {
  g.reset();
  if (g.setBgColor) g.setBgColor(g.theme.bg);
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  g.reset();
  if (g.setBgColor) g.setBgColor(g.theme.bg);
  g.setFont("6x8", 2).setFontAlign(0, 0);
  g.drawImage(corelogo, px - 146 / 2, 30);
  g.drawString(message, g.getWidth() / 2, g.getHeight() / 2 + 16);
}


function stopCore() {
  if (coreStarted) {
    Bangle.removeListener('CORESensor', onCore);
    coreStarted = false;
  }
  if (Bangle.setCORESensorPower) Bangle.setCORESensorPower(0, OWNER);
}

function startCore() {
  if (!settings.btid) {
    drawBackground("Pair CORE\nin Settings");
    return;
  }
  try { require("CORESensor").enable(); } catch (e) {}
  coreStarted = true;
  Bangle.on('CORESensor', onCore);
  if (Bangle.setCORESensorPower) Bangle.setCORESensorPower(1, OWNER);
  drawBackground("Waiting for\ndata...");
}

E.on("kill", stopCore);
startCore();
