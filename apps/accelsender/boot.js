setTimeout( // make other boot code run first, so we can override android.boot.js
  () => {
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

    var storage = require("Storage");
    var max_acceleration = { x: 0, y: 0, z: 0, diff: 0, td: 0, mag: 0 };
    var hasData = false;
    var intervalId;
    var config = storage.readJSON("accelsender.json", 1) || {};
    var configChanged = false;

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

    function onConfigChanged() {
        if (config.enabled) startTracking();
        else stopTracking();
        Bangle.emit("accelsender", config);
    }

    function setConfig(n, v) {
        if (config[n] !== v) {
            config[n] = v;
            configChanged = true;
            onConfigChanged();
        }
    }

    // Provide global ways to access in-memory config
    globalThis.accelSender = {
        setEnabled: (v) => setConfig("enabled", v),
        setWidget: (v) => setConfig("widget", v),
        setInterval: (v) => setConfig("interval", v),
        isEnabled: () => config.enabled,
        getInterval: () => config.interval || 5000,
        getWidget: () => config.widget || 0
    };

    // Wrap the GB handler to listen for messages from gadgetbridge
    globalThis.GB = (_GB => e => {
        switch (e.t) {
            case "accelsender":
                // Note: GB sends "enable" instead of "enabled"
                globalThis.accelSender.setEnabled(e.enable);
                // Note: this is ignoring interval variable from GB and prefering watch settings
                break;
            default:
                if (_GB) setTimeout(_GB, 0, e);
        }
    })(globalThis.GB);

    function startTracking() {
        if (intervalId) stopTracking();
        intervalId = setInterval(sendAccelerationData, globalThis.accelSender.getInterval());
        Bangle.on("accel", updateAcceleration);
    }

    function stopTracking() {
        if (intervalId) { clearInterval(intervalId); intervalId = undefined; }
        Bangle.removeListener("accel", updateAcceleration);
    }

    // On kill, save config if changed
    Bangle.on("kill", () => {
        if (configChanged) storage.writeJSON("accelsender.json", config);
    });

    // On initial load, apply config
    onConfigChanged();
}, 1);
