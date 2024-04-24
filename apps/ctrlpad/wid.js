(function () {
    if (!Bangle.prependListener) {
        Bangle.prependListener = function (evt, listener) {
            var handlers = Bangle["#on".concat(evt)];
            if (!handlers) {
                Bangle.on(evt, listener);
            }
            else {
                if (typeof handlers === "function") {
                    Bangle.on(evt, listener);
                }
                Bangle["#on".concat(evt)] = [listener].concat(handlers.filter(function (f) { return f !== listener; }));
            }
        };
    }
    var Overlay = (function () {
        function Overlay() {
            this.width = g.getWidth() - 10 * 2;
            this.height = g.getHeight() - 24 - 10;
            this.g2 = Graphics.createArrayBuffer(this.width, this.height, 4, { msb: true });
            this.renderG2();
        }
        Overlay.prototype.setBottom = function (bottom) {
            var g2 = this.g2;
            var y = bottom - this.height;
            Bangle.setLCDOverlay(g2, 10, y - 10);
        };
        Overlay.prototype.hide = function () {
            Bangle.setLCDOverlay();
        };
        Overlay.prototype.renderG2 = function () {
            this.g2
                .reset()
                .clearRect(0, 0, this.width, this.height)
                .drawRect(0, 0, this.width - 1, this.height - 1)
                .drawRect(1, 1, this.width - 2, this.height - 2);
        };
        return Overlay;
    }());
    var colour = {
        on: {
            fg: "#fff",
            bg: "#00a",
        },
        off: {
            fg: "#000",
            bg: "#bbb",
        },
    };
    var Controls = (function () {
        function Controls(g) {
            var height = g.getHeight();
            var centreY = height / 2;
            var circleGapY = 30;
            var width = g.getWidth();
            this.controls = [
                { x: width / 4 - 10, y: centreY - circleGapY, text: "BLE", fg: colour.on.fg, bg: colour.on.bg },
                { x: width / 2, y: centreY - circleGapY, text: "DnD", fg: colour.off.fg, bg: colour.off.bg },
                { x: width * 3 / 4 + 10, y: centreY - circleGapY, text: "HRM", fg: colour.off.fg, bg: colour.off.bg },
                { x: width / 3, y: centreY + circleGapY, text: "B-", fg: colour.on.fg, bg: colour.on.bg },
                { x: width * 2 / 3, y: centreY + circleGapY, text: "B+", fg: colour.on.fg, bg: colour.on.bg },
            ];
        }
        Controls.prototype.draw = function (g, single) {
            g
                .setFontAlign(0, 0)
                .setFont("4x6:3");
            for (var _i = 0, _a = single ? [single] : this.controls; _i < _a.length; _i++) {
                var ctrl = _a[_i];
                g
                    .setColor(ctrl.bg)
                    .fillCircle(ctrl.x, ctrl.y, 23)
                    .setColor(ctrl.fg)
                    .drawString(ctrl.text, ctrl.x, ctrl.y);
            }
        };
        Controls.prototype.hitTest = function (x, y) {
            var dist = Infinity;
            var closest;
            for (var _i = 0, _a = this.controls; _i < _a.length; _i++) {
                var ctrl = _a[_i];
                var dx = x - ctrl.x;
                var dy = y - ctrl.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                if (d < dist) {
                    dist = d;
                    closest = ctrl;
                }
            }
            return dist < 30 ? closest : undefined;
        };
        return Controls;
    }());
    var state = 0;
    var startY = 0;
    var startedUpDrag = false;
    var upDragAnim;
    var ui;
    var touchDown = false;
    var onDrag = (function (e) {
        var _a, _b;
        var dragDistance = 30;
        if (e.b === 0)
            touchDown = startedUpDrag = false;
        switch (state) {
            case 2:
                if (e.b === 0) {
                    state = 0;
                    ui = undefined;
                }
                break;
            case 0:
                if (e.b && !touchDown) {
                    if (e.y <= 40) {
                        state = 1;
                        startY = e.y;
                    }
                    else {
                        state = 2;
                        ui = undefined;
                    }
                }
                break;
            case 1:
                if (e.b === 0) {
                    if (e.y > startY + dragDistance) {
                        state = 3;
                        startY = 0;
                        Bangle.prependListener("touch", onTouch);
                        Bangle.buzz(20);
                        ui.overlay.setBottom(g.getHeight());
                        break;
                    }
                    state = 0;
                    ui === null || ui === void 0 ? void 0 : ui.overlay.hide();
                    ui = undefined;
                }
                else {
                    var dragOffset = 32;
                    if (!ui) {
                        var overlay = new Overlay();
                        ui = {
                            overlay: overlay,
                            ctrls: new Controls(overlay.g2),
                        };
                        ui.ctrls.draw(ui.overlay.g2);
                    }
                    ui.overlay.setBottom(e.y - dragOffset);
                }
                (_a = E.stopEventPropagation) === null || _a === void 0 ? void 0 : _a.call(E);
                break;
            case 3:
                (_b = E.stopEventPropagation) === null || _b === void 0 ? void 0 : _b.call(E);
                if (e.b) {
                    if (!touchDown) {
                        startY = e.y;
                    }
                    else if (startY) {
                        var dist = Math.max(0, startY - e.y);
                        if (startedUpDrag || (startedUpDrag = dist > 10))
                            ui.overlay.setBottom(g.getHeight() - dist);
                    }
                }
                else if (e.b === 0) {
                    if ((startY - e.y) > dragDistance) {
                        var bottom_1 = g.getHeight() - Math.max(0, startY - e.y);
                        if (upDragAnim)
                            clearInterval(upDragAnim);
                        upDragAnim = setInterval(function () {
                            if (!ui || bottom_1 <= 0) {
                                clearInterval(upDragAnim);
                                upDragAnim = undefined;
                                ui === null || ui === void 0 ? void 0 : ui.overlay.hide();
                                ui = undefined;
                                return;
                            }
                            ui.overlay.setBottom(bottom_1);
                            bottom_1 -= 30;
                        }, 50);
                        Bangle.removeListener("touch", onTouch);
                        state = 0;
                    }
                    else {
                        ui.overlay.setBottom(g.getHeight());
                    }
                }
                break;
        }
        if (e.b)
            touchDown = true;
    });
    var onTouch = (function (_btn, xy) {
        var _a;
        if (!ui || !xy)
            return;
        var top = g.getHeight() - ui.overlay.height;
        var left = (g.getWidth() - ui.overlay.width) / 2;
        var ctrl = ui.ctrls.hitTest(xy.x - left, xy.y - top);
        if (ctrl) {
            onCtrlTap(ctrl, ui);
            (_a = E.stopEventPropagation) === null || _a === void 0 ? void 0 : _a.call(E);
        }
    });
    var origBuzz;
    var onCtrlTap = function (ctrl, ui) {
        var _a;
        var on = true;
        switch (ctrl.text) {
            case "BLE":
                if (NRF.getSecurityStatus().advertising) {
                    NRF.sleep();
                    on = false;
                }
                else {
                    NRF.wake();
                }
                break;
            case "DnD":
                if (origBuzz) {
                    Bangle.buzz = origBuzz;
                    origBuzz = undefined;
                    on = false;
                }
                else {
                    origBuzz = Bangle.buzz;
                    Bangle.buzz = function () { return Promise.resolve(); };
                }
                break;
            case "HRM": {
                var id = "widhid";
                var hrm = (_a = Bangle._PWR) === null || _a === void 0 ? void 0 : _a.HRM;
                if (!hrm || hrm.indexOf(id) === -1) {
                    Bangle.setHRMPower(1, id);
                }
                else {
                    Bangle.setHRMPower(0, id);
                    on = false;
                }
                break;
            }
            default:
                console.log("widhid: couldn't handle \"".concat(ctrl.text, "\" tap"));
                on = ctrl.fg !== colour.on.fg;
        }
        var col = on ? colour.on : colour.off;
        ctrl.fg = col.fg;
        ctrl.bg = col.bg;
        ui.ctrls.draw(ui.overlay.g2, ctrl);
    };
    Bangle.prependListener("drag", onDrag);
    WIDGETS["hid"] = {
        area: "tr",
        sortorder: -20,
        draw: function () { },
        width: 0,
    };
})();
