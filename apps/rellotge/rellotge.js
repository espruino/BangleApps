// Example application code
// Taken from https://github.com/espruino/BangleApps/blob/master/apps/sclock/clock-simple.js
(function() {

  const timeFontSize = 1;
  const dateFontSize = 2;
  const font = "12x20";

  const Panel = {
    STEPS: 0,
    DATE: 1
  };

  let panel = Panel.STEPS;

  const timeTextMagin = 15;
  const xyCenter = timeTextMagin;
  const yposTime = 45;
  const leshores = ["Les dotze","La una","Les dues","Les tres","Les quatre","Les cinc","Les sis","Les set","Les vuit","Les nou","Les deu","Les onze","Les dotze","La una","Les dues","Les tres","Les quatre","Les cinc","Les sis","Les set","Les vuit","Les nou","Les deu","Les onze","Les dotze"];
  const leshores2 = ["d'una","de dues","de tres","de quatre","de cinc","de sis","de set","de vuit","de nou","de deu","d'onze","de dotze"];
  const RED = '#f00';
  const BLACK = "#000"

  function getHora(hour) {
    if (hour >= 12) {
      hour -= 12;
    }
    return leshores2[hour];
  }

  function addLineFeeds(inputString, g, posX) {
      const margin = timeTextMagin;
      const words = inputString.split(' ');
      let lines = "";
      let line = "";
      const totalWidth = g.getWidth();

      for (const word of words) {
          const nextLine = line + word;
          const width = posX + g.stringWidth(nextLine) + margin;

          if (width > totalWidth) {
              lines += line.trim() + "\r\n";
              line = "";
          }
          line += word + " ";
      }
      lines += line.trim();
      return lines;
  }

  // Define the center coordinates of the watch face
  const margin = 10;
  const centerX = 40 + margin;
  const centerY = g.getHeight() - 40 - margin;

  // Function to draw the watch face
  function drawWatchFace() {

    const diameter = 40;
    g.setColor(BLACK);
    g.drawCircle(centerX, centerY, diameter);

    // Draw hour markers
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x1 = centerX + Math.sin(angle) * 70 / 2;
      const y1 = centerY - Math.cos(angle) * 70 / 2;
      const x2 = centerX + Math.sin(angle) * 60 / 2;
      const y2 = centerY - Math.cos(angle) * 60 / 2;
      g.drawLine(x1, y1, x2, y2);
    }
  }

  function drawHand(centerX, centerY, hourAngle, handLength) {
    const hourHandX = centerX + Math.sin(hourAngle) * handLength;
    const hourHandY = centerY - Math.cos(hourAngle) * handLength;
    g.drawLine(centerX, centerY, hourHandX, hourHandY);
  }

  // Function to update the watch display
  function updateWatch() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();

    // Calculate angles for hour, minute, and second hands
    const hourAngle = ((hours + minutes / 60) / 12) * Math.PI * 2;
    const minuteAngle = (minutes / 60) * Math.PI * 2;
    g.setColor(BLACK);

    drawHand(centerX, centerY, hourAngle, 10);
    drawHand(centerX, centerY, minuteAngle, 15);
  }

  function getSteps() {
    var steps = Bangle.getHealthStatus("day").steps;
    steps = Math.round(steps/1000);
    return steps + "k";
  }

  function drawDate() {
    g.setFont(font, dateFontSize);

    const date = new Date();
    const dow = require("locale").dow(date, 2).toUpperCase(); //dj.
    g.drawString(dow, g.getWidth() - 60, g.getHeight() - 60, true);

    const mon = date.getDate() + " " + require("locale").month(date, 1);
    g.setFont(font, "4x6");
    g.drawString(mon, g.getWidth() - 70, g.getHeight() - 25, true);
  }

  function drawSteps() {
  
    g.setFont(font, dateFontSize);
    const steps = getSteps()
    g.drawString(steps, g.getWidth() - 60, g.getHeight() - 60, true);

    g.setFont(font, "4x6");
    const text = "Passos"
    g.drawString(text, g.getWidth() - 70, g.getHeight() - 25, true);
  }

  function drawSimpleClock() {

    // get date
    var d = new Date();
    var m = d.getMinutes();

    let t;
    if (m == 0) {
      t = leshores[d.getHours()] + " en punt";
    } else if (m >= 1 && m < 4) {
      t = leshores[d.getHours()] + " tocades";
    } else if (m >= 4 && m < 7) {
      t = leshores[d.getHours()] + " ben tocades";
    } else if (m == 7) {
      t = "Mig quart " + getHora(d.getHours());
    } else if (m >= 8 && m < 12) {
      t = "Mig quart tocat " + getHora(d.getHours());
    } else if (m >= 12 && m < 15) {
      t = "Mig quart ben tocat " + getHora(d.getHours());
    } else if (m == 15) {
      t = "Un quart " + getHora(d.getHours());
    } else if (m >= 16 && m < 19) {
      t = "Un quart tocat " + getHora(d.getHours());
    } else if (m >= 19 && m < 22) {
      t = "Un quart ben tocat " + getHora(d.getHours());
    } else if (m == 22) {
      t = "Un quart i mig " + getHora(d.getHours());
    } else if (m >= 23 && m < 26) {
      t = "Un quart i mig tocat " + getHora(d.getHours());
    } else if (m >= 26 && m < 30) {
      t = "Un quart i mig ben tocat " + getHora(d.getHours());
    } else if (m == 30) {
      t = "Dos quarts " + getHora(d.getHours());
    } else if (m >= 31 && m < 34) {
      t = "Dos quarts tocats " + getHora(d.getHours());
    } else if (m >= 34 && m < 37) {
      t = "Dos quarts ben tocats " + getHora(d.getHours());
    } else if (m == 37) {
      t = "Dos quarts i mig " + getHora(d.getHours());
    } else if (m >= 38 && m < 42) {
      t = "Dos quarts i mig tocats " + getHora(d.getHours());
    } else if (m >= 42 && m < 45) {
      t = "Dos quarts i mig ben tocats " + getHora(d.getHours());
    } else if (m == 45) {
      t = "Tres quarts " + getHora(d.getHours());
    } else if (m >= 46 && m < 49) {
      t = "Tres quarts tocats " + getHora(d.getHours());
    } else if (m >= 49 && m < 52) {
      t = "Tres quarts ben tocats " + getHora(d.getHours());
    } else if (m == 52) {
      t = "Tres quarts i mig " + getHora(d.getHours());
    } else if (m >= 53 && m < 56) {
      t = "Tres quarts i mig tocats " + getHora(d.getHours());
    } else if (m >= 57) {
      t = "Tres quarts i mig ben tocats " + getHora(d.getHours());
    }
    g.clearRect(Bangle.appRect);
    // drawString centered
    g.setFontAlign(-1, 0);

    g.setFont(font, timeFontSize);
    t = addLineFeeds(t, g, xyCenter);

    let color;
    if (E.getBattery() < 15) {
      color = RED;
    }
    else {
      color = BLACK;
    }

    g.setColor(color);
    g.drawString(t, xyCenter, yposTime, true);
    g.setColor(BLACK);
    if (panel == Panel.STEPS) {
       drawSteps();
       panel = Panel.DATE;
    } else {
       drawDate();
       panel = Panel.STEPS;
    }
   
    drawWatchFace();
    updateWatch();
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
 Bangle.setUI({
         mode: "clockupdown"
     },
     btn => {
         // up & down even which forces panel switch
         drawSimpleClock();
     });

  Bangle.loadWidgets();
  require("widget_utils").swipeOn();

  // clean app screen
  g.clear();

  // refesh every 60 sec
  setInterval(drawSimpleClock, 60E3);

  // draw now
  drawSimpleClock();

})();
