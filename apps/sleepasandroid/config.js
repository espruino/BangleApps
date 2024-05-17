class SleepAsAndroidConfig {
    //Simple class to store whether sleep as android is running
    constructor() {
        this.filename = "sleepasandroid.json";
    }

    getEnabled() {
        //returns whether sleeptracking is enabled
        var content = require("Storage").readJSON(this.filename);
        if (content === undefined) {
            this.setEnabled(false);
            return this.getEnabled();
        }
        return content.enabled;
    }

    setEnabled(enabled) {
        // set sleeptracking state
        require("Storage").writeJSON(this.filename, {"enabled": enabled});
    }
}

function startTracking() {
    var config = new SleepAsAndroidConfig();
    config.setEnabled(true);
}

function stopTracking() {
    var config = new SleepAsAndroidConfig();
    config.setEnabled(false);
}

// (() => {eval(require("Storage").read("sleepasandroid.conf.js"));stopTracking();})();
// (() => {eval(require("Storage").read("sleepasandroid.conf.js"));startTracking();})();