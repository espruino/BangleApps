// 
//  pure_numerals.app.js
//
//  Pure Numerals Clock 
//
//  Prime views:
//  date (day, month), time (hour, minute), time (minute, seconds), heartbeat and steps.
//
//  Secondary views:
//  Flashlight (double touch bottom left) and Battery (touch top right)
//
//  04.11.2025  Peter Bühler
//  

{
  // globals
  const DISPLAY_SIZE = 176;
  const CENTER = DISPLAY_SIZE / 2;
  const COLOR = {
    background : "#000000",
    foreground : "#FFFFFF",
    month : "#00FFFF",
    day : "#FFFF00",
    hour : "#FF00FF",
    minute : "#00FF00",
    second : "#FF0000",
    steps : "#FF8800",
    heart : "#fc4e4e"
  };
  const TouchArea = {
    BOTTOM_LEFT : "BOTTOM_LEFT",
    CENTER : "CENTER",
    TOP_RIGHT : "TOP_RIGHT",
  };

  // load module
  //let moduleFont = require("pure_numerals.font.js");
  //let font = moduleFont.createFont(COLOR.background);  

  // Creates the font, background-color must be passed. 
let createFont = function(bgColor) {

  let _bgColor = bgColor;

  const DISPLAY_SIZE = 176;   // Bangle.JS 2 : 176 x 176
  const DIGIT_HEIGHT = 72;
  const DIGIT_WIDTH = 60;
  const DIGIT_WIDTH_1 = 36;
     
  const numerals = {
    0 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,   48, 4, 52, 5, 55, 8, 56, 12,   56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60 ],
      holes: [[20, 20, 40, 20, 40, 52, 20, 52]],
    },
    1: {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  24, 4, 28, 5, 31, 8, 32, 12,   32, 60, 31, 64, 28, 67, 24, 68, 20, 67, 17, 64, 16, 60,  16, 20, 12, 20, 8, 19, 5, 16 ],
    },
    2 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  48, 4, 52, 5, 55, 8, 56, 12,  56, 36, 55, 40, 52, 43, 48, 44,   20, 44, 20, 52,  48, 52, 52, 53, 55, 56, 56, 60,  
         56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60,  4, 36, 5, 32, 8, 29, 12, 28,  40, 28, 40, 20,   12, 20, 8, 19, 5, 16 ],
    },
    3 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  48, 4, 52, 5, 55, 8, 56, 12,  56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60, 5, 56, 8, 53, 12, 52,  
        40, 52, 40, 44,   12, 44, 8, 43, 5, 40, 4, 36, 5, 32, 8, 29, 12, 28,  40, 28, 40, 20,   12, 20, 8, 19, 5, 16 ],
    },
    4 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4, 16, 5, 19, 8, 20, 12,  20, 28, 40, 28,  40, 12, 41, 8, 44, 5, 48, 4, 52, 5, 55, 8, 56, 12,  
        56, 60, 55, 64, 52, 67, 48, 68, 44, 67, 41, 64, 40, 60,  40, 44, 12, 44, 8, 43, 5, 40, 4, 36 ],
    },
    5 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  48, 4, 52, 5, 55, 8, 56, 12,  55, 16, 52, 19, 48, 20,  20, 20, 20, 28,  48, 28, 52, 29, 55, 32, 56, 36, 
        56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60,  5, 56, 8, 53, 12, 52,  40, 52, 40, 44,  12, 44, 8, 43, 5, 40, 4, 36 ],
    },
    6 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  48, 4, 52, 5, 55, 8, 56, 12,  55, 16, 52, 19, 48, 20,  20, 20, 20, 28,  48, 28, 52, 29, 55, 32, 56, 36, 
        56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60 ],
      holes: [[20, 44, 40, 44, 40, 52, 20, 52]],  
    },
    7 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  48, 4, 52, 5, 55, 8, 56, 12,  55, 16, 16, 67, 12, 68, 8, 67, 5, 64, 4, 60, 5, 56, 32, 20, 
        12, 20, 8, 19, 5, 16 ],
    }, 
    8: {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,   48, 4, 52, 5, 55, 8, 56, 12,   56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60 ],
      holes: [[20, 20, 40, 20, 40, 28, 20, 28], [20, 44, 40, 44, 40, 52, 20, 52]],
    },
    9 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,   48, 4, 52, 5, 55, 8, 56, 12,   56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60,
        5, 56, 8, 53, 12, 52,  40, 52, 40, 44,  12, 44, 8, 43, 5, 40, 4, 36 ],
      holes: [[20, 20, 40, 20, 40, 28, 20, 28]],
    }
  };

  // the character -
  const hyphen = [4, 36, 5, 32, 8, 29, 12, 28,  48, 28, 52, 29, 55, 32, 56, 36,  55, 40, 52, 43, 48, 44,  12, 44, 8, 43, 5, 40 ];

    // Draws digit in orginal size, for debug.
  function drawNumeral(digit) {
    let num = numerals[digit];
    g.setColor('#FF0000');
    g.fillPoly(num.polygon);
    let holes = num.holes;
    if (holes === undefined) { return; }
    g.setColor(_bgColor);
    for (let i=0; i<holes.length; i++) {
      g.fillPoly(holes[i]);
    }
  }

  // Returns the scaling factor.
  function getScale(fontSize) {
    return fontSize / DIGIT_HEIGHT;
  }

  // Returns the width in pixel for the given digit.
  function getDigitWidth(digit, fontSize) {
    let scale = getScale(fontSize);
    if (digit === 1) {
      return DIGIT_WIDTH_1 * scale;
    }
    return DIGIT_WIDTH * scale;
  }

  // Draws digit at given position (x,y) with given fontSize and color.
  // Anchor is top left.
  function drawDigit(digit, x, y, fontSize, color) {
    let scale = getScale(fontSize);
    let num = numerals[digit];
    g.setColor(color);
    g.fillPoly(g.transformVertices(num.polygon, {x:x, y:y, scale:scale}));
    
    let holes = num.holes;
    if (holes === undefined) { return; }
    g.setColor(_bgColor);
    for (let i=0; i<holes.length; i++) {
      g.fillPoly(g.transformVertices(holes[i], {x:x, y:y, scale:scale}));
    }
  }
  
  // Draws upper 2-digit number using full screen.
  // Parameter number must be string. 
  function drawUpperNumber(number, color) {
    let fontSize = DISPLAY_SIZE / 2;
    let d1 = +number.charAt(0);
    let d2 = +number.charAt(1);
    let w0 = getDigitWidth(0, fontSize);    // width digit 0
    let w1 = getDigitWidth(d1, fontSize);
    let w2 = getDigitWidth(d2, fontSize);
    let x2 = (DISPLAY_SIZE / 2 + w0) - w2;  // right aligned
    let x1 = x2 - w1;
    drawDigit(d1, x1, 0, fontSize, color);
    drawDigit(d2, x2, 0, fontSize, color);
  }

  // Draws lower 2-digit number using full screen.
  // Parameter number must be string. 
  function drawLowerNumber(number, color) {
    let fontSize = DISPLAY_SIZE / 2;
    let d1 = +number.charAt(0);
    let d2 = +number.charAt(1);
    let w0 = getDigitWidth(0, fontSize);    // width digit 0
    let w1 = getDigitWidth(d1, fontSize);
    let w2 = getDigitWidth(d2, fontSize);
    let x2 = (DISPLAY_SIZE / 2 + w0) - w2;  // right aligned
    let x1 = x2 - w1;
    let y = (DISPLAY_SIZE / 2) - 2;
    drawDigit(d1, x1, y, fontSize, color);
    drawDigit(d2, x2, y, fontSize, color);
  }

  // calculate width for given number (must be String),
  function getNumberWidth(number, fontSize) {
    let width = 0;
    for (let i=0; i<number.length; i++) {
      let d = +number.charAt(i);
      width += getDigitWidth(d, fontSize);
    }
    return width;
  }

  // draws given number (must be String) horizontal centered.
  function drawNumberCentered(number, y, fontSize, color) {

    let width = getNumberWidth(number, fontSize);

    // draw each digit
    let x = (DISPLAY_SIZE - width) / 2;
    for (let i=0; i<number.length; i++) {
      let d = +number.charAt(i);
      drawDigit(d, x, y, fontSize, color);
      x += getDigitWidth(d, fontSize);
    }
  }

  // draw number (must be string) at given position.
  function drawNumber(number, x, y, fontSize, color) {

    // draw each digit
    for (let i=0; i<number.length; i++) {
      let d = +number.charAt(i);
      drawDigit(d, x, y, fontSize, color);
      x += getDigitWidth(d, fontSize);
    }
  }

  // draws hyphen
  function drawHyphen(x, y, fontSize, color) {
    let scale = getScale(fontSize);
    g.setColor(color);
    g.fillPoly(g.transformVertices(hyphen, {x:x, y:y, scale:scale}));
  }

  // draws hyphen horizontal centered
  function drawHyphenCentered(y, fontSize, color) {
    let scale = getScale(fontSize);
    let wChar = DIGIT_WIDTH * scale;
    let x = (DISPLAY_SIZE - wChar) / 2;
    drawHyphen(x, y, fontSize, color);
  }

  // draws two hyphen horizontal centered
  function drawTwoHyphenCentered(y, fontSize, color) {
    let scale = getScale(fontSize);
    let wChar = DIGIT_WIDTH * scale;
    let x = (DISPLAY_SIZE - (2*wChar)) / 2;
    drawHyphen(x, y, fontSize, color);
    drawHyphen(x + wChar, y, fontSize, color);
  }
  
  return { drawNumeral, drawDigit, drawUpperNumber, drawLowerNumber, drawNumber, drawNumberCentered, getNumberWidth, drawHyphen, 
    drawHyphenCentered, drawTwoHyphenCentered };

};

  let font = createFont(COLOR.background);  


  // draws the background black
  let clearBackground = function() {
    g.clear();
    g.setColor(COLOR.background);
    g.fillRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
  };

  // factory function for view minute/second
  let createMinuteSecondView = function() {

    let drawTimeout;

    function enter() {
      draw();
    }

    function draw() {
      clearBackground();
      let date = new Date();
      let min = ("0" + date.getMinutes()).slice(-2);
      let sec = ("0" + date.getSeconds()).slice(-2);
      font.drawUpperNumber(min, COLOR.minute);
      font.drawLowerNumber(sec, COLOR.second);
      queueDraw(); // queue draw in one second
    }

    // schedule a draw for the next second
    function queueDraw() {
      if (drawTimeout) { clearTimeout(drawTimeout); }
      let sleep = 1000 - (Date.now() % 1000);
      //console.log(sleep);
      drawTimeout = setTimeout(function () {
        drawTimeout = undefined;
        draw();
      }, sleep);
    }

    function leave() {
      if (drawTimeout) { clearTimeout(drawTimeout); }
    }

    return { enter, leave };
  };

  // factory function for view hour/minute
  let createHourMinuteView = function() {

    const MILLIS_PER_MINUTE = 60000;  
    let drawTimeout;

    function enter() {
      draw();
    }

    function draw() {
      clearBackground();
      let date = new Date();
      let hour = ("0" + date.getHours()).slice(-2);
      let min = ("0" + date.getMinutes()).slice(-2);
      font.drawUpperNumber(hour, COLOR.hour);
      font.drawLowerNumber(min, COLOR.minute);
      queueDraw(); 
    }

    function queueDraw() {
      if (drawTimeout) { clearTimeout(drawTimeout); }
      drawTimeout = setTimeout(function () {
        drawTimeout = undefined;
        draw();
      }, MILLIS_PER_MINUTE - (Date.now() % MILLIS_PER_MINUTE));
    }

    function leave() {
      if (drawTimeout) { clearTimeout(drawTimeout); }
    }

    return { enter, leave };
  };

  // factory function for view month/day
  let createMonthDayView = function() {

    const MILLIS_PER_DAY = 60000 * 24;  
    let drawTimeout;

    function enter() {
      draw();
    }

    function draw() {
      clearBackground();
      let date = new Date();
      let month = ("0" + (date.getMonth()+1)).slice(-2);  // month begins with 0
      let day = ("0" + date.getDate()).slice(-2);         // stupid api
      // console.log("day " + day + ", month " + month);
      font.drawUpperNumber(day, COLOR.day);
      font.drawLowerNumber(month, COLOR.month);
      queueDraw(); 
    }

    function queueDraw() {
      if (drawTimeout) { clearTimeout(drawTimeout); }
      drawTimeout = setTimeout(function () {
        drawTimeout = undefined;
        draw();
      }, MILLIS_PER_DAY - (Date.now() % MILLIS_PER_DAY));
    }

    function leave() {
      if (drawTimeout) { clearTimeout(drawTimeout); }
    }

    return { enter, leave };
  };

  // factory function for view flashlight
  let createFlashLightView = function() {

    let lastLCDTimeout; // in millis !
    let lastBrightness; 

    function onTouch(button, e) {
      app.showLastCarouselView();
    }

    function enter() {

      const options = Bangle.getOptions();
      lastLCDTimeout = options.backlightTimeout;
      // lastBrightness = options.backlight;        // does not exist
      // workaround
      let obj = require("Storage").readJSON("setting.json", 1);
      //console.log("Brigtness: " + obj.brightness);
      lastBrightness = obj.brightness;

      Bangle.on("touch", onTouch);
      Bangle.setLCDTimeout(0);
      Bangle.setLCDBrightness(1.0);
      draw();
    }

    function draw() {
      g.clear();
      g.setColor('#FFFFFF');
      g.fillRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
    }

    function leave() {
      Bangle.removeListener("touch", onTouch);
      Bangle.setLCDTimeout(lastLCDTimeout / 1000);
      Bangle.setLCDBrightness(lastBrightness);    
    }

    return { enter, leave };
  };

  // factory function for battery view
  let createBatteryView = function() {

    let timeout;
    const TIMEOUT_TIME = 3000;
    const COLOR_FULL = "#00FF00";
    const COLOR_MEDIUM = "#ed8e00";
    const COLOR_EMPTY = "#FF0000";

    function enter() {
      if (timeout) { clearTimeout(timeout); }
      timeout = setTimeout(function() {
        timeout = undefined;
        app.showLastCarouselView();
      }, TIMEOUT_TIME); 
      draw();
    }

    function draw() {
      clearBackground();
      let percent = E.getBattery();  // Emulator : 0
      //percent = 19;

      // draw battery
      let bx = CENTER - 36, by = CENTER - 42;
      let bw = 72, bh = 30;
      g.setColor("#FFFFFF");
      g.drawRect(bx, by, bx + bw, by + bh);
      g.drawRect(bx-1, by-1, bx + bw+1, by + bh+1);  // thicken line
      g.fillRect(bx + bw + 2, by + 8, bx + bw + 8, by + bh - 8);

      // draw fill
      let color = COLOR_MEDIUM;
      if (percent < 20 ) { color = COLOR_EMPTY; }
      if (percent >= 40 ) { color = COLOR_FULL; }
      g.setColor(color);
      let fillW = Math.round((bw - 6) * percent / 100);
      g.fillRect(bx + 3, by + 3, bx + 3 + fillW, by + bh - 3);

      // concat value and %
      let fontsize = 36;
      let pStr = percent.toString();
      let wStr = font.getNumberWidth(pStr, fontsize);
      
      g.setFont("Vector", 32);
      let wChar = g.stringWidth("%");
      let x = (DISPLAY_SIZE - (wStr + wChar + 4)) / 2;
      let y = CENTER + 20;
      font.drawNumber(pStr, x, y, fontsize, COLOR.foreground);
      x += wStr + 4;

      g.setColor(COLOR.foreground);
      g.setFontAlign(-1, -1);     // must be set
      g.drawString("%", x, y + 8);
    }

    function leave() {
      if (timeout) { clearTimeout(timeout); }
    }

    return { enter, leave };

  };

  // factory function for step count
  let createStepsView = function () {

    function onStep(up) {
      draw();
    }

    function enter() {
      Bangle.on("step", onStep);
      draw();
    }

    function draw() {

      let allSteps = Bangle.getStepCount();
      let stepOffset = app.getStepOffset();
      let steps = allSteps - stepOffset;

      clearBackground();

      // shrink font to dispay width
      let fontsize = 66;
      let svalue = steps.toString();
      let width = font.getNumberWidth(svalue, fontsize);
      while (width > 132) {  // border = 22
        fontsize -= 4;
        width = font.getNumberWidth(svalue, fontsize);
      }
      let y = 55 - fontsize / 2;  // center vertically
      font.drawNumberCentered(svalue, y, fontsize, COLOR.steps);

      g.setFont("Vector", 44);
      g.setColor("#FFFFFF");
      g.setFontAlign(0, 0);
      g.drawString("Steps", CENTER, CENTER + 44);
    }

    function leave() {
      Bangle.removeListener("step", onStep);
    }

    return { enter, leave };
  };

  // factory function for heartbeat
  let createHeartView = function() {

    let lastLCDTimeout; // in millis !
    let value;   // current BPM

    function onHRM(hrm) {
      //console.log("bpm: " + hrm.bpm + ", conf: " + hrm.confidence);
      if (hrm.bpm === 0 || hrm.confidence < 50) {  // value not valid
        return;
      }
      value = hrm.bpm;    
      draw();
    }

    function enter() {
      const options = Bangle.getOptions();
      lastLCDTimeout = options.backlightTimeout;
      Bangle.setLCDTimeout(0);

      value = undefined;  // reset value (?)
      Bangle.setHRMPower(true);  // set appId (optional parameter ?)
      Bangle.on("HRM", onHRM);
      draw();
    }

    function draw() {
      clearBackground();
      let fontsize = 66;
      
      if (value === undefined) {
        fontsize = 58;
        let y = 55 - fontsize / 2;
        font.drawTwoHyphenCentered(y, fontsize, COLOR.heart);
      }
      else {
        // shrink font to dispay width
        let svalue = value.toString();
        let width = font.getNumberWidth(svalue, fontsize);
        while (width > 132){  // border = 22
          fontsize -= 4;
          width = font.getNumberWidth(svalue, fontsize);
        } 
        let y = 55 - fontsize / 2;  // center vertically
        font.drawNumberCentered(svalue, y, fontsize, COLOR.heart);
      }

      g.setFont("Vector", 44);
      g.setColor(COLOR.foreground);
      g.setFontAlign(0, 0);
      g.drawString("BPM", CENTER, CENTER + 44);

    }

    function leave() {
      Bangle.removeListener("HRM", onHRM);
      Bangle.setHRMPower(false);  
      Bangle.setLCDTimeout(lastLCDTimeout / 1000);   
    }

    return { enter, leave };

  };

  // factory function for the app
  let createApp = function() {

    const FILE_NAME = "purenumerals.data.json";
    
    const viewMap = {
      0: createMonthDayView(),
      1: createHourMinuteView(),
      2: createMinuteSecondView(),
      3: createStepsView(),
      4: createHeartView(),
      10: createBatteryView(),
      11: createFlashLightView(),
    };

    const MAX_CAROUSEL_KEY = 4;
    let currentView;
    let currentKey;
    let lastCarouselKey;
    let stepDate;
    let stepOffset;

    const DOUBLE_TOUCH_TIMEOUT = 500;
    let lastTouchTime = 0;
    let lastTouchArea = undefined;

    function onSwipe(lr, td) {
      // console.log("onSwipe() lr: " + lr + " td: " + td);
      if (currentKey > MAX_CAROUSEL_KEY) { return; }    // only when carousel view
      if (lr === 1) {  // left to right
        showPreviousView();
      } else if (lr === -1) { // right to left
        showNextView();
      }
    }

    function getTouchArea(e) {
      const QUART = CENTER / 2;
      if (e.x < CENTER && e.y > (CENTER + QUART)) {
        return TouchArea.BOTTOM_LEFT;
      }
      if (e.y > QUART && e.y < (CENTER + QUART)) {
        return TouchArea.CENTER;
      }
      if (e.x > CENTER && e.y < QUART) {
        return TouchArea.TOP_RIGHT;
      }
      return undefined;
    }

    // touch event handler
    function onTouch(button, e) {

      // console.log("onTouch() button: " + button + " e: " + e);
      if (currentKey > MAX_CAROUSEL_KEY) {
        return;
      }

      let area = getTouchArea(e);
      // console.log("TouchArea: " + area)
      let keyNextView = undefined;

      // battery should be shown
      if (area === TouchArea.TOP_RIGHT) {
        keyNextView = 10; 
      }

      // double touch if flashlight should be shown
      else if (area === TouchArea.BOTTOM_LEFT) {
        let now = Date.now();
        let delta = now - lastTouchTime;
        if (delta < DOUBLE_TOUCH_TIMEOUT && lastTouchArea === area) {
          keyNextView = 11;
        }
        else {
          lastTouchTime = now;
          lastTouchArea = area;
        }
      }

      if (keyNextView) {
        lastTouchTime = 0;
        lastTouchArea = undefined;
        showView(keyNextView);
      }
    }

    // date change handler
    function onMidnight() {
      stepDate = (new Date()).toISOString().slice(0, 10);
      stepOffset = Bangle.getStepCount();
    }

    // lock event handler
    function onLock(on, reason) {
      if (on && reason === "timeout") { // screen locked
        showView(1); 
      }
    }

    // shows next view of carousel 
    function showNextView() {
      let key = (currentKey == MAX_CAROUSEL_KEY) ? 0 : currentKey + 1;
      showView(key);
    }

    // shows pervious view of carousel
    function showPreviousView() {
      let key = (currentKey == 0) ? MAX_CAROUSEL_KEY : currentKey -1;
      showView(key);
    }

    // shows the carousel view last shown
    function showLastCarouselView() {
      showView(lastCarouselKey);
    }

    // shows view with given key
    function showView(key) {
      if (currentView) { currentView.leave(); }
      currentKey = key;
      currentView = viewMap[currentKey];
      lastCarouselKey = (currentKey <= MAX_CAROUSEL_KEY) ? currentKey : lastCarouselKey;
      currentView.enter();
    }

    // returns offset for step view
    function getStepOffset() {
      return stepOffset;
    }

    // read file of step view
    function readStepData() {
      let today = (new Date()).toISOString().slice(0, 10);
      let obj = require("Storage").readJSON(FILE_NAME, 1);
      if (obj) {
        stepDate = obj.stepDate;
        stepOffset = obj.stepOffset;
      } 

      // file missing or date changed
      if (obj === undefined || (stepDate !== today)) {
        stepDate = today;
        stepOffset = Bangle.getStepCount();
      }
    }

    // write file for step view
    function writeStepData() {
      let data = {};
      data.stepDate = stepDate;
      data.stepOffset = stepOffset;
      require("Storage").writeJSON(FILE_NAME, data);
    }

    // start app
    function start() {
      // console.log("app start()");
      g.clear();
      readStepData();

      // register event handlers
      Bangle.on("swipe", onSwipe);
      Bangle.on("touch", onTouch);
      Bangle.on("midnight", onMidnight);
      Bangle.on("lock", onLock);

      showView(1); // show hour/minute
    }

    // shutdown app
    function shutdown() {
      // console.log("app shutdown()");
      if (currentView) { currentView.leave(); }

      // unregister event handler
      Bangle.removeListener("swipe", onSwipe);
      Bangle.removeListener("touch", onTouch);
      Bangle.removeListener("midnight", onMidnight);
      Bangle.removeListener("lock", onLock);

      writeStepData();
    }

    return { start, shutdown, showLastCarouselView, showView, getStepOffset };

  };

  let app = createApp();
  app.start();

  // Show launcher when middle button pressed
  // callback when clock is removed
  Bangle.setUI({mode:"clock", remove:function() {
    app.shutdown();
  }});


}