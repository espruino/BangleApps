global.activityreminder = Object.assign({
  enabled: true,
  startHour: 9,
  endHour: 20,
  maxInnactivityMin: 30,
  dismissDelayMin: 15,
  minSteps: 50
}, require("Storage").readJSON("activityreminder.json", true) || {});

var stepsArray = []; // todo load from storage and save in storage on activityreminder.data. Create lib.js to read and write in it 


// todo put it in sequential to see if it work still

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
          // todo save stepsArray
        }
        else{
          if(stepsArray != [])
          {
             stepsArray = [];
             // todo save stepsArray
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

  setInterval(global.activityreminder.run, 60000);
}

