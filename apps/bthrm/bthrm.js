var btm = g.getHeight()-1;
var eventInt = null;
var eventBt = null;
var counterInt = 0;
var counterBt = 0;


function draw(y, event, type, counter) {
  var px = g.getWidth()/2;
  g.reset();
  g.setFontAlign(0,0);
  g.clearRect(0,y,g.getWidth(),y+80);
  if (type == null || event == null || counter == 0) return;
  var str = event.bpm + "";
  g.setFontVector(40).drawString(str,px,y+20);
  str = "Confidence: " + event.confidence;
  g.setFontVector(12).drawString(str,px,y+50);
  str = "Event: " + type;
  g.setFontVector(12).drawString(str,px,y+60);
}

function onBtHrm(e) {
  print("Event for BT " + JSON.stringify(e));
  counterBt += 5;
  eventBt = e;
}

function onHrm(e) {
  print("Event for Int " + JSON.stringify(e));
  counterInt += 5;
  eventInt = e;
}

Bangle.on('BTHRM', onBtHrm);
Bangle.on('HRM', onHrm);

Bangle.setHRMPower(1,'bthrm')
Bangle.setBTHRMPower(1,'bthrm')

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

g.reset().setFont("6x8",2).setFontAlign(0,0);
g.drawString("Please wait...",g.getWidth()/2,g.getHeight()/2 - 16);

function drawInt(){
  counterInt--;
  if (counterInt < 0) counterInt = 0;
  if (counterInt > 5) counterInt = 5;
  draw(24, eventInt, "HRM", counterInt);
}
function drawBt(){
  counterBt--;
  if (counterBt < 0) counterBt = 0;
  if (counterBt > 5) counterBt = 5;
  draw(100, eventBt, "BTHRM", counterBt);
}

var interval = setInterval(drawInt, 1000);
var interval = setInterval(drawBt, 1000);
