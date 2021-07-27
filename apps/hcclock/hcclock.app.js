
//////////////////////////////////////////////////////
// Numbers Rect order (left, top, right, bottom)
// Each number defines a set of rects to draw

const numbers = 
[
  [// Zero
    [0, 0, 1, 0.2],
    [0, 0.8, 1, 1],
    [0, 0, 0.1, 1],
    [0.9, 0, 1, 1]
  ],
  [// One
    [0.7, 0, 1, 0.2],
    [0.9, 0, 1, 1]
  ],
  [// Two
    [0, 0, 1, 0.2],
    [0, 0.4, 1, 0.6],
    [0, 0.8, 1, 1],
    [0, 0.4, 0.1, 1],
    [0.9, 0, 1, 0.6]
  ],
  [// Three
    [0, 0, 1, 0.2],
    [0.5, 0.4, 1, 0.6],
    [0, 0.8, 1, 1],
    [0.9, 0, 1, 1]
  ],
  [// Four
    [0, 0.4, 1, 0.6],
    [0, 0, 0.1, 0.6],
    [0.9, 0, 1, 1]
  ],
  [// Five
    [0, 0, 1, 0.2],
    [0, 0.4, 1, 0.6],
    [0, 0.8, 1, 1],
    [0, 0, 0.1, 0.6],
    [0.9, 0.4, 1, 1]
  ],
  [// Six
    [0, 0, 1, 0.2],
    [0, 0.4, 1, 0.6],
    [0, 0.8, 1, 1],
    [0, 0, 0.1, 1.0],
    [0.9, 0.4, 1, 1]
  ],
  [// Seven
    [0.0, 0, 1, 0.2],
    [0.9, 0, 1, 1]
  ],
  [// Eight
    [0, 0, 1, 0.2],
    [0, 0.4, 1, 0.6],
    [0, 0.8, 1, 1],
    [0, 0, 0.1, 1],
    [0.9, 0, 1, 1]
  ],
  [// Nine
    [0, 0, 1, 0.2],
    [0, 0.4, 1, 0.6],
    [0, 0.8, 1, 1],
    [0, 0, 0.1, 0.6],
    [0.9, 0, 1, 1]
  ] 
];

const months = [ "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC" ];

const interval = 1000; // in ms
const top = 32;

let ampm = (require("Storage").readJSON("setting.json",1)||{})["12hour"];

let bg = 255;
let fg = 0;

let mins = -1;
let hour = -1;
let day = -1;

function redraw() {
  mins = -1;
  hour = -1;
  day = -1;
  refresh();
}

function refresh() {
  g.setColor(bg,bg,bg);
  g.fillRect(0,45,240,210);
  Bangle.drawWidgets();
  updateTime();
}

function updateTime()
{
  let now = new Date();
  let m = now.getMinutes();
  let h = now.getHours();
  let mo = now.getMonth();
  let y = now.getFullYear();
  let d = now.getDate();
  
  if(h != hour)
  {
    hour = h;
    g.setColor(bg,bg,bg);
    g.fillRect(0,60,240,110);
    g.setColor(fg,fg,fg);
    if(ampm)
      h = h%12;
    drawDigits(60, h);
  }
  if(m != mins)
  {
    mins = m;
    g.setColor(bg,bg,bg);
    g.fillRect(0,145,240,195);
    g.setColor(fg,fg,fg);
    drawDigits(145, mins);
  }
  if(d != day)
  {
    day = d;
    g.setFont("6x8", 2);
    g.setFontAlign(0, -1, 0);
    g.drawString(fmtDate(d,mo,y,hour), 120, 120); 
  }
}

function drawDigits(x, value)
{
  if(!Bangle.isLCDOn()) // No need to draw when LCD Off
    return;
  
  drawChar(Math.floor(value/10),  15, x, 115, x+50);
  if(value%10 == 1)
    drawChar(value%10, 55, x, 155, x+50);
  else
    drawChar(value%10, 125, x, 225, x+50);
}

function drawChar(i, xMin, yMin, xMax, yMax)
{
   numbers[i].forEach(rect => {
     r = place(rect, xMin, yMin, xMax, yMax);
     g.setColor(fg,fg,fg);
     g.fillRect(r[0], r[1], r[2], r[3]);
    });
}

function place(array, xMin, yMin, xMax, yMax)
{
  return [
   lerp(xMin,xMax,array[0]),
   lerp(yMin,yMax,array[1]),
   lerp(xMin,xMax,array[2]),
   lerp(yMin,yMax,array[3])
  ];
}

function lerp(a,b,t)
{
  return a + t*(b-a);
}

function fmtDate(day,month,year,hour)
{
  if(ampm)
  {
    let ap = "(AM)";
    if(hour == 0 || hour > 12)
      ap = "(PM)";
    return months[month] + " " + day + " " + year + " "+ ap;    
  }
  else
    return months[month] + ". " + day + " " + year;
}

// Handles Flipping colors, then refreshes the UI
function flipColors()
{
  let t = bg;
  bg = fg;
  fg = t;
  redraw();
}

//////////////////////////////////////////
//
//   MAIN FUNCTION()
//

// Initialize
g.clear();
Bangle.loadWidgets();
redraw();

// Define Refresh Interval
setInterval(updateTime, interval);

// Handle Button Press
setWatch(flipColors, BTN1, true);
setWatch(Bangle.showLauncher, BTN2, false);

// Handle redraw on LCD on / fullscreen notifications dismissed
Bangle.on('lcdPower', (on) => { if(on) redraw(); });
