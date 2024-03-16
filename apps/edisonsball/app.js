//ADVANCED SETTINGS
var lower_limit_BPM = 49;
var upper_limit_BPM = 140;
var deviation_threshold = 3;

var ISBANGLEJS1 = process.env.HWVERSION==1;

var target_heartrate = 70;
var heartrate_set;

var currentBPM;
var lastBPM;
var firstBPM = true; // first reading since sensor turned on
var HR_samples = [];
var trigger_count = 0;
var file = require("Storage").open("steel_log.csv","a");
var launchtime;
var alarm_length;

function btn1Pressed() {
  if(!heartrate_set){
  target_heartrate++;
  update_target_HR();
  }
}

function btn2Pressed() {
   heartrate_set = true;
  Bangle.setHRMPower(1);
  launchtime = 0|getTime();
  g.clear();
  g.setFont("6x8",2);
  g.drawString("tracking HR...", 120,120);
  g.setFont("6x8",3);
  }

function update_target_HR(){
  g.clear();
  if (process.env.HWVERSION==1) {
    g.setColor("#00ff7f");
    g.setFont("6x8", 4);
    g.setFontAlign(0,0); // center font

    g.drawString(target_heartrate, 120,120);
    g.setFont("6x8", 2);
    g.setFontAlign(-1,-1);
    g.drawString("-", 220, 200);
    g.drawString("+", 220, 40);
    g.drawString("GO", 210, 120);

    g.setColor("#ffffff");
    g.setFontAlign(0,0); // center font
    g.drawString("target HR", 120,90);

    g.setFont("6x8", 1);
    g.drawString("if unsure, start with 7-10%\n less than waking average and\n adjust as required", 120,170);
  } else {
    g.setFont("6x8", 4);
    g.setFontAlign(0,0); // center font
    g.drawString(target_heartrate, 88,88);
    g.setFont("6x8", 2);
    g.setFontAlign(-1,-1);
    g.drawString("-", 160, 160);
    g.drawString("+", 160, 10);
    g.drawString("GO", 150, 88);
    g.setFontAlign(0,0); // center font
    g.drawString("target HR", 88,65);
    g.setFont("6x8", 1);
    g.drawString("if unsure, start with 7-10%\n less than waking average and\n adjust as required", 88,150);
  }
  
  g.setFont("6x8",3);
  g.flip();
}

function btn3Pressed(){
  if(!heartrate_set){
    target_heartrate--;
    update_target_HR();
  }
}

function alarm(){
  if(alarm_length > 0){
    //Bangle.beep(500,4000);
    Bangle.buzz(500,1);
    alarm_length--;
  }
  else{
    clearInterval(alarm);
    if(trigger_count > 1)
       Bangle.setHRMPower(0);
  }
}

function average(nums) {
  return nums.reduce((a, b) => (a + b)) / nums.length;
}

function getStandardDeviation (array) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function checkHR() {
  var bpm = currentBPM; //isCurrent = true;
  if (bpm===undefined) {
    bpm = lastBPM;
    //isCurrent = false;
  }
  if (bpm===undefined || bpm < lower_limit_BPM || bpm > upper_limit_BPM)
     bpm = "--";
  if (bpm != "--"){
     HR_samples.push(bpm);
    // Terminal.println(bpm);
  }

  if(HR_samples.length == 5){
     g.clear();
     let average_HR = average(HR_samples).toFixed(0);
     let stdev_HR = getStandardDeviation (HR_samples).toFixed(1);

    if (ISBANGLEJS1) {
      g.drawString("HR: " + average_HR, 120,100);
      g.drawString("STDEV: " + stdev_HR, 120,160);
    } else {
      g.drawString("HR: " + average_HR, 88,60);
      g.drawString("STDEV: " + stdev_HR, 88,90);
    }
     HR_samples = [];
     if(average_HR < target_heartrate && stdev_HR < deviation_threshold){
       
       Bangle.setHRMPower(0);
       alarm_length = 4;
       setInterval(alarm, 2000);
       
        trigger_count++;
        var csv = [
        0|getTime(),
        launchtime,
            average_HR,
            stdev_HR
          ];
        file.write(csv.join(",")+"\n");
       
       heartrate_set = false;
       update_target_HR();
     }
 }
}

update_target_HR();

if (ISBANGLEJS1) {
  // Bangle 1
  setWatch(btn1Pressed, BTN1, {repeat:true});
  setWatch(btn2Pressed, BTN2, {repeat:true});
  setWatch(btn3Pressed, BTN3, {repeat:true});
} else {
  // Bangle 2
  setWatch(btn2Pressed, BTN1, { repeat: true });
  Bangle.on('touch', function(zone, e) {
    if (e.y < g.getHeight() / 2) {
      btn1Pressed();
    }
    if (e.y > g.getHeight() / 2) {
      btn3Pressed();
    }
  });
}


Bangle.on('HRM',function(hrm) {
   if(trigger_count < 2){
    if (firstBPM)
      firstBPM=false; // ignore the first one as it's usually rubbish
    else {
      currentBPM = hrm.bpm;
      lastBPM = currentBPM;
    }
    checkHR();
   }
});
