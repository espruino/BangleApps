g.clear();

require("FontHaxorNarrow7x17").add(Graphics);
g.setFont("HaxorNarrow7x17", 1); // bitmap font, 8x magnified

g.setFontAlign(0,0); // center font

let interval = null;
let stepCounter = 0;

let fgColor = "#FFFFFF";
let bgColor = "#000000";

let fillDigits = true;
let myHeartRate = 123;
let hrmPower = false;

const startX = [ 24, 90,  24, 90 ];
const startY = [ 14,  14, 120, 120 ];

const hht = 60;
const vht = 40;
const w = 60;
const h = 90;

let lastHour = 99;
let lastMinute = 99;


function pad0(n) {
  return (n > 9) ? n : ("0"+n);
}

function setFG() {
  g.setColor(fgColor);
}

function setBG() {
  g.setColor(bgColor);
}

function ellipse(x1, y1, x2, y2, fill) {
  if (fill) g.fillEllipse(x1, y1, x2, y2);
  else g.drawEllipse(x1, y1, x2, y2);
}

function poly(arr, fill) {
  if (fill) g.fillPoly(arr, true);
  else g.drawPoly(arr, true);
}

function rect(x1, y1, x2, y2, fill) {
  if (fill) g.fillRect(x1, y1, x2, y2);
  else g.drawRect(x1, y1, x2, y2);
}

setBG();
rect(0, 0, 240, 240, true);


/** DIGITS **/

/* zero */
function draw0(xOrig, yOrig) {
  setFG();
  ellipse(xOrig, yOrig, xOrig+w, yOrig+h, fillDigits);
  if(fillDigits) setBG();
  ellipse(xOrig+15, yOrig+15, xOrig+w-15, yOrig+h-15, fillDigits);
}

/* one */
function draw1(xOrig, yOrig) {
  setFG();
  poly([xOrig+w/2-6, yOrig, 
        xOrig+w/2-12, yOrig,
        xOrig+w/2-20, yOrig+12,
        xOrig+w/2-6, yOrig+12
        ], fillDigits);
  rect(xOrig+w/2-6, yOrig, xOrig+w/2+6, yOrig+h-3, fillDigits);
 
}

/* two */
function draw2(xOrig, yOrig) { 
  setFG();
  ellipse(xOrig, yOrig, xOrig+56, yOrig+56, fillDigits);
    if(fillDigits) setBG();
  ellipse(xOrig+13, yOrig+13, xOrig+43, yOrig+43, fillDigits);
  
 setBG();
  rect(xOrig, yOrig+27, xOrig+40, yOrig+61, true);

  setFG();
  poly([xOrig, yOrig+88,
        xOrig+56, yOrig+88,
        xOrig+56, yOrig+75,
        xOrig+25, yOrig+75,
        xOrig+46, yOrig+50,
        xOrig+42, yOrig+36
  ], fillDigits);
}

/* three */
function draw8(xOrig, yOrig) {
  setFG();
  ellipse(xOrig+3, yOrig, xOrig+53, yOrig+48, fillDigits);
  ellipse(xOrig, yOrig+33, xOrig+56, yOrig+89, fillDigits);
  if(fillDigits) setBG();
  ellipse(xOrig+17, yOrig+13, xOrig+40, yOrig+35, fillDigits);
  ellipse(xOrig+13, yOrig+46, xOrig+43, yOrig+76, fillDigits);
}

function draw3(xOrig, yOrig) {
  draw8(xOrig, yOrig);
  setBG();
  rect(xOrig, yOrig+24, xOrig+24, yOrig+61, true);
}

/* four */
function draw4(xOrig, yOrig) {
  setFG();
  rect(xOrig+8, yOrig+54, xOrig+w-4, yOrig+67, fillDigits);
  rect(xOrig+36, yOrig+12, xOrig+49, yOrig+88, fillDigits);
  poly([xOrig, yOrig+67,
            xOrig+12, yOrig+67,
            xOrig+49, yOrig+12,
            xOrig+49, yOrig+1,
            xOrig+42, yOrig+1
  ], fillDigits);
}

function draw5(xOrig, yOrig) {
  setFG();
  ellipse(xOrig, yOrig+33, xOrig+56, yOrig+89, fillDigits);
  if(fillDigits) setBG();
  ellipse(xOrig+13, yOrig+46, xOrig+43, yOrig+76, fillDigits);
  
  setBG();
  rect(xOrig, yOrig+24, xOrig+20, yOrig+61, true);
  
  setFG();
  poly([xOrig+20, yOrig+1,
        xOrig+7, yOrig+47, 
        xOrig+19, yOrig+47,
        xOrig+32, yOrig+1      
        ], fillDigits);
  rect(xOrig+20, yOrig+1, xOrig+53, yOrig+13, fillDigits);
}

/* six */
function draw6(xOrig, yOrig) {
  setFG();
  ellipse(xOrig, yOrig+33, xOrig+56, yOrig+89, fillDigits);
  poly([xOrig+2, yOrig+48,
        xOrig+34, yOrig,
        xOrig+46, yOrig+7,
        xOrig+14, yOrig+56
        ], fillDigits);
  if(fillDigits) setBG();
  ellipse(xOrig+13, yOrig+46, xOrig+43, yOrig+76, fillDigits);
}

/* seven */
function draw7(xOrig, yOrig) {
  setFG();
  poly([xOrig+4, yOrig+1, 
        xOrig+w-1, yOrig+1,
        xOrig+w-7, yOrig+13,
        xOrig+4, yOrig+13
        ], fillDigits);
  poly([xOrig+w-1, yOrig+1,
        xOrig+15, yOrig+88,
        xOrig+5, yOrig+81,
        xOrig+w-19, yOrig+9
        ], fillDigits);
}

function draw9(xOrig, yOrig) { 
  setFG();
  ellipse(xOrig, yOrig, xOrig+56, yOrig+56, fillDigits);
  poly([xOrig+54, yOrig+41,
        xOrig+22, yOrig+89,
        xOrig+10, yOrig+82,
        xOrig+42, yOrig+33
        ], fillDigits);
  if(fillDigits) setBG();
  ellipse(xOrig+13, yOrig+13, xOrig+43, yOrig+43, fillDigits);
}

/** END DIGITS **/
function getRandomColor() {
  const digits = "0123456789ABCDEF";
  let r1 = digits[Math.floor(Math.random() * 16)];
   let r2 = digits[Math.floor(Math.random() * 16)];
    let g1 = digits[Math.floor(Math.random() * 16)];
     let g2 = digits[Math.floor(Math.random() * 16)];
      let b1 = digits[Math.floor(Math.random() * 16)];
       let b2 = digits[Math.floor(Math.random() * 16)];
  let str = "#"+r1+r2+g1+g2+b1+b2;
  /* console.log(str); */
  return str;
}

function drawDigit(pos, dig) {
  let x = startX[pos];
  let y = startY[pos];
  
  setBG();
  rect(x, y, x+w, y+h, true);
  switch(dig) {
    case 0:
      draw0(x, y);
      break;
    case 1:
      draw1(x, y);
      break;
    case 2:
      draw2(x, y);
      break;
    case 3:
      draw3(x, y);
      break;
    case 4:
      draw4(x, y);
      break;
    case 5:
      draw5(x, y);
      break;
    case 6:
      draw6(x, y);
      break;
    case 7:
      draw7(x, y);
      break;
    case 8:
      draw8(x, y);
      break;
    case 9:
      draw9(x, y);
      break;
  }
}


function drawTime() {
  let d = new Date();
  let hour = d.getHours();
  let minute = d.getMinutes();
  let month = d.getMonth();
  let date = d.getDate();

  if(hour == lastHour && minute == lastMinute) {
    return;
  }
  
  fgColor = "#FFFFFF";
  if(hour != lastHour) {
    drawDigit(0, Math.floor(hour / 10));
    drawDigit(1, hour % 10);
  }
  
  fgColor = "#00FFFF";
  if(minute != lastMinute) {
    drawDigit(2, Math.floor(minute / 10));
    drawDigit(3, minute % 10);
  }  
  lastHour = hour;
  lastMinute = minute;

  setBG();
  rect(0, 226, 240, 240, true);
  for(let c = 0; c <= 240; c++) {
    g.setColor(0, 0, 1-c/240);
    g.fillRect(180, c, 240, c);
  }
  g.setColor("#C0C0C0");
  
  g.setFontAlign(-1,-1);
  g.drawString("DT", 184, 10);
  g.drawString("STP", 184, 70);
  g.drawString("BPM", 184, 140);
  g.drawString("BTY", 184, 210);
  
  g.setFontAlign(1,-1);
  g.drawString(month + "/" + date, 236, 10);
  g.drawString(stepCounter, 236, 70);
  g.drawString(myHeartRate, 236, 140);
  g.drawString(E.getBattery(), 236, 210);

}

function stop () {
  if (interval) {
    clearInterval(interval);
  }
}

function start () {
  if (interval) {
    clearInterval(interval);
  }
  // first time init
  interval = setInterval(drawTime, 10000);
  drawTime();
}

start();

// Bangle.loadWidgets();
// Bangle.drawWidgets();

Bangle.on('lcdPower', function (on) {
  if (on) {
    start();
  } else {
    stop();
  }
});

function btn1Func() {
  fillDigits = !fillDigits;
  g.clear();
  lastHour = 99;
  lastMinute = 99;
  drawTime();
}

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

setWatch(btn1Func, BTN1, {repeat:true,edge:"falling"});

Bangle.on('step', function(cnt) { 
  stepCounter = cnt;
});

