let myProfile = require("Storage").readJSON("myprofile.json",1)||{};
let savedData = require("Storage").readJSON("calories.json",1)||{};
//init global var
global.calories = {
  activeCaloriesBurned:savedData.activeCaloriesBurned||0,
  totalCaloriesBurned:savedData.totalCaloriesBurned||0,
  bmrCaloriesBurned:savedData.bmrCaloriesBurned||0
};
let lastBMRWrite=savedData.lastBMRWrite||Date.now();

function writeData() {
  require('Storage').writeJSON("calories.json", savedData);
}


function intermittentBMRUpdate(){
  // update BMR every 2 minutes
  let now=Date.now();
  let bmr=Math.round(require("calories").calcBMR(myProfile)*((now - lastBMRWrite) / 60000));
  global.calories.totalCaloriesBurned+=bmr;
  global.calories.bmrCaloriesBurned+=bmr;
  // schedule next update
  lastBMRWrite=Date.now();
  Bangle.emit("calories",global.calories);
  setTimeout(intermittentBMRUpdate,120000);
}

Bangle.on('health',function(hd){
  let calData=require("calories").calcCalories(Object.assign(hd,{duration:10}),myProfile)
  global.calories.activeCaloriesBurned+=calData.activeCalories;
  global.calories.totalCaloriesBurned+=calData.activeCalories;
  Bangle.emit("calories",global.calories)
})

Bangle.on('midnight', function(){
  //reset for new day
  global.calories.activeCaloriesBurned=0;
  global.calories.totalCaloriesBurned=0;
  global.calories.bmrCaloriesBurned=0;
  savedData.totalCaloriesBurned=global.calories.totalCaloriesBurned
  savedData.activeCaloriesBurned=global.calories.activeCaloriesBurned;
  savedData.bmrCaloriesBurned=global.calories.bmrCaloriesBurned;
  writeData()
  
})

E.on('kill', function() {
 //save cals counted
  print("re-boot.js")
  savedData.lastBMRWrite=lastBMRWrite;
  savedData.totalCaloriesBurned=global.calories.totalCaloriesBurned
  savedData.activeCaloriesBurned=global.calories.activeCaloriesBurned;
  savedData.bmrCaloriesBurned=global.calories.bmrCaloriesBurned;

  writeData()
});

intermittentBMRUpdate();

