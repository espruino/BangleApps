function run() {
    if (isNotWorn()) return;
    var now = new Date();
    var h = now.getHours();
    var doAlert = false;
    var doSave = false;
    var health = Bangle.getHealthStatus("day");

    if (h >= activityreminder_settings.startHour && h < activityreminder_settings.endHour) {
        if (health.steps - activityreminder_data.stepsOnDate >= activityreminder_settings.minSteps) {
            activityreminder_data.stepsOnDate = health.steps;
            activityreminder_data.stepsDate = now;
            doSave = true;
        }
        doAlert = activityreminder.mustAlert(activityreminder_data, activityreminder_settings);
    }

    if (doSave) {
        activityreminder.saveData(activityreminder_data);
    }
    if (doAlert) {
        load('activityreminder.app.js');
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
    activityreminder.saveData(activityreminder_data);
    setInterval(run, 60000);
}

