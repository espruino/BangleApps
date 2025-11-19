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
  let moduleFont = require("pure_numerals.font.js");
  let font = moduleFont.createFont(COLOR.background);  

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

    const FILE_NAME = "pure_numerals.data.json";
    
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
