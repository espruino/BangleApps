let background = require("clockbg");
Modules.addCached("widget_utils", function() {
    exports.hide = function() {
        exports.cleanup();
        if (!global.WIDGETS) return;
        g.reset();
        for (var w of global.WIDGETS) {
            if (w._draw) return;
            w._draw = w.draw;
            w.draw = () => {};
            w._area = w.area;
            w.area = "";
            if (w.x != undefined) g.clearRect(w.x, w.y, w.x + w.width - 1, w.y + 23);
        }
    };
    exports.show = function() {
        exports.cleanup();
        if (!global.WIDGETS) return;
        for (var w of global.WIDGETS) {
            if (!w._draw) return;
            w.draw = w._draw;
            w.area = w._area;
            delete w._draw;
            delete w._area;
            w.draw(w);
        }
    };
    exports.cleanup = function() {
        delete exports.autohide;
        delete Bangle.appRect;
        if (exports.swipeHandler) {
            Bangle.removeListener("swipe", exports.swipeHandler);
            delete exports.swipeHandler;
        }
        if (exports.animInterval) {
            clearInterval(exports.animInterval);
            delete exports.animInterval;
        }
        if (exports.hideTimeout) {
            clearTimeout(exports.hideTimeout);
            delete exports.hideTimeout;
        }
        if (exports.origDraw) {
            Bangle.drawWidgets = exports.origDraw;
            delete exports.origDraw;
        }
    }
    exports.swipeOn = function(autohide) {
        if (process.env.HWVERSION !== 2) return exports.hide();
        exports.cleanup();
        if (!global.WIDGETS) return;
        exports.autohide = autohide === undefined ? 2000 : autohide;
        Bangle.appRect = {
            x: 0,
            y: 0,
            w: g.getWidth(),
            h: g.getHeight(),
            x2: g.getWidth() - 1,
            y2: g.getHeight() - 1
        };
        let og = Graphics.createArrayBuffer(g.getWidth(), 26, 16, {
            msb: true
        });
        og.theme = g.theme;
        og._reset = og.reset;
        og.reset = function() {
            return this._reset().setColor(g.theme.fg).setBgColor(g.theme.bg);
        };
        og.reset().clearRect(0, 0, og.getWidth(), 23).fillRect(0, 24, og.getWidth(), 25);
        let _g = g;
        let offset = -24;

        function queueDraw() {
            Bangle.appRect.y = offset + 24;
            Bangle.appRect.h = 1 + Bangle.appRect.y2 - Bangle.appRect.y;
            if (offset > -24) Bangle.setLCDOverlay(og, 0, offset);
            else Bangle.setLCDOverlay();
        }
        for (var w of global.WIDGETS) {
            if (w._draw) continue;
            w._draw = w.draw;
            w.draw = function() {
                g = og;
                this._draw(this);
                g = _g;
                if (offset > -24) queueDraw();
            };
            w._area = w.area;
            if (w.area.startsWith("b")) w.area = "t" + w.area.substr(1);
        }
        exports.origDraw = Bangle.drawWidgets;
        Bangle.drawWidgets = () => {
            g = og;
            exports.origDraw();
            g = _g;
        };

        function anim(dir, callback) {
            if (exports.animInterval) clearInterval(exports.interval);
            exports.animInterval = setInterval(function() {
                offset += dir;
                let stop = false;
                if (dir > 0 && offset >= 0) {
                    stop = true;
                    offset = 0;
                } else if (dir < 0 && offset < -23) {
                    stop = true;
                    offset = -24;
                }
                if (stop) {
                    clearInterval(exports.animInterval);
                    delete exports.animInterval;
                    if (callback) callback();
                }
                queueDraw();
            }, 50);
        }
        exports.swipeHandler = function(lr, ud) {
            if (exports.hideTimeout) {
                clearTimeout(exports.hideTimeout);
                delete exports.hideTimeout;
            }
            let cb;
            if (exports.autohide > 0) cb = function() {
                exports.hideTimeout = setTimeout(function() {
                    anim(-4);
                }, exports.autohide);
            }
            if (ud > 0 && offset < 0) anim(4, cb);
            if (ud < 0 && offset > -24) anim(-4);
        };
        Bangle.on("swipe", exports.swipeHandler);
        Bangle.drawWidgets();
    };
});
{
    let storage = require("Storage");
    let locale = require("locale");
    let widgets = require("widget_utils");
    let date = new Date();
    let configNumber = (storage.readJSON("boxclk.json", 1) || {}).selectedConfig || 0;
    let fileName = 'boxclk' + (configNumber > 0 ? `-${configNumber}` : '') + '.json';
    if (!storage.read(fileName)) {
        fileName = 'boxclk.json';
    }
    let boxesConfig = storage.readJSON(fileName, 1) || {};
    let boxes = {};
    let boxPos = {};
    let isDragging = {};
    let wasDragging = {};
    let doubleTapTimer = null;
    let g_setColor;
    let saveIcon = require("heatshrink").decompress(atob("mEwwkEogA/AHdP/4AK+gWVDBQWNAAIuVGBAIB+UQdhMfGBAHBCxUAgIXHIwPyCxQwEJAgXB+MAl/zBwQGBn8ggQjBGAQXG+EA/4XI/8gBIQXTGAMPC6n/C6HzkREBC6YACC6QAFC57aHCYIXOOgLsEn4XPABIX/C6vykQAEl6/WgCQBC5imFAAT2BC5gCBI4oUCC5x0IC/4X/C4K8Bl4XJ+TCCC4wKBABkvC4tEEoMQCxcBB4IWEC4XyDBUBFwIXGJAIAOIwowDABoWGGB4uHDBwWJAH4AzA"));
    let w = g.getWidth();
    let h = g.getHeight();
    let totalWidth, totalHeight;
    let drawTimeout;
    let touchHandler;
    let dragHandler;
    let movementDistance = 0;
    let loadCustomFont = function() {
        Graphics.prototype.setFontBrunoAce = function() {
            return this.setFontCustom(E.toString(require('heatshrink').decompress(atob('ABMHwADBh4DKg4bKgIPDAYUfAYV/AYX/AQMD/gmC+ADBn/AByE/GIU8AYUwLxcfAYX/8AnB//4JIP/FgMP4F+CQQBBjwJBFYRbBAd43DHoJpBh/g/xPEK4ZfDgEEORKDDAY8////wADLfZrTCgITBnhEBAYJMBAYMPw4DCM4QDjhwDCjwDBn0+AYMf/gDBh/4AYMH+ADBLpc4ToK/NGYZfnAYcfL4U/x5fBW4LvB/7vC+LvBgHAsBfIn76Cn4WBcYQDFEgJ+CQQYDyH4L/BAZbHLNYjjCAZc8ngDunycBZ4KkBa4KwBnEHY4UB+BfMgf/ZgMH/4XBc4cf4F/gE+ZgRjwAYcfj5jBM4U4M4RQBM4UA8BjIngDFEYJ8BAYUDAYQvCM4ZxBC4V+AYQvBnkBQ4M8gabBJQPAI4WAAYM/GYQaBAYJKCnqyCn5OCn4aBAYIaBAYJPCU4IABnBhIuDXCFAMD+Z/BY4IDBQwOPwEfv6TDAYUPAcwrDAYQ7BAYY/BI4cD8bLCK4RfEAA0BRYTeDcwIrFn0Pw43Bg4DugYDBjxBBU4SvDMYMH/5QBgP/LAQAP8EHN4UPwADHB4YAHA'))), 46, atob("CBEdChgYGhgaGBsaCQ=="), 32 | 65536);
        };
    };
    let boxKeys = Object.keys(boxes);
    boxKeys.forEach((key) => {
        let boxConfig = boxes[key];
        boxPos[key] = {
            let background = require("clockbg");
            Modules.addCached("widget_utils", function() {
        };
        isDragging[key] = false;
        wasDragging[key] = false;
    });
    let modSetColor = function() {
        g_setColor = g.setColor;
        g.setColor = function(color) {
            if (typeof color === "string" && color in g.theme) {
                g_setColor.call(g, g.theme[color]);
            } else {
                g_setColor.call(g, color);
            }
        };
    };
    let restoreSetColor = function() {
        if (g_setColor) {
            g.setColor = g_setColor;
        }
    };
    let g_drawString = g.drawString;
    g.drawString = function(box, str, x, y) {
        outlineText(box, str, x, y);
        g.setColor(box.color);
        g_drawString.call(g, str, x, y);
    };
    let outlineText = function(box, str, x, y) {
        let px = box.outline;
        let dx = [-px, 0, px, -px, px, -px, 0, px];
        let dy = [-px, -px, -px, 0, 0, px, px, px];
        g.setColor(box.outlineColor);
        for (let i = 0; i < dx.length; i++) {
            g_drawString.call(g, str, x + dx[i], y + dy[i]);
        }
    };
    let calcBoxSize = function(boxItem) {
        g.reset();
        g.setFontAlign(0, 0);
        g.setFont(boxItem.font, boxItem.fontSize);
        let strWidth = g.stringWidth(boxItem.string) + 2 * boxItem.outline;
        let fontHeight = g.getFontHeight() + 2 * boxItem.outline;
        totalWidth = strWidth + 2 * boxItem.xPadding;
        totalHeight = fontHeight + 2 * boxItem.yPadding;
    };
    let calcBoxPos = function(boxKey) {
        return {
            x1: boxPos[boxKey].x - totalWidth / 2,
            y1: boxPos[boxKey].y - totalHeight / 2,
            x2: boxPos[boxKey].x + totalWidth / 2,
            y2: boxPos[boxKey].y + totalHeight / 2
        };
    };
    let displaySaveIcon = function() {
        draw(boxes);
        g.drawImage(saveIcon, w / 2 - 24, h / 2 - 24);
        setTimeout(() => {
            g.clearRect(w / 2 - 24, h / 2 - 24, w / 2 + 24, h / 2 + 24);
            draw(boxes);
        }, 2000);
    };
    let isBool = function(val, defaultVal) {
        return typeof val !== 'undefined' ? Boolean(val) : defaultVal;
    };
    let getDate = function(short, shortMonth, disableSuffix) {
        const date = new Date();
        const dayOfMonth = date.getDate();
        const month = shortMonth ? locale.month(date, 1) : locale.month(date, 0);
        const year = date.getFullYear();
        let suffix;
        if ([1, 21, 31].includes(dayOfMonth)) {
            suffix = "st";
        } else if ([2, 22].includes(dayOfMonth)) {
            suffix = "nd";
        } else if ([3, 23].includes(dayOfMonth)) {
            suffix = "rd";
        } else {
            suffix = "th";
        }
        let dayOfMonthStr = disableSuffix ? dayOfMonth : dayOfMonth + suffix;
        return month + " " + dayOfMonthStr + (short ? '' : (", " + year));
    };
    let getDayOfWeek = function(date, short) {
        return locale.dow(date, short ? 1 : 0);
    };
    locale.meridian = function(date, short) {
        let hours = date.getHours();
        let meridian = hours >= 12 ? 'PM' : 'AM';
        return short ? meridian[0] : meridian;
    };
    let modString = function(boxItem, data) {
        let prefix = boxItem.prefix || '';
        let suffix = boxItem.suffix || '';
        return prefix + data + suffix;
    };
    let draw = (function() {
        let updatePerMinute = true;
        return function(boxes) {
            date = new Date();
            g.clear();
            background.fillRect(Bangle.appRect);
            if (boxes.time) {
                boxes.time.string = modString(boxes.time, locale.time(date, isBool(boxes.time.short, true) ? 1 : 0));
                updatePerMinute = isBool(boxes.time.short, true);
            }
            if (boxes.meridian) {
                boxes.meridian.string = modString(boxes.meridian, locale.meridian(date, isBool(boxes.meridian.short, true)));
            }
            if (boxes.date) {
                boxes.date.string = (modString(boxes.date, getDate(isBool(boxes.date.short, true), isBool(boxes.date.shortMonth, true), isBool(boxes.date.disableSuffix, false))));
            }
            if (boxes.dow) {
                boxes.dow.string = modString(boxes.dow, getDayOfWeek(date, isBool(boxes.dow.short, true)));
            }
            if (boxes.batt) {
                boxes.batt.string = modString(boxes.batt, E.getBattery());
            }
            if (boxes.step) {
                boxes.step.string = modString(boxes.step, Bangle.getHealthStatus("day").steps);
            }
            boxKeys.forEach((boxKey) => {
                let boxItem = boxes[boxKey];
                calcBoxSize(boxItem);
                const pos = calcBoxPos(boxKey);
                if (isDragging[boxKey]) {
                    g.setColor(boxItem.border);
                    g.drawRect(pos.x1, pos.y1, pos.x2, pos.y2);
                }
                g.drawString(boxItem, boxItem.string, boxPos[boxKey].x + boxItem.xOffset, boxPos[boxKey].y + boxItem.yOffset);
            });
            if (!Object.values(isDragging).some(Boolean)) {
                if (drawTimeout) clearTimeout(drawTimeout);
                let interval = updatePerMinute ? 60000 - (Date.now() % 60000) : 1000;
                drawTimeout = setTimeout(() => draw(boxes), interval);
            }
        };
    })();
    let touchInText = function(e, boxItem, boxKey) {
        calcBoxSize(boxItem);
        const pos = calcBoxPos(boxKey);
        return e.x >= pos.x1 && e.x <= pos.x2 && e.y >= pos.y1 && e.y <= pos.y2;
    };
    let deselectAllBoxes = function() {
        Object.keys(isDragging).forEach((boxKey) => {
            isDragging[boxKey] = false;
        });
        restoreSetColor();
        widgets.show();
        widgets.swipeOn();
        modSetColor();
    };
    let setup = function() {
        touchHandler = function(zone, e) {
            wasDragging = Object.assign({}, isDragging);
            let boxTouched = false;
            boxKeys.forEach((boxKey) => {
                if (touchInText(e, boxes[boxKey], boxKey)) {
                    isDragging[boxKey] = true;
                    wasDragging[boxKey] = true;
                    boxTouched = true;
                }
            });
            if (!boxTouched) {
                if (!Object.values(isDragging).some(Boolean)) {
                    deselectAllBoxes();
                    if (doubleTapTimer) {
                        clearTimeout(doubleTapTimer);
                        doubleTapTimer = null;
                        Object.keys(boxPos).forEach((boxKey) => {
                            boxesConfig[boxKey].boxPos.x = (boxPos[boxKey].x / w).toFixed(3);
                            boxesConfig[boxKey].boxPos.y = (boxPos[boxKey].y / h).toFixed(3);
                        });
                        storage.write(fileName, JSON.stringify(boxesConfig));
                        displaySaveIcon();
                        return;
                    }
                } else {
                    deselectAllBoxes();
                }
            }
            if (Object.values(wasDragging).some(Boolean) || !boxTouched) {
                draw(boxes);
            }
            doubleTapTimer = setTimeout(() => {
                doubleTapTimer = null;
            }, 500);
            movementDistance = 0;
        };
        dragHandler = function(e) {
            if (!Object.values(isDragging).some(Boolean)) return;
            movementDistance += Math.abs(e.dx) + Math.abs(e.dy);
            if (movementDistance > 1) {
                boxKeys.forEach((boxKey) => {
                    if (isDragging[boxKey]) {
                        widgets.hide();
                        let boxItem = boxes[boxKey];
                        calcBoxSize(boxItem);
                        let newX = boxPos[boxKey].x + e.dx;
                        let newY = boxPos[boxKey].y + e.dy;
                        if (newX - totalWidth / 2 >= 0 && newX + totalWidth / 2 <= w && newY - totalHeight / 2 >= 0 && newY + totalHeight / 2 <= h) {
                            boxPos[boxKey].x = newX;
                            boxPos[boxKey].y = newY;
                        }
                        const pos = calcBoxPos(boxKey);
                        g.clearRect(pos.x1, pos.y1, pos.x2, pos.y2);
                    }
                });
                draw(boxes);
            }
        };
        Bangle.on('touch', touchHandler);
        Bangle.on('drag', dragHandler);
        Bangle.setUI({
            mode: "clock",
            remove: function() {
                Bangle.removeListener('touch', touchHandler);
                Bangle.removeListener('drag', dragHandler);
                if (drawTimeout) clearTimeout(drawTimeout);
                drawTimeout = undefined;
                delete Graphics.prototype.setFontBrunoAce;
                g.drawString = g_drawString;
                restoreSetColor();
                widgets.show();
            }
        });
        loadCustomFont();
        draw(boxes);
    };
    Bangle.loadWidgets();
    widgets.swipeOn();
    modSetColor();
    setup();
}
