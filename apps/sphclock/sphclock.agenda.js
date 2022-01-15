// gcalcli agenda --tsv | jq -rRs 'split("\n")[0:-1] | map([split("\t")[]|split(",")] | { "data":(.[0][0] + "T" + .[1][0] + ":00Z"), "data_fim":(.[2][0] + "T" + .[3][0] + ":00Z"), "descricao":.[4][0]})' | iconv -f UTF-8 -t ISO-8859-1 - > agenda.json

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

  // Carrega a agenda pro próximo dia com eventos
  let schedules = require("Storage").readJSON("agenda.json", false) || [];
  // Parse da data
  schedules.forEach((s) => (s.data = new Date(s.data)));
  schedules = schedules
    .filter((v) => v.data > new Date()) // Remove eventos que já foram
    .sort((a, b) => a.data - b.data); // Ordena pela data

  schedules = schedules.slice(0, 4);

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

    g.setFontAlign(1, -1);
    g.setColor("#000");

    g.setFontLECO1976Regular11();
    width = g.stringWidth(data) + 3;

    let x = 173 - width;
    let y = 112;
    g.fillRect(x, y, 176, y + 13);

    g.setColor("#FFF");
    g.drawString(data, 173, y + 3);

    g.setFont("6x8");

    startY = 122;
    endY = 171;

    g.setColor("#F00");
    g.fillRect(4, startY, 41, endY);

    var spaceEach = (endY - startY) / schedules.length;

    xTime = 38;
    xDesc = 45;
    for (var i = 0; i < schedules.length; i++) {
      v = schedules[i];
      var textTime = v.data.getHours() + "h";
      if (v.data.getMinutes() > 0)
        textTime += v.data.getMinutes().toString().padStart(2, "0");

      g.setFontAlign(-1, 0);
      g.setColor("#000");
      var y = startY + i * spaceEach;
      var yText = Math.round(y + spaceEach / 2);
      g.drawString(v.descricao, xDesc, yText);

      g.setFontAlign(1, 0);
      g.drawString(textTime, xTime + 1, yText + 1);
      g.setColor("#FFF");
      g.drawString(textTime, xTime, yText);

      g.setColor("#FFF");
      g.drawLine(4, y, 41, y);
    }
  } else {
    g.setFontLECO1976Regular14();
    g.setFontAlign(0, 0);
    g.setColor("#888");
    g.drawString("SEM COMPROMISSOS\nNA AGENDA", 88, 150);
  }
};
