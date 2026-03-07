{
    var serviceRegistered_1 = false;
    Bangle.on('touch', function (_btn, xy) {
        var oversize = 5;
        var w = WIDGETS["hrmadv"];
        if (!w)
            return;
        var x = xy.x;
        var y = xy.y;
        if (w.x - oversize <= x && x < w.x + 14 + oversize
            && w.y - oversize <= y && y < w.y + 24 + oversize) {
            E.stopEventPropagation();
            var wasOn = w.userReq;
            if (wasOn) {
                require("ble_advert").remove(0x180d);
                if (!NRF.getSecurityStatus().connected)
                    NRF.sleep();
            }
            else {
                require("ble_advert").set(0x180d);
                register_1();
                NRF.wake();
            }
            w.userReq = !wasOn;
            apply_1(!wasOn && NRF.getSecurityStatus().connected);
        }
    });
    NRF.on("connect", function () { return apply_1(!!WIDGETS["hrmadv"].userReq); });
    NRF.on("disconnect", function () { return apply_1(0); });
    var apply_1 = function (userReqAndNRF) {
        if (userReqAndNRF) {
            Bangle.setHRMPower(1, "widhrmadv");
            Bangle.on("HRM", onHrm_1);
        }
        else {
            Bangle.setHRMPower(0, "widhrmadv");
            Bangle.removeListener("HRM", onHrm_1);
        }
        var w = WIDGETS["hrmadv"];
        w === null || w === void 0 ? void 0 : w.draw(w);
    };
    var onHrm_1 = function (hrmObj) {
        if (hrmObj.confidence < 70)
            return;
        try {
            NRF.updateServices({
                0x180d: {
                    0x2a37: {
                        value: [6, hrmObj.bpm],
                        notify: true,
                    },
                },
            });
        }
        catch (e) {
            if (("" + e).indexOf("until BLE restart") === -1)
                throw e;
        }
    };
    var register_1 = function () {
        if (serviceRegistered_1)
            return;
        try {
            NRF.setServices({
                0x180d: {
                    0x2a37: {
                        value: [6, 0],
                        notify: true,
                    },
                },
            });
            serviceRegistered_1 = true;
        }
        catch (e) {
            console.error("widhrmadv:", e);
        }
    };
    WIDGETS["hrmadv"] = {
        area: "tr",
        sortorder: -10,
        width: 14,
        draw: function (w) {
            var hrm = Bangle.isHRMOn();
            var userReq = w.userReq;
            g
                .reset()
                .setColor(hrm && userReq
                ? "#f00"
                : userReq
                    ? "#00f"
                    : "#555")
                .drawImage(atob("CgoCAAABpaQ//9v//r//5//9L//A/+AC+AAFAA=="), w.x, w.y, { scale: 1.5 });
        },
    };
    register_1();
}
