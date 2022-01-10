require("FontLECO1976Regular.js").add14(Graphics);

drawBackground = function () {
  g.setColor("#000");
  g.fillRect(0, 0, 175, 175);
  g.setColor("#FFF");
  g.fillRect(3, 3, 172, 172);
};

function draw() {
  drawBackground();

  g.setColor("#000");
  g.setFontAlign(0, 0);

  // TITLE
  g.fillRect(0, 0, 176, 25);
  g.setFontLECO1976Regular14();
  g.setColor("#FFF");
  g.drawString("WEATHER", 88, 13);
  [0, 136].forEach((v) => {
    for (let i = 5; i < 20; i += 3) {
      g.drawLine(v, i, v + 40, i);
    }
  });

  let weather = require("Storage").readJSON("sphclock.json", false).weather;
  let hour = new Date().getHours();

  if (weather) {
    g.setColor("#000");
    g.setFont("6x8");

    let minC = null;
    let maxC = null;

    weather.forEach((v1) => {
      v1.hourly.forEach((v2) => {
        if (!minC || v2.tempC < minC + 1) minC = v2.tempC + 1;
        if (!maxC || v2.tempC > maxC + 1) maxC = v2.tempC + 1;
      });
    });

    minC = Math.floor(minC / 5) * 5;
    maxC = Math.ceil(maxC / 5) * 5;

    min_x = 22;
    min_y = 32;
    max_x = 172;
    max_y = 124;

    // Grid horizontal
    for (let y = maxC - 5; y >= minC + 5; y -= 5) {
      let height = Math.round(((y - minC) * (max_y - min_y)) / (maxC - minC));
      g.setColor("#888");
      g.drawLine(min_x, max_y - height, max_x, max_y - height);
      g.setFontAlign(1, 0);
      g.setColor("#000");
      g.drawString(y, min_x - 3, max_y - height);
    }

    // Grid vertical
    for (let i = 1; i < 3; i++) {
      // Marcação da hora atual
      g.setColor("#888");
      g.drawLine(min_x + i * 48, max_y, min_x + i * 48, min_y);
    }

    g.setColor("#000");
    g.setFontAlign(1, -1);
    g.drawString(maxC, min_x - 3, min_y + 2);
    g.setFontAlign(1, 1);
    g.drawString(minC, min_x - 3, max_y);

    for (let d = 0; d < 3; d++) {
      for (let i = 0; i < 8; i++) {
        let w = weather[d].hourly[i];
        let height = Math.round(
          ((w.tempC - minC) * (max_y - min_y)) / (maxC - minC)
        );
        let x = min_x + d * 48 + i * 6;
        let y = max_y - height;

        if (w.chanceofrain > 60) g.setColor("#00F");
        else if (w.chanceofrain > 20) g.setColor("#88F");
        else g.setColor("#F88");
        g.fillRect(x, y, x + 4, max_y);

        if (w.chanceofrain > 20) g.setColor("#00F");
        else g.setColor("#F00");

        g.drawRect(x, y, x + 4, max_y);
      }
    }

    // Marcação da hora atual
    g.setColor("#000");
    g.drawLine(min_x + hour * 2, max_y, min_x + hour * 2, min_y);
    g.setFontAlign(0, -1);
    g.setFont("4x6");

    // Forecast icons
    counter = 0;
    let ic = require("sphweather.icons.js");
    let hoje = dateToISO(new Date());
    let hora = new Date().getHours();

    for (let d = 0; d < 3 && counter <= 5; d++) {
      if (weather[d].date < hoje) continue;

      for (let i = 0; i < 8 && counter <= 5; i++) {
        if (weather[d].date == hoje && i * 3 < hora - 2) continue;

        g.drawImage(
          ic.getIcon(
            ic.wwoCodeToIcon(weather[d].hourly[i].weatherCode),
            i * 3 > 19 || i * 3 < 6
          ),
          counter * 29 + 3,
          135
        );
        g.setColor("#000");
        g.setFontAlign(0, -1);
        g.setFontLECO1976Regular14();
        g.setFont("6x8");
        g.drawString(i * 3 + "h", counter * 29 + 15, 160);
        counter++;
      }
    }

    // }
    drawSeparator("TEMP AND RAIN", 25);
    drawSeparator("FORECAST", 125);
  }
}

function drawSeparator(text, y) {
  g.setColor("#F00");
  g.fillRect(0, y, 176, y + 5);
  g.setColor("#FFF");
  g.drawRect(-1, y, 176, y + 5);
  g.setColor("#000");
  g.drawLine(0, y + 6, 176, y + 6);
  g.setFontLECO1976Regular14();

  g.setFontAlign(1, 0);
  drawStringWithFullBorder(text, "#FFF", "#000", 176 - 13, y + 5);
}

function drawStringWithFullBorder(text, color, border, x, y) {
  g.setColor(border);
  g.drawString(text, x - 1, y - 1);
  g.drawString(text, x - 1, y + 1);
  g.drawString(text, x + 1, y - 1);
  g.drawString(text, x + 1, y + 1);
  g.setColor(color);
  g.drawString(text, x, y);
}

function dateToISO(date) {
  ano = date.getFullYear();
  mes = ("00" + date.getMonth() + 1).slice(-2);
  dia = ("00" + date.getDate()).slice(-2);
  return ano + "-" + mes + "-" + dia;
}

Bangle.on("touch", function (button, xy) {
  // Back to clock
  Bangle.buzz(100, 0.1).then(() => load());
});

Bangle.on("lock", function () {
  if (Bangle.isLocked()) {
    load();
  }
});

draw();
