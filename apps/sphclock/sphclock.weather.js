// curl wttr.in/sorocaba?format=j1 | jq "[.weather[] | {hourly:[.hourly[] | {tempC: .tempC|tonumber, chanceofrain: .chanceofrain|tonumber}], date, mintempC: .mintempC | tonumber, maxtempC: .maxtempC|tonumber}]"
// curl wttr.in/sorocaba?format=j1 | jq "[.weather[] | {hourly:[.hourly[] | {tempC: .tempC|tonumber, chanceofrain: .chanceofrain|tonumber, weatherDesc: .weatherDesc[0].value}], date, mintempC: .mintempC | tonumber, maxtempC: .maxtempC|tonumber, avgtempC: .avgtempC | tonumber}]"


exports.drawWeather = function () {
  let hour = new Date().getHours();
  g.setColor("#000");
  g.setFont("4x6");
  g.fillRect(78, 7, 151, 33);
  g.setColor("#FFF");
  g.fillRect(79, 8, 150, 32);

  let weather = require("Storage").readJSON("sphclock.json", false).weather;

  if (weather) {
    let minC = null;
    let maxC = null;

    weather.forEach((v1) => {
      v1.hourly.forEach((v2) => {
        if (!minC || v2.tempC < minC) minC = v2.tempC;
        if (!maxC || v2.tempC > maxC) maxC = v2.tempC;
      });
    });

    minC = Math.floor(minC / 5) * 5;
    maxC = Math.ceil(maxC / 5) * 5;

    for (let y = maxC - 5; y >= minC + 5; y -= 5) {
      let ypos = Math.round(((y - minC) * 24) / (maxC - minC));
      g.setColor("#AAA");
      g.drawLine(79, 32 - ypos, 150, 32 - ypos);
    }

    g.setColor("#000");
    g.setFontAlign(1, -1);
    g.drawString(maxC, 75, 8);
    g.setFontAlign(1, 1);
    g.drawString(minC, 75, 35);

    // // Método 1
    // for (let d = 0; d < 3; d++) {
    //   for (let i = 0; i < 8; i++) {
    //     let w = weather[d].hourly[i];
    //     if (w.chanceofrain > 50) g.setColor("#F00");
    //     else g.setColor("#00F");
    //     let height = Math.round(((w.tempC - minC) * 24) / (maxC - minC));
    //     let x = 79 + d * 24 + i * 3;
    //     g.fillRect(x, 32, x + 1, 32 - height);
    //   }
    // }

    // // Método 2
    // g.setColor("#F88");
    // g.fillRect(79, 8, 150, 32);
    // for (let d = 0; d < 3; d++) {
    //   for (let i = 0; i < 8; i++) {
    //     let w = weather[d].hourly[i];
    //     if (w.chanceofrain > 50) g.setColor("#F00");
    //     else g.setColor("#00F");
    //     let height = Math.round(((w.tempC - minC) * 24) / (maxC - minC));
    //     let x = 79 + d * 24 + i * 3;
    //     g.fillRect(x, 32, x + 2, 32 - height);
    //   }
    // }

    // Método 3
    let last_pos = undefined;
    for (let d = 0; d < 3; d++) {
      for (let i = 0; i < 8; i++) {
        let w = weather[d].hourly[i];
        let height = Math.round(((w.tempC - minC) * 24) / (maxC - minC));
        let x = 79 + d * 24 + i * 3;
        let y = 32 - height;
        if (last_pos) {
          //   if (w.chanceofrain > 50) g.setColor("#F00");
          //   else g.setColor("#00F");
          if (w.chanceofrain > 50) {
            if (w.chanceofrain > 80) g.setColor("#00F");
            else g.setColor("#88F");
            g.fillRect(x, 8, x + 3, 32);
          }
          g.setColor("#000");
          g.drawLine(last_pos[0], last_pos[1], x, y);
          g.drawLine(last_pos[0], last_pos[1] + 1, x, y + 1);
        }
        last_pos = [x, y];
      }
    }
    g.drawLine(last_pos[0], last_pos[1], last_pos[0] + 3, last_pos[1]);
    g.drawLine(last_pos[0], last_pos[1]+1, last_pos[0] + 3, last_pos[1]+1);

    // Marcação da hora atual
    g.setColor("#000");
    g.drawLine(79 + hour, 32, 79 + hour, 8);
    g.setFontAlign(0, -1);
    g.setFont("4x6");
    for (let d = 0; d < 3; d++) {
      g.drawString(`${weather[d].avgtempC}`, 79 + d * 24 + 12, 35);
      g.drawString(`${weather[d].maxtempC}`, 79 + d * 24 + 12, 43);
    }
  }
};
