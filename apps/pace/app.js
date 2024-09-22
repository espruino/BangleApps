{
    var Layout_1 = require("Layout");
    var time_utils_1 = require("time_utils");
    var exs_1 = require("exstats").getStats(["dist", "pacec"], {
        notify: {
            dist: {
                increment: 1000,
            },
        },
    });
    var drawTimeout_1;
    var lastUnlazy_1 = 0;
    var splits_1 = [];
    var splitOffset_1 = 0, splitOffsetPx_1 = 0;
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
    var calculatePace_1 = function (time, dist) {
        if (dist === 0)
            return 0;
        return time / dist / 1000 / 60;
    };
    var draw_1 = function () {
        if (!exs_1.state.active) {
            drawSplits_1();
            return;
        }
        if (drawTimeout_1)
            clearTimeout(drawTimeout_1);
        drawTimeout_1 = setTimeout(draw_1, 1000);
        var now = Date.now();
        var pace;
        if ("time" in exs_1.state.thisGPS
            && now - exs_1.state.thisGPS.time < GPS_TIMEOUT_MS_1) {
            pace = exs_1.stats.pacec.getString();
        }
        else {
            pace = "No GPS";
        }
        var tm = time_utils_1.decodeTime(exs_1.state.duration);
        layout_1["time"].label = tm.d ? time_utils_1.formatDuration(tm) : time_utils_1.formatTime(tm);
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
        var totalTime = 0;
        for (;; i++) {
            var split = splits_1[i + splitOffset_1];
            if (split == null)
                break;
            totalTime += split;
            var y = Bangle.appRect.y + i * (barSize + barSpacing) + barSpacing / 2;
            if (y > h)
                break;
            var size = w * split / max;
            g.setColor("#00f").fillRect(0, y, size, y + barSize);
            var splitPace = calculatePace_1(split, 1);
            g.setColor("#fff").drawString("".concat(i + 1 + splitOffset_1, " @ ").concat(splitPace.toFixed(2)), 0, y);
        }
        var pace = exs_1.stats.pacec.getString();
        var splitTime = exs_1.state.duration - totalTime;
        g.setColor("#fff").drawString("".concat(i + 1 + splitOffset_1, " @ ").concat(pace, " (").concat((splitTime / 1000).toFixed(2), ")"), 0, Bangle.appRect.y + i * (barSize + barSpacing) + barSpacing / 2);
    };
    var pauseRun_1 = function () {
        exs_1.stop();
        Bangle.setGPSPower(0, "pace");
        draw_1();
    };
    var resumeRun_1 = function () {
        exs_1.resume();
        Bangle.setGPSPower(1, "pace");
        g.clearRect(Bangle.appRect);
        layout_1.forgetLazyState();
        draw_1();
    };
    var onButton_1 = function () {
        if (exs_1.state.active)
            pauseRun_1();
        else
            resumeRun_1();
    };
    exs_1.stats.dist.on("notify", function (dist) {
        var prev = splits_1[splits_1.length - 1] || 0;
        var totalDist = dist.getValue();
        var thisSplit = totalDist - prev;
        var prevTime = splits_1.reduce(function (a, b) { return a + b; }, 0);
        var time = exs_1.state.duration - prevTime;
        while (thisSplit > 0) {
            splits_1.push(time);
            time = 0;
            thisSplit -= 1000;
        }
    });
    Bangle.on('lock', function (locked) {
        if (!locked && exs_1.state.active)
            onButton_1();
    });
    setWatch(function () { return onButton_1(); }, BTN1, { repeat: true });
    Bangle.on('drag', function (e) {
        if (exs_1.state.active || e.b === 0)
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
