(() => {
  function draw(w) {
    g.reset();
    g.setColor(0).fillRect(0, 24, 239, 239);

    require('weather').drawIcon(w.txt, 65, 90, 55);
    const locale = require("locale");

    g.setColor(-1);

    const temp = locale.temp(w.temp-273.15).match(/^(\D*\d*)(.*)$/);
    let width = g.setFont("Vector", 40).stringWidth(temp[1]);
    width += g.setFont("Vector", 20).stringWidth(temp[2]);
    g.setFont("Vector", 40).setFontAlign(-1, -1, 0);
    g.drawString(temp[1], 180-width/2, 70);
    g.setFont("Vector", 20).setFontAlign(1, -1, 0);
    g.drawString(temp[2], 180+width/2, 70);

    g.setFont("6x8", 1);
    g.setFontAlign(-1, 0, 0);
    g.drawString("Humidity", 135, 130);
    g.drawString("Wind", 135, 142);
    g.setFontAlign(1, 0, 0);
    g.drawString(w.hum+"%", 225, 130);
    g.drawString(locale.speed(w.wind), 225, 142);

    g.setFont("6x8", 2).setFontAlign(0, 0, 0);
    g.drawString(w.loc, 120, 170);

    g.setFont("6x8", 1).setFontAlign(0, 0, 0);
    g.drawString(w.txt.charAt(0).toUpperCase()+w.txt.slice(1), 120, 190);

    g.flip();
  }

  const _GB = global.GB;
  global.GB = (event) => {
    if (event.t==="weather") draw(event);
    if (_GB) setTimeout(_GB, 0, event);
  };

  Bangle.loadWidgets();
  Bangle.drawWidgets();

  const weather = require('weather').load();
  if (weather) {
    draw(weather);
  } else {
    E.showMessage('Weather unknown\n\nIs Gadgetbridge\nconnected?');
  }

  // Show launcher when middle button pressed
  setWatch(Bangle.showLauncher, BTN2, {repeat: false, edge: 'falling'})
})()
