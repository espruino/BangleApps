const background = {
  width : 176, height : 176, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("/4A/AH4ACUb8H9MkyVJAThB/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/INP/AH4A/AAX8Yz4Afn5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/IP5B/INI="))
};

const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var level = -1;

function ISO8601_week_no(date) { //copied from: https://gist.github.com/IamSilviu/5899269#gistcomment-3035480
    var tdt = new Date(date.valueOf());
    var dayn = (date.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
        tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

function d02(value) {
  return ('0' + value).substr(-2);
}

function pollBattery() {
  level = E.getBattery();
  return level;
}

function getBatteryColor(level) {
  var color;
  if (level < 0) {
    level = pollBattery();
  }
  if(level>80) {
    color = [0,0,1];
  } else if(level>60) {
    color = [0,1,1];
  } else if(level>40) {
    color = [0,1,0];
  } else if(level>20) {
    color = [1,1,0];
  } else {
    color = [1,0,0];
  }
  return color;
}

function draw() {
  g.drawImage(background);

  const color = getBatteryColor();
  const bat = E.getBattery() + "%";
  const d = new Date();
  const day = d.getDate();
  const month = (d.getMonth() + 1);
  const week = d02(ISO8601_week_no(d));
  const date1 = d02(day) + "/" + d02(month);
  const date2 = weekday[d.getDay()] + " " + d02(week);
  const h = d.getHours();
  const m = d.getMinutes();
  const time = d02(h) + ":" + d02(m);

  g.reset();

  g.setColor(0, 0, 0);
  g.setFont("Vector", 20);
  g.drawString(date1, 105, 20, false);
  g.setFont("Vector", 16);
  g.drawString(date2, 105, 55, false);

  g.setColor(1, 1, 1);
  g.setFont("Vector", 60);
  g.drawString(time, 10, 108, false);

  g.setColor(1, 1, 1);
  g.setFont("Vector", 16);
  g.drawString("Bat:", 12, 22, false);
  g.setColor(color[0], color[1], color[2]);
  g.drawString(bat, 46, 22, false);
}

g.clear();

pollBattery();
draw();

var batInterval = setInterval(pollBattery, 60000);
var drawInterval = setInterval(draw, 10000);

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (batInterval) clearInterval(batInterval);
  batInterval = undefined;
  if (drawInterval) clearInterval(drawInterval);
  drawInterval = undefined;
  if (on) {
    batInterval = setInterval(pollBattery, 60000);
    drawInterval = setInterval(draw, 10000);
    
    pollBattery();
    draw(); // draw immediately
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");
