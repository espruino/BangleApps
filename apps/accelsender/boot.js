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

    var max_acceleration = { x: 0, y: 0, z: 0, diff: 0, td: 0, mag: 0 };
    var hasData = false;

    /**
     * Updates the maximum acceleration if the current acceleration is greater.
     * @param {Object} accel - The current acceleration object with x, y, z, and mag properties.
     */
    function updateAcceleration(accel) {
        hasData = true;
        var current_max_raw = accel.mag;
        var max_raw = max_acceleration.mag;

        if (current_max_raw > max_raw) {
            max_acceleration = accel;
        }
    }

    /**
     * Updates the acceleration data and sends it to gadgetbridge.
     * Resets the maximum acceleration.
     * Note: If your interval setting is too short, the last value gets sent again.
     */
    function sendAccelerationData() {
        var accel = hasData ? max_acceleration : Bangle.getAccel();

        var update_data = {
            t: "accel", accel: accel
        };
        gbSend(update_data);

        max_acceleration = { x: 0, y: 0, z: 0, mag: 0, diff: 0, td: 0 };
        hasData = false;
    }

    var config = require("Storage").readJSON("accelsender.json") || {};
    if (config.enabled) { // Gadgetbridge needs to enable and disable tracking by writing {enabled: true} to "accelsender.json" and reloading
        setInterval(sendAccelerationData, config.interval);
        Bangle.on("accel", updateAcceleration); // Log all acceleration events
    }

})();
