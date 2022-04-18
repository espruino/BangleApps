exports.loadSettings = function() {
    return Object.assign({
        enabled: true,
        startHour: 9,
        endHour: 20,
        maxInnactivityMin: 30,
        dismissDelayMin: 15,
        minSteps: 50
    }, require("Storage").readJSON("activityreminder.settings.json", true) || {});
}

exports.saveStepsArray = function(stepsArray) {
    require("Storage").writeJSON("activityreminder.stepsarray.json", stepsArray);
}

exports.loadStepsArray = function(){
    return require("Storage").readJSON("activityreminder.stepsarray.json") || [];
}