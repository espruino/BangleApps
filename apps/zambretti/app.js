/**
 * https://web.archive.org/web/20110610213848/http://www.meteormetrics.com/zambretti.htm
 */

const storage = require('Storage');
const Layout = require("Layout");

let height;
let mainScreen = false;

const ZAMBRETTI_FORECAST = {
A: /*LANG*/'Settled Fine',
B: /*LANG*/'Fine Weather',
C: /*LANG*/'Becoming Fine',
D: /*LANG*/'Fine Becoming Less Settled',
E: /*LANG*/'Fine, Possibly showers',
F: /*LANG*/'Fairly Fine, Improving',
G: /*LANG*/'Fairly Fine, Possibly showers, early',
H: /*LANG*/'Fairly Fine Showery Later',
I: /*LANG*/'Showery Early, Improving',
J: /*LANG*/'Changeable Mending',
K: /*LANG*/'Fairly Fine, Showers likely',
L: /*LANG*/'Rather Unsettled Clearing Later',
M: /*LANG*/'Unsettled, Probably Improving',
N: /*LANG*/'Showery Bright Intervals',
O: /*LANG*/'Showery Becoming more unsettled',
P: /*LANG*/'Changeable some rain',
Q: /*LANG*/'Unsettled, short fine Intervals',
R: /*LANG*/'Unsettled, Rain later',
S: /*LANG*/'Unsettled, rain at times',
T: /*LANG*/'Very Unsettled, Finer at times',
U: /*LANG*/'Rain at times, worse later.',
V: /*LANG*/'Rain at times, becoming very unsettled',
W: /*LANG*/'Rain at Frequent Intervals',
X: /*LANG*/'Very Unsettled, Rain',
Y: /*LANG*/'Stormy, possibly improving',
Z: /*LANG*/'Stormy, much rain',
};

const ZAMBRETTI_FALLING = {
1050: 'A',
1040: 'B',
1024: 'C',
1018: 'H',
1010: 'O',
1004: 'R',
 998: 'U',
 991: 'V',
 985: 'X',
};

const ZAMBRETTI_STEADY = {
1033: 'A',
1023: 'B',
1014: 'E',
1008: 'K',
1000: 'N',
 994: 'P',
 989: 'S',
 981: 'W',
 974: 'X',
 960: 'Z',
};

const ZAMBRETTI_RISING = {
1030: 'A',
1022: 'B',
1012: 'C',
1007: 'F',
1000: 'G',
 995: 'I',
 990: 'J',
 984: 'L',
 978: 'M',
 970: 'Q',
 965: 'T',
 959: 'Y',
 947: 'Z',
};

function correct_season(letter, dir) {
  const month = new Date().getMonth() + 1;
  const location = require("Storage").readJSON("mylocation.json",1)||{"lat":51.5072,"lon":0.1276,"location":"London"};
  const northern_hemisphere = location.lat > 0;
  const summer = northern_hemisphere ? (month >= 4 && month <= 9) : (month >= 10 || month <= 3);

  let corr = 0;
  if (dir < 0 && !summer) { // Winter falling
    corr = +1;
  } else if (dir > 0 && summer) { // Summer rising
    corr = -1;
  }
  return letter == 'A' || letter == 'Z' ? letter : String.fromCharCode(letter.charCodeAt(0)+corr);
}

function get_zambretti_letter(pressure, dir) {
  let table = (() => {
    if (dir < 0) { // Barometer Falling
      return ZAMBRETTI_FALLING;
    } else if (dir == 0) { // Barometer Steady
      return ZAMBRETTI_STEADY;
    } else { // Barometer Rising
      return ZAMBRETTI_RISING;
    }
  })();

  const closest = Object.keys(table).reduce(function(prev, curr) {
    return (Math.abs(curr - pressure) < Math.abs(prev - pressure) ? curr : prev);
  });

  return correct_season(table[closest], dir);
}

function loadSettings() {
  const settings = require('Storage').readJSON("zambretti.json", true) || {};
  height = settings.height;
}

function showMenu() {
  const menu = {
    "" : {
      title : "Zambretti Forecast",
    },
    "< Back": () => {
      E.showMenu();
      layout.forgetLazyState();
      show();
    },
    /*LANG*/"Exit": () => load(),
    /*LANG*/"Settings": () =>
      eval(require('Storage').read('zambretti.settings.js'))(() => {
        loadSettings();
        showMenu();
      }),
    'Plot history': () => {E.showMenu(); plot();},
  };
  E.showMenu(menu);
}

const layout = new Layout({
  type:"v", c: [
    {type:"txt", font:"9%", label:/*LANG*/"Zambretti Forecast", bgCol:g.theme.bgH, fillx: true, pad: 1},
    {type:"txt", font:"12%", id:"forecast", filly: 1, wrap: 1, width: Bangle.appRect.w, pad: 1},
    {type:"h", c:[
      {type: 'v', c:[
        {type:"txt", font:"9%", label:/*LANG*/"Pressure", pad: 3, halign: -1},
        {type:"txt", font:"9%", label:/*LANG*/"Difference", pad: 3, halign: -1},
        {type:"txt", font:"9%", label:/*LANG*/"Temperature", pad: 3, halign: -1},
      ]},
      {type: 'v', c:[
        {type:"txt", font:"9%", id:"pressure", pad: 3, halign: -1},
        {type:"txt", font:"9%", id:"diff", pad: 3, halign: -1},
        {type:"txt", font:"9%", id:"temp", pad: 3, halign: -1},
      ]}
    ]},
  ]
}, {lazy:true});

function draw(temperature) {
  const history3 = storage.readJSON("zambretti.log.json", true) || []; // history of recent 3 hours
  const pressure_cur = history3[history3.length-1].p;
  const pressure_last = history3[0].p;
  const diff = pressure_cur - pressure_last;
  const pressure_sea = pressure_cur * Math.pow(1 - (0.0065 * height) / (temperature + (0.0065 * height) + 273.15),-5.257);

  layout.forecast.label = ZAMBRETTI_FORECAST[get_zambretti_letter(pressure_sea, diff)];
  layout.pressure.label = Math.round(pressure_sea);
  layout.diff.label = diff;
  layout.temp.label = require("locale").number(temperature,1);
  layout.render();
  //layout.debug();

  mainScreen = true;
  Bangle.setUI({
    mode: "custom",
    btn: (n) => {mainScreen = false; showMenu();},
  });
}

function show() {
  Bangle.getPressure().then(p =>{if (p) draw(p.temperature);});
}

function plot() {
  const interval = 15; // minutes
  const history3 = require('Storage').readJSON("zambretti.log.json", true) || []; // history of recent 3 hours

  const now = new Date()/(1000);
  let curtime = now-3*60*60; // 3h ago
  const data = [];
  while (curtime <= now) {
    // find closest value in history for this timestamp
    const closest = history3.reduce((prev, curr) => {
      return (Math.abs(curr.ts - curtime) < Math.abs(prev.ts - curtime) ? curr : prev);
    });
    data.push(closest.p);
    curtime += interval*60;
  }

  Bangle.setUI({
    mode: "custom",
    back: () => showMenu(),
  });

  g.reset().setFont("6x8",1);
  require("graph").drawLine(g, data, {
    axes: true,
    x: 4,
    y: Bangle.appRect.y+8,
    height: Bangle.appRect.h-20,
    gridx: 1,
    gridy: 1,
    miny: Math.min.apply(null, data)-1,
    maxy: Math.max.apply(null, data)+1,
    title: /*LANG*/"Barometer history (mBar)",
    ylabel: y => y,
    xlabel: i => {
      const t = -3*60 + interval*i;
      if (t % 60 === 0) {
        return "-" + t/60 + "h";
      }
      return "";
    },
  });
}

g.reset().clear();
loadSettings();
Bangle.loadWidgets();

if (height === undefined) {
  // setting of height required
  eval(require('Storage').read('zambretti.settings.js'))(() => {
    loadSettings();
    show();
  });
} else {
  show();
}
Bangle.drawWidgets();

// Update every 15 minutes
setInterval(() => {
  if (mainScreen) {
    show();
  }
}, 15*60*1000);
