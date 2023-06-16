{
  // 1. Module dependencies and initial configurations
  let storage = require("Storage");
  let locale = require("locale");
  let date = new Date();
  let bgImage;
  let boxesConfig = storage.readJSON('boxclk.json', 1) || {};
  let boxes = {};
  let boxPos = {};
  let isDragging = {};
  let wasDragging = {};

  // 2. Graphical and visual configurations
  let w = g.getWidth();
  let h = g.getHeight();
  let totalWidth, totalHeight;
  let enableSuffix = true;
  let drawTimeout;

  // 3. Handlers
  let touchHandler;
  let dragHandler;

  // 4. Font loading function
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

  // 5. Initial settings of boxes and their positions
  for (let key in boxesConfig) {
    if (key === 'bg' && boxesConfig[key].img) {
      bgImage = storage.read(boxesConfig[key].img);
    } else {
      boxes[key] = Object.assign({}, boxesConfig[key]);
    }
  }

  Object.keys(boxes).forEach((boxKey) => {
    let boxConfig = boxes[boxKey];
    boxPos[boxKey] = {
      x: w * boxConfig.boxPos.x,
      y: h * boxConfig.boxPos.y
    };
    isDragging[boxKey] = false;
    wasDragging[boxKey] = false;
  });

  // 6. Text and drawing functions
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

  // 7. Date and time related functions
  let getDate = function() {
    const date = new Date();
    const dayOfMonth = date.getDate();
    const month = locale.month(date, 1);
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
    let dayOfMonthStr = enableSuffix ? dayOfMonth + suffix : dayOfMonth;
    return month + " " + dayOfMonthStr + ", " + year;
  };

  let getDayOfWeek = function(date) {
    return locale.dow(date, 0);
  };

  // 8. Main draw function
  let draw = function(boxes) {
    date = new Date();
    g.clear();
    if (bgImage) {
      g.drawImage(bgImage, 0, 0);
    }
    if (boxes.time) {
      boxes.time.string = locale.time(date, 1);
    }
    if (boxes.date) {
      boxes.date.string = getDate();
    }
    if (boxes.dow) {
      boxes.dow.string = getDayOfWeek(date);
    }
    if (boxes.batt) {
      boxes.batt.string = E.getBattery() + "%";
    }
    Object.keys(boxes).forEach((boxKey) => {
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
      drawTimeout = setTimeout(() => draw(boxes), 60000 - (Date.now() % 60000));
    }
  };

  // 9. Setup function to configure event handlers
  let setup = function() {
    // Define the touchHandler function
    touchHandler = function(zone, e) {
      wasDragging = Object.assign({}, isDragging);
      let boxTouched = false;
      Object.keys(boxes).forEach((boxKey) => {
        if (touchInText(e, boxes[boxKey], boxKey)) {
          isDragging[boxKey] = true;
          wasDragging[boxKey] = true;
          boxTouched = true;
        }
      });
      if (!boxTouched) {
        Object.keys(isDragging).forEach((boxKey) => {
          isDragging[boxKey] = false;
        });
      }
      if (Object.values(wasDragging).some(Boolean) || !boxTouched) {
        draw(boxes);
      }
    };

    // Define the dragHandler function
    dragHandler = function(e) {
      Object.keys(boxes).forEach((boxKey) => {
        if (isDragging[boxKey]) {
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
    };

    Bangle.on('touch', touchHandler);
    Bangle.on('drag', dragHandler);

    Bangle.setUI({
      mode : "clock",
      remove : function() {
        // remove the event handlers when the app should be removed
        Bangle.removeListener('touch', touchHandler);
        Bangle.removeListener('drag', dragHandler);
        if (drawTimeout) clearTimeout(drawTimeout);
        drawTimeout = undefined;
        delete Graphics.prototype.setFontBrunoAce;
        g.drawString = g_drawString;
        require("widget_utils").show();
      }
    });
    loadCustomFont();
    draw(boxes);
  };

  // 10. Helper function for touch event
  let touchInText = function(e, boxItem, boxKey) {
    calcBoxSize(boxItem);
    const pos = calcBoxPos(boxKey);
    return e.x >= pos.x1 &&
          e.x <= pos.x2 &&
          e.y >= pos.y1 &&
          e.y <= pos.y2;
  };

  // 11. Main execution part
  Bangle.loadWidgets();
  require("widget_utils").swipeOn();
  setup();
}
