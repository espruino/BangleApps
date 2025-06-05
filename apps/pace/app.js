var _a;
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
    var menuShown_1 = false;
    var splits_1 = ((_a = S_1.readJSON("pace.json", 1)) === null || _a === void 0 ? void 0 : _a.splits) || [];
    var splitOffset_1 = 0, splitOffsetPx_1 = 0;
    var GPS_TIMEOUT_MS_1 = 30000;
    var drawGpsLvl = function (l) {
        var _a;
        var gps = l.gps;
        var nsats = (_a = gps === null || gps === void 0 ? void 0 : gps.satellites) !== null && _a !== void 0 ? _a : 0;
        if (!gps || !gps.fix)
            g.setColor("#FF0000");
        else if (gps.satellites < 4)
            g.setColor("#FF5500");
        else if (gps.satellites < 6)
            g.setColor("#FF8800");
        else if (gps.satellites < 8)
            g.setColor("#FFCC00");
        else
            g.setColor("#00FF00");
        g.fillRect(l.x, l.y + l.h - 10 - (l.h - 10) * ((nsats > 12 ? 12 : nsats) / 12), l.x + l.w - 1, l.y + l.h - 1);
    };
    var layout_1 = new Layout_1({
        type: "h",
        c: [
            {
                type: "custom",
                render: drawGpsLvl,
                id: "gpslvl",
                filly: 1,
                width: 10,
                bgCol: g.theme.bg,
            },
            {
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
        var y = Bangle.appRect.y + barSpacing / 2;
        g
            .setColor(g.theme.fg)
            .drawString(formatDuration_1(exs_1.state.duration), 0, y);
        var i = 0;
        for (;; i++) {
            var split = splits_1[i + splitOffset_1];
            if (split == null)
                break;
            var y_1 = Bangle.appRect.y + (i + 1) * (barSize + barSpacing) + barSpacing / 2;
            if (y_1 > h)
                break;
            var size = w * split.time / max;
            g.setColor("#00f").fillRect(0, y_1, size, y_1 + barSize);
            var splitPace = calculatePace_1(split);
            g.setColor(g.theme.fg);
            drawSplit_1(i, y_1, splitPace);
        }
        var pace = exs_1.stats.pacec.getString();
        y = Bangle.appRect.y + (i + 1) * (barSize + barSpacing) + barSpacing / 2;
        drawSplit_1(i, y, pace);
    };
    var drawSplit_1 = function (i, y, pace) {
        return g
            .drawString("".concat(i + 1 + splitOffset_1, " ").concat(typeof pace === "number" ? pace.toFixed(2) : pace), 0, y);
    };
    var pauseRun_1 = function () {
        exs_1.stop();
        draw_1();
    };
    var resumeRun_1 = function () {
        exs_1.resume();
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
    var hideMenu_1 = function () {
        if (!menuShown_1)
            return;
        Bangle.setUI();
        menuShown_1 = false;
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
        if (thisSplit > 1000) {
            if (thisTime > 0) {
                if (splits_1.length || thisTime > 1000 * 60)
                    splits_1.push({ dist: thisSplit, time: thisTime });
            }
            thisSplit %= 1000;
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
        if (exs_1.state.active || e.b === 0 || menuShown_1)
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
    Bangle.on('tap', function (e) {
        if (exs_1.state.active || menuShown_1 || !e.double)
            return;
        menuShown_1 = true;
        var menu = {
            "": {
                remove: function () {
                    draw_1();
                },
            },
            "< Back": function () {
                hideMenu_1();
            },
            "Zero time": function () {
                exs_1.start();
                exs_1.stop();
                hideMenu_1();
            },
            "Clear splits": function () {
                splits_1.splice(0, splits_1.length);
                hideMenu_1();
            },
        };
        E.showMenu(menu);
    });
    Bangle.loadWidgets();
    Bangle.setGPSPower(1, "pace");
    Bangle.on("GPS", function (gps) {
        var l = layout_1["gpslvl"];
        if (l)
            l.gps = gps;
    });
    g.clearRect(Bangle.appRect);
    if (splits_1) {
        E.showMessage("Restored splits\n(".concat(splits_1.length, ")"), "Pace");
        setTimeout(function () {
            g.reset().clear();
            Bangle.drawWidgets();
            draw_1();
        }, 1000);
    }
    else {
        Bangle.drawWidgets();
        draw_1();
    }
}
