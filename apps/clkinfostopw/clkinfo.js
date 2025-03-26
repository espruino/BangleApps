(function () {
    var durationOnPause = "---";
    var redrawInterval;
    var startTime;
    var showMillis = true;
    var milliTime = 60;
    var unqueueRedraw = function () {
        if (redrawInterval)
            clearInterval(redrawInterval);
        redrawInterval = undefined;
    };
    var queueRedraw = function () {
        var _this = this;
        unqueueRedraw();
        redrawInterval = setInterval(function () {
            if (startTime) {
                if (showMillis && Date.now() - startTime > milliTime * 1000) {
                    showMillis = false;
                    changeInterval(redrawInterval, 1000);
                }
            }
            else {
                unqueueRedraw();
            }
            _this.emit('redraw');
        }, 100);
    };
    var pad2 = function (s) { return ('0' + s.toFixed(0)).slice(-2); };
    var duration = function (start) {
        var seconds = (Date.now() - start) / 1000;
        if (seconds < milliTime)
            return seconds.toFixed(1);
        var mins = seconds / 60;
        seconds %= 60;
        if (mins < 60)
            return "".concat(mins.toFixed(0), ":").concat(pad2(seconds));
        var hours = mins / 60;
        mins %= 60;
        return "".concat(hours.toFixed(0), ":").concat(pad2(mins), ":").concat(pad2(seconds));
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
                show: function () {
                    if (startTime) {
                        queueRedraw.call(this);
                    }
                    else {
                        this.emit('redraw');
                    }
                },
                hide: unqueueRedraw,
                run: function () {
                    if (startTime) {
                        durationOnPause = duration(startTime);
                        startTime = undefined;
                    }
                    else {
                        queueRedraw.call(this);
                        showMillis = true;
                        startTime = Date.now();
                    }
                }
            }
        ]
    };
})
