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
            this.width = g.getWidth() - 2 * 2;
            this.height = g.getHeight() - 24 - 10;
            this.g2 = Graphics.createArrayBuffer(this.width, this.height, 4, { msb: true });
            this.g2.transparent = 13;
            this.renderG2();
        }
        Overlay.prototype.setBottom = function (bottom) {
            var g2 = this.g2;
            var y = bottom - this.height;
            Bangle.setLCDOverlay(g2, 2, y - 10);
        };
        Overlay.prototype.hide = function () {
            Bangle.setLCDOverlay();
        };
        Overlay.prototype.renderG2 = function () {
          var border = 3;
          this.g2
              .reset()
              .setColor(13)
              .fillRect(0, 0, this.width, this.height) // Background (Transparent)

              .setColor(colour.on.bg)
              .fillRect({
                  x: 0, 
                  y: 0, 
                  w: this.width, 
                  h: this.height, 
                  r: 20
              }) // The Outer Shape

              .setColor(g.theme.bg == "0" ? "#000" : g.theme.bg)
              .fillRect({
                  x: border, 
                  y: border, 
                  w: this.width - (border * 2), 
                  h: this.height - (border * 2), 
                  r: 16 
              });
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
            bg: g.theme.dark?"#fff":"#bbb",
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
                { x: width / 4 - 10, y: centreY + circleGapY },
                { x: width / 2, y: centreY + circleGapY },
                { x: width * 3 / 4 + 10, y: centreY + circleGapY },
            ].map(function (xy, i) {
              var ctrl = xy;
              var from = controls[i];

              // Wrap into a cb function
              ctrl.cb = function(tap) {
                if (tap) return from.toggle();
                return from.get();
              };

              ctrl.text = from.text;
              ctrl.img = from.img;
              Object.assign(ctrl, {}, ctrl.cb(false) ? colour.on : colour.off);

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
                    .drawImage(ctrl.img,ctrl.x-12,ctrl.y-12)
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
        // ... inside initUI ...
var controls = [
  {
    text: "BLE",
    img:atob("GBiBAAAAAAAYAAAcAAAfAAAbgAAZ4AYYYAcY4AOZwAH/AAB+AAA8AAA8AAB+AAD/AAOZwAcY4A4YYAQZ4AAbgAAfAAAcAAAYAAAAAA=="),
    get: () => NRF.getSecurityStatus().advertising||NRF.getSecurityStatus().connected, 
    toggle: () => {
      if (NRF.getSecurityStatus().advertising||NRF.getSecurityStatus().connected) NRF.sleep(); else NRF.wake();
    }
  },
  {
    text: "DnD",
    img:atob("GBiBAAAAAAAAAAA8AAAYAAAYAAD/AAH/gAH/gAP/wAP/wAP/wAP/wAP/wAP/wAP/wAf/4Af/4A//8B//+A//8AAAAAA8AAAAAAAAAA=="),
    get: () => {
      return require("Storage").readJSON("setting.json", 1).quiet === 1;
    },
    toggle: () => {
      let s = require("Storage").readJSON("setting.json", 1);
      s.quiet = s.quiet ? 0 : 1;
      require("Storage").writeJSON("setting.json", s);
      //if qm widget is present, update that
      if (typeof WIDGETS === "object" && "qmsched" in WIDGETS) WIDGETS["qmsched"].draw();
      if (global.setAppQuietMode) setAppQuietMode(s.quiet);
    }
  },
  {
    text: "HRM",
    img:atob("GBiBAAAAAA+B8B/D+D/n/H///v/////////P///P///H/3+WQAC2Xj82HB86uA/48Af54AP9wAH9gAD/AAB+AAA8AAAYAAAAAAAAAA=="),
    get: () => Bangle.isHRMOn(),
    toggle: () => {
      Bangle.setHRMPower(!Bangle.isHRMOn(), "widhid");
    }
  },
  {
    text: "clock",
    img:atob("GBiBAAB+AAP/wAeB4A4AcBgAGDAADHAYDmAYBmAYBsAYA8AYA8AYA8AcA8AOA8AHA2ADBmAABnAADjAADBgAGA4AcAeB4AP/wAB+AA=="),
    get: () => false, // Always looks "off" until pressed
    toggle: () => {Bangle.showClock(); return "close";}
  },
  {
    text: "launch",
    img:atob("GBiBAAAAAAAAAAAAAA/AwB/gwBhgwBhn+Bhn+BhgwB/gwA/AwAAAAAAAAA/D8B/n+BhmGBhmGBhmGBhmGB/n+A/D8AAAAAAAAAAAAA=="),
    get: () => false,
    toggle: () => {Bangle.showLauncher(); return "close";}
  },
  {
    text: "settings",
    img:atob("GBiBAAA8AAB+AAR+IA7/cB//+D///B//+A/D8B8A+H8A/v4Af/4Af/4Af/4Af38A/h8A+A/D8B//+D///B//+A7/cAR+IAB+AAA8AA=="),
    get: () => false,
    toggle: () => {Bangle.load("setting.app.js"); return "close";}
  }
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
                    if (e.y <= 10) {
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
  var origBuzz;
    var onCtrlTap = function(ctrl) {
      Bangle.buzz(20);

      var result = ctrl.cb(true); 
      if (result === "close") {
        terminateUI();
        return;
      }
      ui.ctrls.controls.forEach(function(c) {
          var isActive = c.cb(false);
          Object.assign(c, isActive ? colour.on : colour.off);
      });

      // Clear and Redraw the buffer
      ui.overlay.renderG2();
      ui.ctrls.draw(ui.overlay.g2);
      
      // Force an update through the overlay
      var y = g.getHeight() - ui.overlay.height; 
      Bangle.setLCDOverlay(ui.overlay.g2, 2, y - 10);
      Bangle.buzz(10);
      
  };

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
    
    Bangle.prependListener("drag", onDrag);
    Bangle.on("lock", terminateUI);
})();
