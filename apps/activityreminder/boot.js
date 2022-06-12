(function () {
    // load variable before defining functions cause it can trigger a ReferenceError
    const activityreminder = require("activityreminder");
    const activityreminder_settings = activityreminder.loadSettings();
    let activityreminder_data = activityreminder.loadData();
    
    if (activityreminder_data.firstLoad) {
        activityreminder_data.firstLoad = false;
        activityreminder.saveData(activityreminder_data);
    }

    function run() {
        if (isNotWorn()) return;
        let now = new Date();
        let h = now.getHours();

        if (isDuringAlertHours(h)) {
            let health = Bangle.getHealthStatus("day");
            if (health.steps - activityreminder_data.stepsOnDate >= activityreminder_settings.minSteps // more steps made than needed
                || health.steps < activityreminder_data.stepsOnDate) { // new day or reboot of the watch
                activityreminder_data.stepsOnDate = health.steps;
                activityreminder_data.stepsDate = now;
                activityreminder.saveData(activityreminder_data);
                /* todo in a futur release 
                Add settimer to trigger like 30 secs after going in this part cause the person have been walking 
                (pass some argument to run() to handle long walks and not triggering so often)
                */
            }

            if (activityreminder.mustAlert(activityreminder_data, activityreminder_settings)) {
                load('activityreminder.app.js');
            }
        }

    }

    function isNotWorn() {
        return (Bangle.isCharging() || activityreminder_settings.tempThreshold >= E.getTemperature());
    }

    function isDuringAlertHours(h) {
        if (activityreminder_settings.startHour < activityreminder_settings.endHour) { // not passing through midnight
            return (h >= activityreminder_settings.startHour && h < activityreminder_settings.endHour);
        } else { // passing through midnight
            return (h >= activityreminder_settings.startHour || h < activityreminder_settings.endHour);
        }
    }

    Bangle.on('midnight', function () {
        /*
        Usefull trick to have the app working smothly for people using it at night 
        */
        let now = new Date();
        let h = now.getHours();
        if (activityreminder_settings.enabled && isDuringAlertHours(h)) {
            // updating only the steps and keeping the original stepsDate on purpose 
            activityreminder_data.stepsOnDate = 0;
            activityreminder.saveData(activityreminder_data);
        }
    });


    if (activityreminder_settings.enabled) {
        setInterval(run, 60000);
        /* todo in a futur release 
        increase setInterval time to something that is still sensible (5 mins ?)
        when we added a settimer
        */
    }
})();
