{
  // 1. Module dependencies and initial configurations
  let background = require("clockbg");
  let storage = require("Storage");
  let locale = require("locale");
  let widgets = require("widget_utils");
  let bgImage;
  let configNumber = (storage.readJSON("boxclk.json", 1) || {}).selectedConfig || 0;
  let fileName = 'boxclk' + (configNumber > 0 ? `-${configNumber}` : '') + '.json';
  if (!storage.read(fileName)) {
    fileName = 'boxclk.json';
  }
  let boxesConfig = storage.readJSON(fileName, 1) || {};
  let boxes = {};
  let isDragging = false;
  let doubleTapTimer = null;
  let g_setColor;

  let saveIcon = require("heatshrink").decompress(atob("mEwwkEogA/AHdP/4AK+gWVDBQWNAAIuVGBAIB+UQdhMfGBAHBCxUAgIXHIwPyCxQwEJAgXB+MAl/zBwQGBn8ggQjBGAQXG+EA/4XI/8gBIQXTGAMPC6n/C6HzkREBC6YACC6QAFC57aHCYIXOOgLsEn4XPABIX/C6vykQAEl6/WgCQBC5imFAAT2BC5gCBI4oUCC5x0IC/4X/C4K8Bl4XJ+TCCC4wKBABkvC4tEEoMQCxcBB4IWEC4XyDBUBFwIXGJAIAOIwowDABoWGGB4uHDBwWJAH4AzA"));

  // 2. Graphical and visual configurations
  let w = g.getWidth();
  let h = g.getHeight();
  let drawTimeout;

  // 3. Event handlers
  let eventHandlers = {
    touchHandler: function(zone, e) {
      let boxTouched = false;
      let touchedBox = null;
    
      for (let boxKey in boxes) {
        if (touchInText(e, boxes[boxKey])) {
          touchedBox = boxKey;
          boxTouched = true;
          break;
        }
      }
    
      if (boxTouched) {
      // Toggle the selected state of the touched box
        boxes[touchedBox].selected = !boxes[touchedBox].selected;
      
      // Update isDragging based on whether any box is selected
        isDragging = Object.values(boxes).some(box => box.selected);
        
        if (isDragging) {
          widgets.hide();
        } else {
          deselectAllBoxes();
        }
      } else {
      // If tapped outside any box, deselect all boxes
        deselectAllBoxes();
      }
    
    // Always redraw after a touch event
      draw();
    
    // Handle double tap for saving
      if (!boxTouched && !isDragging) {
        if (doubleTapTimer) {
          clearTimeout(doubleTapTimer);
          doubleTapTimer = null;
          for (let boxKey in boxes) {
            boxesConfig[boxKey].boxPos.x = (boxes[boxKey].pos.x / w).toFixed(3);
            boxesConfig[boxKey].boxPos.y = (boxes[boxKey].pos.y / h).toFixed(3);
          }
          storage.write(fileName, JSON.stringify(boxesConfig));
          displaySaveIcon();
          return;
        }
    
        doubleTapTimer = setTimeout(() => {
          doubleTapTimer = null;
        }, 500);
      }
    },

    dragHandler: function(e) {
      if (!isDragging) return;
  
    // Stop propagation of the drag event to prevent other handlers
      E.stopEventPropagation();
    
      for (let key in boxes) {
        if (boxes[key].selected) {
          let boxItem = boxes[key];
          calcBoxSize(boxItem);
          let newX = boxItem.pos.x + e.dx;
          let newY = boxItem.pos.y + e.dy;
    
          if (newX - boxItem.cachedSize.width / 2 >= 0 &&
              newX + boxItem.cachedSize.width / 2 <= w &&
              newY - boxItem.cachedSize.height / 2 >= 0 &&
              newY + boxItem.cachedSize.height / 2 <= h) {
            boxItem.pos.x = newX;
            boxItem.pos.y = newY;
          }
        }
      }
    
      draw();
    },

    stepHandler: function(up) {
      if (boxes.step && !isDragging) {
        boxes.step.string = formatStr(boxes.step, Bangle.getHealthStatus("day").steps);
        boxes.step.cachedSize = null;
        draw();
      }
    },

    lockHandler: function(isLocked) {
      if (isLocked) {
        deselectAllBoxes();
        draw();
      }
    }
  };

  // 4. Font loading function
  let loadCustomFont = function() {
    Graphics.prototype.setFontBrunoAce = function() {
      // Actual height 23 (24 - 2)
      return this.setFontCustom(
        E.toString(require('heatshrink').decompress(atob('ABMHwADBh4DKg4bKgIPDAYUfAYV/AYX/AQMD/gmC+ADBn/AByE/GIU8AYUwLxcfAYX/8AnB//4JIP/FgMP4F+CQQBBjwJBFYRbBAd43DHoJpBh/g/xPEK4ZfDgEEORKDDAY8////wADLfZrTCgITBnhEBAYJMBAYMPw4DCM4QDjhwDCjwDBn0+AYMf/gDBh/4AYMH+ADBLpc4ToK/NGYZfnAYcfL4U/x5fBW4LvB/7vC+LvBgHAsBfIn76Cn4WBcYQDFEgJ+CQQYDyH4L/BAZbHLNYjjCAZc8ngDunycBZ4KkBa4KwBnEHY4UB+BfMgf/ZgMH/4XBc4cf4F/gE+ZgRjwAYcfj5jBM4U4M4RQBM4UA8BjIngDFEYJ8BAYUDAYQvCM4ZxBC4V+AYQvBnkBQ4M8gabBJQPAI4WAAYM/GYQaBAYJKCnqyCn5OCn4aBAYIaBAYJPCU4IABnBhIuDXCFAMD+Z/BY4IDBQwOPwEfv6TDAYUPAcwrDAYQ7BAYY/BI4cD8bLCK4RfEAA0BRYTeDcwIrFn0Pw43Bg4DugYDBjxBBU4SvDMYMH/5QBgP/LAQAP8EHN4UPwADHB4YAHA'))),
        46,
        atob("CBEdChgYGhgaGBsaCQ=="),
        32 | 65536
      );
    };
  };

  // 5. Initial settings of boxes and their positions
  let isBool = (val, defaultVal) => val !== undefined ? Boolean(val) : defaultVal;

  for (let key in boxesConfig) {
    if (key === 'bg' && boxesConfig[key].img) {
      bgImage = storage.read(boxesConfig[key].img);
    } else if (key !== 'selectedConfig') {
      boxes[key] = Object.assign({}, boxesConfig[key]);
      // Set default values for short, shortMonth, and disableSuffix
      boxes[key].short = isBool(boxes[key].short, true);
      boxes[key].shortMonth = isBool(boxes[key].shortMonth, true);
      boxes[key].disableSuffix = isBool(boxes[key].disableSuffix, false);

      // Set box position
      boxes[key].pos = {
        x: w * boxes[key].boxPos.x,
        y: h * boxes[key].boxPos.y
      };
      // Cache box size
      boxes[key].cachedSize = null;
    }
  }

  // 6. Text and drawing functions

  /*
    Overwrite the setColor function to allow the
    use of (x) in g.theme.x as a string
    in your JSON config ("fg", "bg", "fg2", "bg2", "fgH", "bgH")
  */
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

  let displaySaveIcon = function() {
    draw(boxes);
    g.drawImage(saveIcon, w / 2 - 24, h / 2 - 24);
    // Display save icon for 2 seconds
    setTimeout(() => {
      g.clearRect(w / 2 - 24, h / 2 - 24, w / 2 + 24, h / 2 + 24);
      draw(boxes);
    }, 2000);
  };

  // 7. String forming helper functions
  let getDate = function(short, shortMonth, disableSuffix) {
    const date = new Date();
    const dayOfMonth = date.getDate();
    const month = shortMonth ? locale.month(date, 1) : locale.month(date, 0);
    const year = date.getFullYear();
    let suffix = ["st", "nd", "rd"][(dayOfMonth - 1) % 10] || "th";
    let dayOfMonthStr = disableSuffix ? dayOfMonth : `${dayOfMonth}${suffix}`;
    return `${month} ${dayOfMonthStr}${short ? '' : `, ${year}`}`;
  };

  let getDayOfWeek = function(date, short) {
    return locale.dow(date, short ? 1 : 0);
  };

  locale.meridian = function(date, short) {
    let hours = date.getHours();
    let meridian = hours >= 12 ? 'PM' : 'AM';
    return short ? meridian[0] : meridian;
  };

  let formatStr = function(boxItem, data) {
    return `${boxItem.prefix || ''}${data}${boxItem.suffix || ''}`;
  };

  // 8. Main draw function and update logic
  let lastDay = -1;
  const BATTERY_UPDATE_INTERVAL = 300000;

  let updateBoxData = function() {
    let date = new Date();
    let currentDay = date.getDate();
    let now = Date.now();

    if (boxes.time || boxes.meridian || boxes.date || boxes.dow) {
      if (boxes.time) {
        let showSeconds = !boxes.time.short;
        let timeString = locale.time(date, 1).trim();
        if (showSeconds) {
          let seconds = date.getSeconds().toString().padStart(2, '0');
          timeString += ':' + seconds;
        }
        let newTimeString = formatStr(boxes.time, timeString);
        if (newTimeString !== boxes.time.string) {
          boxes.time.string = newTimeString;
          boxes.time.cachedSize = null;
        }
      }

      if (boxes.meridian) {
        let newMeridianString = formatStr(boxes.meridian, locale.meridian(date, boxes.meridian.short));
        if (newMeridianString !== boxes.meridian.string) {
          boxes.meridian.string = newMeridianString;
          boxes.meridian.cachedSize = null;
        }
      }

      if (boxes.date && currentDay !== lastDay) {
        let newDateString = formatStr(boxes.date,
          getDate(boxes.date.short,
            boxes.date.shortMonth,
            boxes.date.noSuffix)
        );
        if (newDateString !== boxes.date.string) {
          boxes.date.string = newDateString;
          boxes.date.cachedSize = null;
        }
      }

      if (boxes.dow) {
        let newDowString = formatStr(boxes.dow, getDayOfWeek(date, boxes.dow.short));
        if (newDowString !== boxes.dow.string) {
          boxes.dow.string = newDowString;
          boxes.dow.cachedSize = null;
        }
      }

      lastDay = currentDay;
    }

    if (boxes.step) {
      let newStepCount = Bangle.getHealthStatus("day").steps;
      let newStepString = formatStr(boxes.step, newStepCount);
      if (newStepString !== boxes.step.string) {
        boxes.step.string = newStepString;
        boxes.step.cachedSize = null;
      }
    }

    if (boxes.batt) {
      if (!boxes.batt.lastUpdate || now - boxes.batt.lastUpdate >= BATTERY_UPDATE_INTERVAL) {
        let currentLevel = E.getBattery();
        if (currentLevel !== boxes.batt.lastLevel) {
          let newBattString = formatStr(boxes.batt, currentLevel);
          if (newBattString !== boxes.batt.string) {
            boxes.batt.string = newBattString;
            boxes.batt.cachedSize = null;
            boxes.batt.lastLevel = currentLevel;
          }
        }
        boxes.batt.lastUpdate = now;
      }
    }
  };

  let draw = function() {
    g.clear();
  
    // Always draw backgrounds full screen
    if (bgImage) { // Check for bg in boxclk config
      g.drawImage(bgImage, 0, 0);
    } else { // Otherwise use clockbg module
      background.fillRect(0, 0, g.getWidth(), g.getHeight());
    }
  
    if (!isDragging) {
      updateBoxData();
    }
  
    for (let boxKey in boxes) {
      let boxItem = boxes[boxKey];
  
      // Set font and alignment for each box individually
      g.setFont(boxItem.font, boxItem.fontSize);
      g.setFontAlign(0, 0);
  
      calcBoxSize(boxItem);
  
      const pos = calcBoxPos(boxItem);
  
      if (boxItem.selected) {
        g.setColor(boxItem.border);
        g.drawRect(pos.x1, pos.y1, pos.x2, pos.y2);
      }
  
      g.drawString(
        boxItem,
        boxItem.string,
        boxItem.pos.x + boxItem.xOffset,
        boxItem.pos.y + boxItem.yOffset
      );
    }
  
    if (!isDragging) {
      if (drawTimeout) clearTimeout(drawTimeout);
      let updateInterval = boxes.time && !isBool(boxes.time.short, true) ? 1000 : 60000 - (Date.now() % 60000);
      drawTimeout = setTimeout(draw, updateInterval);
    }
  };

  // 9. Helper function for touch event
  let calcBoxPos = function(boxItem) {
    calcBoxSize(boxItem);
    return {
      x1: boxItem.pos.x - boxItem.cachedSize.width / 2,
      y1: boxItem.pos.y - boxItem.cachedSize.height / 2,
      x2: boxItem.pos.x + boxItem.cachedSize.width / 2,
      y2: boxItem.pos.y + boxItem.cachedSize.height / 2
    };
  };

  // Use cached size if available, otherwise calculate and cache
  let calcBoxSize = function(boxItem) {
    if (boxItem.cachedSize) {
      return boxItem.cachedSize;
    }
  
    g.setFont(boxItem.font, boxItem.fontSize);
    g.setFontAlign(0, 0);
  
    let strWidth = g.stringWidth(boxItem.string) + 2 * boxItem.outline;
    let fontHeight = g.getFontHeight() + 2 * boxItem.outline;
    let totalWidth = strWidth + 2 * boxItem.xPadding;
    let totalHeight = fontHeight + 2 * boxItem.yPadding;
  
    boxItem.cachedSize = {
      width: totalWidth,
      height: totalHeight
    };
  
    return boxItem.cachedSize;
  };

  let touchInText = function(e, boxItem) {
    calcBoxSize(boxItem);
    const pos = calcBoxPos(boxItem);
    return e.x >= pos.x1 &&
      e.x <= pos.x2 &&
      e.y >= pos.y1 &&
      e.y <= pos.y2;
  };

  let deselectAllBoxes = function() {
    isDragging = false;
    for (let boxKey in boxes) {
      boxes[boxKey].selected = false;
    }
    restoreSetColor();
    widgets.show();
    widgets.swipeOn();
    modSetColor();
  };

  // 10. Setup function to configure event handlers
  let setup = function() {
    Bangle.on('lock', eventHandlers.lockHandler);
    Bangle.on('touch', eventHandlers.touchHandler);
    Bangle.on('drag', eventHandlers.dragHandler);
  
    if (boxes.step) {
      boxes.step.string = formatStr(boxes.step, Bangle.getHealthStatus("day").steps);
      Bangle.on('step', eventHandlers.stepHandler);
    }
  
    if (boxes.batt) {
      boxes.batt.lastLevel = E.getBattery();
      boxes.batt.string = formatStr(boxes.batt, boxes.batt.lastLevel);
      boxes.batt.lastUpdate = Date.now();
    }
  
    Bangle.setUI({
      mode: "clock",
      remove: function() {
        // Remove event handlers, stop draw timer, remove custom font
        Bangle.removeListener('touch', eventHandlers.touchHandler);
        Bangle.removeListener('drag', eventHandlers.dragHandler);
        Bangle.removeListener('lock', eventHandlers.lockHandler);
        if (boxes.step) {
          Bangle.removeListener('step', eventHandlers.stepHandler);
        }
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
    draw();
  };

  // 11. Main execution
  Bangle.loadWidgets();
  widgets.swipeOn();
  modSetColor();
  setup();
}
