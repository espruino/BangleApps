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
    var x2 = x + 6;
    var y2 = y + 66;
    g.reset()
        .clearRect(Bangle.appRect)
        .setFont("Vector", 55)
        .setFontAlign(0, 0)
        .drawString(timeStr, x, y)
        .setFont("Vector", 24)
        .drawString(dateStr, x2, y2)
        .drawString("".concat(E.getBattery(), "%"), x2, y2 + 48);
    if (nextDraw)
        clearTimeout(nextDraw);
    nextDraw = setTimeout(function () {
        nextDraw = undefined;
        draw();
    }, 60000 - (date.getTime() % 60000));
};
var reload = function () {
    var showMenu = function () {
        var menu = {
            "Restore to full power": drainedRestore,
        };
        if (NRF.getSecurityStatus().advertising)
            menu["Disable BLE"] = function () { NRF.sleep(); showMenu(); };
        else
            menu["Enable BLE"] = function () { NRF.wake(); showMenu(); };
        menu["Settings"] = function () { return load("setting.app.js"); };
        menu["Recovery"] = function () { return Bangle.showRecoveryMenu(); };
        menu["Exit menu"] = reload;
        if (nextDraw)
            clearTimeout(nextDraw);
        E.showMenu(menu);
    };
    Bangle.setUI({
        mode: "custom",
        remove: function () {
            if (nextDraw)
                clearTimeout(nextDraw);
            nextDraw = undefined;
        },
        btn: showMenu
    });
    Bangle.CLOCK = 1;
    g.clear();
    draw();
};
reload();
Bangle.emit("drained", E.getBattery());
var _a = require("Storage").readJSON("".concat(app, ".setting.json"), true) || {}, _b = _a.keepStartup, keepStartup = _b === void 0 ? true : _b, _c = _a.restore, restore = _c === void 0 ? 20 : _c, _d = _a.exceptions, exceptions = _d === void 0 ? ["widdst.0"] : _d;
function drainedRestore() {
    if (!keepStartup) {
        try {
            eval(require('Storage').read('bootupdate.js'));
        }
        catch (e) {
            console.log("error restoring bootupdate:" + e);
        }
    }
    load();
}
var checkCharge = function () {
    if (E.getBattery() < restore)
        return;
    drainedRestore();
};
if (Bangle.isCharging())
    checkCharge();
Bangle.on("charging", function (charging) {
    if (charging)
        checkCharge();
});
if (!keepStartup) {
    var storage = require("Storage");
    for (var _i = 0, exceptions_1 = exceptions; _i < exceptions_1.length; _i++) {
        var boot = exceptions_1[_i];
        try {
            var js = storage.read("".concat(boot, ".boot.js"));
            if (js)
                eval(js);
        }
        catch (e) {
            console.log("error loading boot exception \"".concat(boot, "\": ").concat(e));
        }
    }
}
