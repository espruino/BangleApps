// Example application code
// Taken from https://github.com/espruino/BangleApps/blob/master/apps/sclock/clock-simple.js
(function() {

  const timeFontSize = 1;
  const dateFontSize = 2;
  const font = "12x20";

  const xyCenter = g.getWidth() /9;
  const yposTime = 55;
  const yposDate = 130;
  const leshores = ["Les dotze","La una","Les dues","Les tres","Les quatre","Les cinc","Les sis","Les set","Les vuit","Les nou","Les deu","Les onze","Les dotze","La una","Les dues","Les tres","Les quatre","Les cinc","Les sis","Les set","Les vuit","Les nou","Les deu","Les onze","Les dotze"];
  const leshores2 = ["d\'una\r\nel mati","de dues\r\ndel mati","de tres\r\ndel mati","de quatre\r\ndel mati","de cinc\r\ndel mati","de sis\r\ndel mati","de set\r\ndel mati","de vuit\r\ndel mati","de nou\r\ndel mati","de deu\r\ndel mati","d'onze\r\ndel mati","de dotze\r\ndel mati","d'una\r\nde la tarda","de dues\r\nde la tarda","de tres\r\nde la tarda","de quatre\r\nde la tarda","de cinc\r\nde la tarda","de sis\r\nde la tarda","de set\r\nde la tarda","de vuit\r\nde la tarda","de nou\r\ndel vespre","de deu\r\ndel vespre","d'onze\r\ndel vespre","de dotze"];

  function drawSimpleClock() {
    g.clearRect(Bangle.appRect);
    // get date
    var d = new Date();
    var m = d.getMinutes();

    // drawSting centered
    g.setFontAlign(-1, 0);

    // draw time
    if (m >= 0 && m < 2) {
      t = leshores[d.getHours()] + "\r\nen punt";
    } else if (m >= 2 && m < 5) {
      t = leshores[d.getHours()] + "\r\ntocades";
    } else if (m >= 5 && m < 7) {
      t = leshores[d.getHours()] + "\r\nben tocades";
    } else if (m >= 7 && m < 10) {
      t = "Mig quart\r\n" + leshores2[d.getHours()];
    } else if (m >= 10 && m < 12) {
      t = "Mig quart\r\ntocat\r\n" + leshores2[d.getHours()];
    } else if (m >= 12 && m < 15) {
      t = "Mig quart\r\nben tocat\r\n" + leshores2[d.getHours()];
    } else if (m >= 15 && m < 17) {
      t = "Un quart\r\n" + leshores2[d.getHours()];
    } else if (m >= 17 && m < 20) {
      t = "Un quart\r\ntocat\r\n" + leshores2[d.getHours()];
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
      t = "Dos quarts\r\ntocats\r\n" + leshores2[d.getHours()];
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
      t = "Tres quarts\r\ntocats\r\n" + leshores2[d.getHours()];
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

    // draw Hours
    g.setFont(font, dateFontSize);    
    var mu = "";
    if (m < 10) {mu = "0"+m;} else {mu = m;}

    g.drawString(d.getHours()+":"+mu, xyCenter, yposDate, true);
  }

  // handle switch display on by pressing BTN1
  function onLcd(on) {
    if (on) {
      Bangle.drawWidgets();
      //drawSimpleClock();
      Bangle.removeListener('lcdPower', onLcd);
    }
  }
  Bangle.on('lcdPower', onLcd);
  Bangle.setUI("clock");
  Bangle.loadWidgets();
  require("widget_utils").swipeOn();

  // clean app screen
  g.clear();

  // refesh every 60 sec
  setInterval(drawSimpleClock, 60E3);

  // draw now
  drawSimpleClock();

})();
