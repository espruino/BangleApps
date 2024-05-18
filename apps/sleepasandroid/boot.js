(() => {
    /**
     * Sends a message to the gadgetbridge via Bluetooth.
     * @param {Object} message - The message to be sent.
     */
    function gbSend(message) {
        try {
            Bluetooth.println("");
            Bluetooth.println(JSON.stringify(message));
        } catch (error) {
            console.error("Failed to send message via Bluetooth:", error);
        }
    }

    var max_acceleration = {x: 0, y: 0, z: 0, mag: 0};

    /**
     * Updates the maximum acceleration if the current acceleration is greater.
     * @param {Object} accel - The current acceleration object with x, y, z, and mag properties.
     */
    function updateAcceleration(accel) {
        var current_max_raw = accel.mag;
        var max_raw = max_acceleration.mag;

        if (current_max_raw > max_raw) {
            max_acceleration = accel;
        }
    }

    /**
     * Updates the Sleep as Android data and sends it to gadgetbridge.
     * Resets the maximum acceleration.
     * Acceleration values in g are converted to m/s^2, as expected by Sleep as Android.
     */
    function sendSleepAsAndroidData() {
        var accel = Bangle.getAccel();
        var health = Bangle.getHealthStatus();

        var update_data = {
            t: "sleep_as_android", accel: {
                x: accel.x * 9.80665, y: accel.y * 9.80665, z: accel.z * 9.80665
            }, bpm: health.bpm
        };
        gbSend(update_data);

        max_acceleration = {x: 0, y: 0, z: 0, mag: 0};
    }

    var config = require("Storage").readJSON("sleepasandroid.json") || {};
    if (config.enabled) { // Gadgetbridge needs to enable and disable tracking by writing {enabled: true} to "sleepasandroid.json" and reloading
        setInterval(sendSleepAsAndroidData, 10000); // Sleep as Android wants a 10-second maximum
        Bangle.on("accel", updateAcceleration); // Log all acceleration events
    }

})();
