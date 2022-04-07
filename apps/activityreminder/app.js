global.activityreminder = Object.assign({
  enabled: true,
  startHour: 9,
  endHour: 20,
  maxInnactivityMin: 30,
  dismissDelayMin: 15,
  minSteps: 50
}, require("Storage").readJSON("activityreminder.json", true) || {});

var stepsArray = []; // todo load from storage and save in storage on activityreminder.data. Create lib.js to read and write in it 


function drawAlert(){
  E.showPrompt("Innactivity detected",{
    title:"Activity reminder",
    buttons : {"Ok": true,"Dismiss": false}
    }).then(function(v) {
      console.log(global.stepsArray);
      if(v == true){  
        stepsArray = global.stepsArray.slice(0, activityreminder.maxInnactivityMin - 3);
        // todo save stepsArray
      }
      if(v == false){
        stepsArray = global.stepsArray.slice(0, activityreminder.maxInnactivityMin - activityreminder.dismissDelayMin);
        // todo save stepsArray
      }
    load();
  });

  Bangle.buzz();
  setTimeout(load, 10000);

}

function run()
{
  if(stepsArray.length == activityreminder.maxInnactivityMin){
    if (stepsArray[0] - stepsArray[stepsArray.length-1] < activityreminder.minSteps)
    {
       drawAlert();
    }
  }else{
    // todo find something else to do when there is no alert to show, showing the setting is a placeholder for now
    eval(require("Storage").read("android.settings.js"))(()=>load());
  }
  
  
}


g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
run();
