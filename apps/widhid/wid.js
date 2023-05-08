(function () {
    var settings = require('Storage').readJSON('setting.json', true) || { HID: false };
    if (settings.HID !== "kbmedia") {
        console.log("widhid: can't enable, HID setting isn't \"kbmedia\"");
        return;
    }
    var start = { x: 0, y: 0 }, end = { x: 0, y: 0 };
    var dragging = false;
    var activeTimeout;
    Bangle.on("swipe", function (_lr, ud) {
        if (ud > 0) {
            listen();
            Bangle.buzz();
        }
    });
    Bangle.on('drag', function (e) {
        if (!activeTimeout)
            return;
        if (!dragging) {
            dragging = true;
            start.x = e.x;
            start.y = e.y;
            return;
        }
        var released = e.b === 0;
        if (released) {
            var dx = end.x - start.x;
            var dy = end.y - start.y;
            if (Math.abs(dy) < 10) {
                if (dx > 40)
                    next();
                else if (dx < 40)
                    prev();
            }
            else if (Math.abs(dx) < 10) {
                if (dy > 40)
                    down();
                else if (dy < 40)
                    up();
            }
            else if (dx === 0 && dy === 0) {
                toggle();
            }
            Bangle.buzz();
            listen();
            return;
        }
        end.x = e.x;
        end.y = e.y;
    });
    var listen = function () {
        suspendOthers();
        var wasActive = !!activeTimeout;
        clearTimeout(activeTimeout);
        activeTimeout = setTimeout(function () {
            activeTimeout = undefined;
            resumeOthers();
            redraw();
        }, 5000);
        if (!wasActive)
            redraw();
    };
    WIDGETS["hid"] = {
        area: "tr",
        sortorder: -20,
        draw: function () {
            g.drawImage(activeTimeout
                ? require("heatshrink").decompress(atob("mEwxH+AH4A/AH4A/AG8gkAvvAAYvvGVIvIGcwvMGMQv/F/4vTGpQvmNJAvqBggvtAEQv/F/4v/F/4nbFIYvlFooAHF1wvgFxwvfFx4v/Fz4v/F/4v/F/4wfFzwvwGBwugGBouiGBYukGJAtnAH4A/AH4A/ACIA=="))
                : require("heatshrink").decompress(atob("mEwxH+AH4A/AH4A/AG9lsovvAAYvvGVIvIGcwvMGMQv/F/4vTGpQvmNJAvqBggvtAEQv/F/4v/F/4nbFIYvlFooAHF1wvgFxwvfFx4v/Fz4v/F/4v/F/4wfFzwvwGBwugGBouiGBYukGJAtnAH4A/AH4A/ACIA==")), this.x + 2, this.y + 2);
        },
        width: 24,
    };
    var redraw = function () { return setTimeout(Bangle.drawWidgets, 50); };
    NRF.on("connect", function () {
        WIDGETS["hid"].width = 24;
        redraw();
    });
    NRF.on("disconnect", function () {
        WIDGETS["hid"].width = 0;
        redraw();
    });
    var sendHid = function (code) {
        NRF.sendHIDReport([1, code], function () { return NRF.sendHIDReport([1, 0]); });
    };
    var next = function () { return sendHid(0x01); };
    var prev = function () { return sendHid(0x02); };
    var toggle = function () { return sendHid(0x10); };
    var up = function () { return sendHid(0x40); };
    var down = function () { return sendHid(0x80); };
    var suspendOthers = function () {
        var swipeHandler = Bangle.swipeHandler;
        if (swipeHandler)
            Bangle.removeListener("swipe", swipeHandler);
    };
    var resumeOthers = function () {
        var swipeHandler = Bangle.swipeHandler;
        if (swipeHandler)
            Bangle.on("swipe", swipeHandler);
    };
})();
