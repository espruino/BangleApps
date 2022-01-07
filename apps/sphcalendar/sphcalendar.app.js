Graphics.prototype.setFontLECO1976Regular14 = function (scale) {
  // Actual height 14 (13 - 0)
  g.setFontCustom(
    atob(
      "AAAAAAAAAAAD+w/sAAAAA8APAAAA8APAAAAMwP/D/wMwDMD/w/8DMAAAAAD8w/M8z/M/zPM/DPwAAAAPwD8QzcP/D/AHgD/D/wzMI/APwAAAAD/w/8MzDMwzMM/DPwDAAADwA8AAAAAAD8H/74f4BwAAAA4B/z8/8D8AAAAAeAPwD8AeAHgAAAAAAAAYAGAH4B+AGABgAAAAAAHgB4AAAAAYAGABgAYAAAAAABgAYAAAAQA8D/D+A8AAAAAA/8P/DAwwMMDD/w/8AAAAAwMMDD/w/8ADAAwAAO/DvwzMMzDMw/MPzAAAAAMDDMwzMMzDMw/8P/AAAAAPwD8ADAAwAMA/8P/AAAAAP3D9wzMMzDMwz8M/AAAAAP/D/wzMMzDMwz8M/AAA4AOADAAwAMAD/w/8AAAAA/8P/DMwzMMzD/w/8AAAAA/MPzDMwzMMzD/w/8AAAAAYYGGAAAAAGHhh4AABwAcAPgDYB3AYwAAAAAZgGYBmAZgGYBmAAAAABjAdwDYA+AHABwAAA4AOADOwzsMwD8A/AAAAAA//P/zAM37N+zZs/7P+wAAAAP/D/wzAMwDMA/8P/AAAAAP/D/wzMMzDMw/8P/AAAAAP/D/wwMMDDAwwMMDAAAAAP/D/wwMMDDhw/8H+AAAAAP/D/wzMMzDMwzMMDAAAAAP/D/wzAMwDMAzAMAAAA/8P/DAwzMMzDPwz8AAAAA/8P/AMADAAwD/w/8AAAAA/8P/AAAwMMDDAwwMMDD/w/8AAAAA/8P/AcAPAPwDvwj8AAAAA/8P/AAwAMADAAwAAP/D/w/AB+AHwA8B+B+A/8P/AAA/8P/D/wfAB8AHw/8P/AAAAAP/D/wwMMDDAw/8P/AAAAAP/D/wzAMwDMA/APwAAA/8P/DAwwMMDD/8//AAwAA/8P/DOAzwM/D9w/EAAAAA/MPzDMwzMMzDPwz8AADAAwAMAD/w/8MADAAwAAAD/w/8ADAAwAMP/D/wAAPAD8AP4AfAHwP4PwDgAAAPgD/gH8AfB/w/AP4A/wA8D/D/A8AAADAw4cP/A/APwH+DzwwMAAAAA/APwAPwD8A/D8A/AAAAAAz8M/DMwzMMzD8w/MAAAAA/////ADwA4ADwA/wB/ADwAAMAPAD////8A"
    ),
    32,
    atob(
      "BAQHCQkNCQQGBggIBAYEBgkHCQkJCQkICQkEBAcIBwkKCQkJCQkICQkECAkHDAkJCAkJCQgJCQ0JCQkFBgU="
    ),
    14 + (scale << 8) + (1 << 16)
  );
};

let getDows = function () {
  let date = new Date();
  let locale = require("locale");
  let dates = [0, 1, 2, 3, 4, 5, 6];
  dates = dates.map((v) => {
    date.setDate(date.getDate() - date.getDay() + v);
    return locale.dow(date).toUpperCase();
  });
  return dates;
};

let currentDate = new Date();

let getMeses = function () {
  let date = new Date();
  let locale = require("locale");
  let dates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  dates = dates.map((v) => {
    date.setMonth(v);
    return locale.month(date).replace("ç", "c").toUpperCase();
  });
  return dates;
};

drawBackground = function () {
  g.setColor("#000");
  g.fillRect(0, 0, 175, 175);
  g.setColor("#FFF");
  g.fillRect(3, 3, 172, 172);
};

let drawCalendar = function () {
  drawBackground();
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth();
  let today = new Date();

  let daysInMonth = 32 - new Date(year, month, 32).getDate();

  g.setColor("#000");
  g.setFontAlign(0, 0);

  let firstDay = new Date(year, month).getDay();

  // Mês
  g.fillRect(0, 0, 176, 25);
  g.setFontLECO1976Regular14();
  g.setColor("#FFF");
  g.drawString(getMeses()[month], 88, 13);
  [0, 136].forEach((v) => {
    for (let i = 5; i < 20; i += 3) {
      g.drawLine(v, i, v + 40, i);
    }
  });

  // Dias da semana
  g.setColor("#F00");
  g.fillRect(0, 25, 176, 30);
  g.setColor("#FFF");
  g.drawRect(-1, 25, 176, 30);
  g.setColor("#000");
  g.drawLine(0, 31, 176, 31);
  g.setFontLECO1976Regular14();
  let dows = getDows();
  for (let i = 0; i < 7; i++) {
    g.setColor("#000");
    g.drawString(dows[i][0], i * 25 + 11, 30);
    g.drawString(dows[i][0], i * 25 + 15, 30);
    g.drawString(dows[i][0], i * 25 + 13, 32);
    g.drawString(dows[i][0], i * 25 + 13, 28);
    g.setColor("#FFF");
    g.drawString(dows[i][0], i * 25 + 13, 30);
  }

  // Dias
  g.setColor("#000");
  g.setFontLECO1976Regular14();
  let date = 1;
  for (let i = 0; i < 6; i++) {
    //creating individual cells, filing them up with data.
    for (let j = 0; j < 7; j++) {
      if ((i > 0 || j >= firstDay) && date <= daysInMonth) {
        if (
          date == today.getDate() &&
          month == today.getMonth() &&
          year == today.getFullYear()
        ) {
          g.setColor("#F00");
          g.fillCircle(j * 25 + 13, i * 23 + 35 + 11, 12);
          g.setColor("#FFF");
        } else if (j == 0 || j == 6) g.setColor("#F00");
        else g.setColor("#000");

        g.drawString(date++, j * 25 + 13, i * 23 + 35 + 13);
      }
    }
  }
};

drawCalendar();

Bangle.on("touch", function (button, xy) {
  if (xy.y <= 60) {
    // Prev month
    if (xy.x < 60) currentDate.setMonth(currentDate.getMonth() - 1);

    // Next month
    if (xy.x > 116) currentDate.setMonth(currentDate.getMonth() + 1);

    if (xy.x < 60 || xy.x > 116) {
      Bangle.buzz(100, 0.1);
      drawCalendar();
    }
  } else {
    // "Main" calendar, back to clock
    Bangle.buzz(100, 0.1).then(() => load());
  }
});

Bangle.on("lock", function () {
  if (Bangle.isLocked()) {
    load();
  }
});
