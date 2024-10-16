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
    var S_1 = require("Storage");
    var drawTimeout_1;
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
        layout_1["time"].label = formatDuration_1(exs_1.state.duration);
        layout_1["pace"].label = pace;
        layout_1.render();
    };
    var pad2_1 = function (n) { return "0".concat(n).substr(-2); };
    var formatDuration_1 = function (ms) {
        var tm = time_utils_1.decodeTime(ms);
        if (tm.h)
            return "".concat(tm.h, ":").concat(pad2_1(tm.m), ":").concat(pad2_1(tm.s));
        return "".concat(pad2_1(tm.m), ":").concat(pad2_1(tm.s));
    };
    var calculatePace_1 = function (split) { return formatDuration_1(split.time / split.dist * 1000); };
    var drawSplits_1 = function () {
        g.clearRect(Bangle.appRect);
        var barSize = 20;
        var barSpacing = 10;
        var w = g.getWidth();
        var h = g.getHeight();
        var max = splits_1.reduce(function (a, s) { return Math.max(a, s.time); }, 0);
        g.setFont("6x8", 2).setFontAlign(-1, -1);
        var i = 0;
        for (;; i++) {
            var split = splits_1[i + splitOffset_1];
            if (split == null)
                break;
            var y_1 = Bangle.appRect.y + i * (barSize + barSpacing) + barSpacing / 2;
            if (y_1 > h)
                break;
            var size = w * split.time / max;
            g.setColor("#00f").fillRect(0, y_1, size, y_1 + barSize);
            var splitPace = calculatePace_1(split);
            drawSplit_1(i, y_1, splitPace);
        }
        var pace = exs_1.stats.pacec.getString();
        var y = Bangle.appRect.y + i * (barSize + barSpacing) + barSpacing / 2;
        drawSplit_1(i, y, pace);
    };
    var drawSplit_1 = function (i, y, pace) {
        g
            .setColor(g.theme.fg)
            .drawString("".concat(i + 1 + splitOffset_1, " ").concat(typeof pace === "number" ? pace.toFixed(2) : pace), 0, y);
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
    exs_1.start();
    exs_1.stats.dist.on("notify", function (dist) {
        var prev = { time: 0, dist: 0 };
        for (var _i = 0, splits_2 = splits_1; _i < splits_2.length; _i++) {
            var s = splits_2[_i];
            prev.time += s.time;
            prev.dist += s.dist;
        }
        var totalDist = dist.getValue();
        var thisSplit = totalDist - prev.dist;
        var thisTime = exs_1.state.duration - prev.time;
        while (thisSplit > 1000) {
            splits_1.push({ dist: thisSplit, time: thisTime });
            thisTime = 0;
            thisSplit -= 1000;
        }
        exs_1.state.notify.dist.next -= thisSplit;
        S_1.writeJSON("pace.json", { splits: splits_1 });
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
    Bangle.on('twist', function () {
        Bangle.setBacklight(1);
    });
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    g.clearRect(Bangle.appRect);
    draw_1();
}
