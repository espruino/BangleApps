function run(){
    var now = new Date();
    var h = now.getHours();
    if(h >= activityreminder.startHour && h < activityreminder.endHour){
        var health = Bangle.getHealthStatus("day");
        stepsArray.unshift(health.steps);
        stepsArray = stepsArray.slice(0, activityreminder.maxInnactivityMin);
        require("activityreminder").saveStepsArray(stepsArray);
    }
    else{
        if(stepsArray != []){
            stepsArray = [];
            require("activityreminder").saveStepsArray(stepsArray);
        }
    }
    if(stepsArray.length >= activityreminder.maxInnactivityMin){
        if (stepsArray[0] - stepsArray[stepsArray.length-1] < activityreminder.minSteps){
            load('activityreminder.app.js');
        }
    }
}


activityreminder = require("activityreminder").loadSettings();
if(activityreminder.enabled) {
    stepsArray = require("activityreminder").loadStepsArray();
    setInterval(run, 60000);
}

