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
  const leshores2 = ["d'una","de dues","de tres","de quatre","de cinc","de sis","de set","de vuit","de nou","de deu","d'onze","de dotze"];
  const fontWeight = 12;
  const maxChars = Math.floor(Bangle.appRect.w / fontWeight);

  function getHora(hour) {
    if (hour >= 12) {
      hour -= 12;
    }
    return leshores2[hour];
  }

  function addLineFeeds(inputString) {
      const words = inputString.split(' ');
      let lines = "";
      let line = "";

      for (let i = 0; i < words.length; i++) {
          const word = words[i];
          if (line.length + word.length > maxChars) {
              lines += line.trim() + "\r\n";
              line = "";
          }
          line += word + " ";
      }
      lines += line.trim();
      return lines;
  }

  function drawSimpleClock() {
    g.clearRect(Bangle.appRect);
    // get date
    var d = new Date();
    var m = d.getMinutes();

    // drawSting centered
    g.setFontAlign(-1, 0);

    // draw time
    let t;
    if (m >= 0 && m < 2) {
      t = leshores[d.getHours()] + " en punt";
    } else if (m >= 2 && m < 5) {
      t = leshores[d.getHours()] + " tocades";
    } else if (m >= 5 && m < 7) {
      t = leshores[d.getHours()] + " ben tocades";
    } else if (m >= 7 && m < 10) {
      t = "Mig quart " + getHora(d.getHours());
    } else if (m >= 10 && m < 12) {
      t = "Mig quart tocat " + getHora(d.getHours());
    } else if (m >= 12 && m < 15) {
      t = "Mig quart ben tocat " + getHora(d.getHours());
    } else if (m >= 15 && m < 17) {
      t = "Un quart " + getHora(d.getHours());
    } else if (m >= 17 && m < 20) {
      t = "Un quart tocat " + getHora(d.getHours());
    } else if (m >= 20 && m < 22) {
      t = "Un quart ben tocat " + getHora(d.getHours());
    } else if (m >= 22 && m < 25) {
      t = "Un quart i mig " + getHora(d.getHours());
    } else if (m >= 25 && m < 27) {
      t = "Un quart i mig tocat " + getHora(d.getHours());
    } else if (m >= 27 && m < 30) {
      t = "Un quart i mig ben tocat " + getHora(d.getHours());
    } else if (m >= 30 && m < 32) {
      t = "Dos quarts " + getHora(d.getHours());
    } else if (m >= 32 && m < 35) {
      t = "Dos quarts tocats " + getHora(d.getHours());
    } else if (m >= 35 && m < 37) {
      t = "Dos quarts ben tocats " + getHora(d.getHours());
    } else if (m >= 37 && m < 40) {
      t = "Dos quarts i mig " + getHora(d.getHours());
    } else if (m >= 40 && m < 42) {
      t = "Dos quarts i mig tocats " + getHora(d.getHours());
    } else if (m >= 42 && m < 45) {
      t = "Dos quarts i mig ben tocats " + getHora(d.getHours());
    } else if (m >= 45 && m < 47) {
      t = "Tres quarts " + getHora(d.getHours());
    } else if (m >= 47 && m < 50) {
      t = "Tres quarts tocats " + getHora(d.getHours());
    } else if (m >= 50 && m < 52) {
      t = "Tres quarts ben tocats " + getHora(d.getHours());
    } else if (m >= 52 && m < 55) {
      t = "Tres quarts i mig " + getHora(d.getHours());
    } else if (m >= 55 && m < 57) {
      t = "Tres quarts i mig tocats " + getHora(d.getHours());
    } else if (m >= 57) {
      t = "Tres quarts i mig ben tocats " + getHora(d.getHours());
    }
    t = addLineFeeds(t)
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
