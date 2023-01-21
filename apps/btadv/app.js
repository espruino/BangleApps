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
var _a, _b;
var acc;
var bar;
var gps;
var hrm;
var mag;
var curMenu = "main";
var mainMenuScroll = 0;
var settings = {
    barEnabled: false,
    gpsEnabled: false,
    hrmEnabled: false,
    magEnabled: false,
};
var showMainMenu = function () {
    var onOff = function (b) { return b ? " (on)" : " (off)"; };
    var mainMenu = {};
    var showMenu = function (menu, scroll, cur) { return function () {
        E.showMenu(menu);
        mainMenuScroll = scroll;
        curMenu = cur;
    }; };
    mainMenu[""] = {
        "title": "BLE Advert",
    };
    mainMenu[""].scroll = mainMenuScroll;
    mainMenu["Acceleration"] = showMenu(accMenu, 0, "acc");
    mainMenu["Barometer" + onOff(settings.barEnabled)] = showMenu(barMenu, 1, "bar");
    mainMenu["GPS" + onOff(settings.gpsEnabled)] = showMenu(gpsMenu, 2, "gps");
    mainMenu["Heart Rate" + onOff(settings.hrmEnabled)] = showMenu(hrmMenu, 3, "hrm");
    mainMenu["Magnetometer" + onOff(settings.magEnabled)] = showMenu(magMenu, 4, "mag");
    mainMenu["Exit"] = function () { return load(); };
    E.showMenu(mainMenu);
    curMenu = "main";
};
var optionsCommon = {
    back: showMainMenu,
};
var accMenu = {
    "": __assign({ "title": "Acceleration -" }, optionsCommon),
    "Active": { value: "true (fixed)" },
    "x": { value: "" },
    "y": { value: "" },
    "z": { value: "" },
};
var barMenu = {
    "": __assign({ "title": "Barometer" }, optionsCommon),
    "Active": {
        value: settings.barEnabled,
        onchange: function (v) { return updateSetting('barEnabled', v); },
    },
    "Altitude": { value: "" },
    "Press": { value: "" },
    "Temp": { value: "" },
};
var gpsMenu = {
    "": __assign({ "title": "GPS" }, optionsCommon),
    "Active": {
        value: settings.gpsEnabled,
        onchange: function (v) { return updateSetting('gpsEnabled', v); },
    },
    "Lat": { value: "" },
    "Lon": { value: "" },
    "Altitude": { value: "" },
    "Satellites": { value: "" },
    "HDOP": { value: "" },
};
var hrmMenu = {
    "": __assign({ "title": "-  Heart Rate  -" }, optionsCommon),
    "Active": {
        value: settings.hrmEnabled,
        onchange: function (v) { return updateSetting('hrmEnabled', v); },
    },
    "BPM": { value: "" },
    "Confidence": { value: "" },
};
var magMenu = {
    "": __assign({ "title": "Magnetometer" }, optionsCommon),
    "Active": {
        value: settings.magEnabled,
        onchange: function (v) { return updateSetting('magEnabled', v); },
    },
    "x": { value: "" },
    "y": { value: "" },
    "z": { value: "" },
    "Heading": { value: "" },
};
var updateMenu = function () {
    switch (curMenu) {
        case "acc":
            if (acc) {
                accMenu.x.value = acc.x.toFixed(2);
                accMenu.y.value = acc.y.toFixed(2);
                accMenu.z.value = acc.z.toFixed(2);
                E.showMenu(accMenu);
            }
            else if (accMenu.x.value !== "...") {
                accMenu.x.value = accMenu.y.value = accMenu.z.value = "...";
                E.showMenu(accMenu);
            }
            break;
        case "bar":
            if (bar) {
                barMenu.Altitude.value = bar.altitude.toFixed(1) + 'm';
                barMenu.Press.value = bar.pressure.toFixed(1) + 'mbar';
                barMenu.Temp.value = bar.temperature.toFixed(1) + 'C';
                E.showMenu(barMenu);
            }
            else if (barMenu.Altitude.value !== "...") {
                barMenu.Altitude.value = barMenu.Press.value = barMenu.Temp.value = "...";
                E.showMenu(accMenu);
            }
            break;
        case "gps":
            if (gps) {
                gpsMenu.Lat.value = gps.lat.toFixed(4);
                gpsMenu.Lon.value = gps.lon.toFixed(4);
                gpsMenu.Altitude.value = gps.alt + 'm';
                gpsMenu.Satellites.value = "" + gps.satellites;
                gpsMenu.HDOP.value = (gps.hdop * 5).toFixed(1) + 'm';
                E.showMenu(gpsMenu);
            }
            else if (gpsMenu.Lat.value !== "...") {
                gpsMenu.Lat.value = gpsMenu.Lon.value = gpsMenu.Altitude.value =
                    gpsMenu.Satellites.value = gpsMenu.HDOP.value = "...";
                E.showMenu(gpsMenu);
            }
            break;
        case "hrm":
            if (hrm) {
                hrmMenu.BPM.value = "" + hrm.bpm;
                hrmMenu.Confidence.value = hrm.confidence + '%';
                E.showMenu(hrmMenu);
            }
            else if (hrmMenu.BPM.value !== "...") {
                hrmMenu.BPM.value = hrmMenu.Confidence.value = "...";
                E.showMenu(hrmMenu);
            }
            break;
        case "mag":
            if (mag) {
                magMenu.x.value = "" + mag.x;
                magMenu.y.value = "" + mag.y;
                magMenu.z.value = "" + mag.z;
                magMenu.Heading.value = mag.heading.toFixed(1);
                E.showMenu(magMenu);
            }
            else if (magMenu.x.value !== "...") {
                magMenu.x.value = magMenu.y.value = magMenu.z.value = magMenu.Heading.value = "...";
                E.showMenu(magMenu);
            }
            break;
    }
};
var updateBleAdvert = function () {
    var _a, _b;
    var bleAdvert;
    if (!(bleAdvert = Bangle.bleAdvert))
        bleAdvert = Bangle.bleAdvert = {};
    if (hrm) {
        bleAdvert["0x180d"] = undefined;
        if (NRF.getSecurityStatus().connected) {
            NRF.updateServices((_a = {},
                _a["0x180d"] = (_b = {},
                    _b["0x2a37"] = {
                        value: [0, hrm.bpm],
                        notify: true,
                    },
                    _b),
                _a));
            return;
        }
    }
    NRF.setAdvertising(Bangle.bleAdvert);
};
var encodeHrm = function () { return [0, hrm ? hrm.bpm : 0]; };
var encodeBarServiceData = function (data) {
    var t = toByteArray(Math.round(data.temperature * 100), 2, true);
    var p = toByteArray(Math.round(data.pressure * 1000), 4, false);
    var e = toByteArray(Math.round(data.altitude * 100), 3, true);
    return [
        0x02, 0x01, 0x06,
        0x05, 0x16, 0x6e, 0x2a, t[0], t[1],
        0x07, 0x16, 0x6d, 0x2a, p[0], p[1], p[2], p[3],
        0x06, 0x16, 0x6c, 0x2a, e[0], e[1], e[2]
    ];
};
var encodeGpsServiceData = function (data) {
    var s = toByteArray(Math.round(1000 * data.speed / 36), 2, false);
    var lat = toByteArray(Math.round(data.lat * 10000000), 4, true);
    var lon = toByteArray(Math.round(data.lon * 10000000), 4, true);
    var e = toByteArray(Math.round(data.alt * 100), 3, true);
    var h = toByteArray(Math.round(data.course * 100), 2, false);
    return [
        0x02, 0x01, 0x06,
        0x14, 0x16, 0x67, 0x2a, 0x9d, 0x02, s[0], s[1], lat[0], lat[1], lat[2],
        lat[3], lon[0], lon[1], lon[2], lon[3], e[0], e[1], e[2], h[0], h[1]
    ];
};
var encodeMagServiceData = function (data) {
    var x = toByteArray(data.x, 2, true);
    var y = toByteArray(data.y, 2, true);
    var z = toByteArray(data.z, 2, true);
    return [
        0x02, 0x01, 0x06,
        0x09, 0x16, 0xa1, 0x2a, x[0], x[1], y[0], y[1], z[0], z[1]
    ];
};
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
    Bangle.setBarometerPower(settings.barEnabled, "btadv");
    if (!settings.barEnabled)
        bar = undefined;
    Bangle.setGPSPower(settings.gpsEnabled, "btadv");
    if (!settings.gpsEnabled)
        gps = undefined;
    Bangle.setHRMPower(settings.hrmEnabled, "btadv");
    if (!settings.hrmEnabled)
        hrm = undefined;
    Bangle.setCompassPower(settings.magEnabled, "btadv");
    if (!settings.magEnabled)
        mag = undefined;
};
var updateSetting = function (name, value) {
    settings[name] = value;
    enableSensors();
};
NRF.setServices((_a = {},
    _a["0x180d"] = (_b = {},
        _b["0x2a37"] = {
            value: encodeHrm(),
            readable: true,
            notify: true,
        },
        _b),
    _a), {
    advertise: [
        '180d',
    ]
});
var updateServices = function () {
    var _a, _b;
    NRF.updateServices((_a = {},
        _a["0x180d"] = (_b = {},
            _b["0x2a37"] = {
                value: encodeHrm(),
                notify: true,
            },
            _b),
        _a));
};
Bangle.on('accel', function (newAcc) { return acc = newAcc; });
Bangle.on('pressure', function (newBar) { return bar = newBar; });
Bangle.on('GPS', function (newGps) { return gps = newGps; });
Bangle.on('HRM', function (newHrm) { return hrm = newHrm; });
Bangle.on('mag', function (newMag) { return mag = newMag; });
Bangle.loadWidgets();
Bangle.drawWidgets();
showMainMenu();
enableSensors();
setInterval(updateBleAdvert, 30000);
var menuInterval = setInterval(updateMenu, 1000);
Bangle.on("lock", function (locked) {
    changeInterval(menuInterval, locked ? 30000 : 1000);
});
var serviceInterval;
NRF.on("connect", function () {
    serviceInterval = setInterval(updateServices, 1000);
});
NRF.on("disconnect", function () {
    clearInterval(serviceInterval);
    serviceInterval = undefined;
});
