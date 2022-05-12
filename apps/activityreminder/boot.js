function run() {
    if (isNotWorn()) return;
    var now = new Date();
    var h = now.getHours();
    var health = Bangle.getHealthStatus("day");

    if (h >= activityreminder_settings.startHour && h < activityreminder_settings.endHour) {
        if (health.steps - activityreminder_data.stepsOnDate >= activityreminder_settings.minSteps // more steps made than needed
            || health.steps < activityreminder_data.stepsOnDate) { // new day or reboot of the watch
            activityreminder_data.stepsOnDate = health.steps;
            activityreminder_data.stepsDate = now;
            activityreminder.saveData(activityreminder_data);
        }
        
        if(activityreminder.mustAlert(activityreminder_data, activityreminder_settings)){
            load('activityreminder.app.js');
        }
    }

}

function isNotWorn() {
    // todo check temperature and mouvement in a futur release 
    return Bangle.isCharging();
}

const activityreminder = require("activityreminder");
activityreminder_settings = activityreminder.loadSettings();
if (activityreminder_settings.enabled) {
    activityreminder_data = activityreminder.loadData();
    if(activityreminder_data.firstLoad){
        activityreminder_data.firstLoad =false;
        activityreminder.saveData(activityreminder_data);
    }
    setInterval(run, 60000);
}
