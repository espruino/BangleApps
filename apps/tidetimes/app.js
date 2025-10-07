const tide = require("tidetimes");

function msToDayHours(ms) {
  var d = new Date(ms);
  return d.getHours()+d.getMinutes()/60;
}
function dayHoursToStr(t) {
  t = Math.round(t*60)/60;
  var hrs = Math.floor(t);
  return hrs + ":" + Math.round((t-hrs)*60).toString().padStart(2,0);
}
function getDayStart() {
  return new Date((new Date()).toISOString().substr(0,10)).getTime();
}

// redraw the screen
function draw() {
  let R = Bangle.appRect;
  let dayStart = getDayStart(), // midnight yesterday
      dayEnd = dayStart+86400000;
  g.reset().clearRect(R);
  let y = R.y + 20, h = 50;
  g.reset();
  function timeToX(time) { return (time-dayStart) * R.w / 86400000;  }
  function heightToY(v) { return y+(1-v)*h;  }
  // background fill
  g.setColor(g.blendColor(g.theme.bg,"#00f",0.5));
  for (let t=dayStart;t<=dayEnd;t+=3600000) {
    g.fillRect(timeToX(t-1800000),heightToY(tide.getLevelAt(t)),
               timeToX(t+1800000),y+h);
  }
  // grid lines
  g.setColor(g.blendColor(g.theme.bg,g.theme.fg,0.5)).drawLine(0,y+h/2,R.w,y+h/2);
  g.setColor(g.theme.fg).drawLine(0,y,R.w,y).drawLine(0,y+h,R.w,y+h);
  let x = timeToX(Date.now());
  g.fillRect(x-1,y,x+1,y+h);
  // mark times
  g.setColor(g.theme.fg).setFont("14").setFontAlign(0,0);
  let td = tide.getNext(dayStart);
  while (td.t<dayEnd) {
    g.drawString(require("locale").time(new Date(td.t),1),
                 timeToX(td.t), (td.v>0.5)?y-8:y+h+12);
    td = tide.getNext(td.t+3600000);
  }
  // Tide text
  y+=h+20;
  g.setFont("17");
  td = tide.getNext(Date.now());
  for (let c=0;c<2;c++) {
    g.drawString(`Next ${td.v>0.5?"High":"Low"}: `+require("locale").time(new Date(td.t),1),
                R.w/2, y+=20);
    td = tide.getNext(td.t+3600000);
  }
}

function showTides() {
  Bangle.setUI({mode: "custom", btn: showMenu});
  draw();
}

function showMenu() {
  let step = 20/60;
  E.showMenu({
    "":{title:"Tides", back : showTides },
    "Low Tide" : {
      value : Math.round(msToDayHours(tide.getNext(Date.now(), false).t)/step)*step,
      format : dayHoursToStr,
      min : 0, max: 24, step : step, wrap : true,
      onchange : v => {
        let dayStart = getDayStart();
        let currHr = msToDayHours(Date.now());
        if (v+1<currHr) v+=24;
        tide.offset = dayStart + v*3600000 + tide.period/2;
        tide.save();
        showTides();
      }
    },
    "High Tide" : {
      value : Math.round(msToDayHours(tide.getNext(Date.now(), true).t)/step)*step,
      format : dayHoursToStr,
      min : 0, max: 24, step : step, wrap : true,
      onchange : v => {
        let dayStart = getDayStart();
        let currHr = msToDayHours(Date.now());
        if (v+1<currHr) v+=24;
        tide.offset = dayStart + v*3600000;
        tide.save();
        showTides();
      }
    },
    "Exit": () => load(),
  });
}

Bangle.loadWidgets();
showTides();
Bangle.drawWidgets();

