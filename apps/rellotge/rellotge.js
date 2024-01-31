// drawWidgets() is added by bootloader.js when loading a clock app, but when you upload via the IDE it just 
// resets the watch and skips out running bootloader.js completely. So add the relevant code from the bootloader. 
var WIDGETPOS = {
  tl: 32,
  tr: g.getWidth() - 32,
  bl: 32,
  br: g.getWidth() - 32
};
var WIDGETS = {};

function drawWidgets() {
  for (var w of WIDGETS) w.draw();
}

require("Storage").list().filter(a => a[0] == '=').forEach(
  widget => eval(require("Storage").read(widget)));
setTimeout(drawWidgets, 100);

// Example application code
// Taken from https://github.com/espruino/BangleApps/blob/master/apps/sclock/clock-simple.js
(function() {

  const timeFontSize = 15;
  const dateFontSize = 10;
  const gmtFontSize = 10;
  const font = "Vector";

  const xyCenter = g.getWidth() / 2;
  const yposTime = 50;
  const yposDate = 130;
  const yposYear = 175;
  const yposGMT = 220;
  const leshores = ["Les dotze","La una","Les dues","les tres","Les quatre","Les cinc","Les sis","Les set","Les vuit","Les nou","Les deu","Les onze","Les dotze","La una","Les dues","Les tres","Les quatre","Les cinc","Les sis","Les set","Les vuit","Les nou","Les deu","Les onze","Les dotze"];
  const leshores2 = ["d\'una del mati","de dues del mati","de tres del mati","de quatre del mati","de cinc del mati","de sis del mati","de set del mati","de vuit del mati","de nou del mati","de deu del mati","d'onze del mati","de dotze del mati","d'una de la tarda","de dues de la tarda","de tres de la tarda","de quatre de la tarda","de cinc de la tarda","de sis de la tarda","de set de la tarda","de vuit de la tarda","de nou del vespre","de deu del vespre","d'onze del vespre","de dotze"];

  function drawSimpleClock() {
    g.clear();
    // get date
    var d = new Date();
    var da = d.toString().split(" ");
    var m = d.getMinutes();

    // drawSting centered
    g.setFontAlign(0, 0);

    // draw time
    var time = da[4].substr(0, 5);
    var hora = time.split(":");
    if (m >= 0 && m < 2) {
      t = leshores[d.getHours()] + "\r\nen punt";
    } else if (m >= 2 && m < 5) {
      t = leshores[d.getHours()] + "\r\ntocades";
    } else if (m >= 5 && m < 7) {
      t = leshores[d.getHours()] + "\r\nben tocades";
    } else if (m >= 7 && m < 10) {
      t = "Mig quart\r\n" + leshores2[d.getHours()];
    } else if (m >= 10 && m < 12) {
      t = "Mig quart tocat\r\n" + leshores2[d.getHours()];
    } else if (m >= 12 && m < 15) {
      t = "Mig quart\r\nben tocat\r\n" + leshores2[d.getHours()];
    } else if (m >= 15 && m < 17) {
      t = "Un quart\r\n" + leshores2[d.getHours()];
    } else if (m >= 17 && m < 20) {
      t = "Un quart tocat\r\n" + leshores2[d.getHours()];
    } else if (m >= 20 && m < 22) {
      t = "Un quart\r\nben tocat\r\n" + leshores2[d.getHours()];
    } else if (m >= 22 && m < 25) {
      t = "Un quart i mig\r\n" + leshores2[d.getHours()];
    } else if (m >= 25 && m < 27) {
      t = "Un quart i mig\r\ntocat\r\n" + leshores2[d.getHours()];
    } else if (m >= 27 && m < 30) {
      t = "Un quart i mig\r\nben tocat\r\n" + leshores2[d.getHours()];
    } else if (m >= 30 && m < 32) {
      t = "Dos quarts\r\n" + leshores2[d.getHours()];
    } else if (m >= 32 && m < 35) {
      t = "Dos quarts tocats\r\n" + leshores2[d.getHours()];
    } else if (m >= 35 && m < 37) {
      t = "Dos quarts\r\nben tocats\r\n" + leshores2[d.getHours()];
    } else if (m >= 37 && m < 40) {
      t = "Dos quarts i mig\r\n" + leshores2[d.getHours()];
    } else if (m >= 40 && m < 42) {
      t = "Dos quarts i mig\r\ntocats\r\n" + leshores2[d.getHours()];
    } else if (m >= 42 && m < 45) {
      t = "Dos quarts i mig\r\nben tocats\r\n" + leshores2[d.getHours()];
    } else if (m >= 45 && m < 47) {
      t = "Tres quarts\r\n" + leshores2[d.getHours()];
    } else if (m >= 47 && m < 50) {
      t = "Tres quarts tocats\r\n" + leshores2[d.getHours()];
    } else if (m >= 50 && m < 52) {
      t = "Tres quarts\r\nben tocats\r\n" + leshores2[d.getHours()];
    } else if (m >= 52 && m < 55) {
      t = "Tres quarts i mig\r\n" + leshores2[d.getHours()];
    } else if (m >= 55 && m < 57) {
      t = "Tres quarts i mig\r\ntocats\r\n" + leshores2[d.getHours()];
    } else if (m >= 57) {
      t = "Tres quarts i mig\r\nben tocats\r\n" + leshores2[d.getHours()];
    }
    g.setFont(font, timeFontSize);
    g.drawString(t, xyCenter, yposTime, true);

    // draw Day, name of month, Date
    var date = [da[0], da[1], da[2]].join(" ");
    g.setFont(font, dateFontSize);

    g.drawString(date, xyCenter, yposDate, true);

    // draw year
    g.setFont(font, dateFontSize);
    g.drawString(d.getFullYear(), xyCenter, yposYear, true);

    // draw gmt
    var gmt = da[5];
    g.setFont(font, gmtFontSize);
    g.drawString(gmt, xyCenter, yposGMT, true);

  }

  // handle switch display on by pressing BTN1
  Bangle.on('lcdPower', function(on) {
    if (on) {
      drawWidgets();
      drawSimpleClock();
    }
  });

  // clean app screen
  //g.clear();

  // refesh every 60 sec
  setInterval(drawSimpleClock, 60E3);

  // draw now
  drawSimpleClock();

})();
