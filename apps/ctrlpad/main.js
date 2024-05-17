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
                .setColor(g.theme.bg)
                .fillRect(0, 0, this.width, this.height)
                .setColor(colour.on.bg)
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
        function Controls(g, controls) {
            var height = g.getHeight();
            var centreY = height / 2;
            var circleGapY = 30;
            var width = g.getWidth();
            this.controls = [
                { x: width / 4 - 10, y: centreY - circleGapY },
                { x: width / 2, y: centreY - circleGapY },
                { x: width * 3 / 4 + 10, y: centreY - circleGapY },
                { x: width / 3, y: centreY + circleGapY },
                { x: width * 2 / 3, y: centreY + circleGapY },
            ].map(function (xy, i) {
                var ctrl = xy;
                var from = controls[i];
                ctrl.text = from.text;
                ctrl.cb = from.cb;
                Object.assign(ctrl, from.cb(false) ? colour.on : colour.off);
                return ctrl;
            });
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
    var initUI = function () {
        if (ui)
            return;
        var controls = [
            {
                text: "BLE",
                cb: function (tap) {
                    var on = NRF.getSecurityStatus().advertising;
                    if (tap) {
                        if (on)
                            NRF.sleep();
                        else
                            NRF.wake();
                    }
                    return on !== tap;
                }
            },
            {
                text: "DnD",
                cb: function (tap) {
                    var on;
                    if ((on = !!origBuzz)) {
                        if (tap) {
                            Bangle.buzz = origBuzz;
                            origBuzz = undefined;
                        }
                    }
                    else {
                        if (tap) {
                            origBuzz = Bangle.buzz;
                            Bangle.buzz = function () { return Promise.resolve(); };
                            setTimeout(function () {
                                if (!origBuzz)
                                    return;
                                Bangle.buzz = origBuzz;
                                origBuzz = undefined;
                            }, 1000 * 60 * 10);
                        }
                    }
                    return on !== tap;
                }
            },
            {
                text: "HRM",
                cb: function (tap) {
                    var _a;
                    var id = "widhid";
                    var hrm = (_a = Bangle._PWR) === null || _a === void 0 ? void 0 : _a.HRM;
                    var off = !hrm || hrm.indexOf(id) === -1;
                    if (off) {
                        if (tap)
                            Bangle.setHRMPower(1, id);
                    }
                    else if (tap) {
                        Bangle.setHRMPower(0, id);
                    }
                    return !off !== tap;
                }
            },
            {
                text: "clk",
                cb: function (tap) {
                    if (tap)
                        Bangle.showClock(), terminateUI();
                    return true;
                },
            },
            {
                text: "lch",
                cb: function (tap) {
                    if (tap)
                        Bangle.showLauncher(), terminateUI();
                    return true;
                },
            },
        ];
        var overlay = new Overlay();
        ui = {
            overlay: overlay,
            ctrls: new Controls(overlay.g2, controls),
        };
        ui.ctrls.draw(ui.overlay.g2);
    };
    var terminateUI = function () {
        state = 0;
        ui === null || ui === void 0 ? void 0 : ui.overlay.hide();
        ui = undefined;
    };
    var onSwipe = function () {
        var _a;
        switch (state) {
            case 0:
            case 2:
                return;
            case 1:
            case 3:
                (_a = E.stopEventPropagation) === null || _a === void 0 ? void 0 : _a.call(E);
        }
    };
    Bangle.prependListener('swipe', onSwipe);
    var onDrag = (function (e) {
        var _a, _b, _c;
        var dragDistance = 30;
        if (e.b === 0)
            touchDown = startedUpDrag = false;
        switch (state) {
            case 2:
                if (e.b === 0)
                    state = 0;
                break;
            case 0:
                if (e.b && !touchDown) {
                    if (e.y <= 40) {
                        state = 1;
                        startY = e.y;
                        (_a = E.stopEventPropagation) === null || _a === void 0 ? void 0 : _a.call(E);
                    }
                    else {
                        state = 2;
                    }
                }
                break;
            case 1:
                if (e.b === 0) {
                    if (e.y > startY + dragDistance) {
                        initUI();
                        state = 3;
                        startY = 0;
                        Bangle.prependListener("touch", onTouch);
                        Bangle.buzz(20);
                        ui.overlay.setBottom(g.getHeight());
                    }
                    else {
                        terminateUI();
                        break;
                    }
                }
                else {
                    var dragOffset = 32;
                    initUI();
                    ui.overlay.setBottom(e.y - dragOffset);
                }
                (_b = E.stopEventPropagation) === null || _b === void 0 ? void 0 : _b.call(E);
                break;
            case 3:
                (_c = E.stopEventPropagation) === null || _c === void 0 ? void 0 : _c.call(E);
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
                                terminateUI();
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
        Bangle.buzz(20);
        var col = ctrl.cb(true) ? colour.on : colour.off;
        ctrl.fg = col.fg;
        ctrl.bg = col.bg;
        ui.ctrls.draw(ui.overlay.g2, ctrl);
    };
    Bangle.prependListener("drag", onDrag);
    Bangle.on("lock", terminateUI);
})();
