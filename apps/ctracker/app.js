// place your const, vars, functions or classes here
var calories = 0;
var leftMargin = g.getWidth()/2;
var topMargin = g.getHeight()/2;
var hrArray = [];

//personal data (settings file?)
var age = 27;
var weight = 96;
var sex = "Male";



function draw(){
  g.clear();
  g.setFontAlign(0,0);
  g.setFont("6x8",8);
  g.drawString(calories.toFixed(0),leftMargin,topMargin);
  g.setFont("6x8",4);
  g.drawString("cal",leftMargin,topMargin*1.6);
}

function onHrm(hrm){
  if(hrm.confidence > 95){
    console.log(hrm.bpm);
    hrArray.push(hrm.bpm);
  }
}

function calcCalories(){
  if(hrArray.length>0){
    var total = 0;
    for(var i =0;i<hrArray.length;i++){
      total += hrArray[i];
    }
    var bpmAverage = total/hrArray.length;
    console.log("Total: " + total + "; Average: " + bpmAverage + ";\n");
    hrArray = [];
    var acCal = 0; 
    if(sex === "Male"){
      acCal = ((age*0.2017) + (weight*0.1988) + (bpmAverage*0.6309) - 55.0969) * 0.5/4.184;
    } else if (sex === "Female"){
      acCal = ((age*0.074) + (weight*0.1263) + (bpmAverage*0.4472) - 20.4022) * 0.5/4.184;
    }
    calories += acCal;
    console.log("Calories: " + acCal + "; Sum Cal: "+calories);
  }
}

// special function to handle display switch on
Bangle.setHRMPower(1);
Bangle.on('HRM',onHrm);
setInterval(draw,1000);
setInterval(calcCalories,30*1000);

// call your app function here
