(() => {
    eval(require("Storage").read("sleepasandroid.conf.js"));
    var interval = null;

    function gbSend(message) {
        // Helper function to send data to gadgetbridge
        Bluetooth.println("");
        Bluetooth.println(JSON.stringify(message));
    }

    var config = new SleepAsAndroidConfig();


    function update_sleep_as_android() {
        // send data to gadgetbridge
        accel = Bangle.getAccel();
        health = Bangle.getHealthStatus();

        update_data = {t: "sleep_as_android", "accel": {"x": accel.x, "y": accel.y, "z": accel.z}, "bpm": health.bpm};
        gbSend(update_data);
        accel_data = [];
        if (!config.getEnabled()) {
            clearInterval(interval);
        }
    }

    if (config.getEnabled()) {
        interval = setInterval(update_sleep_as_android, 1000);
    }

})();