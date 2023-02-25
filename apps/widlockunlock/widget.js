"use strict";
WIDGETS["lockunlock"] = {
    area: (function () {
        var _a;
        var settings = require("Storage")
            .readJSON("lockunlock.settings.json", true) || {};
        return (_a = settings.location) !== null && _a !== void 0 ? _a : "tl";
    })(),
    sortorder: 10,
    width: 14,
    draw: function (w) {
        g.reset()
            .drawImage(atob(Bangle.isLocked()
            ? "DBGBAAAA8DnDDCBCBP////////n/n/n//////z/A"
            : "DBGBAAAA8BnDDCBABP///8A8A8Y8Y8Y8A8A//z/A"), w.x + 1, w.y + 3);
    },
};
Bangle.on("lock", function () { return Bangle.drawWidgets(); });
Bangle.on("touch", function (_btn, e) {
    var oversize = 5;
    if (!e)
        return;
    var x = e.x, y = e.y;
    var w = WIDGETS["lockunlock"];
    if (w.x - oversize <= x && x < w.x + 14 + oversize
        && w.y - oversize <= y && y < w.y + 24 + oversize) {
        Bangle.setLocked(true);
        var backlightTimeout_1 = Bangle.getOptions().backlightTimeout;
        Bangle.setOptions({ backlightTimeout: 100 });
        setTimeout(function () {
            Bangle.setOptions({ backlightTimeout: backlightTimeout_1 });
        }, 300);
    }
});
