function run() {
    if (isNotWorn()) return;
    let now = new Date();
    let h = now.getHours();
    let health = Bangle.getHealthStatus("day");

    if (h >= activityreminder_settings.startHour && h < activityreminder_settings.endHour) {
        if (health.steps - activityreminder_data.stepsOnDate >= activityreminder_settings.minSteps // more steps made than needed
            || health.steps < activityreminder_data.stepsOnDate) { // new day or reboot of the watch
            activityreminder_data.stepsOnDate = health.steps;
            activityreminder_data.stepsDate = now;
            activityreminder.saveData(activityreminder_data);
            /* todo in a futur release 
            add settimer to trigger like 10 secs after the stepsDate + minSteps
            cancel all other timers of this app
            */
        }
        
        if(activityreminder.mustAlert(activityreminder_data, activityreminder_settings)){
            load('activityreminder.app.js');
        }
    }

}

function isNotWorn() {
    // todo in a futur release check temperature and mouvement in a futur release 
    return Bangle.isCharging();
}

const activityreminder = require("activityreminder");
const activityreminder_settings = activityreminder.loadSettings();
if (activityreminder_settings.enabled) {
    const activityreminder_data = activityreminder.loadData();
    if(activityreminder_data.firstLoad){
        activityreminder_data.firstLoad =false;
        activityreminder.saveData(activityreminder_data);
    }
    setInterval(run, 60000);
    /* todo in a futur release 
    increase setInterval time to something that is still sensible (5 mins ?)
    add settimer to trigger like 10 secs after the stepsDate + minSteps
    cancel all other timers of this app
    */
}
