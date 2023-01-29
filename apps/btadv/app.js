"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Layout = require("Layout");
Bangle.loadWidgets();
Bangle.drawWidgets();
var services = ["0x180d", "0x181a", "0x1819"];
var acc;
var bar;
var gps;
var hrm;
var mag;
var btnsShown = false;
var prevBtnsShown = undefined;
var settings = {
    bar: false,
    gps: false,
    hrm: false,
    mag: false,
};
var idToName = {
    acc: "Acceleration",
    bar: "Barometer",
    gps: "GPS",
    hrm: "HRM",
    mag: "Magnetometer",
};
var infoFont = "6x8:2";
var colour = {
    on: "#0f0",
    off: "#fff",
};
var makeToggle = function (id) { return function () {
    settings[id] = !settings[id];
    var entry = btnLayout[id];
    var col = settings[id] ? colour.on : colour.off;
    entry.btnBorder = entry.col = col;
    btnLayout.update();
    btnLayout.render();
    enableSensors();
}; };
var btnStyle = {
    font: "Vector:14",
    fillx: 1,
    filly: 1,
    col: g.theme.fg,
    bgCol: g.theme.bg,
    btnBorder: "#fff",
};
var btnLayout = new Layout({
    type: "v",
    c: [
        {
            type: "h",
            c: [
                __assign({ type: "btn", label: idToName.bar, id: "bar", cb: makeToggle('bar') }, btnStyle),
                __assign({ type: "btn", label: idToName.gps, id: "gps", cb: makeToggle('gps') }, btnStyle),
            ]
        },
        {
            type: "h",
            c: [
                __assign({ type: "btn", label: idToName.hrm, id: "hrm", cb: makeToggle('hrm') }, btnStyle),
                __assign({ type: "btn", label: idToName.mag, id: "mag", cb: makeToggle('mag') }, btnStyle),
            ]
        },
        {
            type: "h",
            c: [
                __assign(__assign({ type: "btn", label: idToName.acc, id: "acc", cb: function () { } }, btnStyle), { col: colour.on, btnBorder: colour.on }),
                __assign({ type: "btn", label: "Back", cb: function () {
                        setBtnsShown(false);
                    } }, btnStyle),
            ]
        }
    ]
}, {
    lazy: true,
    back: function () {
        setBtnsShown(false);
    },
});
var setBtnsShown = function (b) {
    btnsShown = b;
    hook(!btnsShown);
    setIntervals();
    redraw();
};
var drawInfo = function (force) {
    var _a = Bangle.appRect, y = _a.y, x = _a.x, w = _a.w;
    var mid = x + w / 2;
    var drawn = false;
    if (!force && !bar && !gps && !hrm && !mag)
        return;
    g.reset()
        .clearRect(Bangle.appRect)
        .setFont(infoFont)
        .setFontAlign(0, -1);
    if (bar) {
        g.drawString("".concat(bar.altitude.toFixed(1), "m"), mid, y);
        y += g.getFontHeight();
        g.drawString("".concat(bar.pressure.toFixed(1), "mbar"), mid, y);
        y += g.getFontHeight();
        g.drawString("".concat(bar.temperature.toFixed(1), "C"), mid, y);
        y += g.getFontHeight();
        drawn = true;
    }
    if (gps) {
        g.drawString("".concat(gps.lat.toFixed(4), " lat, ").concat(gps.lon.toFixed(4), " lon"), mid, y);
        y += g.getFontHeight();
        g.drawString("".concat(gps.alt, "m (").concat(gps.satellites, " sat)"), mid, y);
        y += g.getFontHeight();
        drawn = true;
    }
    if (hrm) {
        g.drawString("".concat(hrm.bpm, " BPM (").concat(hrm.confidence, "%)"), mid, y);
        y += g.getFontHeight();
        drawn = true;
    }
    if (mag) {
        g.drawString("".concat(mag.x, " ").concat(mag.y, " ").concat(mag.z), mid, y);
        y += g.getFontHeight();
        g.drawString("heading: ".concat(mag.heading.toFixed(1)), mid, y);
        y += g.getFontHeight();
        drawn = true;
    }
    if (!drawn) {
        if (!force || Object.values(settings).every(function (x) { return !x; })) {
            g.drawString("swipe to enable", mid, y);
        }
        else {
            g.drawString("waiting for events...", mid, y);
        }
        y += g.getFontHeight();
    }
};
var onTap = function () {
    setBtnsShown(true);
};
var redraw = function () {
    if (btnsShown) {
        if (!prevBtnsShown) {
            prevBtnsShown = btnsShown;
            Bangle.removeListener("swipe", onTap);
            btnLayout.setUI();
            btnLayout.forgetLazyState();
            g.clearRect(Bangle.appRect);
        }
        btnLayout.render();
    }
    else {
        if (prevBtnsShown) {
            prevBtnsShown = btnsShown;
            Bangle.setUI();
            Bangle.on("swipe", onTap);
            drawInfo(true);
        }
        else {
            drawInfo();
        }
    }
};
var encodeHrm = function (hrm) {
    return [0, hrm.bpm];
};
encodeHrm.maxLen = 2;
var encodePressure = function (data) {
    return toByteArray(Math.round(data.pressure * 1000), 4, false);
};
encodePressure.maxLen = 4;
var encodeElevation = function (data) {
    return toByteArray(Math.round(data.altitude * 100), 3, true);
};
encodeElevation.maxLen = 3;
var encodeTemp = function (data) {
    return toByteArray(Math.round(data.temperature * 100), 2, true);
};
encodeTemp.maxLen = 2;
var encodeGps = function (data) {
    var speed = toByteArray(Math.round(1000 * data.speed / 36), 2, false);
    var lat = toByteArray(Math.round(data.lat * 10000000), 4, true);
    var lon = toByteArray(Math.round(data.lon * 10000000), 4, true);
    var elevation = toByteArray(Math.round(data.alt * 100), 3, true);
    var heading = toByteArray(Math.round(data.course * 100), 2, false);
    return [
        0x9d,
        0x2,
        speed[0], speed[1],
        lat[0], lat[1], lat[2], lat[3],
        lon[0], lon[1], lon[2], lon[3],
        elevation[0], elevation[1], elevation[2],
        heading[0], heading[1]
    ];
};
encodeGps.maxLen = 17;
var encodeMag = function (data) {
    var x = toByteArray(data.x, 2, true);
    var y = toByteArray(data.y, 2, true);
    var z = toByteArray(data.z, 2, true);
    return [x[0], x[1], y[0], y[1], z[0], z[1]];
};
encodeMag.maxLen = 6;
var toByteArray = function (value, numberOfBytes, isSigned) {
    var byteArray = new Array(numberOfBytes);
    if (isSigned && (value < 0)) {
        value += 1 << (numberOfBytes * 8);
    }
    for (var index = 0; index < numberOfBytes; index++) {
        byteArray[index] = (value >> (index * 8)) & 0xff;
    }
    return byteArray;
};
var enableSensors = function () {
    Bangle.setBarometerPower(settings.bar, "btadv");
    if (!settings.bar)
        bar = undefined;
    Bangle.setGPSPower(settings.gps, "btadv");
    if (!settings.gps)
        gps = undefined;
    Bangle.setHRMPower(settings.hrm, "btadv");
    if (!settings.hrm)
        hrm = undefined;
    Bangle.setCompassPower(settings.mag, "btadv");
    if (!settings.mag)
        mag = undefined;
};
var haveServiceData = function (serv) {
    switch (serv) {
        case "0x180d": return !!hrm;
        case "0x181a": return !!(bar || mag);
        case "0x1819": return !!(gps && gps.lat && gps.lon);
    }
};
var serviceToAdvert = function (serv, initial) {
    var _a, _b;
    if (initial === void 0) { initial = false; }
    switch (serv) {
        case "0x180d":
            if (hrm || initial) {
                var o = {
                    maxLen: encodeHrm.maxLen,
                    readable: true,
                    notify: true,
                };
                if (hrm) {
                    o.value = encodeHrm(hrm);
                    hrm = undefined;
                }
                return _a = {}, _a["0x2a37"] = o, _a;
            }
            return {};
        case "0x1819":
            if (gps || initial) {
                var o = {
                    maxLen: encodeGps.maxLen,
                    readable: true,
                    notify: true,
                };
                if (gps) {
                    o.value = encodeGps(gps);
                    gps = undefined;
                }
                return _b = {}, _b["0x2a67"] = o, _b;
            }
            return {};
        case "0x181a": {
            var o = {};
            if (bar || initial) {
                o["0x2a6c"] = {
                    maxLen: encodeElevation.maxLen,
                    readable: true,
                    notify: true,
                };
                o["0x2A1F"] = {
                    maxLen: encodeTemp.maxLen,
                    readable: true,
                    notify: true,
                };
                o["0x2a6d"] = {
                    maxLen: encodePressure.maxLen,
                    readable: true,
                    notify: true,
                };
                if (bar) {
                    o["0x2a6c"].value = encodeElevation(bar);
                    o["0x2A1F"].value = encodeTemp(bar);
                    o["0x2a6d"].value = encodePressure(bar);
                    bar = undefined;
                }
            }
            if (mag || initial) {
                o["0x2aa1"] = {
                    maxLen: encodeMag.maxLen,
                    readable: true,
                    notify: true,
                };
                if (mag) {
                    o["0x2aa1"].value = encodeMag(mag);
                    mag = undefined;
                }
            }
            return o;
        }
    }
};
var getBleAdvert = function (map, all) {
    if (all === void 0) { all = false; }
    var advert = {};
    for (var _i = 0, services_1 = services; _i < services_1.length; _i++) {
        var serv = services_1[_i];
        if (all || haveServiceData(serv)) {
            advert[serv] = map(serv);
        }
    }
    return advert;
};
var updateServices = function () {
    var newAdvert = getBleAdvert(serviceToAdvert);
    NRF.updateServices(newAdvert);
};
var onAccel = function (newAcc) { return acc = newAcc; };
var onPressure = function (newBar) { return bar = newBar; };
var onGPS = function (newGps) { return gps = newGps; };
var onHRM = function (newHrm) { return hrm = newHrm; };
var onMag = function (newMag) { return mag = newMag; };
var hook = function (enable) {
    if (enable) {
        Bangle.on("accel", onAccel);
        Bangle.on("pressure", onPressure);
        Bangle.on("GPS", onGPS);
        Bangle.on("HRM", onHRM);
        Bangle.on("mag", onMag);
    }
    else {
        Bangle.removeListener("accel", onAccel);
        Bangle.removeListener("pressure", onPressure);
        Bangle.removeListener("GPS", onGPS);
        Bangle.removeListener("HRM", onHRM);
        Bangle.removeListener("mag", onMag);
    }
};
var setIntervals = function (locked, connected) {
    if (locked === void 0) { locked = Bangle.isLocked(); }
    if (connected === void 0) { connected = NRF.getSecurityStatus().connected; }
    changeInterval(redrawInterval, locked ? 15000 : 5000);
    if (connected) {
        var interval = btnsShown ? 5000 : 1000;
        if (bleInterval) {
            changeInterval(bleInterval, interval);
        }
        else {
            bleInterval = setInterval(updateServices, interval);
        }
    }
    else if (bleInterval) {
        clearInterval(bleInterval);
        bleInterval = undefined;
    }
};
var redrawInterval = setInterval(redraw, 1000);
Bangle.on("lock", function (locked) { return setIntervals(locked); });
var bleInterval;
NRF.on("connect", function () { return setIntervals(undefined, true); });
NRF.on("disconnect", function () { return setIntervals(undefined, false); });
setIntervals();
setBtnsShown(true);
enableSensors();
{
    var ad = getBleAdvert(function (serv) { return serviceToAdvert(serv, true); }, true);
    var adServices = Object
        .keys(ad)
        .map(function (k) { return k.replace("0x", ""); });
    NRF.setServices(ad, {
        advertise: adServices,
        uart: false,
    });
}
