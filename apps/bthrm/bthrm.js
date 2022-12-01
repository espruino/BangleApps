var intervalInt;
var intervalBt;
var intervalAgg;

const BPM_FONT_SIZE="19%";
const VALUE_TIMEOUT=3000;

var BODY_LOCS = {
  0: 'Other',
  1: 'Chest',
  2: 'Wrist',
  3: 'Finger',
  4: 'Hand',
  5: 'Earlobe',
  6: 'Foot',
};

var Layout = require("Layout");

function border(l,c) {
  g.setColor(c).drawLine(l.x+l.w*0.05, l.y-4, l.x+l.w*0.95, l.y-4);
  c++;
}

function getRow(id, text, additionalInfo){
  let additional = [];
  let l = {
    type:"h", c: [
      {
        type:"v",
        width: g.getWidth()*0.4,
        c: [
          {type:"txt", halign:1, font:"8%", label:text, id:id+"text" },
          {type:"txt", halign:1, font:BPM_FONT_SIZE, label:"--", id:id, bgCol: g.theme.bg }
        ]
      },{
        type:undefined, fillx:1
      },{
        type:"v",
        valign: -1,
        width: g.getWidth()*0.45,
        c: additional
      },{
        type:undefined, width:g.getWidth()*0.05
      }
    ]
  };
  for (let i of additionalInfo){
    let label = {type:"txt", font:"6x8", label:i + ":" };
    let value = {type:"txt", font:"6x8", label:"--", id:id + i };
    additional.push({type:"h", halign:-1, c:[ label, {type:undefined, fillx:1}, value ]});
  }

  return l;
}

var layout = new Layout( {
  type:"v", c: [
    getRow("int", "INT", ["Confidence"]),
    getRow("agg", "HRM", ["Confidence", "Source"]),
    getRow("bt", "BT", ["Battery","Location","Contact", "RR", "Energy"]),
    { type:undefined, height:8 } //dummy to protect debug output
  ]
}, {
  lazy:true
});

var int,agg,bt;
var firstEvent = true;

var drawTimeout;
function draw(){

  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 1000);
  
  if (!(int || agg || bt)) return;
  
  if (firstEvent) {
    g.clearRect(Bangle.appRect);
    firstEvent = false;
  }
  
  if (int){
    layout.int.label = int.bpm;
    if (!isNaN(int.confidence)) layout.intConfidence.label = int.confidence;
  } else {
    layout.int.label = "--";
    layout.intConfidence.label = "--";
  }

  if (agg){
    layout.agg.label = agg.bpm;
    if (!isNaN(agg.confidence)) layout.aggConfidence.label = agg.confidence;
    if (agg.src) layout.aggSource.label = agg.src;
  } else {
    layout.agg.label = "--";
    layout.aggConfidence.label = "--";
    layout.aggSource.label = "--";
  }

  if (bt) {
    layout.bt.label = bt.bpm;
    if (bt.battery) layout.btBattery.label = bt.battery;
    if (bt.rr) layout.btRR.label = bt.rr.join(",");
    if (bt.location) layout.btLocation.label = BODY_LOCS[bt.location];
    if (bt.contact !== undefined) layout.btContact.label = bt.contact ? "Yes":"No";
    if (bt.energy) layout.btEnergy.label = bt.energy.toFixed(0) + "kJ";
  } else {
    layout.bt.label = "--";
    layout.btBattery.label = "--";
    layout.btRR.label = "--";
    layout.btLocation.label = "--";
    layout.btContact.label = "--";
    layout.btEnergy.label = "--";
  }

  layout.update();
  layout.render();
  let first = true;
  for (let c of layout.l.c){
    if (first) {
      first = false;
      continue;
    }
    if (c.type && c.type == "h")
      border(c,g.theme.fg);
  }
}

var firstEventBt = true;
var firstEventInt = true;


// This can get called for the boot code to show what's happening
function showStatusInfo(txt) {
  var R = Bangle.appRect;
  g.reset().clearRect(R.x,R.y2-8,R.x2,R.y2).setFont("6x8");
  txt = g.wrapString(txt, R.w)[0];
  g.setFontAlign(0,1).drawString(txt, (R.x+R.x2)/2, R.y2);
}

function onBtHrm(e) {
  bt = e;
  if (e.bpm === 0){
    Bangle.buzz(100,0.2);
  }
  if (intervalBt){
    clearInterval(intervalBt);
  }
  intervalBt = setInterval(()=>{
    bt = undefined;
  }, VALUE_TIMEOUT);
}

function onInt(e) {
  int = e;
  if (intervalInt){
    clearInterval(intervalInt);
  }
  intervalInt = setInterval(()=>{
    int = undefined;
  }, VALUE_TIMEOUT);
}

function onAgg(e) {
  agg = e;
  if (intervalAgg){
    clearInterval(intervalAgg);
  }
  intervalAgg = setInterval(()=>{
    agg = undefined;
  }, VALUE_TIMEOUT);
}


var settings = require('Storage').readJSON("bthrm.json", true) || {};

Bangle.on('BTHRM', onBtHrm);
Bangle.on('HRM_int', onInt);
Bangle.on('HRM', onAgg);


Bangle.setHRMPower(1,'bthrm');
if (!(settings.startWithHrm)){
  Bangle.setBTHRMPower(1,'bthrm');
}

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
if (Bangle.setBTHRMPower){
  g.reset().setFont("6x8",2).setFontAlign(0,0);
  g.drawString("Please wait...",g.getWidth()/2,g.getHeight()/2);
  draw();
} else {
  g.reset().setFont("6x8",2).setFontAlign(0,0);
  g.drawString("BTHRM disabled",g.getWidth()/2,g.getHeight()/2);
}

E.on('kill', ()=>Bangle.setBTHRMPower(0,'bthrm'));
