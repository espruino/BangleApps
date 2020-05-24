// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
// position on screen
const X = 180, Y = 180;
var displayTime = 0;

function drawTime() {
  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var time = (" "+h).substr(-2) + ":" + ("0"+m).substr(-2);
  // draw the current time (4x size 7 segment)
  g.setFont("7x11Numeric7Seg",4);
  g.setFontAlign(1,1); // align right bottom
  g.drawString(time, X, Y, true /*clear background*/);
  // draw the seconds (2x size 7 segment)
  g.setFont("7x11Numeric7Seg",2);
  g.drawString(("0"+d.getSeconds()).substr(-2), X+30, Y, true /*clear background*/);
}

function test(intVal){
  hour_16 = 0;
  hour_8 = 0;
  hour_4 = 0;
  hour_2 = 0;
  hour_1 = 0;

  if(intVal > 16){
    hour_16 = 1;
    intVal = intVal - 16;
  }
  if(intVal > 8){
    hour_8 = 1;
    intVal = intVal - 8;
  }
  if(intVal > 4){
    hour_4 = 1;
    intVal = intVal - 4;
  }
  if(intVal > 2){
    hour_2 = 1;
    intVal = intVal - 2;
  }
  if(intVal > 0){
    hour_1 = 1;
  }
}

function getHourArray(hours){

   var hourLED = [0,0,0,0,0];
  
  if(hours > 15){
    hourLED[0] = 1;
    hours = hours - 16;
  }
  if(hours > 7){
    hourLED[1] = 1;
    hours = hours - 8;
  }
  if(hours > 3){
    hourLED[2] = 1;
    hours = hours - 4;
  }
  if(hours > 1){
    hourLED[3] = 1;
    hours = hours - 2;
  }
  if(hours > 0){
    hourLED[4] = 1;
  }
  
  return hourLED;
  
}

function getMinuteArray(minutes){

   var minuteLED = [0,0,0,0,0,0];
  
  if(minutes > 31){
    minuteLED[0] = 1;
    minutes = minutes - 32;
  }
  if(minutes > 15){
    minuteLED[1] = 1;
    minutes = minutes - 16;
  }
  if(minutes > 7){
    minuteLED[2] = 1;
    minutes = minutes - 8;
  }
  if(minutes > 3){
    minuteLED[3] = 1;
    minutes = minutes - 4;
  }
  if(minutes > 1){
    minuteLED[4] = 1;
    minutes = minutes - 2;
  }
  if(minutes > 0){
    minuteLED[5] = 1;
  }
  
  return minuteLED;
  
}

function draw(){
  
  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  
  //reset hour booleans to 0
  var hourLED = getHourArray(h);
  var minuteLED = getMinuteArray(m);
  
  var i;
  //Draw hour circles
  for(i=0; i<hourLED.length; i++){
    if(hourLED[i] == 1){
      g.fillCircle(24+i*48,50,10);
    } else {
      g.drawCircle(24+i*48,50,10);
    }
  }
  for(i=0; i<minuteLED.length; i++){
    if(minuteLED[i] == 1){
      g.fillCircle(20+i*40,100,10);
    } else {
      g.drawCircle(20+i*40,100,10);
    }
  }
  
  // draw the date, in a normal font
  g.setFont("6x8");
  g.setFontAlign(0,1); // align center bottom
  // pad the date - this clears the background if the date were to change length
  var dateStr = "    "+require("locale").date(d)+"    ";
  g.drawString(dateStr, g.getWidth()/2, 130, true /*clear background*/);
  
  if(displayTime){
   drawTime();
  }else{
   g.clearRect(0,240,240,130); 
  }
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
var secondInterval = setInterval(draw, 1000);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    setInterval(draw, 1000);
    draw(); // draw immediately
  }
});
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
setWatch(function() {
  if(displayTime == 0){
     displayTime = 1;
   } else{
     displayTime = 0; 
   }
}, BTN, {edge:"rising", debounce:50, repeat:true});
