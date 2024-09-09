{
    var Layout_1 = require("Layout");
    var state_1 = 1;
    var drawTimeout_1;
    var lastUnlazy_1 = 0;
    var lastResumeTime_1 = Date.now();
    var splitTime_1 = 0;
    var totalTime_1 = 0;
    var splits_1 = [];
    var splitDist_1 = 0;
    var splitOffset_1 = 0, splitOffsetPx_1 = 0;
    var lastGPS_1 = 0;
    var GPS_TIMEOUT_MS_1 = 30000;
    var layout_1 = new Layout_1({
        type: "v",
        c: [
            {
                type: "txt",
                font: "6x8:2",
                label: "Pace",
                id: "paceLabel",
                pad: 4
            },
            {
                type: "txt",
                font: "Vector:40",
                label: "",
                id: "pace",
                halign: 0
            },
            {
                type: "txt",
                font: "6x8:2",
                label: "Time",
                id: "timeLabel",
                pad: 4
            },
            {
                type: "txt",
                font: "Vector:40",
                label: "",
                id: "time",
                halign: 0
            },
        ]
    }, {
        lazy: true
    });
    var formatTime_1 = function (ms) {
        var totalSeconds = Math.floor(ms / 1000);
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        return "".concat(minutes, ":").concat(seconds < 10 ? '0' : '').concat(seconds);
    };
    var calculatePace_1 = function (time, dist) {
        if (dist === 0)
            return 0;
        return time / dist / 1000 / 60;
    };
    var draw_1 = function () {
        if (state_1 === 1) {
            drawSplits_1();
            return;
        }
        if (drawTimeout_1)
            clearTimeout(drawTimeout_1);
        drawTimeout_1 = setTimeout(draw_1, 1000);
        var now = Date.now();
        var elapsedTime = formatTime_1(totalTime_1 + (state_1 === 0 ? now - lastResumeTime_1 : 0));
        var pace;
        if (now - lastGPS_1 <= GPS_TIMEOUT_MS_1) {
            pace = calculatePace_1(thisSplitTime_1(), splitDist_1).toFixed(2);
        }
        else {
            pace = "No GPS";
        }
        layout_1["time"].label = elapsedTime;
        layout_1["pace"].label = pace;
        layout_1.render();
        if (now - lastUnlazy_1 > 30000)
            layout_1.forgetLazyState(), lastUnlazy_1 = now;
    };
    var drawSplits_1 = function () {
        g.clearRect(Bangle.appRect);
        var barSize = 20;
        var barSpacing = 10;
        var w = g.getWidth();
        var h = g.getHeight();
        var max = splits_1.reduce(function (a, x) { return Math.max(a, x); }, 0);
        g.setFont("6x8", 2).setFontAlign(-1, -1);
        var i = 0;
        for (;; i++) {
            var split = splits_1[i + splitOffset_1];
            if (split == null)
                break;
            var y = Bangle.appRect.y + i * (barSize + barSpacing) + barSpacing / 2;
            if (y > h)
                break;
            var size = w * split / max;
            g.setColor("#00f").fillRect(0, y, size, y + barSize);
            var splitPace = calculatePace_1(split, 1);
            g.setColor("#fff").drawString("".concat(i + 1 + splitOffset_1, " @ ").concat(splitPace.toFixed(2)), 0, y);
        }
        var splitTime = thisSplitTime_1();
        var pace = calculatePace_1(splitTime, splitDist_1);
        g.setColor("#fff").drawString("".concat(i + 1 + splitOffset_1, " @ ").concat(pace, " (").concat((splitTime / 1000).toFixed(2), ")"), 0, Bangle.appRect.y + i * (barSize + barSpacing) + barSpacing / 2);
    };
    var thisSplitTime_1 = function () {
        if (state_1 === 1)
            return splitTime_1;
        return Date.now() - lastResumeTime_1 + splitTime_1;
    };
    var pauseRun_1 = function () {
        state_1 = 1;
        var now = Date.now();
        totalTime_1 += now - lastResumeTime_1;
        splitTime_1 += now - lastResumeTime_1;
        Bangle.setGPSPower(0, "pace");
        Bangle.removeListener('GPS', onGPS_1);
        draw_1();
    };
    var resumeRun_1 = function () {
        state_1 = 0;
        lastResumeTime_1 = Date.now();
        Bangle.setGPSPower(1, "pace");
        Bangle.on('GPS', onGPS_1);
        g.clearRect(Bangle.appRect);
        layout_1.forgetLazyState();
        draw_1();
    };
    var onGPS_1 = function (fix) {
        if (fix && fix.speed && state_1 === 0) {
            var now = Date.now();
            var elapsedTime = now - lastGPS_1;
            splitDist_1 += fix.speed * elapsedTime / 3600000;
            while (splitDist_1 >= 1) {
                splits_1.push(thisSplitTime_1());
                splitDist_1 -= 1;
                splitTime_1 = 0;
            }
            lastGPS_1 = now;
        }
    };
    var onButton_1 = function () {
        switch (state_1) {
            case 0:
                pauseRun_1();
                break;
            case 1:
                resumeRun_1();
                break;
        }
    };
    Bangle.on('lock', function (locked) {
        if (!locked && state_1 == 0)
            onButton_1();
    });
    setWatch(function () { return onButton_1(); }, BTN1, { repeat: true });
    Bangle.on('drag', function (e) {
        if (state_1 !== 1 || e.b === 0)
            return;
        splitOffsetPx_1 -= e.dy;
        if (splitOffsetPx_1 > 20) {
            if (splitOffset_1 < splits_1.length - 3)
                splitOffset_1++, Bangle.buzz(30);
            splitOffsetPx_1 = 0;
        }
        else if (splitOffsetPx_1 < -20) {
            if (splitOffset_1 > 0)
                splitOffset_1--, Bangle.buzz(30);
            splitOffsetPx_1 = 0;
        }
        draw_1();
    });
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    g.clearRect(Bangle.appRect);
    draw_1();
}
