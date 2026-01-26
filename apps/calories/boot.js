let myProfile = require("Storage").readJSON("myprofile.json",1)||{};
let savedData = require("Storage").readJSON("calories.json",1)||{};
let settings = require("Storage").readJSON("calories.settings.json",1)||{};
if(!savedData.prevData)savedData.prevData=[];
if(savedData.dayLastUpdated==undefined)savedData.dayLastUpdated=new Date().getDate();
//init global var
global.calories = {
  activeCaloriesBurned:savedData.activeCaloriesBurned||0,
  totalCaloriesBurned:savedData.totalCaloriesBurned||0,
  bmrCaloriesBurned:savedData.bmrCaloriesBurned||0
};
let calData=global.calories;
let lastBMRWrite=savedData.lastBMRWrite||Date.now();

function writeData() {
  require('Storage').writeJSON("calories.json", savedData);
}

let captureChanges=function(){
  savedData.lastBMRWrite=lastBMRWrite;
  savedData.totalCaloriesBurned=calData.totalCaloriesBurned
  savedData.activeCaloriesBurned=calData.activeCaloriesBurned;
  savedData.bmrCaloriesBurned=calData.bmrCaloriesBurned;
}
/* formatted like so:
savedData.prevData=[
  {activeCals:421,bmrCals:321},
  {activeCals:421,bmrCals:321},
]
  */
let onNewDay=function(){
  savedData.prevData.unshift({
    activeCals:calData.activeCaloriesBurned,
    bmrCals:calData.bmrCaloriesBurned
  })
  //limit to 7 days ago
  savedData.prevData=savedData.prevData.slice(0,6);
  // update to a new day
  savedData.dayLastUpdated=new Date().getDate();
  calData.activeCaloriesBurned=0;
  calData.totalCaloriesBurned=0;
  calData.bmrCaloriesBurned=0
  savedData.goalShownToday=false;
  captureChanges();
  writeData();
}

function intermittentBMRUpdate(){
  if(new Date().getDate()!=savedData.dayLastUpdated){
    // day has changed
    onNewDay();
  }
  // update BMR every 2 minutes
  let now=Date.now();
  let bmr=Math.round(require("calories").calcBMR(myProfile)*((now - lastBMRWrite) / 60000));
  calData.totalCaloriesBurned+=bmr;
  calData.bmrCaloriesBurned+=bmr;
  // schedule next update
  lastBMRWrite=Date.now();
  Bangle.emit("calories",calData);
  setTimeout(intermittentBMRUpdate,120000);
}

Bangle.on('health',function(hd){
  if(new Date().getDate()!=savedData.dayLastUpdated){
    // day has changed
    onNewDay();
  }
  let calData=require("calories").calcCalories(Object.assign(hd,{duration:10}),myProfile)
  calData.activeCaloriesBurned+=calData.activeCalories;
  calData.totalCaloriesBurned+=calData.activeCalories;
  if(calData.activeCaloriesBurned>=savedData.calGoal&&!savedData.goalShownToday&&settings.showGoalReached){
    savedData.goalShownToday=true;
    writeData();
    require("notify").show({
      title : calData.activeCaloriesBurned+/*LANG*/ "Calories",
      body : /*LANG*/ "You reached your calorie goal!",
      icon : atob("DAyBABmD6BaBMAsA8BCBCBCBCA8AAA==")
    });
  }
  Bangle.emit("calories",calData)
})




E.on('kill', function() {
 //save cals counted
  captureChanges()
  writeData()
  
});

intermittentBMRUpdate();

