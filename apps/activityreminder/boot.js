global.activityreminder = Object.assign({
  enabled: true,
  startHour: 9,
  endHour: 20,
  maxInnactivityMin: 30,
  dismissDelayMin: 15,
  minSteps: 50,
}, require("Storage").readJSON("activityreminder.json", true) || {});

global.stepsArray = [];


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
          global.stepsArray.unshift(health.steps);
          global.stepsArray = global.stepsArray.slice(0, activityreminder.maxInnactivityMin);
        }
        else{
          global.stepsArray = [];
        }
        if(global.stepsArray.length == activityreminder.maxInnactivityMin){
          if (global.stepsArray[0] - global.stepsArray[stepsArray.length-1] < activityreminder.minSteps)
          {
              load('activityreminder.app.js');
          }
        }
      }
   });

  setInterval(global.activityreminder.run, 2000);
}

