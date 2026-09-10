(function () {
    "ram";
    var _a;
    var state = (function () {
        var status = NRF.getSecurityStatus();
        if (status.connected)
            return 2;
        if (status.advertising)
            return 1;
        return 0;
    })();
    var width = function () { return state > 0 ? 15 : 0; };
    var update = function (newState) {
        state = newState;
        WIDGETS["bluetooth"].width = width();
        setTimeout(Bangle.drawWidgets, 50);
    };
    var colours = (_a = {},
        _a[1] = {
            false: "#000",
            true: "#fff",
        },
        _a[2] = {
            false: "#00f",
            true: "#0ff",
        },
        _a);
    WIDGETS["bluetooth"] = {
        area: "tl",
        sortorder: -1,
        draw: function () {
            if (state == 0)
                return;
            g.reset();
            g.setColor(colours[state][g.theme.dark]);
            g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), this.x + 2, this.y + 2);
        },
        width: width(),
    };
    NRF.on("connect", update.bind(null, 2));
    NRF.on("disconnect", update.bind(null, 1));
    var origWake = NRF.wake;
    var origSleep = NRF.sleep;
    NRF.wake = function () {
        update(1);
        return origWake.apply(this, arguments);
    };
    NRF.sleep = function () {
        update(0);
        return origSleep.apply(this, arguments);
    };
})();
