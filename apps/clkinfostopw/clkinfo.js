"use strict";
(function () {
    var durationOnPause = "---";
    var redrawInterval;
    var startTime;
    var unqueueRedraw = function () {
        if (redrawInterval)
            clearInterval(redrawInterval);
        redrawInterval = undefined;
    };
    var queueRedraw = function () {
        var _this = this;
        unqueueRedraw();
        redrawInterval = setInterval(function () { return _this.emit('redraw'); }, 100);
    };
    var pad2 = function (s) { return ('0' + s.toFixed(0)).slice(-2); };
    var duration = function (start) {
        var seconds = (Date.now() - start) / 1000;
        if (seconds < 60)
            return seconds.toFixed(1);
        var mins = seconds / 60;
        seconds %= 60;
        if (mins < 60)
            return "".concat(pad2(mins), "m").concat(pad2(seconds), "s");
        var hours = mins / 60;
        mins %= 60;
        return "".concat(Math.round(hours), "h").concat(pad2(mins), "m").concat(pad2(seconds), "s");
    };
    var img = function () { return atob("GBiBAAAAAAB+AAB+AAAAAAB+AAH/sAOB8AcA4A4YcAwYMBgYGBgYGBg8GBg8GBgYGBgAGAwAMA4AcAcA4AOBwAH/gAB+AAAAAAAAAA=="); };
    return {
        name: "timer",
        img: img(),
        items: [
            {
                name: "stopw",
                get: function () { return ({
                    text: startTime
                        ? duration(startTime)
                        : durationOnPause,
                    img: img(),
                }); },
                show: queueRedraw,
                hide: unqueueRedraw,
                run: function () {
                    if (startTime) {
                        durationOnPause = duration(startTime);
                        startTime = undefined;
                        unqueueRedraw();
                    }
                    else {
                        queueRedraw.call(this);
                        startTime = Date.now();
                    }
                }
            }
        ]
    };
});
