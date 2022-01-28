var btm = g.getHeight()-1;
var eventInt = null;
var eventBt = null;
var counterInt = 0;
var counterBt = 0;


function draw(y, event, type, counter) {
  var px = g.getWidth()/2;
  g.reset();
  g.setFontAlign(0,0);
  g.clearRect(0,y,g.getWidth(),y+75);
  if (type == null || event == null || counter == 0){
    return;
  }
  var str = event.bpm + "";
  g.setFontVector(40).drawString(str,px,y+20);
  str = "Confidence: " + event.confidence;
  g.setFontVector(12).drawString(str,px,y+50);
  str = "Event: " + type;
  if (type == "HRM") str += " Source: " + (event.src ? event.src : "internal");
  g.setFontVector(12).drawString(str,px,y+60);
}

function onBtHrm(e) {
  //print("Event for BT " + JSON.stringify(e));
  if (e.bpm == 0){
    Bangle.buzz(100,0.2);
  }
  if (counterBt == 0){
    Bangle.buzz(200,0.5);
  }
  counterBt += 3;
  eventBt = e;
}

function onHrm(e) {
  //print("Event for Int " + JSON.stringify(e));
  counterInt += 3;
  eventInt = e;
}

Bangle.on('BTHRM', onBtHrm);
Bangle.on('HRM', onHrm);

Bangle.setHRMPower(1,'bthrm');

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

g.reset().setFont("6x8",2).setFontAlign(0,0);
g.drawString("Please wait...",g.getWidth()/2,g.getHeight()/2 - 16);

function drawInt(){
  counterInt--;
  if (counterInt < 0) counterInt = 0;
  if (counterInt > 3) counterInt = 3;
  draw(24, eventInt, "HRM", counterInt);
}
function drawBt(){
  counterBt--;
  if (counterBt < 0) counterBt = 0;
  if (counterBt > 3) counterBt = 3;
  draw(100, eventBt, "BTHRM", counterBt);
}

var interval = setInterval(drawInt, 1000);
var interval = setInterval(drawBt, 1000);
