g.clear();

require("Font8x12").add(Graphics);
g.setFont("8x12", 1);
let interval = null;
let stepCounter = 0;

let msgs = require("Storage").readJSON('yngv27.msgs.json');
let alarms = require("Storage").readJSON('yngv27.alarm.json');

let alarming = false;
let nightMode = false;

function showMsg(msg) {
  alarming = true;
  g.setFontAlign(0,-1);
  g.setColor(1,1,1);
  g.drawString("<< ALARM >>", 120, 180, true);
  g.drawString(msg, 120, 200, true);
  Bangle.buzz();
  setTimeout(Bangle.buzz, 800);
  setTimeout(Bangle.buzz, 1600);
  setTimeout(Bangle.buzz, 2400);
  setTimeout(Bangle.buzz, 3200);
}

function checkMsgs() {
  for(let idx=0; idx < alarms.length; idx++) {
    let tdiff = Date.now() - Date.parse(alarms[idx].time);
    // 10 sec margin of error
    if(tdiff > 0 && tdiff < 10000) {
      showMsg(alarms[idx].msg);
    }
  }
}

for(let idx=0; idx < alarms.length; idx++) {
  let tdiff = Date.parse(alarms[idx].time) - Date.now();
  let msg = alarms[idx].msg;
  if(tdiff > 0) {
    /*console.log(`will alarm ${msg} in ${tdiff}`);*/
    setTimeout(checkMsgs, tdiff);
  }
}

let xs = 0.5;
let ys = 0.75;

let prevH1 = -1;
let prevH2 = -1;
let prevM1 = -1;
let prevM2 = -1;


let points0 = [
  0, 40,
  1, 35,
  7, 20, 
  16, 8,
  28, 2,
  40, 0,
  
  51, 2,
  63, 10,
  72, 20,
  77, 35,
  78, 40,
  
  78, 59,
  77, 64,
  72, 79,
  63, 89,
  51, 97,
  
  40, 99,
  28, 97,
  16, 91,
  7, 79,
  1, 64,
  0, 59,
  0, 40
];

let points1 = [ 40, 99, 40, 0];

let points2 = [ 0, 25,
               2, 22,
              6, 13, 
              17, 5,
              28, 2,
              40, 0,
              52, 2,
              63, 5,
              74, 13,
              79, 23,
              79, 28,
              74, 38,
               63, 46,
              51, 54,
              40, 58,
              29, 62,
              17, 68,
              8, 80,
              0, 99,
              79, 99
              ];

let points4 = [ 60, 99, 60, 0, 0, 75, 79, 75 ];

let points8 = [
  40, 40,
  26, 42,
  15, 46,
  4, 56,
  1, 66,
  1, 77,
  6, 87,
  17, 94,
  28, 97,
  38, 99,
  42, 99,
  52, 97,
  63, 94,
  74, 87,
  79, 77,
  79, 66,
  75, 56,
  64, 46,
  54, 42,
  40, 40,
  
  52, 39,
  62, 34,
  69, 29,
  72, 23,
  72, 19,
  69, 12,
  62, 6,
  52, 2,
  40, 0,
  
  28, 2,
  18, 6,
  11, 12,
  8, 19,
  8, 23,
  11, 29,
  18, 34,
  28, 39,
  40, 40,
  ];

let points6 = [
  50, 0,
  4, 56,
  1, 66,
  1, 77,
  6, 87,
  17, 94,
  28, 97,
  40, 99,
  52, 97,
  63, 94,
  74, 87,
  79, 77,
  79, 66,
  75, 56,
  64, 46,
  52, 42,
  40, 40,
  26, 42,
  15, 46,
  4, 56,
  ];

let points3 = [
  1, 77,
  6, 87,
  17, 94,
  28, 97,
  40, 99,
  52, 97,
  63, 94,
  74, 87,
  79, 77,
  79, 66,
  75, 56,
  64, 46,
  52, 42,
  39, 40,
  79, 0,
  1, 0
  ];

let points7 = [ 0, 0, 79, 0, 30, 99 ];

let points9 = [];
let points5 = [
  1, 77,
  6, 87,
  17, 94,
  28, 97,
  38, 99,
  42, 99,
  52, 97,
  63, 94,
  74, 87,
  79, 77,
  79, 66,
  75, 56,
  64, 46,
  54, 42,
  40, 40,
  26, 42,
  15, 46,
  27,  0,
  79,  0,
              ];

function drawPoints(points, x0, y0) {
  let x = points[0]*xs+x0, y = points[1]*ys+y0;
   //g.drawEllipse(x-2, y-2, x+2, y+2);
   g.moveTo(x, y);
  for(let idx=1; idx*2 < points.length; idx ++) {
    let x = points[idx*2]*xs+x0;
    let y = points[idx*2+1]*ys+y0;
    //g.drawEllipse(x-2, y-2, x+2, y+2);
    g.lineTo(x, y);
  }
}

/* create 5 from 2  */
/* uncomment if you want the 5 to look more authentic (but uglier)
for (let idx=0; idx*2 < points2.length; idx++) {
   points5[idx*2] = points2[idx*2];
   points5[idx*2+1] = 99-points2[idx*2+1];
}
*/
/* create 9 from 6 */
for (let idx=0; idx*2 < points6.length; idx++) {
   points9[idx*2] = 79-points6[idx*2];
   points9[idx*2+1] = 99-points6[idx*2+1];
}

pointsArray = [points0, points1, points2, points3, points4, points5, points6, points7, points8, points9];

function eraseDigit(d, x, y) {
  if(d < 0) return;
  g.setColor("#000000");
  if(nightMode) {
    drawPoints(pointsArray[d], x, y);
    return;
  }
  drawPoints(pointsArray[d], x-2, y-2);
  drawPoints(pointsArray[d], x+2, y-2);
  drawPoints(pointsArray[d], x-2, y+2);
  drawPoints(pointsArray[d], x+2, y+2);
  drawPoints(pointsArray[d], x-1, y-1);
  drawPoints(pointsArray[d], x+1, y-1);
  drawPoints(pointsArray[d], x-1, y+1);
  drawPoints(pointsArray[d], x+1, y+1);
}

function drawDigit(d, x, y) {
  if(nightMode) {
    g.setColor("#206040");
    drawPoints(pointsArray[d], x, y);
    return;
  }
  g.setColor("#202020");
  for (let idx = pointsArray.length - 1; idx >= 0 ; idx--) {
    if(idx == d)  {
      g.setColor("#FF0000");
      drawPoints(pointsArray[d], x-2, y-2);
      drawPoints(pointsArray[d], x+2, y-2);
      drawPoints(pointsArray[d], x-2, y+2);
      drawPoints(pointsArray[d], x+2, y+2);
      g.setColor("#FF6000");
      drawPoints(pointsArray[d], x-1, y-1);
      drawPoints(pointsArray[d], x+1, y-1);
      drawPoints(pointsArray[d], x-1, y+1);
      drawPoints(pointsArray[d], x+1, y+1);

      g.setColor("#FFC000");
      drawPoints(pointsArray[d], x, y);

      g.setColor("#202020");
    } else {
      drawPoints(pointsArray[idx], x, y);
    }
  }
}

function drawTime() {
  const mstr="JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC";

  let d = new Date();
  let hour = d.getHours();
  let minute = d.getMinutes();
  let month = d.getMonth();
  let date = d.getDate();

  let h1 = Math.floor(hour / 10);
  let h2 = hour % 10;
  let m1 = Math.floor(minute / 10);
  let m2 = minute % 10;

  if(h1 == prevH1 && h2 == prevH2 && m1 == prevM1 && m2 == prevM2) {
    return;
  }

  if(h1 != prevH1) {
    eraseDigit(prevH1, 10, 80);
    drawDigit(h1, 10, 80);
  }
  if(h2 != prevH2) {
    eraseDigit(prevH2, 65, 80);
    drawDigit(h2, 65, 80);
  }
  if(m1 != prevM1) {
    eraseDigit(prevM1, 135, 80);
    drawDigit(m1, 135, 80);
  }
  if(m2 != prevM2) {
    eraseDigit(prevM2, 190, 80);
    drawDigit(m2, 190, 80);
  }
  if(!nightMode) {
    g.setColor("#000000");
    g.fillRect(0, 10, 240, 24);
    g.fillRect(0, 222, 240, 240);
    g.setColor("#202020");
    g.drawLine(0, 24, 239, 24);
    g.drawLine(0, 226, 239, 226);
    g.setColor("#C06000");
    g.setFontAlign(0, -1);
    g.drawString(mstr.slice(month*3,month*3+3) + " " + date, 120, 10);
    g.setFontAlign(-1,-1);
    g.drawString("STEP " + stepCounter, 0, 230);
    g.setFontAlign(1,-1);
    g.drawString("BTY "+E.getBattery(), 240, 230);
  }

  prevH1 = h1;
  prevH2 = h2;
  prevM1 = m1;
  prevM2 = m2;

}

function btn1Func() {
  if(alarming) {
    alarming = false;
  } else {
    nightMode = !nightMode;
    g.setRotation(nightMode ? 1 : 0, 0);
  }
    g.clear();
    prevH1 = -1;
    prevH2 = -1;
    prevM1 = -1;
    prevM2 = -1;
    drawTime();
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
  interval = setInterval(drawTime, 10000);
  drawTime();
}

start();


Bangle.on('lcdPower', function (on) {
  if (on) {
    start();
  } else {
    stop();
  }
});


function btn3Func() {
  showMsg("This is a test message");
}

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
// redraw
setWatch(btn1Func, BTN1, {repeat:true,edge:"falling"});
setWatch(btn3Func, BTN3, {repeat:true,edge:"falling"});
Bangle.on('step', function(cnt) { 
  stepCounter = cnt / 10;
});
