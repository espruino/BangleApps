function drawAlert(){
  E.showPrompt("Inactivity detected",{
    title:"Activity reminder",
    buttons : {"Ok": true,"Dismiss": false}
    }).then(function(v) {
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

  // Obey system quiet mode:
  if (!(require('Storage').readJSON('setting.json',1)||{}).quiet) {
    Bangle.buzz(400);
  }
  setTimeout(load, 20000);
}

function run(){
    if(stepsArray.length == activityreminder.maxInnactivityMin){
        if (stepsArray[0] - stepsArray[stepsArray.length-1] < activityreminder.minSteps){
            drawAlert();
        }
    }else{
        eval(require("Storage").read("activityreminder.settings.js"))(()=>load());
    }
}


g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
activityreminder = require("activityreminder").loadSettings();
stepsArray = require("activityreminder").loadStepsArray();
run();
