// place your const, vars, functions or classes here
var calories = 0;
var leftMargin = g.getWidth()/4;
var topMargin = g.getHeight()/8;
var previousHr = {
  timestamp: 0
};
var hr = 0;
var status = "stopped";
var startTime = 0;
var interval;

//personal data (settings file?)
var age = 27;
var weight = 96;
var sex = "Male";

function draw(){
  g.clear();
  g.setColor(1,1,1);
  //time
  g.setFontAlign(0,0);
  g.setFont("6x8",3);
  g.drawString(getTimeString(),leftMargin*2,topMargin);
  
  //calories
  g.setFontAlign(0,0);
  g.setFont("6x8",6);
  g.drawString(calories.toFixed(0),leftMargin*3,topMargin*3);
  g.setFontAlign(0,1);
  g.setFont("6x8",3);
  g.drawString("kCal",leftMargin*3,topMargin*6);
  
  //heartrate
  g.setFontAlign(0,0);
  g.setFont("6x8",6);
  g.drawString(hr.toFixed(0),leftMargin,topMargin*3);
  g.setFontAlign(0,1);
  g.setFont("6x8",3);
  g.drawString("bpm",leftMargin,topMargin*6);
  
  //status
  g.setFontAlign(0,1);
  g.setFont("6x8",3);
  if(status == "running")
    g.setColor(0,1,0);
  g.drawString(status,leftMargin*2,topMargin*7);
  
  //keep screen active
  g.flip();
}

function onHrm(hrm){
  if(hrm.confidence > 95){
    hr = hrm.bpm;
    if(previousHr.timestamp == 0){
      previousHr.timestamp = getTime();
    } else {
      var acCal = 0; 
      var timespan = (getTime() - previousHr.timestamp);
      console.log((timespan) + " sec");
      if(sex === "Male"){
        acCal = ((age*0.2017) + (weight*0.1988) + (hrm.bpm*0.6309) - 55.0969) * (timespan/60)/4.184;
      } else if (sex === "Female"){
        acCal = ((age*0.074) + (weight*0.1263) + (hrm.bpm*0.4472) - 20.4022) * (timespan/60)/4.184;
      }
      calories += Math.abs(acCal);
      previousHr.timestamp += timespan;
      console.log("kCalories: " + Math.abs(acCal) + "; Sum kCal: "+calories);
    }
  }
}

//get time string formated to hh:mm in 24h format
function getTimeString(){
  if(startTime == 0)
    return "00:00:00";
  
  var secs = getTime()- startTime;
  var hours = Math.floor(secs/3600);
  secs %= 3600;
  var minutes = Math.floor(secs/60);
  secs = Math.floor(secs%60);
  
  var str = ((hours>9) ? hours : "0" + hours) +":";
  str += ((minutes>9) ? minutes : "0" + minutes) +":";
  str += ((secs>9) ? secs : "0" + secs);
  return str;
}

//start and stop
function start(){
  calories = 0;
  previousHr.timestamp = 0;
  startTime = getTime();
  interval = setInterval(draw,1000);
  Bangle.setHRMPower(1);
  Bangle.on('HRM',onHrm);
  status = "running";
}
function stop(){
  Bangle.setHRMPower(0);
  Bangle.removeListener('HRM',onHrm);
  status = "stopped";
  draw();  
  clearInterval(interval);
  startTime=0;
}

//intervals and eventhandlers

setWatch(start, BTN1, {repeat:true,edge:"falling"});
setWatch(stop, BTN3, {repeat:true,edge:"falling"});

draw();