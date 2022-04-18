global.activityreminder = require("activityreminder").loadSettings();

if (global.activityreminder) {

  activityreminder =
    Object.assign(activityreminder,
    {
      run: function(){
        var now = new Date();
        var h = now.getHours();
        console.log(global.stepsArray);
        if(h >= activityreminder.startHour && h < activityreminder.endHour)
        {
          var health = Bangle.getHealthStatus("day");
          stepsArray.unshift(health.steps);
          stepsArray = stepsArray.slice(0, activityreminder.maxInnactivityMin);
          require("activityreminder").saveStepsArray(stepsArray);
        }
        else{
          if(stepsArray != [])
          {
             stepsArray = [];
             require("activityreminder").saveStepsArray(stepsArray);
          }
          
        }
        if(stepsArray.length == activityreminder.maxInnactivityMin){
          if (stepsArray[0] - stepsArray[stepsArray.length-1] < activityreminder.minSteps)
          {
              load('activityreminder.app.js');
          }
        }
      }
   });

  stepsArray = require("activityreminder").loadStepsArray(); // todo load from storage and save in storage on activityreminder.data. Create lib.js to read and write in it
  setInterval(global.activityreminder.run, 10000); // todo change back to 60000
}

