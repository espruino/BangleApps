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
    g.clearRect(Bangle.appRect);
    redraw();
};
var infoFont = "6x8:2";
var infoCommon = {
    type: "txt",
    label: "",
    font: infoFont,
    pad: 5,
};
var infoLayout = new Layout({
    type: "v",
    c: [
        {
            type: "h",
            c: [
                __assign({ id: "bar_alti" }, infoCommon),
                __assign({ id: "bar_pres" }, infoCommon),
                __assign({ id: "bar_temp" }, infoCommon),
            ]
        },
        {
            type: "h",
            c: [
                __assign({ id: "gps_lat" }, infoCommon),
                __assign({ id: "gps_lon" }, infoCommon),
                __assign({ id: "gps_altitude" }, infoCommon),
                __assign({ id: "gps_satellites" }, infoCommon),
                __assign({ id: "gps_hdop" }, infoCommon),
            ]
        },
        {
            type: "h",
            c: [
                __assign({ id: "hrm_bpm" }, infoCommon),
                __assign({ id: "hrm_confidence" }, infoCommon),
            ]
        },
        {
            type: "h",
            c: [
                __assign({ id: "mag_x" }, infoCommon),
                __assign({ id: "mag_y" }, infoCommon),
                __assign({ id: "mag_z" }, infoCommon),
                __assign({ id: "mag_heading" }, infoCommon),
            ]
        },
        __assign({ type: "btn", label: "Set", cb: function () {
                setBtnsShown(true);
            } }, btnStyle),
    ]
}, {
    lazy: true,
});
var showElem = function (layout, s) {
    layout.label = s;
    delete layout.height;
};
var hideElem = function (layout) {
    layout.height = 0;
};
var populateInfo = function () {
    if (bar) {
        showElem(infoLayout["bar_alti"], "".concat(bar.altitude.toFixed(1), "m"));
        showElem(infoLayout["bar_pres"], "".concat(bar.pressure.toFixed(1), "mbar"));
        showElem(infoLayout["bar_temp"], "".concat(bar.temperature.toFixed(1), "C"));
    }
    else {
        hideElem(infoLayout["bar_alti"]);
        hideElem(infoLayout["bar_pres"]);
        hideElem(infoLayout["bar_temp"]);
    }
    if (gps) {
        showElem(infoLayout["gps_lat"], gps.lat.toFixed(4));
        showElem(infoLayout["gps_lon"], gps.lon.toFixed(4));
        showElem(infoLayout["gps_altitude"], "".concat(gps.alt, "m"));
        showElem(infoLayout["gps_satellites"], "".concat(gps.satellites));
        showElem(infoLayout["gps_hdop"], "".concat((gps.hdop * 5).toFixed(1), "m"));
    }
    else {
        hideElem(infoLayout["gps_lat"]);
        hideElem(infoLayout["gps_lon"]);
        hideElem(infoLayout["gps_altitude"]);
        hideElem(infoLayout["gps_satellites"]);
        hideElem(infoLayout["gps_hdop"]);
    }
    if (hrm) {
        showElem(infoLayout["hrm_bpm"], "".concat(hrm.bpm));
        showElem(infoLayout["hrm_confidence"], "".concat(hrm.confidence, "%"));
    }
    else {
        hideElem(infoLayout["hrm_bpm"]);
        hideElem(infoLayout["hrm_confidence"]);
    }
    if (mag) {
        showElem(infoLayout["mag_x"], "".concat(mag.x));
        showElem(infoLayout["mag_y"], "".concat(mag.y));
        showElem(infoLayout["mag_z"], "".concat(mag.z));
        showElem(infoLayout["mag_heading"], mag.heading.toFixed(1));
    }
    else {
        hideElem(infoLayout["mag_x"]);
        hideElem(infoLayout["mag_y"]);
        hideElem(infoLayout["mag_z"]);
        hideElem(infoLayout["mag_heading"]);
    }
};
var redraw = function () {
    var layout;
    if (btnsShown) {
        layout = btnLayout;
    }
    else {
        populateInfo();
        infoLayout.update();
        layout = infoLayout;
    }
    if (btnsShown !== prevBtnsShown) {
        prevBtnsShown = btnsShown;
        layout.forgetLazyState();
        layout.setUI();
    }
    layout.render();
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
    console.log("enableSensors():", settings);
};
var serviceActive = function (serv) {
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
        if (all || serviceActive(serv)) {
            advert[serv] = map(serv);
        }
    }
    return advert;
};
var updateBleAdvert = function () {
    var bleAdvert;
    if (!(bleAdvert = Bangle.bleAdvert)) {
        bleAdvert = getBleAdvert(function (_) { return undefined; });
        Bangle.bleAdvert = bleAdvert;
    }
    try {
        NRF.setAdvertising(bleAdvert);
    }
    catch (e) {
        console.log("setAdvertising(): " + e);
    }
};
var updateServices = function () {
    var newAdvert = getBleAdvert(serviceToAdvert);
    NRF.updateServices(newAdvert);
};
Bangle.on('accel', function (newAcc) { return acc = newAcc; });
Bangle.on('pressure', function (newBar) { return bar = newBar; });
Bangle.on('GPS', function (newGps) { return gps = newGps; });
Bangle.on('HRM', function (newHrm) { return hrm = newHrm; });
Bangle.on('mag', function (newMag) { return mag = newMag; });
Bangle.loadWidgets();
Bangle.drawWidgets();
setBtnsShown(true);
var redrawInterval = setInterval(redraw, 1000);
Bangle.on("lock", function (locked) {
    changeInterval(redrawInterval, locked ? 30000 : 1000);
});
enableSensors();
{
    var ad = getBleAdvert(function (serv) { return serviceToAdvert(serv, true); }, true);
    NRF.setServices(ad, {
        advertise: Object
            .keys(ad)
            .map(function (k) { return k.replace("0x", ""); })
    });
}
var iv;
var setIntervals = function (connected) {
    if (connected) {
        if (iv) {
            changeInterval(iv, 1000);
        }
        else {
            iv = setInterval(updateServices, 1000);
        }
    }
    else if (iv) {
        clearInterval(iv);
        iv = undefined;
    }
};
