var app = "drained";
if (typeof drainedInterval !== "undefined")
    drainedInterval = clearInterval(drainedInterval);
Bangle.setLCDBrightness(0);
var powerNoop = function () { return false; };
var forceOff = function (name) {
    var _a;
    if ((_a = Bangle._PWR) === null || _a === void 0 ? void 0 : _a[name])
        Bangle._PWR[name] = [];
    Bangle["set".concat(name, "Power")](0, app);
    Bangle["set".concat(name, "Power")] = powerNoop;
};
forceOff("GPS");
forceOff("HRM");
try {
    NRF.disconnect();
    NRF.sleep();
}
catch (e) {
    console.log("couldn't disable ble: ".concat(e));
}
Bangle.removeAllListeners();
clearWatch();
Bangle.setOptions({
    wakeOnFaceUp: 0,
    wakeOnTouch: 0,
    wakeOnTwist: 0,
});
var nextDraw;
var draw = function () {
    var x = g.getWidth() / 2;
    var y = g.getHeight() / 2 - 48;
    var date = new Date();
    var timeStr = require("locale").time(date, 1);
    var dateStr = require("locale").date(date, 0).toUpperCase() +
        "\n" +
        require("locale").dow(date, 0).toUpperCase();
    g.reset()
        .clearRect(Bangle.appRect)
        .setFont("Vector", 55)
        .setFontAlign(0, 0)
        .drawString(timeStr, x, y)
        .setFont("Vector", 24)
        .drawString(dateStr, x, y + 56)
        .drawString("".concat(E.getBattery(), "%"), x, y + 104);
    if (nextDraw)
        clearTimeout(nextDraw);
    nextDraw = setTimeout(function () {
        nextDraw = undefined;
        draw();
    }, 60000 - (date.getTime() % 60000));
};
var reload = function () {
    Bangle.setUI({
        mode: "custom",
        remove: function () {
            if (nextDraw)
                clearTimeout(nextDraw);
            nextDraw = undefined;
        },
        btn: function () {
            E.showPrompt("Restore watch to full power?").then(function (v) {
                if (v) {
                    drainedRestore();
                }
                else {
                    reload();
                }
            });
        }
    });
    Bangle.CLOCK = 1;
    g.clear();
    draw();
};
reload();
Bangle.emit("drained", E.getBattery());
var _a = require("Storage").readJSON("".concat(app, ".setting.json"), true) || {}, _b = _a.disableBoot, disableBoot = _b === void 0 ? false : _b, _c = _a.restore, restore = _c === void 0 ? 20 : _c;
function drainedRestore() {
    if (disableBoot) {
        try {
            eval(require('Storage').read('bootupdate.js'));
        }
        catch (e) {
            console.log("error restoring bootupdate:" + e);
        }
    }
    load();
}
if (disableBoot) {
    var checkCharge_1 = function () {
        if (E.getBattery() < restore)
            return;
        drainedRestore();
    };
    if (Bangle.isCharging())
        checkCharge_1();
    Bangle.on("charging", function (charging) {
        if (charging)
            checkCharge_1();
    });
}
