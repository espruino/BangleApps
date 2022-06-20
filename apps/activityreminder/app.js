(function () {
    // load variable before defining functions cause it can trigger a ReferenceError
    const activityreminder = require("activityreminder");
    const storage = require("Storage");
    const activityreminder_settings = activityreminder.loadSettings();
    let activityreminder_data = activityreminder.loadData();

    function drawAlert() {
        E.showPrompt("Inactivity detected", {
            title: "Activity reminder",
            buttons: { "Ok": 1, "Dismiss": 2, "Pause": 3 }
        }).then(function (v) {
            if (v == 1) {
                activityreminder_data.okDate = new Date();
            }
            if (v == 2) {
                activityreminder_data.dismissDate = new Date();
            }
            if (v == 3) {
                activityreminder_data.pauseDate = new Date();
            }
            activityreminder.saveData(activityreminder_data);
            load();
        });
        
        // Obey system quiet mode:
        if (!(storage.readJSON('setting.json', 1) || {}).quiet) {
            Bangle.buzz(400);
        }
        setTimeout(load, 20000);
    }
    
    function run() {
        if (activityreminder.mustAlert(activityreminder_data, activityreminder_settings)) {
            drawAlert();
        } else {
            eval(storage.read("activityreminder.settings.js"))(() => load());
        }
    }

    g.clear();
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    run();
    
})();