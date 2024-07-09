{
    var __assign = Object.assign;
    var Layout_1 = require("Layout");
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    var HRM_MIN_CONFIDENCE_1 = 75;
    var services_1 = [
        "0x180d",
        "0x181a",
        "0x1819",
        "E95D0753251D470AA062FA1922DFA9A8",
    ];
    var acc_1;
    var bar_1;
    var gps_1;
    var hrm_1;
    var hrmAny_1;
    var mag_1;
    var btnsShown_1 = false;
    var prevBtnsShown_1 = undefined;
    var hrmAnyClear_1;
    var settings_1 = {
        bar: false,
        gps: false,
        hrm: false,
        mag: false,
    };
    var idToName = {
        bar: "Barometer",
        gps: "GPS",
        hrm: "HRM",
        mag: "Magnetometer",
    };
    var infoFont_1 = "6x8:2";
    var colour_1 = {
        on: "#0f0",
        off: "#fff",
    };
    var makeToggle = function (id) { return function () {
        settings_1[id] = !settings_1[id];
        var entry = btnLayout_1[id];
        var col = settings_1[id] ? colour_1.on : colour_1.off;
        entry.btnBorder = entry.col = col;
        btnLayout_1.update();
        btnLayout_1.render();
        enableSensors_1();
    }; };
    var btnStyle = {
        font: "Vector:14",
        fillx: 1,
        filly: 1,
        col: g.theme.fg,
        bgCol: g.theme.bg,
        btnBorder: "#fff",
    };
    var btnLayout_1 = new Layout_1({
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
                    __assign({ type: "btn", label: "Back", cb: function () {
                            setBtnsShown_1(false);
                        } }, btnStyle),
                ]
            }
        ]
    }, {
        lazy: true,
        back: function () {
            setBtnsShown_1(false);
        },
    });
    var setBtnsShown_1 = function (b) {
        btnsShown_1 = b;
        hook_1(!btnsShown_1);
        setIntervals_1();
        redraw_1();
    };
    var drawInfo_1 = function (force) {
        var _a = Bangle.appRect, y = _a.y, x = _a.x, w = _a.w;
        var mid = x + w / 2;
        var drawn = false;
        if (!force && !bar_1 && !gps_1 && !hrm_1 && !mag_1)
            return;
        g.reset()
            .clearRect(Bangle.appRect)
            .setFont(infoFont_1)
            .setFontAlign(0, -1);
        if (bar_1) {
            g.drawString("".concat(bar_1.altitude.toFixed(1), "m"), mid, y);
            y += g.getFontHeight();
            g.drawString("".concat(bar_1.pressure.toFixed(1), " hPa"), mid, y);
            y += g.getFontHeight();
            g.drawString("".concat(bar_1.temperature.toFixed(1), "C"), mid, y);
            y += g.getFontHeight();
            drawn = true;
        }
        if (gps_1) {
            g.drawString("".concat(gps_1.lat.toFixed(4), " lat, ").concat(gps_1.lon.toFixed(4), " lon"), mid, y);
            y += g.getFontHeight();
            g.drawString("".concat(gps_1.alt, "m (").concat(gps_1.satellites, " sat)"), mid, y);
            y += g.getFontHeight();
            drawn = true;
        }
        if (hrm_1) {
            g.drawString("".concat(hrm_1.bpm, " BPM (").concat(hrm_1.confidence, "%)"), mid, y);
            y += g.getFontHeight();
            drawn = true;
        }
        else if (hrmAny_1) {
            g.drawString("~".concat(hrmAny_1.bpm, " BPM (").concat(hrmAny_1.confidence, "%)"), mid, y);
            y += g.getFontHeight();
            drawn = true;
            if (!settings_1.hrm && !hrmAnyClear_1) {
                hrmAnyClear_1 = setTimeout(function () {
                    hrmAny_1 = undefined;
                    hrmAnyClear_1 = undefined;
                }, 10000);
            }
        }
        if (mag_1) {
            g.drawString("".concat(mag_1.x, " ").concat(mag_1.y, " ").concat(mag_1.z), mid, y);
            y += g.getFontHeight();
            g.drawString("heading: ".concat(mag_1.heading.toFixed(1)), mid, y);
            y += g.getFontHeight();
            drawn = true;
        }
        if (!drawn) {
            if (!force || Object.values(settings_1).every(function (x) { return !x; })) {
                g.drawString("swipe to enable", mid, y);
            }
            else {
                g.drawString("events pending", mid, y);
            }
            y += g.getFontHeight();
        }
    };
    var onTap_1 = function () {
        setBtnsShown_1(true);
    };
    var redraw_1 = function () {
        if (btnsShown_1) {
            if (!prevBtnsShown_1) {
                prevBtnsShown_1 = btnsShown_1;
                Bangle.removeListener("swipe", onTap_1);
                btnLayout_1.setUI();
                btnLayout_1.forgetLazyState();
                g.clearRect(Bangle.appRect);
            }
            btnLayout_1.render();
        }
        else {
            if (prevBtnsShown_1) {
                prevBtnsShown_1 = btnsShown_1;
                Bangle.setUI();
                Bangle.on("swipe", onTap_1);
                drawInfo_1(true);
            }
            else {
                drawInfo_1();
            }
        }
    };
    var encodeHrm_1 = function (hrm) {
        return [0, hrm.bpm];
    };
    encodeHrm_1.maxLen = 2;
    var encodePressure_1 = function (data) {
        return toByteArray_1(Math.round(data.pressure * 10), 4, false);
    };
    encodePressure_1.maxLen = 4;
    var encodeElevation_1 = function (data) {
        return toByteArray_1(Math.round(data.altitude * 100), 3, true);
    };
    encodeElevation_1.maxLen = 3;
    var encodeTemp_1 = function (data) {
        return toByteArray_1(Math.round(data.temperature * 10), 2, true);
    };
    encodeTemp_1.maxLen = 2;
    var encodeGps_1 = function (data) {
        var speed = toByteArray_1(Math.round(1000 * data.speed / 36), 2, false);
        var lat = toByteArray_1(Math.round(data.lat * 10000000), 4, true);
        var lon = toByteArray_1(Math.round(data.lon * 10000000), 4, true);
        var elevation = toByteArray_1(Math.round(data.alt * 100), 3, true);
        var heading = toByteArray_1(Math.round(data.course * 100), 2, false);
        return [
            157,
            2,
            speed[0], speed[1],
            lat[0], lat[1], lat[2], lat[3],
            lon[0], lon[1], lon[2], lon[3],
            elevation[0], elevation[1], elevation[2],
            heading[0], heading[1]
        ];
    };
    encodeGps_1.maxLen = 17;
    var encodeGpsHeadingOnly_1 = function (data) {
        var heading = toByteArray_1(Math.round(data.heading * 100), 2, false);
        return [
            16,
            16,
            heading[0], heading[1]
        ];
    };
    encodeGpsHeadingOnly_1.maxLen = 17;
    var encodeMag_1 = function (data) {
        var x = toByteArray_1(data.x, 2, true);
        var y = toByteArray_1(data.y, 2, true);
        var z = toByteArray_1(data.z, 2, true);
        return [x[0], x[1], y[0], y[1], z[0], z[1]];
    };
    encodeMag_1.maxLen = 6;
    var encodeAcc_1 = function (data) {
        var x = toByteArray_1(data.x * 1000, 2, true);
        var y = toByteArray_1(data.y * 1000, 2, true);
        var z = toByteArray_1(data.z * 1000, 2, true);
        return [x[0], x[1], y[0], y[1], z[0], z[1]];
    };
    encodeAcc_1.maxLen = 6;
    var toByteArray_1 = function (value, numberOfBytes, isSigned) {
        var byteArray = new Array(numberOfBytes);
        if (isSigned && (value < 0)) {
            value += 1 << (numberOfBytes * 8);
        }
        for (var index = 0; index < numberOfBytes; index++) {
            byteArray[index] = (value >> (index * 8)) & 0xff;
        }
        return byteArray;
    };
    var enableSensors_1 = function () {
        Bangle.setBarometerPower(settings_1.bar, "btadv");
        if (!settings_1.bar)
            bar_1 = undefined;
        Bangle.setGPSPower(settings_1.gps, "btadv");
        if (!settings_1.gps)
            gps_1 = undefined;
        Bangle.setHRMPower(settings_1.hrm, "btadv");
        if (!settings_1.hrm)
            hrm_1 = hrmAny_1 = undefined;
        Bangle.setCompassPower(settings_1.mag, "btadv");
        if (!settings_1.mag)
            mag_1 = undefined;
    };
    var haveServiceData_1 = function (serv) {
        switch (serv) {
            case "0x180d": return !!hrm_1;
            case "0x181a": return !!(bar_1 || mag_1);
            case "0x1819": return !!(gps_1 && gps_1.lat && gps_1.lon || mag_1);
            case "E95D0753251D470AA062FA1922DFA9A8": return !!acc_1;
        }
    };
    var serviceToAdvert_1 = function (serv, initial) {
        var _a, _b, _c;
        if (initial === void 0) { initial = false; }
        switch (serv) {
            case "0x180d":
                if (hrm_1 || initial) {
                    var o = {
                        maxLen: encodeHrm_1.maxLen,
                        readable: true,
                        notify: true,
                    };
                    var os = {
                        maxLen: 1,
                        readable: true,
                        notify: true,
                    };
                    if (hrm_1) {
                        o.value = encodeHrm_1(hrm_1);
                        os.value = [2];
                        hrm_1 = undefined;
                    }
                    return _a = {},
                        _a["0x2a37"] = o,
                        _a["0x2a38"] = os,
                        _a;
                }
                return {};
            case "0x1819":
                if (gps_1 || initial) {
                    var o = {
                        maxLen: encodeGps_1.maxLen,
                        readable: true,
                        notify: true,
                    };
                    if (gps_1) {
                        o.value = encodeGps_1(gps_1);
                        gps_1 = undefined;
                    }
                    return _b = {}, _b["0x2a67"] = o, _b;
                }
                else if (mag_1) {
                    var o = {
                        maxLen: encodeGpsHeadingOnly_1.maxLen,
                        readable: true,
                        notify: true,
                        value: encodeGpsHeadingOnly_1(mag_1),
                    };
                    return _c = {}, _c["0x2a67"] = o, _c;
                }
                return {};
            case "0x181a": {
                var o = {};
                if (bar_1 || initial) {
                    o["0x2a6c"] = {
                        maxLen: encodeElevation_1.maxLen,
                        readable: true,
                        notify: true,
                    };
                    o["0x2A1F"] = {
                        maxLen: encodeTemp_1.maxLen,
                        readable: true,
                        notify: true,
                    };
                    o["0x2a6d"] = {
                        maxLen: encodePressure_1.maxLen,
                        readable: true,
                        notify: true,
                    };
                    if (bar_1) {
                        o["0x2a6c"].value = encodeElevation_1(bar_1);
                        o["0x2A1F"].value = encodeTemp_1(bar_1);
                        o["0x2a6d"].value = encodePressure_1(bar_1);
                        bar_1 = undefined;
                    }
                }
                if (mag_1 || initial) {
                    o["0x2aa1"] = {
                        maxLen: encodeMag_1.maxLen,
                        readable: true,
                        notify: true,
                    };
                    if (mag_1) {
                        o["0x2aa1"].value = encodeMag_1(mag_1);
                    }
                }
                return o;
            }
            case "E95D0753251D470AA062FA1922DFA9A8": {
                var o = {};
                if (acc_1 || initial) {
                    o["E95DCA4B251D470AA062FA1922DFA9A8"] = {
                        maxLen: encodeAcc_1.maxLen,
                        readable: true,
                        notify: true,
                    };
                    if (acc_1) {
                        o["E95DCA4B251D470AA062FA1922DFA9A8"].value = encodeAcc_1(acc_1);
                        acc_1 = undefined;
                    }
                }
                return o;
            }
        }
    };
    var getBleAdvert_1 = function (map, all) {
        if (all === void 0) { all = false; }
        var advert = {};
        for (var _i = 0, services_2 = services_1; _i < services_2.length; _i++) {
            var serv = services_2[_i];
            if (all || haveServiceData_1(serv)) {
                advert[serv] = map(serv);
            }
        }
        mag_1 = undefined;
        return advert;
    };
    var updateServices_1 = function () {
        var newAdvert = getBleAdvert_1(serviceToAdvert_1);
        NRF.updateServices(newAdvert);
    };
    var onAccel_1 = function (newAcc) { return acc_1 = newAcc; };
    var onPressure_1 = function (newBar) { return bar_1 = newBar; };
    var onGPS_1 = function (newGps) { return gps_1 = newGps; };
    var onHRM_1 = function (newHrm) {
        if (newHrm.confidence >= HRM_MIN_CONFIDENCE_1)
            hrm_1 = newHrm;
        hrmAny_1 = newHrm;
    };
    var onMag_1 = function (newMag) { return mag_1 = newMag; };
    var hook_1 = function (enable) {
        if (enable) {
            Bangle.on("accel", onAccel_1);
            Bangle.on("pressure", onPressure_1);
            Bangle.on("GPS", onGPS_1);
            Bangle.on("HRM", onHRM_1);
            Bangle.on("mag", onMag_1);
        }
        else {
            Bangle.removeListener("accel", onAccel_1);
            Bangle.removeListener("pressure", onPressure_1);
            Bangle.removeListener("GPS", onGPS_1);
            Bangle.removeListener("HRM", onHRM_1);
            Bangle.removeListener("mag", onMag_1);
        }
    };
    var setIntervals_1 = function (locked, connected) {
        if (locked === void 0) { locked = Bangle.isLocked(); }
        if (connected === void 0) { connected = NRF.getSecurityStatus().connected; }
        changeInterval(redrawInterval_1, locked ? 15000 : 5000);
        if (connected) {
            var interval = btnsShown_1 ? 5000 : 1000;
            if (bleInterval_1) {
                changeInterval(bleInterval_1, interval);
            }
            else {
                bleInterval_1 = setInterval(updateServices_1, interval);
            }
        }
        else if (bleInterval_1) {
            clearInterval(bleInterval_1);
            bleInterval_1 = undefined;
        }
    };
    var redrawInterval_1 = setInterval(redraw_1, 1000);
    Bangle.on("lock", function (locked) { return setIntervals_1(locked); });
    var bleInterval_1;
    NRF.on("connect", function () { return setIntervals_1(undefined, true); });
    NRF.on("disconnect", function () { return setIntervals_1(undefined, false); });
    setIntervals_1();
    setBtnsShown_1(true);
    enableSensors_1();
    {
        var ad = getBleAdvert_1(function (serv) { return serviceToAdvert_1(serv, true); }, true);
        NRF.setServices(ad, {
            uart: false,
        });
        for (var id in ad) {
            var serv = ad[id];
            var value = void 0;
            for (var ch in serv) {
                value = serv[ch].value;
                break;
            }
            require("ble_advert").set(id, value || []);
        }
    }
}
