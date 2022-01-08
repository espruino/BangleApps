"use strict";

exports.drawCalendar = function (date) {
  let dateStr = date.getDate();
  let dowStr = require("locale")
    .dow(date)
    .replace("á", "a")
    .replace("ç", "c")
    .substr(0, 3)
    .toUpperCase();

  require("sphclock.background.js").drawBannerLeft(7, 26, 60);

  g.setFontAlign(0, 0);
  g.setFontLECO1976Regular20();
  g.setColor("#000");
  g.drawString(dateStr, 27, 25);
  g.setColor("#fff");
  g.drawString(dateStr, 25, 23);

  g.setFontLECO1976Regular14();
  g.setColor("#000");
  g.drawString(dowStr, 25, 44);

  g.setFontLECO1976sph12();

  // Carrega a agenda pro próximo dia com eventos
  let schedules = require("Storage").readJSON("sphclock.json", false).schedule;
  // Parse da data
  schedules.forEach((s) => (s.data = new Date(s.data)));
  schedules = schedules
    .filter((v) => v.data > new Date()) // Remove eventos que já foram
    .sort((a, b) => a.data - b.data); // Ordena pela data

  if (schedules.length > 0) {
    let data = schedules[0].data;
    schedules = schedules.filter((v) => v.data.getDay() == data.getDay());

    let hoje = new Date();
    let amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    outraSemana = new Date();
    outraSemana.setDate(outraSemana.getDate() + 7);

    if (data.getDate() == hoje.getDate()) data = "HOJE";
    else if (data.getDate() == amanha.getDate()) data = "AMANHA";
    else if (data.getTime() < outraSemana.getTime()) {
      data = require("locale")
        .dow(data)
        .replace("ç", "c")
        .replace("á", "a")
        .toUpperCase();
      data = data.split("-")[0];
    } else {
      data = require("locale").date(data, 1);
    }

    g.setFontAlign(0, -1);
    g.setColor("#000");
    let x = 50;
    let y = 113;
    g.fillPoly(
      [
        x,
        y,
        (x -= 5),
        (y += 7),
        (x += 5),
        (y += 7),
        (x += 76),
        y,
        (x += 5),
        (y -= 7),
        (x -= 5),
        (y -= 7),
      ],
      true
    );
    g.drawLine((x -= 74), (y += 15), (x += 72), y);

    // g.setFont("Vector",10);

    g.setColor("#FFF");
    g.drawString(data, 88, 116);

    g.setFontAlign(1, -1);
    g.setColor("#000");
    let text = schedules.reduce(function (acumulador, v) {
      return (
        acumulador +
        `${v.data.getHours()}:${v.data
          .getMinutes()
          .toString()
          .padStart(2, "0")}\n`
      );
    }, "");
    g.drawString(text, 45, 136);

    g.setFontAlign(-1, -1);
    text = schedules.reduce(function (acumulador, v) {
      return acumulador + `${E.decodeUTF8(v.descricao).toUpperCase()}\n`;
    }, "");
    g.drawString(text, 50, 136);
  } else {
    g.setFontLECO1976Regular14();
    g.setFontAlign(0, 0);
    g.setColor("#888");
    g.drawString("SEM COMPROMISSOS\nNA AGENDA", 88, 150);
  }
};
