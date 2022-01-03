const w = g.getWidth();
const h = g.getHeight();
const wid_h = 24;
let tStart;
let tNow;
let counter=-1;

const icon = require("heatshrink").decompress(atob("mEwwkBiIA/AH4A/AAkQgEBAREAC6oABdZQXkI6wuKC5iPUFxoXIOpoX/C6QFCC6IsCC6ZEDC/4XcPooXOFgoXQIgwX/C7IUFC5wsIC5ouCC6hcJC5h1DF9YwBChCPOAH4A/AH4Ap"));

function timeToText(t) { // Courtesy of stopwatch app
  let hrs = Math.floor(t/3600000);
  let mins = Math.floor(t/60000)%60;
  let secs = Math.floor(t/1000)%60;
  let tnth = Math.floor(t/100)%10;
  let text;

  if (hrs === 0)
    text = ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2) + "." + tnth;
  else
    text = ("0"+hrs) + ":" + ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2);
  //log_debug(text);
  return text;
}

function doCounter() {
  if (counter<0) {
    tStart = Date.now();
    tNow = tStart;
  } else {
    tNow = Date.now();
  }
  counter++;
  let dT = tNow-tStart;

  g.clearRect(0,wid_h,w,h-wid_h);
  g.setFontAlign(0,0);
  g.setFont("Vector",72);
  g.drawString(counter,w/2,h/2);
  g.setFont("Vector",24);
  g.drawString(timeToText(dT),w/2,h/2+50);
}

setWatch(doCounter, BTN1, true);

g.clear(true);
Bangle.loadWidgets();
Bangle.drawWidgets();
Bangle.setLCDTimeout(0);
g.drawImage(icon,w/2-24,h/2-24);
g.setFontAlign(0,0);
require("Font8x12").add(Graphics);
g.setFont("8x12");
g.drawString("Click button to count.", w/2, h/2+22);
