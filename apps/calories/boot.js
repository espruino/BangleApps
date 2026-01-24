let myProfile = require("Storage").readJSON("myprofile.json",1)||{};
let savedData = require("Storage").readJSON("calories.json",1)||{};
//init global var
global.calories = {
  caloriesBurned:0
};
global.calories.caloriesBurned=savedData.caloriesBurned||0;
function writeData() {
  require('Storage').writeJSON("calories.json", savedData);
}

// takes object with bpm, movement (in duration), steps (in duration), and duration in minutes
let calcCalories = function(healthData) {
  if (!healthData || !healthData.duration) return;
  if(myProfile=={}||!myProfile.weight||!myProfile.restingHr||!myProfile.maxHrm) return;
  let weight = myProfile.weight;
    //current HR-rest HR)/(max HR - rest HR) )
  let hrr = healthData.bpm
  ? (healthData.bpm - myProfile.restingHr) / (myProfile.maxHrm - myProfile.restingHr)
  : 0;
  if(myProfile.gender!=undefined){
    if(myProfile.gender==1){
      //female

    }else{
      //male, but use as default

    }
  }else{
    //not defined, so we'll use an avg formula
    
  }
  let bpmMet = 1 + (5 * Math.max(0,hrr));
  let stepsPerMin = (healthData.steps/healthData.duration);
  let stepsMet = 1 + 0.0175 * stepsPerMin;
  let weightedHR = (healthData.bpm>0)?0.7:0.0;
  let weightedSteps = 1 - weightedHR;
  let met = bpmMet*weightedHR + stepsMet*weightedSteps;

  //cals burned in duration
  return Math.round(met * weight * (healthData.duration/60));

}

Bangle.on('health',function(hd){
  global.calories.caloriesBurned+=calcCalories(Object.assign(hd,{duration:10}))
  Bangle.emit("calories",{totalCalories:global.calories.caloriesBurned})
})

Bangle.on('midnight', function(){
  global.calories.caloriesBurned=0;
})
E.on('kill', function() {
 //save cals counted
  savedData.caloriesBurned=global.calories.caloriesBurned;
  writeData()
});
