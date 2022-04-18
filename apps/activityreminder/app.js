
var stepsArray = []; // todo load from storage and save in storage on activityreminder.data. Create lib.js to read and write in it 


function drawAlert(){
  E.showPrompt("Innactivity detected",{
    title:"Activity reminder",
    buttons : {"Ok": true,"Dismiss": false}
    }).then(function(v) {
      console.log(stepsArray); // todo remove
      if(v == true){  
        stepsArray = stepsArray.slice(0, activityreminder.maxInnactivityMin - 3);
        require("activityreminder").saveStepsArray(stepsArray);
      }
      if(v == false){
        stepsArray = stepsArray.slice(0, activityreminder.maxInnactivityMin - activityreminder.dismissDelayMin);
        require("activityreminder").saveStepsArray(stepsArray);
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
    eval(require("Storage").read("activityreminder.settings.js"))(()=>load());
  }
}


g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
global.activityreminder = require("activityreminder").loadSettings();
stepsArray = require("activityreminder").loadStepsArray();
run()
