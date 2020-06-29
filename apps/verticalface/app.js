require("Font8x12").add(Graphics);
let HRMstate = false;
let currentHRM = "CALC";


function drawTimeDate() {
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes(), day = d.getDate(), month = d.getMonth(), weekDay = d.getDay();

  var daysOfWeek = ["SUN", "MON", "TUE","WED","THU","FRI","SAT"];
  var hours = (" "+h).substr(-2);
  var mins= ("0"+m).substr(-2);
  var date = `${daysOfWeek[weekDay]}|${day}|${("0"+(month+1)).substr(-2)}`;


  // Reset the state of the graphics library
  g.reset();
  // Set color
  g.setColor('#2ecc71');
  // draw the current time (4x size 7 segment)
  g.setFont("8x12",9);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString(hours, 25, 65, true /*clear background*/);
  g.drawString(mins, 25, 155, true /*clear background*/);

  // draw the date (2x size 7 segment)
  g.setFont("6x8",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString(date, 20, 215, true /*clear background*/);
}


//We will create custom "Widgets" for our face.

function drawSteps() {
  //Reset to defaults.
  g.reset();
  // draw the date (2x size 7 segment)
  g.setColor('#7f8c8d');
  g.setFont("8x12",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString("STEPS", 145, 40, true /*clear background*/);
  g.setColor('#bdc3c7');
  g.drawString("-", 145, 65, true /*clear background*/);
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
    drawBattery();
  } else {
    //Screen off
    clearInterval(secondInterval);
  }
});

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });

Bangle.on('touch', function(button) {
  if(button == 1 || button == 2){
    Bangle.showLauncher();
  }
});

//HRM Controller.
setWatch(function(){
  if(!HRMstate){
    console.log("Toggled HRM");
    //Turn on.
    Bangle.buzz();
    Bangle.setHRMPower(1);
    currentHRM = "CALC";
    HRMstate = true;
  } else if(HRMstate){
    console.log("Toggled HRM");
    //Turn off.
    Bangle.buzz();
    Bangle.setHRMPower(0);
    HRMstate = false;
    currentHRM = [];
  }
  drawBPM(HRMstate);
}, BTN1, { repeat: true, edge: "falling" });

Bangle.on('HRM', function(hrm) {
  if(hrm.confidence > 90){
    /*Do more research to determine effect algorithm for heartrate average.*/
    console.log(hrm.bpm);
    currentHRM = hrm.bpm;
    drawBPM(HRMstate);
  }
});


//Bangle.on('step', function(up) {
//  console.log("Step");
//});
