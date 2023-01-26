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
var services = ["0x180d", "0x181a", "0x1819"];
var acc;
var bar;
var gps;
var hrm;
var mag;
var curMenuName = "main";
var curMenu;
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
        mainMenuScroll = scroll;
        curMenu = E.showMenu(menu);
        curMenuName = cur;
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
    curMenu = E.showMenu(mainMenu);
    curMenuName = "main";
};
var optionsCommon = {
    back: showMainMenu,
};
var accMenu = {
    "": __assign({ "title": "Acceleration" }, optionsCommon),
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
    "": __assign({ "title": "Heart Rate" }, optionsCommon),
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
var redrawMenu = function (newMenu) {
    var scroll = curMenu.scroller.scroll;
    curMenu = E.showMenu(newMenu);
    curMenu.scroller.scroll = scroll;
    curMenu.draw();
};
var updateMenu = function () {
    switch (curMenuName) {
        case "acc":
            if (acc) {
                accMenu.x.value = acc.x.toFixed(2);
                accMenu.y.value = acc.y.toFixed(2);
                accMenu.z.value = acc.z.toFixed(2);
                redrawMenu(accMenu);
            }
            else if (accMenu.x.value !== "...") {
                accMenu.x.value = accMenu.y.value = accMenu.z.value = "...";
                redrawMenu(accMenu);
            }
            break;
        case "bar":
            if (bar) {
                barMenu.Altitude.value = bar.altitude.toFixed(1) + 'm';
                barMenu.Press.value = bar.pressure.toFixed(1) + 'mbar';
                barMenu.Temp.value = bar.temperature.toFixed(1) + 'C';
                redrawMenu(barMenu);
            }
            else if (barMenu.Altitude.value !== "...") {
                barMenu.Altitude.value = barMenu.Press.value = barMenu.Temp.value = "...";
                redrawMenu(accMenu);
            }
            break;
        case "gps":
            if (gps) {
                gpsMenu.Lat.value = gps.lat.toFixed(4);
                gpsMenu.Lon.value = gps.lon.toFixed(4);
                gpsMenu.Altitude.value = gps.alt + 'm';
                gpsMenu.Satellites.value = "" + gps.satellites;
                gpsMenu.HDOP.value = (gps.hdop * 5).toFixed(1) + 'm';
                redrawMenu(gpsMenu);
            }
            else if (gpsMenu.Lat.value !== "...") {
                gpsMenu.Lat.value = gpsMenu.Lon.value = gpsMenu.Altitude.value =
                    gpsMenu.Satellites.value = gpsMenu.HDOP.value = "...";
                redrawMenu(gpsMenu);
            }
            break;
        case "hrm":
            if (hrm) {
                hrmMenu.BPM.value = "" + hrm.bpm;
                hrmMenu.Confidence.value = hrm.confidence + '%';
                redrawMenu(hrmMenu);
            }
            else if (hrmMenu.BPM.value !== "...") {
                hrmMenu.BPM.value = hrmMenu.Confidence.value = "...";
                redrawMenu(hrmMenu);
            }
            break;
        case "mag":
            if (mag) {
                magMenu.x.value = "" + mag.x;
                magMenu.y.value = "" + mag.y;
                magMenu.z.value = "" + mag.z;
                magMenu.Heading.value = mag.heading.toFixed(1);
                redrawMenu(magMenu);
            }
            else if (magMenu.x.value !== "...") {
                magMenu.x.value = magMenu.y.value = magMenu.z.value = magMenu.Heading.value = "...";
                redrawMenu(magMenu);
            }
            break;
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
showMainMenu();
var menuInterval = setInterval(updateMenu, 1000);
Bangle.on("lock", function (locked) {
    changeInterval(menuInterval, locked ? 30000 : 1000);
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
setIntervals(NRF.getSecurityStatus().connected);
NRF.on("connect", function () {
    setIntervals(true);
});
NRF.on("disconnect", function () {
    setIntervals(false);
});
