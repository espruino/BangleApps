global.activityreminder = Object.assign({
  enabled: true,
  startHour: 9,
  endHour: 20,
  maxInnactivityMin: 30,
  dismissDelayMin: 15,
  minSteps: 50,
}, require("Storage").readJSON("activityreminder.json", true) || {});

var stepsArray = [];


if (global.activityreminder) {

  activityreminder =
    Object.assign(activityreminder,
    {

      run: function(){
        var now = new Date();
        var h = now.getHours();
        console.log(stepsArray);
        if(h >= activityreminder.startHour && h < activityreminder.endHour)
        {
          var health = Bangle.getHealthStatus("day");
          stepsArray.unshift(health.steps);
          stepsArray = stepsArray.slice(0, activityreminder.maxInnactivityMin);
        }
        else{
          stepsArray = [];
        }
        if(stepsArray.length == activityreminder.maxInnactivityMin){
          if (stepsArray[0] - stepsArray[stepsArray.length-1] < activityreminder.minSteps)
          {
              load('authentiwatch.app.js');
          }
        }
      }
   });

  setInterval(global.activityreminder.run, 2000);
}

