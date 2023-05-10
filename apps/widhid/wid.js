(function () {
    var settings = require("Storage").readJSON("setting.json", true) || { HID: false };
    if (settings.HID !== "kbmedia") {
        console.log("widhid: can't enable, HID setting isn't \"kbmedia\"");
        return;
    }
    delete settings;
    var anchor = { x: 0, y: 0 };
    var start = { x: 0, y: 0 };
    var dragging = false;
    var activeTimeout;
    var waitForRelease = true;
    var onSwipe = (function (_lr, ud) {
        if (Bangle.CLKINFO_FOCUS)
            return;
        if (!activeTimeout && ud > 0) {
            listen();
            Bangle.buzz(20);
        }
    });
    var onDrag = (function (e) {
        if (Bangle.CLKINFO_FOCUS)
            return;
        if (e.b === 0) {
            var wasDragging = dragging;
            dragging = false;
            if (waitForRelease) {
                waitForRelease = false;
                return;
            }
            if (!wasDragging
                || (Math.abs(e.x - anchor.x) < 2 && Math.abs(e.y - anchor.y) < 2)) {
                toggle();
                onEvent();
                return;
            }
        }
        if (waitForRelease)
            return;
        if (e.b && !dragging) {
            dragging = true;
            setStart(e);
            Object.assign(anchor, start);
            return;
        }
        var dx = e.x - start.x;
        var dy = e.y - start.y;
        if (Math.abs(dy) > 25 && Math.abs(dx) > 25) {
            setStart(e);
            return;
        }
        if (dx > 40) {
            next();
            onEvent();
            waitForRelease = true;
        }
        else if (dx < -40) {
            prev();
            onEvent();
            waitForRelease = true;
        }
        else if (dy > 30) {
            down();
            onEvent();
            setStart(e);
        }
        else if (dy < -30) {
            up();
            onEvent();
            setStart(e);
        }
    });
    var setStart = function (_a) {
        var x = _a.x, y = _a.y;
        start.x = x;
        start.y = y;
    };
    var onEvent = function () {
        Bangle.buzz(20);
        listen();
    };
    var listen = function () {
        var wasActive = !!activeTimeout;
        if (!wasActive) {
            suspendOthers();
            waitForRelease = true;
            Bangle.on("drag", onDrag);
            redraw();
        }
        if (activeTimeout)
            clearTimeout(activeTimeout);
        activeTimeout = setTimeout(function () {
            activeTimeout = undefined;
            Bangle.removeListener("drag", onDrag);
            resumeOthers();
            redraw();
        }, 3000);
    };
    var redraw = function () { return setTimeout(Bangle.drawWidgets, 50); };
    var connected = NRF.getSecurityStatus().connected;
    WIDGETS["hid"] = {
        area: "tr",
        sortorder: -20,
        draw: function () {
            if (this.width === 0)
                return;
            g.drawImage(activeTimeout
                ? require("heatshrink").decompress(atob("jEYxH+AEfH44XXAAYXXDKIXZDYp3pC/6KHUMwWHC/4XvUy4YGdqoA/AFoA=="))
                : require("heatshrink").decompress(atob("jEYxH+AEcdjoXXAAYXXDKIXZDYp3pC/6KHUMwWHC/4XvUy4YGdqoA/AFoA==")), this.x + 2, this.y + 2);
        },
        width: connected ? 24 : 0,
    };
    if (connected)
        Bangle.on("swipe", onSwipe);
    delete connected;
    NRF.on("connect", function () {
        WIDGETS["hid"].width = 24;
        Bangle.on("swipe", onSwipe);
        redraw();
    });
    NRF.on("disconnect", function () {
        WIDGETS["hid"].width = 0;
        Bangle.removeListener("swipe", onSwipe);
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
    var touchEvents = {
        tap: null,
        gesture: null,
        aiGesture: null,
        swipe: null,
        touch: null,
        drag: null,
        stroke: null,
    };
    var suspendOthers = function () {
        for (var event in touchEvents) {
            var handlers = Bangle["#on".concat(event)];
            if (!handlers)
                continue;
            var newEvents = void 0;
            if (handlers instanceof Array)
                newEvents = handlers.slice();
            else
                newEvents = [handlers];
            for (var _i = 0, newEvents_1 = newEvents; _i < newEvents_1.length; _i++) {
                var handler = newEvents_1[_i];
                Bangle.removeListener(event, handler);
            }
            touchEvents[event] = newEvents;
        }
    };
    var resumeOthers = function () {
        for (var event in touchEvents) {
            var handlers = touchEvents[event];
            touchEvents[event] = null;
            if (handlers)
                for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                    var handler = handlers_1[_i];
                    try {
                        Bangle.on(event, handler);
                    }
                    catch (e) {
                        console.log("couldn't restore \"".concat(event, "\" handler:"), e);
                    }
                }
        }
    };
})();
