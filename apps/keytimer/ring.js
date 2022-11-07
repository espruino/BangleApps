const common = require('keytimer-com.js');

Bangle.loadWidgets()
Bangle.drawWidgets()

Bangle.setLocked(false);
Bangle.setLCDPower(true);

let brightness = 0;

setInterval(() => {
    Bangle.buzz(200);
    Bangle.setLCDBrightness(1 - brightness);
    brightness = 1 - brightness;
}, 400);
Bangle.buzz(200);

function stopTimer() {
    common.state.wasRunning = false;
    common.state.running = false;
    require("Storage").writeJSON(common.STATE_PATH, common.state);
}

E.showAlert("Timer expired!").then(() => {
    stopTimer();
    load();
});
E.on('kill', stopTimer);