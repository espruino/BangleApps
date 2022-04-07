global.activityreminder = Object.assign({
  enabled: true,
  startHour: 9,
  endHour: 20,
  maxInnactivityMin: 30,
  dismissDelayMin: 15,
  minSteps: 50,
}, require("Storage").readJSON("activityreminder.json", true) || {});



if (global.activityreminder) {

  activityreminder =
    Object.assign(activityreminder,
    {
      stepsArray: [],

      run: function(){
        var now = new Date();
        var h = now.getHours();
        if(h >= activityreminder.startHour && h < activityreminder.endHour)
        {
          var health = Bangle.getHealthStatus("day");
          activityreminder.stepsArray.unshift(health.steps);
          activityreminder.stepsArray = activityreminder.stepsArray.slice(0, activityreminder.maxInnactivityMin);
        }
        else{
          activityreminder.stepsArray = [];
        }
        if(activityreminder.stepsArray.length == activityreminder.maxInnactivityMin){
          if (activityreminder.stepsArray[0] - activityreminder.stepsArray[activityreminder.stepsArray.length-1] < activityreminder.minSteps)
          {
              activityreminder.showAlert();
          }
        }


      },

      showAlert: function(){
        g.clear();
        Bangle.loadWidgets();
        Bangle.drawWidgets();
        E.showPrompt("Innactivity detected",{
          title:"Activity reminder",
          buttons : {"Ok": true,"Dismiss": false}
        }).then(function(v) {
          if(v == true){
            activityreminder.stepsArray = activityreminder.stepsArray.slice(0, activityreminder.maxInnactivityMin - 3);
          }
          if(v == false){
            activityreminder.stepsArray = activityreminder.stepsArray.slice(0, activityreminder.maxInnactivityMin - activityreminder.dismissDelayMin);
          }
          load();
        });
        Bangle.buzz();
        setTimeout(load, 10000);
      },
    }
  );

  setInterval(global.activityreminder.run, 2000);
}

