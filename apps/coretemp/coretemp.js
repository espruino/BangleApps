// Simply listen for core events and show data

Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);

var btm = g.getHeight() - 1;
var img = {
  width : 146,
  height : 48,
  bpp : 4,
  transparent : 0,
  palette : new Uint16Array([ 65535, 65535, 2854, 1419 ]),
  buffer :
      require("heatshrink")
          .decompress(atob(
              "AEUDmczmBD/I4xJ/AAMCkBHFAAJG8kQABJAJHFSVURAAUQRphHCkQGBJAySngJHDJRhHEJALZDAgiSBEQ0RPBIAKHAwQQI4xIEaoQFEEZpIULSRHFkDZDBwZIMEYhITa44SKSAxIDSARIDJ4IjKJCpHNEoiQGJDA2CJCQSOCYaQGJDBsCGiKQGTZIJCI4xBEJBAAEFpQAPDQoMGBQyOGIJJPGF6AALC5glCbJAQEgZCEAoowTSBypJBwKQMIQaSBAgZIJWw5ITB5RTDSBLbEAAjDOPRIVabIiQFJBCQKPYhIVCRxIEBg7WDSBpIVbJ5IQJIqQBgZIiCh7ZLJIriDbhJI3JoxIebIZITI6BIjCZ5IRI4RIPHAYAJJH4AIUAJIzHIhI/SAwzBJH6QGJH5HIHApI2HCIAJL4pITkATOJQJIMHCJeFJD8zaZCQHJCEBJCUCJCKPBJBhWGJEcia5oACJBSfHJB4QMJA6SLI4ZIKPAg3QJCUAJCbbBJETbPJAbbKbIhIBYJpIQbZ5UDbZzZFPBxIVSRIOBJA5JISAhIIF4ZIUfQpJHEwQKDJAhJHbJbBJJCIZECY4KGSQoABBIZOBSBbbIJC6IEBQqSJJoyQLbZBIRbYoAKJAaSHJAjbCF541RSRISLSRkgJAKQKbY5ISJJyQDSRyQMbYxITChhHFSRhGMbY5IUCpRHHJJZITiBIVbpBHJbpJHPFhBITfI4ANIwcgI6AAV"))
}

          function onCore(c) {
            var core = "Core: " + c.core + "°" + c.unit;
            var skin = "Skin: " + c.skin + "°" + c.unit;

            var px = g.getWidth() / 2;
            g.setFontAlign(0, 0);
            g.clearRect(0, 24, g.getWidth(), g.getHeight() - 24);
            g.drawImage(img, 0, 30);
            g.setColor(0xC618); // Light gray
            g.setFont("6x8", 3).drawString(core, px, 48 + 48);
            g.setFont("6x8", 3).drawString(skin, px, 48 + 48 + 24);
          } Bangle.on('CoreTemp', onCore);

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

g.reset().setFont("6x8", 2).setFontAlign(0, 0);
g.drawString("Please wait...", g.getWidth() / 2, g.getHeight() / 2 - 16);
