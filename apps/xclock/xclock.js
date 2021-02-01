// The interval reference for updating the clock
let intervalRef = null;

// String numbers
const numberStr = ["ZERO","ONE", "TWO", "THREE", "FOUR", "FIVE",
                 "SIX", "SEVEN","EIGHT", "NINE", "TEN",
                 "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN",
                  "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN",
                  "NINETEEN", "TWENTY"];
const tensStr = ["ZERO", "TEN", "TWENTY", "THIRTY", "FOURTY",
                 "FIFTY"];

function draw_clock(){
  console.log("draw_clock");
  let date = new Date();
  // First display the hours as a text number
  let hours = date.getHours();
  if(hours == 0 ){
    hours = 12;
  } else if(hours > 12){
    hours = hours - 12;
  }
  g.clear();
  g.setFont("Vector",40);
  g.drawString(numberStr[hours], 20, 50);
  // Now display the minutes on 2 lines
  let mins = date.getMinutes();
  g.setFont("Vector",20);
  if(mins > 20){
    let tens = (mins / 10 | 0);
    g.drawString(tensStr[tens], 20, 100);
    let remainder = mins - tens * 10;
    g.drawString(numberStr[remainder], 20, 125);
    
  } else if(mins > 0) {
    g.drawString(numberStr[mins], 20, 100);
  }
  console.log(date);
}

function clearTimers(){
  //console.log("clearTimers");
  if(intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    //console.log("interval is cleared");
  }
}

function startTimers(){
  console.log("startTimers");
  let date = new Date();
  let secs = date.getSeconds();
  let nextMinuteStart = 60 - secs;
  console.log("scheduling clock draw in " + nextMinuteStart + " seconds");
  setTimeout(scheduleDrawClock,nextMinuteStart * 1000);
  draw_clock();
}

function scheduleDrawClock(){  
  console.log("scheduleDrawClock");
  if(intervalRef) clearTimers();
  intervalRef = setInterval(draw_clock, 60*1000);
  console.log("scheduleDrawClock is set");
  draw_clock();
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    console.log("lcdPower: on");
    Bangle.drawWidgets();
    startTimers();
  } else {
    console.log("lcdPower: off");
    clearTimers();
  }
});
Bangle.on('faceUp',function(up){
  console.log("faceUp: " + up + " LCD: " + Bangle.isLCDOn());
  if (up && !Bangle.isLCDOn()) {
    //console.log("faceUp and LCD off");
    clearTimers();
    Bangle.setLCDPower(true);
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
startTimers();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2,{repeat:false,edge:"falling"});
