let myProfile = require("Storage").readJSON("myprofile.json",1)||{};
let savedData = require("Storage").readJSON("calories.json",1)||{};
//init global var
global.calories = {
  activeCaloriesBurned:0,
  totalCaloriesBurned:0,
  bmrCaloriesBurned:0
};

global.calories.totalCaloriesBurned=savedData.totalCaloriesBurned||0;
global.calories.activeCaloriesBurned=savedData.activeCaloriesBurned||0;
global.calories.bmrCaloriesBurned=savedData.bmrCaloriesBurned||0;



function writeData() {
  require('Storage').writeJSON("calories.json", savedData);
}



Bangle.on('health',function(hd){
  let calData=require("calories").calcCalories(Object.assign(hd,{duration:10}),myProfile)
  global.calories.activeCaloriesBurned+=calData.activeCalories;
  global.calories.totalCaloriesBurned+=calData.totalCalories;
  global.calories.bmrCaloriesBurned+=calData.bmrCalories;
  Bangle.emit("calories",global.calories)
})

Bangle.on('midnight', function(){
  global.calories.activeCaloriesBurned=0,
  global.calories.totalCaloriesBurned=0,
  global.calories.bmrCaloriesBurned=0
})
E.on('kill', function() {
 //save cals counted
  savedData.totalCaloriesBurned=global.calories.totalCaloriesBurned
  savedData.activeCaloriesBurned=global.calories.activeCaloriesBurned;
  savedData.bmrCaloriesBurned=global.calories.bmrCaloriesBurned;

  writeData()
});

