require("Font8x12").add(Graphics);
let HRMstate = false;
let currentHRM = "CALC";


function drawTimeDate() {
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes(), day = d.getDate(), month = d.getMonth(), weekDay = d.getDay();

  if (h < 10) {
    h = "0" + h;
  }

  if (m < 10) {
    m = "0" + m;
  }

  var daysOfWeek = ["SUN", "MON", "TUE","WED","THU","FRI","SAT"];
  var hours = (" "+h).substr(-2);
  var mins= ("0"+m).substr(-2);
  var date = `${daysOfWeek[weekDay]}|${day}|${("0"+(month+1)).substr(-2)}`;

  // Reset the state of the graphics library
  g.reset();
  // Set color
  g.setColor('#2ecc71');
  // draw the current time (4x size 7 segment)
  g.setFont("8x12",8);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString(hours, 25, 75, true /*clear background*/);
  g.drawString(mins, 25, 165, true /*clear background*/);

  // draw the date (2x size 7 segment)
  g.setFont("6x8",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString(date, 20, 215, true /*clear background*/);
}


//We will create custom "Widgets" for our face.

function drawSteps() {
  var steps = "-";
  //Reset to defaults.
  g.reset();
  // draw the date (2x size 7 segment)
  g.setColor('#7f8c8d');
  g.setFont("8x12",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString("STEPS", 145, 40, true /*clear background*/);
  g.setColor('#bdc3c7');
  if (WIDGETS.activepedom !== undefined) {
    steps = WIDGETS.activepedom.getSteps();
  } else if (WIDGETS.wpedom !== undefined) {
    steps = WIDGETS.wpedom.getSteps();
  }
  g.drawString(steps, 145, 65, true /*clear background*/);
}

function drawBPM(on) {
  //Reset to defaults.
  g.reset();
  g.setColor('#7f8c8d');
  g.setFont("8x12",2);
  g.setFontAlign(-1,0);
  var heartRate = 0;

  if(on){
    g.drawString("BPM", 145, 105, true);
    g.setColor('#e74c3c');
    g.drawString("*", 190, 105, false);
    g.setColor('#bdc3c7');
    //Showing current heartrate reading.
    heartRate = currentHRM.toString() + "    ";
    return g.drawString(heartRate, 145, 130, true /*clear background*/);
  } else {
    g.drawString("BPM  ", 145, 105, true /*clear background*/);
    g.setColor('#bdc3c7');
    return g.drawString("-    ", 145, 130, true); //Padding
  }
}

function drawBattery() {
  let charge = E.getBattery();
  //Reset to defaults.
  g.reset();
  // draw the date (2x size 7 segment)
  g.setColor('#7f8c8d');
  g.setFont("8x12",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString("CHARGE", 145, 170, true /*clear background*/);
  g.setColor('#bdc3c7');
  g.drawString(`${charge}%`, 145, 195, true /*clear background*/);
}


// Clear the screen once, at startup
g.clear();

// Show launcher when button pressed
Bangle.setUI("clockupdown", btn=>{
  if (btn!=0) return;
  //HRM Controller.
  if(!HRMstate){
    //console.log("Toggled HRM");
    //Turn on.
    Bangle.buzz();
    Bangle.setHRMPower(1);
    currentHRM = "CALC";
    HRMstate = true;
  } else if(HRMstate){
    //console.log("Toggled HRM");
    //Turn off.
    Bangle.buzz();
    Bangle.setHRMPower(0);
    HRMstate = false;
    currentHRM = [];
  }
  drawBPM(HRMstate);
});

// Load and draw widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// draw immediately at first
drawTimeDate();
drawSteps();
drawBPM();
drawBattery();

var secondInterval = setInterval(()=>{
  drawTimeDate();
}, 15000);

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    secondInterval = setInterval(()=>{
      drawTimeDate();
    }, 15000);
    //Screen on
    drawBPM(HRMstate);
    drawTimeDate();
    drawSteps();
    drawBattery();
  } else {
    //Screen off
    clearInterval(secondInterval);
  }
});

Bangle.on('touch', function(button) {
  if(button == 1 || button == 2){
    Bangle.showLauncher();
  }
});

Bangle.on('HRM', function(hrm) {
  if(hrm.confidence > 90){
    /*Do more research to determine effect algorithm for heartrate average.*/
    //console.log(hrm.bpm);
    currentHRM = hrm.bpm;
    drawBPM(HRMstate);
  }
});


//Bangle.on('step', function(up) {
//  console.log("Step");
//});
