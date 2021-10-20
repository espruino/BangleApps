<<<<<<< HEAD
(() => {
  const weather = require('weather');

  function formatDuration(millis) {
    let pluralize = (n, w) => n + " " + w + (n == 1 ? "" : "s");
    if (millis < 60000) return "< 1 minute";
    if (millis < 3600000) return pluralize(Math.floor(millis/60000), "minute");
    if (millis < 86400000) return pluralize(Math.floor(millis/3600000), "hour");
    return pluralize(Math.floor(millis/86400000), "day");
  }

  function draw() {
    let w = weather.current;
    g.reset();
    g.setColor(0).fillRect(0, 24, 239, 239);

    weather.drawIcon(w.txt, 65, 90, 55);
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

    drawUpdateTime();

    g.flip();
  }

  function drawUpdateTime() {
    if (!weather.current || !weather.current.time) return;
    let text = `Last update received ${formatDuration(Date.now() - weather.current.time)} ago`;
    g.reset();
    g.setColor(0).fillRect(0, 202, 239, 210);
    g.setColor(-1).setFont("6x8", 1).setFontAlign(0, 0, 0);
    g.drawString(text, 120, 206);
  }

  function update() {
    if (weather.current) {
      draw();
    } else {
      E.showMessage('Weather unknown\n\nIs Gadgetbridge\nconnected?');
    }
  }

  let interval = setInterval(drawUpdateTime, 60000);
  Bangle.on('lcdPower', (on) => {
    if (interval) {
      clearInterval(interval);
      interval = undefined;
    }
    if (on) {
      drawUpdateTime();
      interval = setInterval(drawUpdateTime, 60000);
    }
  });

  weather.on("update", update);

  update(weather.current);

  // Show launcher when middle button pressed
  setWatch(Bangle.showLauncher, BTN2, {repeat: false, edge: 'falling'});

  Bangle.loadWidgets();
  Bangle.drawWidgets();
})()
=======
const Layout = require('Layout');
const locale = require('locale');
const weather = require('weather');
let current = weather.get();

Bangle.loadWidgets();

var layout = new Layout({type:"v", bgCol: g.theme.bg, c: [
  {filly: 1},
  {type: "h", filly: 0, c: [
    {type: "custom", width: g.getWidth()/2, height: g.getWidth()/2, valign: -1, txt: "unknown", id: "icon",
      render: l => weather.drawIcon(l.txt, l.x+l.w/2, l.y+l.h/2, l.w/2-5)},
    {type: "v", fillx: 1, c: [
      {type: "h", pad: 2, c: [
        {type: "txt", font: "18%", id: "temp", label: "000"},
        {type: "txt", font: "12%", valign: -1, id: "tempUnit", label: "°C"},
      ]},
      {filly: 1},
      {type: "txt", font: "6x8", pad: 2, halign: 1, label: "Humidity"},
      {type: "txt", font: "9%", pad: 2, halign: 1, id: "hum", label: "000%"},
      {filly: 1},
      {type: "txt", font: "6x8", pad: 2, halign: -1, label: "Wind"},
      {type: "h", halign: -1, c: [
        {type: "txt", font: "9%", pad: 2, id: "wind",  label: "00"},
        {type: "txt", font: "6x8", pad: 2, valign: -1, id: "windUnit", label: "km/h"},
      ]},
    ]},
  ]},
  {filly: 1},
  {type: "txt", font: "9%", wrap: true, height: g.getHeight()*0.18, fillx: 1, id: "cond", label: "Weather condition"},
  {filly: 1},
  {type: "h", c: [
    {type: "txt", font: "6x8", pad: 4, id: "loc", label: "Toronto"},
    {fillx: 1},
    {type: "txt", font: "6x8", pad: 4, id: "updateTime", label: "15 minutes ago"},
  ]},
  {filly: 1},
]}, {lazy: true});

function formatDuration(millis) {
  let pluralize = (n, w) => n + " " + w + (n == 1 ? "" : "s");
  if (millis < 60000) return "< 1 minute";
  if (millis < 3600000) return pluralize(Math.floor(millis/60000), "minute");
  if (millis < 86400000) return pluralize(Math.floor(millis/3600000), "hour");
  return pluralize(Math.floor(millis/86400000), "day");
}

function draw() {
  layout.icon.txt = current.txt;
  const temp = locale.temp(current.temp-273.15).match(/^(\D*\d*)(.*)$/);
  layout.temp.label = temp[1];
  layout.tempUnit.label = temp[2];
  layout.hum.label = current.hum+"%";
  const wind = locale.speed(current.wind).match(/^(\D*\d*)(.*)$/);
  layout.wind.label = wind[1];
  layout.windUnit.label = wind[2] + " " + current.wrose.toUpperCase();
  layout.cond.label = current.txt.charAt(0).toUpperCase()+current.txt.slice(1);
  layout.loc.label = current.loc;
  layout.updateTime.label = `${formatDuration(Date.now() - current.time)} ago`;
  layout.update();
  layout.render();
}

function drawUpdateTime() {
  if (!current || !current.time) return;
  layout.updateTime.label = `${formatDuration(Date.now() - current.time)} ago`;
  layout.update();
  layout.render();
}

function update() {
  current = weather.get();
  NRF.removeListener("connect", update);
  if (current) {
    draw();
  } else {
    layout.forgetLazyState();
    if (NRF.getSecurityStatus().connected) {
      E.showMessage("Weather\nunknown\n\nIs Gadgetbridge\nweather\nreporting set\nup on your\nphone?");
    } else {
      E.showMessage("Weather\nunknown\n\nGadgetbridge\nnot connected");
      NRF.on("connect", update);
    }
  }
}

let interval = setInterval(drawUpdateTime, 60000);
Bangle.on('lcdPower', (on) => {
  if (interval) {
    clearInterval(interval);
    interval = undefined;
  }
  if (on) {
    drawUpdateTime();
    interval = setInterval(drawUpdateTime, 60000);
  }
});

weather.on("update", update);

update();

// Show launcher when middle button pressed
Bangle.setUI("clock");

Bangle.drawWidgets();
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
