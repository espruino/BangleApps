const storage = require("Storage");

exports.loadSettings = function () {
    return Object.assign({
        enabled: true,
        startHour: 9,
        endHour: 20,
        maxInnactivityMin: 30,
        dismissDelayMin: 15,
        pauseDelayMin: 120,
        minSteps: 50
    }, storage.readJSON("activityreminder.s.json", true) || {});
};

exports.writeSettings = function (settings) {
    storage.writeJSON("activityreminder.s.json", settings);
};

exports.saveData = function (data) {
    storage.writeJSON("activityreminder.data.json", data);
};

exports.loadData = function () {
    var health = Bangle.getHealthStatus("day");
    return Object.assign({
        stepsDate: new Date(),
        stepsOnDate: health.steps,
        okDate: new Date(1970, 1, 1),
        dismissDate: new Date(1970, 1, 1),
        pauseDate: new Date(1970, 1, 1),
    },
        storage.readJSON("activityreminder.data.json") || {});
};

exports.mustAlert = function(activityreminder_data, activityreminder_settings) {
    var now = new Date();
    if ((now - activityreminder_data.stepsDate) / 60000 > activityreminder_settings.maxInnactivityMin) { // inactivity detected
        if ((now - activityreminder_settings.okDate) / 60000 > 3 && // last alert was more than 3 min ago
            (now - activityreminder_settings.dismissDate) / 60000 > activityreminder_settings.dismissDelayMin && // last alert was more than dismissDelayMin ago
            (now - activityreminder_settings.pauseDate) / 60000 > activityreminder_settings.pauseDelayMin) { // last alert was more than pauseDelayMin ago
            return true;
        }
    }
    return false;
}