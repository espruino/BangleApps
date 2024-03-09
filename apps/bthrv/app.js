//var btm = g.getHeight()-1;
var ui = false;

function clear(y){
  g.reset();
  g.clearRect(0,y,g.getWidth(),g.getHeight());
}

var startingTime;
var currentSlot = 0;
var hrvSlots = [10,20,30,60,120,300];
var hrvValues = {};
//var rrRmsProgress;

var rrNumberOfValues = 0;
var rrSquared = 0;
var rrLastValue;
var rrMax;
var rrMin;

function calcHrv(rr){
  //Calculate HRV with RMSSD method: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5624990/
  for (var currentRr of rr){
    if (!rrMax) rrMax = currentRr;
    if (!rrMin) rrMin = currentRr;
    rrMax = Math.max(rrMax, currentRr);
    rrMin = Math.min(rrMin, currentRr);
    rrNumberOfValues++;
    if (!rrLastValue){
      rrLastValue = currentRr;
      continue;
    }
    rrSquared += (rrLastValue - currentRr)*(rrLastValue - currentRr);

    rrLastValue = currentRr;
  }
  var rms = Math.sqrt(rrSquared / rrNumberOfValues);
  return rms;
}


function draw(y, hrv) {
  clear(y);
  var px = g.getWidth()/2;
  var str = hrv.toFixed(1) + "ms";
  g.reset();
  g.setFontAlign(0,0);
  g.setFontVector(40).drawString(str,px,y+20);

  for (var i = 0; i < hrvSlots.length; i++){
    str = hrvSlots[i] + "s: ";
    if (hrvValues[hrvSlots[i]]) str += hrvValues[hrvSlots[i]].toFixed(1) + "ms";
    g.setFontVector(16).drawString(str,px,y+44+(i*17));
  }

  g.setRotation(3);
  g.setFontVector(12).drawString("Reset",g.getHeight()/2, g.getWidth()-10);
  g.setRotation(0);
}

function write(){
    if (!hrvValues[hrvSlots[0]]){
      return;
    }

    var file = require('Storage').open("bthrv.csv", "a");
    var data = new Date(startingTime).toISOString();
    for (var i = 0; i < hrvSlots.length; i++ ){
      data += ",";
      if (hrvValues[hrvSlots[i]]){
        data += hrvValues[hrvSlots[i]];
      }
    }

    data += "," + rrMax + "," + rrMin + ","+rrNumberOfValues;
    data += "\n";
    file.write(data);
}

function onBtHrm(e) {
  if (e.rr && !startingTime) Bangle.buzz(500);
  if (e.rr && !startingTime) startingTime=Date.now();

  var hrv = calcHrv(e.rr);
  if (hrv){
    if (currentSlot <= hrvSlots.length && (Date.now() - startingTime) > (hrvSlots[currentSlot] * 1000) && !hrvValues[hrvSlots[currentSlot]]){
      hrvValues[hrvSlots[currentSlot]] = hrv;
      currentSlot++;
      if (currentSlot == hrvSlots.length){
        Bangle.buzz(500)
      } else {
        Bangle.buzz(50);
      }
    }
  }

  if (hrv){
    if (!ui){
      Bangle.setUI("leftright", ()=>{
        resetHrv();
        clear(30);
      });
      ui = true;
    }

    draw(30, hrv);
  }
}

function resetHrv(){
  write();
  hrvValues={};
  startingTime=undefined;
  currentSlot=0;
  rrNumberOfValues = 0;
  rrSquared = 0;
  rrLastValue = undefined;
  rrMax = undefined;
  rrMin = undefined;
}


//var settings = require('Storage').readJSON("bthrm.json", true) || {};

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

if (Bangle.setBTHRMPower){
  Bangle.on('BTHRM', onBtHrm);
  Bangle.setBTHRMPower(1,'bthrv');

  if (require('Storage').list(/bthrv.csv/).length == 0){
    var file = require('Storage').open("bthrv.csv", "a");
    var data = "Time";
    for (var c of hrvSlots){
      data+="," + c + "s";
    }
    data+=",RR_max,RR_min,Measurements";
    data+="\n";
    file.write(data);
  }

  E.on('kill', ()=>{
    write();
    Bangle.setBTHRMPower(0,'bthrv');
  });

  g.reset().setFont("6x8",2).setFontAlign(0,0);
  g.drawString("Please wait...",g.getWidth()/2,g.getHeight()/2 - 16);
} else {
  g.reset().setFont("6x8",2).setFontAlign(0,0);
  g.drawString("Missing BT HRM",g.getWidth()/2,g.getHeight()/2 - 16);
}

