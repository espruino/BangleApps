var _a, _b, _c;
{
    var L = require("Layout");
    var storeReps = require("Storage")
        .readJSON("rep.json");
    if (storeReps == null) {
        E.showAlert("No reps in storage\nLoad them on with the app loader")
            .then(function () { return load(); });
        throw new Error("no storage");
    }
    var reps_1 = storeReps.map(function (r, i, a) {
        var r2 = r;
        r2.accDur = i > 0
            ? a[i - 1].accDur + r.dur
            : r.dur;
        return r2;
    });
    var settings = (require("Storage").readJSON("rep.setting.json", true) || {});
    (_a = settings.record) !== null && _a !== void 0 ? _a : (settings.record = false);
    (_b = settings.recordStopOnExit) !== null && _b !== void 0 ? _b : (settings.recordStopOnExit = false);
    (_c = settings.stepMs) !== null && _c !== void 0 ? _c : (settings.stepMs = 5 * 1000);
    var fontSzMain = 54;
    var fontScaleRep = 2;
    var fontSzRep = 20;
    var fontSzRepDesc = 12;
    var blue_1 = "#205af7";
    var ffStep_1 = settings.stepMs;
    var state_1;
    var drawInterval_1;
    var lastRepIndex_1 = null;
    var firstTime_1 = true;
    var renderDuration = function (l) {
        var lbl;
        g.clearRect(l.x, l.y, l.x + l.w, l.y + l.h);
        if (state_1) {
            var _a = state_1.currentRepPair(), i = _a[0], repElapsed = _a[1];
            if (i !== null) {
                var thisDur = reps_1[i].dur;
                var remaining = thisDur - repElapsed;
                lbl = msToMinSec_1(remaining);
                var fract = repElapsed / thisDur;
                g.setColor(blue_1)
                    .fillRect(l.x, l.y, l.x + fract * l.w, l.y + l.h);
            }
            else {
                lbl = msToMinSec_1(repElapsed);
            }
        }
        else {
            lbl = "RDY";
        }
        if (l.font)
            g.setFont(l.font);
        g.setColor(l.col || g.theme.fg)
            .setFontAlign(0, 0)
            .drawString(lbl, l.x + (l.w >> 1), l.y + (l.h >> 1));
    };
    var layout_1 = new L({
        type: "v",
        c: [
            {
                type: "h",
                c: [
                    {
                        id: "duration",
                        lazyBuster: 1,
                        type: "custom",
                        font: "Vector:".concat(fontSzMain),
                        fillx: 1,
                        filly: 1,
                        render: renderDuration,
                    },
                    {
                        id: "repIdx",
                        type: "txt",
                        font: "6x8:".concat(fontScaleRep),
                        label: "---",
                        r: 1,
                    },
                ]
            },
            {
                type: "txt",
                font: "Vector:".concat(fontSzRepDesc),
                label: "Activity / Duration",
            },
            {
                id: "cur_name",
                type: "txt",
                font: "Vector:".concat(fontSzRep),
                label: "",
                col: blue_1,
                fillx: 1,
            },
            {
                type: "txt",
                font: "Vector:".concat(fontSzRepDesc),
                label: "Next / Duration",
            },
            {
                id: "next_name",
                type: "txt",
                font: "Vector:".concat(fontSzRep),
                label: "",
                fillx: 1,
            },
            {
                type: "h",
                c: [
                    {
                        id: "prev",
                        type: "btn",
                        label: "<<",
                        fillx: 1,
                        cb: function () {
                            buzzInteraction_1();
                            state_1 === null || state_1 === void 0 ? void 0 : state_1.rewind();
                            drawRep_1();
                        },
                    },
                    {
                        id: "play",
                        type: "btn",
                        label: "Play",
                        fillx: 1,
                        cb: function () {
                            buzzInteraction_1();
                            if (!state_1)
                                state_1 = new State_1();
                            state_1.toggle();
                            if (state_1.paused) {
                                clearInterval(drawInterval_1);
                                drawInterval_1 = undefined;
                            }
                            else {
                                drawInterval_1 = setInterval(drawRep_1, 1000);
                            }
                            drawRep_1();
                        },
                    },
                    {
                        id: "next",
                        type: "btn",
                        label: ">>",
                        fillx: 1,
                        cb: function () {
                            buzzInteraction_1();
                            state_1 === null || state_1 === void 0 ? void 0 : state_1.forward();
                            drawRep_1();
                        },
                    }
                ]
            }
        ]
    }, { lazy: true });
    var State_1 = (function () {
        function State() {
            this.paused = true;
            this.begin = Date.now();
            this.accumulated = 0;
        }
        State.prototype.toggle = function () {
            if (this.paused) {
                this.begin = Date.now();
            }
            else {
                var diff = Date.now() - this.begin;
                this.accumulated += diff;
            }
            this.paused = !this.paused;
        };
        State.prototype.getElapsedTotal = function () {
            return (this.paused ? 0 : Date.now() - this.begin) + this.accumulated;
        };
        State.prototype.getElapsedForRep = function () {
            return this.currentRepPair()[1];
        };
        State.prototype.currentRepPair = function () {
            var elapsed = this.getElapsedTotal();
            var i = this.currentRepIndex();
            var repElapsed = elapsed - (i > 0 ? reps_1[i - 1].accDur : 0);
            return [i, repElapsed];
        };
        State.prototype.currentRepIndex = function () {
            var elapsed = this.getElapsedTotal();
            var ent;
            for (var i = 0; (ent = reps_1[i]); i++)
                if (elapsed < ent.accDur)
                    return i;
            return null;
        };
        State.prototype.forward = function () {
            this.accumulated += ffStep_1;
        };
        State.prototype.rewind = function () {
            this.accumulated -= ffStep_1;
        };
        return State;
    }());
    var repToLabel_1 = function (i, id) {
        var rep = reps_1[i];
        if (rep)
            layout_1["".concat(id, "_name")].label = "".concat(rep.label, " / ").concat(msToMinSec_1(rep.dur));
        else
            emptyLabel_1(id);
    };
    var emptyLabel_1 = function (id) {
        layout_1["".concat(id, "_name")].label = "<none> / 0m";
    };
    var pad2_1 = function (s) { return ('0' + s.toFixed(0)).slice(-2); };
    var msToMinSec_1 = function (ms) {
        var sec = Math.floor(ms / 1000);
        var min = Math.floor(sec / 60);
        return min.toFixed(0) + ":" + pad2_1(sec % 60);
    };
    var drawRep_1 = function () {
        layout_1["duration"].lazyBuster ^= 1;
        if (state_1) {
            var i = state_1.currentRepIndex();
            if (i !== lastRepIndex_1) {
                buzzNewRep_1();
                lastRepIndex_1 = i;
                var repIdx = layout_1["repIdx"];
                repIdx.label = i !== null ? "Rep ".concat(i + 1) : "Done";
                layout_1.forgetLazyState();
                layout_1.clear();
            }
            layout_1["play"].label = state_1.paused ? "Play" : "Pause";
            if (i !== null) {
                repToLabel_1(i, "cur");
                repToLabel_1(i + 1, "next");
            }
            else {
                emptyLabel_1("cur");
                emptyLabel_1("next");
            }
        }
        layout_1.render();
    };
    var buzzInteraction_1 = function () { return Bangle.buzz(250); };
    var buzzNewRep_1 = function () {
        var n = firstTime_1 ? 1 : 3;
        firstTime_1 = false;
        var buzz = function () {
            Bangle.buzz(1000).then(function () {
                if (--n <= 0)
                    return;
                setTimeout(buzz, 250);
            });
        };
        buzz();
    };
    var init = function () {
        g.clear();
        layout_1.setUI();
        drawRep_1();
        Bangle.drawWidgets();
    };
    Bangle.loadWidgets();
    if (settings.record && WIDGETS["recorder"]) {
        WIDGETS["recorder"]
            .setRecording(true)
            .then(init);
        if (settings.recordStopOnExit)
            E.on('kill', function () { return WIDGETS["recorder"].setRecording(false); });
    }
    else {
        init();
    }
}
