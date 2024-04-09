require("FontDylex7x13").add(Graphics);

var weather = require("Storage").readJSON("weather.json", 1) || {};

function getArcXY(centerX, centerY, radius, angle) {
  var s,
    r = [];
  s = (2 * Math.PI * angle) / 360;
  r.push(centerX + Math.round(Math.cos(s) * radius));
  r.push(centerY + Math.round(Math.sin(s) * radius));
  return r;
}

function getArc(centerX, centerY, radius, startAngle, endAngle) {
  var xy,
    r = [],
    actAngle = startAngle;
  var stepAngle = ((radius + radius) * Math.PI) / 60;
  stepAngle = 6;
  while (actAngle < endAngle) {
    r = r.concat(getArcXY(centerX, centerY, radius, actAngle));
    actAngle += stepAngle;
    actAngle = Math.min(actAngle, endAngle);
  }
  return r.concat(getArcXY(centerX, centerY, radius, endAngle));
}

var timeout;

function fillLine(x1, y1, x2, y2, thickness) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const offset_x = (thickness * Math.sin(angle)) / 2;
  const offset_y = (thickness * Math.cos(angle)) / 2;
  g.fillPoly(
    [
      x1 + offset_x,
      y1 - offset_y,
      x1 - offset_x,
      y1 + offset_y,
      x2 - offset_x,
      y2 + offset_y,
      x2 + offset_x,
      y2 - offset_y,
    ],
    true
  );
}

function getWeatherIcon(txt) {
  txt = txt.toLowerCase();
  if (txt == "rainy") {
    return atob("EhCBAAAAAPwAf4A/8A/8D//H//v////////3//j//AjEBiMDEIAAAA==");
  } else if (txt == "cloudy") {
    return atob("FA6BAABgAD/AB/4Af+A//wf/+H//7//+//////////f//j//4P/4");
  } else if (txt == "sunny") {
    return atob(
      "FBSBAABgAAYAAAABgBgY8YA/wAf+AH/gD/8M//PP/zD/8Af+AH/gA/wBjxgYAYAAAABgAAYA"
    );
  } else {
    return null;
  }
}

function draw() {
  g.setTheme({ fg: 0xffff, bg: 0 });

  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }
  g.reset().clear();
  g.setColor("#FFF");

  const mid = g.getWidth() / 2;
  g.drawImage(
    require("heatshrink").decompress(
      atob(
        "2GwgIGDhwMEgPAAwk4Dg8HCpdwCqnwCo8DwAVK8AVIB4gVFgIVIB4wFKD5IPFG4pLJCosHMYiNJCozNJvAVJh4VJkAKJgT/PAH4A/AH4A/AH4A/AH4A/ADWACqngCicD/AVTh9+Cqc/n4VTv0P4AURgP4gZuSCYQrTVwNACqT/6AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4Ah//ACaMD/4VrQP4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ADlACSMBAQPACqMDwED8AVS8EPFaUB/E/Nad+vwVTn/4CqcPNiSEDd/4A/AH4A/AH4A/AH4A/AH8gAgcB4AFDgwVJvAVJh4VJuAVJg4VJ8AVJgeACg8BCqoPEApYfECpY3EGpIlGCpEHCpfwCo6jFCoylEA="
      )
    )
  );

  g.setFontAlign(0, 0);
  g.setFont("Dylex7x13", 1);

  const battery = E.getBattery() || 50;
  const outerarc = getArc(
    g.getWidth() * (1 / 4) + 1,
    g.getHeight() * (1 / 4) - 1,
    14,
    -90,
    Math.max(battery * 3.6, 10) - 90
  );
  const innerarc = getArc(
    g.getWidth() * (1 / 4) + 1,
    g.getHeight() * (1 / 4) - 1,
    11,
    -92,
    Math.max(battery * 3.6, 10) - 88
  );
  g.setColor("#00FF00").fillPoly(
    [g.getWidth() * (1 / 4), g.getHeight() * (1 / 4) - 2].concat(outerarc)
  );
  g.setColor("#000").fillPoly(
    [g.getWidth() * (1 / 4), g.getHeight() * (1 / 4) - 2].concat(innerarc)
  );
  g.setColor("#FFF").drawString(
    battery,
    g.getWidth() * (1 / 4),
    g.getHeight() * (1 / 4)
  );

  if (weather && weather.txt) {
    const icon = getWeatherIcon(weather.txt);
    if (icon) {
      g.drawImage(
        icon,
        g.getWidth() * (3 / 4) - 10,
        g.getHeight() * (1 / 4) - 10
      );
    } else {
      g.drawString(
        weather.txt,
        g.getWidth() * (3 / 4),
        g.getHeight() * (1 / 4)
      );
    }
    g.drawString(
      weather.temp || "-",
      g.getWidth() * (3 / 4),
      g.getHeight() * (1 / 4) + 16
    );
  }

  const now = new Date();

  g.setFont("Vector", 14);
  // Date (ex. MON 8)
  g.drawString(
    require("locale").dow(now, 1).toUpperCase() + " " + now.getDate(),
    g.getWidth() / 2,
    g.getHeight() * (3 / 4)
  );

  let rhour =
    (now.getHours() * Math.PI) / 6 +
    (now.getMinutes() * Math.PI) / 30 / 12 -
    Math.PI / 2;
  let rmin = (now.getMinutes() * Math.PI) / 30 - Math.PI / 2;

  // Middle circle
  g.fillCircle(mid, mid, 4);

  // Hours hand
  fillLine(mid, mid, mid + Math.cos(rhour) * 10, mid + Math.sin(rhour) * 10, 3);
  fillLine(
    mid + Math.cos(rhour) * 10,
    mid + Math.sin(rhour) * 10,
    mid + Math.cos(rhour) * 50,
    mid + Math.sin(rhour) * 50,
    7
  );

  // Minutes hand
  fillLine(mid, mid, mid + Math.cos(rmin) * 10, mid + Math.sin(rmin) * 10, 3);
  fillLine(
    mid + Math.cos(rmin) * 10,
    mid + Math.sin(rmin) * 10,
    mid + Math.cos(rmin) * 76,
    mid + Math.sin(rmin) * 76,
    7
  );

  if (now.getMinutes() == 0) {
    Bangle.buzz();
  }

  timeout = setTimeout(() => {
    timeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

draw();

Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
