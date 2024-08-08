{
  /**
  * ---------------------------------------------------------------
  * 1. Module dependencies and initial configurations
  * ---------------------------------------------------------------
  */

  let background = require("clockbg");
  let storage = require("Storage");
  let locale = require("locale");
  let widgets = require("widget_utils");
  let date = new Date();
  let configNumber = (storage.readJSON("boxclk.json", 1) || {}).selectedConfig || 0;
  let fileName = 'boxclk' + (configNumber > 0 ? `-${configNumber}` : '') + '.json';
  // Add a condition to check if the file exists, if it does not, default to 'boxclk.json'
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

  /**
  * ---------------------------------------------------------------
  * 2. Graphical and visual configurations
  * ---------------------------------------------------------------
  */

  let w = g.getWidth();
  let h = g.getHeight();
  let totalWidth, totalHeight;
  let drawTimeout;

  /**
  * ---------------------------------------------------------------
  * 3. Touchscreen Handlers
  * ---------------------------------------------------------------
  */

  let touchHandler;
  let dragHandler;
  let movementDistance = 0;

  /**
  * ---------------------------------------------------------------
  * 4. Font loading function
  * ---------------------------------------------------------------
  */

  let loadCustomFont = function() {
    Graphics.prototype.setFontBrunoAce = function() {
      // Actual height 23 (24 - 2)
      return this.setFontCustom(
        E.toString(require('heatshrink').decompress(atob('ABMHwADBh4DKg4bKgIPDAYUfAYV/AYX/AQMD/gmC+ADBn/AByE/GIU8AYUwLxcfAYX/8AnB//4JIP/FgMP4F+CQQBBjwJBFYRbBAd43DHoJpBh/g/xPEK4ZfDgEEORKDDAY8////wADLfZrTCgITBnhEBAYJMBAYMPw4DCM4QDjhwDCjwDBn0+AYMf/gDBh/4AYMH+ADBLpc4ToK/NGYZfnAYcfL4U/x5fBW4LvB/7vC+LvBgHAsBfIn76Cn4WBcYQDFEgJ+CQQYDyH4L/BAZbHLNYjjCAZc8ngDunycBZ4KkBa4KwBnEHY4UB+BfMgf/ZgMH/4XBc4cf4F/gE+ZgRjwAYcfj5jBM4U4M4RQBM4UA8BjIngDFEYJ8BAYUDAYQvCM4ZxBC4V+AYQvBnkBQ4M8gabBJQPAI4WAAYM/GYQaBAYJKCnqyCn5OCn4aBAYIaBAYJPCU4IABnBhIuDXCFAMD+Z/BY4IDBQwOPwEfv6TDAYUPAcwrDAYQ7BAYY/BI4cD8bLCK4RfEAA0BRYTeDcwIrFn0Pw43Bg4DugYDBjxBBU4SvDMYMH/5QBgP/LAQAP8EHN4UPwADHB4YAHA'))),
        46,
        atob("CBEdChgYGhgaGBsaCQ=="),
        32|65536
      );
    };
  };

  /**
  * ---------------------------------------------------------------
  * 5. Initial settings of boxes and their positions
  * ---------------------------------------------------------------
  */

  let boxKeys = Object.keys(boxes);

  boxKeys.forEach((key) => {
    let boxConfig = boxes[key];
    boxPos[key] = {
      x: w * boxConfig.boxPos.x,
      y: h * boxConfig.boxPos.y
    };
    isDragging[key] = false;
    wasDragging[key] = false;
  });

  /**
  * ---------------------------------------------------------------
  * 6. Text and drawing functions
  * ---------------------------------------------------------------
  */

  // Overwrite the setColor function to allow the
  // use of (x) in g.theme.x as a string
  // in your JSON config ("fg", "bg", "fg2", "bg2", "fgH", "bgH")
  let modSetColor = function() {
    // Save the original setColor function
    g_setColor = g.setColor;
    // Overwrite setColor with the new function
    g.setColor = function(color) {
      if (typeof color === "string" && color in g.theme) {
        g_setColor.call(g, g.theme[color]);
      } else {
        g_setColor.call(g, color);
      }
    };
  };

  let restoreSetColor = function() {
    // Restore the original setColor function
    if (g_setColor) {
      g.setColor = g_setColor;
    }
  };

  // Overwrite the drawString function
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
    g.setFontAlign(0,0);
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
    // Display save icon for 2 seconds
    setTimeout(() => {
      g.clearRect(w / 2 - 24, h / 2 - 24, w / 2 + 24, h / 2 + 24);
      draw(boxes);
    }, 2000);
  };

  /**
  * ---------------------------------------------------------------
  * 7. String forming helper functions
  * ---------------------------------------------------------------
  */

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
    return month + " " + dayOfMonthStr + (short ? '' : (", " + year)); // not including year for short version
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

  /**
  * ---------------------------------------------------------------
  * 8. Main draw function
  * ---------------------------------------------------------------
  */

  let draw = (function() {
    let updatePerMinute = true; // variable to track the state of time display

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
        boxes.date.string = (
          modString(boxes.date,
          getDate(isBool(boxes.date.short, true),
          isBool(boxes.date.shortMonth, true),
          isBool(boxes.date.disableSuffix, false)
        )));
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
        g.drawString(
          boxItem,
          boxItem.string,
          boxPos[boxKey].x +  boxItem.xOffset,
          boxPos[boxKey].y +  boxItem.yOffset
        );
      });
      if (!Object.values(isDragging).some(Boolean)) {
        if (drawTimeout) clearTimeout(drawTimeout);
        let interval = updatePerMinute ? 60000 - (Date.now() % 60000) : 1000;
        drawTimeout = setTimeout(() => draw(boxes), interval);
      }
    };
  })();

  /**
  * ---------------------------------------------------------------
  * 9. Helper function for touch event
  * ---------------------------------------------------------------
  */

  let touchInText = function(e, boxItem, boxKey) {
    calcBoxSize(boxItem);
    const pos = calcBoxPos(boxKey);
    return e.x >= pos.x1 &&
          e.x <= pos.x2 &&
          e.y >= pos.y1 &&
          e.y <= pos.y2;
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

  /**
  * ---------------------------------------------------------------
  * 10. Setup function to configure event handlers
  * ---------------------------------------------------------------
  */

  let setup = function() {
    // ------------------------------------
    // Define the touchHandler function
    // ------------------------------------
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
        if (!Object.values(isDragging).some(Boolean)) { // check if no boxes are being dragged
          deselectAllBoxes();
          if (doubleTapTimer) {
            clearTimeout(doubleTapTimer);
            doubleTapTimer = null;
            // Save boxesConfig on double tap outside of any box and when no boxes are being dragged
            Object.keys(boxPos).forEach((boxKey) => {
              boxesConfig[boxKey].boxPos.x = (boxPos[boxKey].x / w).toFixed(3);
              boxesConfig[boxKey].boxPos.y = (boxPos[boxKey].y / h).toFixed(3);
            });
            storage.write(fileName, JSON.stringify(boxesConfig));
            displaySaveIcon();
            return;
          }
        } else {
          // if any box is being dragged, just deselect all without saving
          deselectAllBoxes();
        }
      }
      if (Object.values(wasDragging).some(Boolean) || !boxTouched) {
        draw(boxes);
      }
      doubleTapTimer = setTimeout(() => {
        doubleTapTimer = null;
      }, 500); // Increase or decrease this value based on the desired double tap timing
      movementDistance = 0;
    };

    // ------------------------------------
    // Define the dragHandler function
    // ------------------------------------
    dragHandler = function(e) {
      // Check if any box is being dragged
      if (!Object.values(isDragging).some(Boolean)) return;
      // Calculate the movement distance
      movementDistance += Math.abs(e.dx) + Math.abs(e.dy);
      // Check if the movement distance exceeds a threshold
      if (movementDistance > 1) {
        boxKeys.forEach((boxKey) => {
          if (isDragging[boxKey]) {
            widgets.hide();
            let boxItem = boxes[boxKey];
            calcBoxSize(boxItem);
            let newX = boxPos[boxKey].x + e.dx;
            let newY = boxPos[boxKey].y + e.dy;
            if (newX - totalWidth / 2 >= 0 &&
                newX + totalWidth / 2 <= w &&
                newY - totalHeight / 2 >= 0 &&
                newY + totalHeight / 2 <= h ) {
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
      mode : "clock",
      remove : function() {
        // Remove event handlers, stop draw timer, remove custom font if used
        Bangle.removeListener('touch', touchHandler);
        Bangle.removeListener('drag', dragHandler);
        if (drawTimeout) clearTimeout(drawTimeout);
        drawTimeout = undefined;
        delete Graphics.prototype.setFontBrunoAce;
        // Restore original drawString function (no outlines)
        g.drawString = g_drawString;
        restoreSetColor();
        widgets.show();
      }
    });
    loadCustomFont();
    draw(boxes);
  };

  /**
  * ---------------------------------------------------------------
  * 11. Main execution part
  * ---------------------------------------------------------------
  */

  Bangle.loadWidgets();
  widgets.swipeOn();
  modSetColor();
  setup();
}
