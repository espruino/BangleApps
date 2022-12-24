let s = {};
// unlocked draw intervals
s.udi = [];
// locked draw intervals
s.ldi = [];
// full draw
s.fd = true;
// performance log
s.pl = {};

{
  let x = g.getWidth()/2;
  let y = g.getHeight()/2;
  g.setColor(g.theme.bg);
  g.fillRect(x-49, y-19, x+49, y+19);
  g.setColor(g.theme.fg);
  g.drawRect(x-50, y-20, x+50, y+20);
  y -= 4;
  x -= 4*6;
  g.setFont("6x8");
  g.setFontAlign(-1,-1);
  g.drawString("Loading...", x, y);

  let watchface = require("Storage").readJSON("imageclock.face.json");
  let watchfaceResources = require("Storage").readJSON("imageclock.resources.json");
  let precompiledJs = eval(require("Storage").read("imageclock.draw.js"));
  let settings = require('Storage').readJSON("imageclock.json", true) || {};

  let startPerfLog = () => {};
  let endPerfLog = () => {};
  Bangle.printPerfLog = () => {print("Deactivated");};
  Bangle.resetPerfLog = () => {s.pl = {};};

  let colormap={
    "#000":0,
    "#00f":1,
    "#0f0":2,
    "#0ff":3,
    "#f00":4,
    "#f0f":5,
    "#ff0":6,
    "#fff":7
  };

  let palette = new Uint16Array([
    0x0000, //black #000
    0x001f, //blue #00f
    0x07e0, //green #0f0
    0x07ff, //cyan #0ff
    0xf800, //red #f00
    0xf81f, //magenta #f0f
    0xffe0, //yellow #ff0
    0xffff, //white #fff
    0xffff, //white
    0xffff, //white
    0xffff, //white
    0xffff, //white
    0xffff, //white
    0xffff, //white
    0xffff, //white
    0xffff, //white
  ]);

  let p0 = g;
  let p1;

  if (settings.perflog){
    startPerfLog = function(name){
      let time = getTime();
      if (!s.pl.start) s.pl.start={};
      s.pl.start[name] = time;
    };
    endPerfLog = function (name, once){
      let time = getTime();
      if (!s.pl.start[name]) return;
      if (!s.pl.last) s.pl.last={};
      let duration = time - s.pl.start[name];
      s.pl.last[name] = duration;
      if (!s.pl.cum) s.pl.cum={};
      if (!s.pl.cum[name]) s.pl.cum[name] = 0;
      s.pl.cum[name] += duration;
      if (!s.pl.count) s.pl.count={};
      if (!s.pl.count[name]) s.pl.count[name] = 0;
      s.pl.count[name]++;
      if (once){s.pl.start[name] = undefined}
    };

    Bangle.printPerfLog = function(){
      let result = "";
      let keys = [];
      for (let c in s.pl.cum){
        keys.push(c);
      }
      keys.sort();
      for (let k of keys){
        print(k, "last:", (s.pl.last[k] * 1000).toFixed(0), "average:", (s.pl.cum[k]/s.pl.count[k]*1000).toFixed(0), "count:", s.pl.count[k], "total:", (s.pl.cum[k] * 1000).toFixed(0));
      }
    };
  }
  startPerfLog("fullDraw");
  startPerfLog("loadFunctions");

  let delayTimeouts = {};
  let timeoutCount = 0;

  let delay = function(t) {
      return new Promise(function (resolve) {
        const i = timeoutCount++;
        let timeout = setTimeout(()=>{
          resolve();
          delete delayTimeouts[i];
        }, t);
        delayTimeouts[i] = timeout;
        //print("Add delay timeout", delayTimeouts);
      });
  };

  let cleanupDelays = function(){
    //print("Cleanup delays", delayTimeouts);
    for (let t of delayTimeouts){
      clearTimeout(t);
    }
    delayTimeouts = {};
  };
  
  let prepareImg = function(resource){
    startPerfLog("prepareImg");
    //print("prepareImg: ", resource);

    if (resource.dataOffset !== undefined){
      resource.buffer = E.toArrayBuffer(require("Storage").read("imageclock.resources.data", resource.dataOffset, resource.dataLength));
      delete resource.dataOffset;
      delete resource.dataLength;
      if (resource.paletteData){
        resource.palette = new Uint16Array(resource.paletteData);
        delete resource.paletteData;
      }
    }
    endPerfLog("prepareImg");
    return resource;
  };

  let getByPath = function(object, path, lastElem){
    startPerfLog("getByPath");
    //print("getByPath", path,lastElem);
    let current = object;
    if (path.length) {
      for (let c of path){
        if (!current[c]) return undefined;
        current = current[c];
      }
    }
    if (lastElem!==undefined){
      if (!current["" + lastElem]) return undefined;
      //print("Found by lastElem", lastElem);
      current = current["" + lastElem];
    }
    endPerfLog("getByPath");
    if (typeof current == "function"){
      //print("current was function");
      return undefined;
    }
    return current;
  };

  let splitNumberToDigits = function(num){
    return String(num).split('').map(item => Number(item));
  };

  let isChangedNumber = function(element){
    return element.lastDrawnValue != getValue(element.Value);
  };

  let isChangedMultistate = function(element){
    return element.lastDrawnValue != getMultistate(element.Value);
  };

  let drawNumber = function(graphics, resources, element){
    startPerfLog("drawNumber");
    let number = getValue(element.Value);
    //print("drawNumber: ", number, element);
    let spacing = element.Spacing ? element.Spacing : 0;
    let unit = element.Unit;

    let imageIndexMinus = element.ImageIndexMinus;
    let imageIndexUnit = element.ImageIndexUnit;
    let numberOfDigits = element.Digits;


    if (number) number = number.toFixed(0);

    let isNegative;
    let digits;
    if (number == undefined){
      isNegative = true;
      digits = [];
      numberOfDigits = 0;
    } else {
      isNegative = number < 0;
      if (isNegative) number *= -1;
      digits = splitNumberToDigits(number);
    }

    //print("digits: ", digits);
    if (!numberOfDigits) numberOfDigits = digits.length;
    let firstDigitX = element.X;
    let firstDigitY = element.Y;
    let imageIndex = element.ImageIndex ? element.ImageIndex : 0;

    let firstImage = element.cachedFirstImage;
    if (!firstImage && !element.cachedFirstImageMissing){
      if (imageIndex){
        firstImage = getByPath(resources, [], "" + (0 + imageIndex));
      } else {
        firstImage = getByPath(resources, element.ImagePath, 0);
      }
      element.cachedFirstImage = firstImage;
      if (!firstImage) element.cachedFirstImageMissing = true;
    }

    let minusImage = element.cachedMinusImage;
    if (!minusImage && !element.cachedMinusImageMissing){
      if (imageIndexMinus){
        minusImage = getByPath(resources, [], "" + (0 + imageIndexMinus));
      } else {
        minusImage = getByPath(resources, element.ImagePath, "minus");
      }
      element.cachedMinusImage = minusImage;
      if (!minusImage) element.cachedMinusImageMissing = true;
    }

    let unitImage = element.cachedUnitImage;
    //print("Get image for unit", imageIndexUnit);
    if (!unitImage && !element.cachedUnitImageMissing){
      if (imageIndexUnit !== undefined){
        unitImage = getByPath(resources, [], "" + (0 + imageIndexUnit));
        //print("Unit image is", unitImage);
      } else if (element.Unit){
        unitImage = getByPath(resources, element.ImagePath, getMultistate(element.Unit, "unknown"));
      }
      unitImage = element.cachedUnitImage;
      if (!unitImage) element.cachedUnitImageMissing = true;
    }

    let numberWidth = (numberOfDigits * firstImage.width) + (Math.max((numberOfDigits - 1),0) * spacing);
    if (isNegative && minusImage){
      //print("Adding to width", minusImage);
      numberWidth += minusImage.width + spacing;
    }
    if (unitImage){
      //print("Adding to width", unitImage);
      numberWidth += unitImage.width + spacing;
    }
    //print("numberWidth:", numberWidth);

    if (element.Alignment == "Center") {
      firstDigitX = Math.round(element.X - (numberWidth/2)) + 1;
      firstDigitY = Math.round(element.Y - (firstImage.height/2)) + 1;
    } else if (element.Alignment == "BottomRight"){
      firstDigitX = element.X - numberWidth + 1;
      firstDigitY = element.Y - firstImage.height + 1;
    } else if (element.Alignment == "TopRight") {
      firstDigitX = element.X - numberWidth + 1;
      firstDigitY = element.Y;
    } else if (element.Alignment == "BottomLeft") {
      firstDigitX = element.X;
      firstDigitY = element.Y - firstImage.height + 1;
    }

    let currentX = firstDigitX;
    if (isNegative && minusImage){
      //print("Draw minus at", currentX);
      if (imageIndexMinus){
        drawElement(graphics, resources, {X:currentX,Y:firstDigitY}, element, "" + (0 + imageIndexMinus));
      } else {
        drawElement(graphics, resources, {X:currentX,Y:firstDigitY}, element, "minus");
      }
      currentX += minusImage.width + spacing;
    }
    for (let d = 0; d < numberOfDigits; d++){
      let currentDigit;
      let difference = numberOfDigits - digits.length;
      if (d >= difference){
        currentDigit = digits[d-difference];
      } else {
        currentDigit = 0;
      }
      //print("Digit", currentDigit, currentX);
      drawElement(graphics, resources, {X:currentX,Y:firstDigitY}, element, currentDigit + imageIndex);
      currentX += firstImage.width + spacing;
    }
    if (imageIndexUnit){
      //print("Draw unit at", currentX);
      drawElement(graphics, resources, {X:currentX,Y:firstDigitY}, element, "" + (0 + imageIndexUnit));
    } else if (element.Unit){
      drawElement(graphics, resources, {X:currentX,Y:firstDigitY}, element, getMultistate(element.Unit,"unknown"));
    }
    element.lastDrawnValue = number;

    endPerfLog("drawNumber");
  };

  let drawElement = function(graphics, resources, pos, element, lastElem){
    startPerfLog("drawElement");
    let cacheKey = "_"+(lastElem?lastElem:"nole");
    if (!element.cachedImage) element.cachedImage={};
    if (!element.cachedImage[cacheKey]){
      let resource = getByPath(resources, element.ImagePath, lastElem);
      if (resource){
        prepareImg(resource);
        //print("lastElem", typeof resource)
        element.cachedImage[cacheKey] = resource;
      } else {
        //print("Could not get resource from", element, lastElem);
      }
    }

    //print("cache ", typeof element.cachedImage[cacheKey], element.ImagePath, lastElem);
    if(element.cachedImage[cacheKey]){
      //print("drawElement ", pos, element, lastElem);
      let options={};
      if (element.RotationValue){
        options.rotate = radians(element);
      }
      if (element.Scale){
        options.scale = element.ScaleValue;
      }
      //print("options", options);
      //print("Memory before drawing", process.memory(false));
      startPerfLog("drawElement_g.drawImage");
      try{
      graphics.drawImage(element.cachedImage[cacheKey] ,(pos.X ? pos.X : 0), (pos.Y ? pos.Y : 0), options);} catch (e) {
        //print("Error", e, element.cachedImage[cacheKey]);
      }
      endPerfLog("drawElement_g.drawImage");
    }
    endPerfLog("drawElement");
  };

  let getValue = function(value, defaultValue){
    startPerfLog("getValue");
    if (typeof value == "string"){
      return numbers[value]();
    }
    if (value == undefined) return defaultValue;
    endPerfLog("getValue");
    return value;
  };

  let getMultistate = function(name, defaultValue){
    startPerfLog("getMultistate");
    if (typeof name == "string"){
      return multistates[name]();
    } else {
      if (name == undefined) return defaultValue;
    }
    endPerfLog("getMultistate");
    return undefined;
  };

  let drawScale = function(graphics, resources, scale){
    startPerfLog("drawScale");
    //print("drawScale", scale);
    let segments = scale.Segments;
    let imageIndex = scale.ImageIndex !== undefined ? scale.ImageIndex : 0;

    let value = scaledown(scale.Value, scale.MinValue, scale.MaxValue);
    let segmentsToDraw = Math.ceil(value * segments.length);

    for (let i = 0; i < segmentsToDraw; i++){
      drawElement(graphics, resources, segments[i], scale, imageIndex + i);
    }
    scale.lastDrawnValue = segmentsToDraw;

    endPerfLog("drawScale");
  };

  let drawImage = function(graphics, resources, image, name){
    startPerfLog("drawImage");
    //print("drawImage", image.X, image.Y, name);
    if (image.Value && image.Steps){
      let steps = Math.floor(scaledown(image.Value, image.MinValue, image.MaxValue) * (image.Steps - 1));
      //print("Step", steps, "of", image.Steps);
      drawElement(graphics, resources, image, image, "" + steps);
    } else if (image.ImageIndex !== undefined) {
      drawElement(graphics, resources, image, image, image.ImageIndex);
    } else {
      drawElement(graphics, resources, image, image, name ? "" + name: undefined);
    }

    endPerfLog("drawImage");
  };

  let drawCodedImage = function(graphics, resources, image){
    startPerfLog("drawCodedImage");
    let code = getValue(image.Value);
    //print("drawCodedImage", image, code);

    if (image.ImagePath) {
      let factor = 1;
      let currentCode = code;
      while (code / factor > 1){
        currentCode = Math.floor(currentCode/factor)*factor;
        //print("currentCode", currentCode);
        if (getByPath(resources, image.ImagePath, currentCode)){
          break;
        }
        factor *= 10;
      }
      if (code / factor > 1){
        //print("found match");
        drawImage(graphics, resources, image, currentCode);
      } else {
        //print("fallback");
        drawImage(graphics, resources, image, "fallback");
      }
    }
    image.lastDrawnValue = code;

    startPerfLog("drawCodedImage");
  };

  let getWeatherCode = function(){
    let jsonWeather = require("Storage").readJSON('weather.json');
    let weather = (jsonWeather && jsonWeather.weather) ? jsonWeather.weather : undefined;

    if (weather && weather.code){
      return weather.code;
    }
    return undefined;
  };

  let getWeatherTemperature = function(){
    let jsonWeather = require("Storage").readJSON('weather.json');
    let weather = (jsonWeather && jsonWeather.weather) ? jsonWeather.weather : undefined;

    let result = { unit: "unknown"};
    if (weather && weather.temp){
      //print("Weather is", weather);
      let temp = require('locale').temp(weather.temp-273.15);
      result.value = Number(temp.match(/[\d\-]*/)[0]);
      let unit;
      if (temp.includes("C")){
        result.unit = "celsius";
      } else if (temp.includes("F")){
        result.unit = "fahrenheit";
      }
    }
    return result;
  };

  let scaledown = function(value, min, max){
    //print("scaledown", value, min, max);
    let scaled = E.clip(getValue(value),getValue(min,0),getValue(max,1));
    scaled -= getValue(min,0);
    scaled /= getValue(max,1);
    return scaled;
  };

  let radians = function(rotation){
    let value = scaledown(rotation.RotationValue, rotation.MinRotationValue, rotation.MaxRotationValue);
    value -= rotation.RotationOffset ? rotation.RotationOffset : 0;
    value *= 360;
    value *= Math.PI / 180;
    return value;
  };

  let drawPoly = function(graphics, resources, element){
      startPerfLog("drawPoly");
      let vertices = [];

      startPerfLog("drawPoly_transform");
      for (let c of element.Vertices){
        vertices.push(c.X);
        vertices.push(c.Y);
      }
      let transform = { x: element.X ? element.X : 0,
        y: element.Y ? element.Y : 0
      };
      if (element.RotationValue){
        transform.rotate = radians(element);
      }
      vertices = graphics.transformVertices(vertices, transform);

      endPerfLog("drawPoly_transform");

      if (element.Filled){
        startPerfLog("drawPoly_g.fillPoly");
        graphics.fillPoly(vertices,true);
        endPerfLog("drawPoly_g.fillPoly");
      } else {
        startPerfLog("drawPoly_g.drawPoly");
        graphics.drawPoly(vertices,true);
        endPerfLog("drawPoly_g.drawPoly");
      }

      endPerfLog("drawPoly");
  };

  let drawRect = function(graphics, resources, element){
      startPerfLog("drawRect");
      let vertices = [];

      if (element.Filled){
        startPerfLog("drawRect_g.fillRect");
        graphics.fillRect(element.X, element.Y, element.X + element.Width, element.Y + element.Height);
        endPerfLog("drawRect_g.fillRect");
      } else {
        startPerfLog("drawRect_g.fillRect");
        graphics.drawRect(element.X, element.Y, element.X + element.Width, element.Y + element.Height);
        endPerfLog("drawRect_g.fillRect");
      }
      endPerfLog("drawRect");
  };

  let drawCircle = function(graphics, resources, element){
      startPerfLog("drawCircle");

      if (element.Filled){
        startPerfLog("drawCircle_g.fillCircle");
        graphics.fillCircle(element.X, element.Y, element.Radius);
        endPerfLog("drawCircle_g.fillCircle");
      } else {
        startPerfLog("drawCircle_g.drawCircle");
        graphics.drawCircle(element.X, element.Y, element.Radius);
        endPerfLog("drawCircle_g.drawCircle");
      }
      endPerfLog("drawCircle");
  };

  let numbers = {};
  numbers.Hour = () => { return new Date().getHours(); };
  numbers.HourTens = () => { return Math.floor(new Date().getHours()/10); };
  numbers.HourOnes = () => { return Math.floor(new Date().getHours()%10); };
  numbers.Hour12 = () => { return new Date().getHours()%12; };
  numbers.Hour12Analog = () => { let date = new Date(); return date.getHours()%12 + (date.getMinutes()/59); };
  numbers.Hour12Tens = () => { return Math.floor((new Date().getHours()%12)/10); };
  numbers.Hour12Ones = () => { return Math.floor((new Date().getHours()%12)%10); };
  numbers.Minute = () => { return new Date().getMinutes(); };
  numbers.MinuteAnalog = () => { let date = new Date(); return date.getMinutes() + (date.getSeconds()/59); };
  numbers.MinuteTens = () => { return Math.floor(new Date().getMinutes()/10); };
  numbers.MinuteOnes = () => { return Math.floor(new Date().getMinutes()%10); };
  numbers.Second = () => { return new Date().getSeconds(); };
  numbers.SecondAnalog = () => { let date = new Date(); return date.getSeconds() + (date.getMilliseconds()/999); };
  numbers.SecondTens = () => { return Math.floor(new Date().getSeconds()/10); };
  numbers.SecondOnes = () => { return Math.floor(new Date().getSeconds()%10); };
  numbers.WeekDay = () => { return new Date().getDay(); };
  numbers.WeekDayMondayFirst = () => {  let day = (new Date().getDay() - 1); if (day < 0) day = 7 + day; return day; };
  numbers.Day = () => { return new Date().getDate(); };
  numbers.DayTens = () => { return Math.floor(new Date().getDate()/10); };
  numbers.DayOnes = () => { return Math.floor(new Date().getDate()%10); };
  numbers.Month = () => { return new Date().getMonth() + 1; };
  numbers.MonthTens = () => { return Math.floor((new Date().getMonth() + 1)/10); };
  numbers.MonthOnes = () => { return Math.floor((new Date().getMonth() + 1)%10); };
  numbers.Pulse = () => { return pulse; };
  numbers.Steps = () => { return Bangle.getHealthStatus ? Bangle.getHealthStatus("day").steps : undefined; };
  numbers.StepsGoal = () => { return settings.stepsgoal || 10000; };
  numbers.Temperature = () => { return temp; };
  numbers.Pressure = () => { return press; };
  numbers.Altitude = () => { return alt; };
  numbers.BatteryPercentage = E.getBattery;
  numbers.BatteryVoltage = NRF.getBattery;
  numbers.WeatherCode = getWeatherCode;
  numbers.WeatherTemperature = () => { return getWeatherTemperature().value; };

  let multistates = {};
  multistates.Lock = () => { return Bangle.isLocked() ? "on" : "off"; };
  multistates.Charge = () => { return Bangle.isCharging() ? "on" : "off"; };
  multistates.Notifications = () => { return ((require("Storage").readJSON("setting.json", 1) || {}).quiet|0) ? "off" : "vibrate"; };
  multistates.Alarm = () => { return (require('Storage').readJSON('alarm.json',1)||[]).some(alarm=>alarm.on) ? "on" : "off"; };
  multistates.Bluetooth = () => { return NRF.getSecurityStatus().connected ? "on" : "off"; };
  //TODO: Implement peripheral connection status
  multistates.BluetoothPeripheral = () => { return NRF.getSecurityStatus().connected ? "on" : "off"; };
  multistates.HRM = () => { return Bangle.isHRMOn ? "on" : "off"; };
  multistates.Barometer = () => { return Bangle.isBarometerOn() ? "on" : "off"; };
  multistates.Compass = () => { return Bangle.isCompassOn() ? "on" : "off"; };
  multistates.GPS = () => { return Bangle.isGPSOn() ? "on" : "off"; };
  multistates.WeatherTemperatureNegative = () => { return getWeatherTemperature().value ? getWeatherTemperature().value : 0 < 0; };
  multistates.WeatherTemperatureUnit = () => { return getWeatherTemperature().unit; };
  multistates.StepsGoal = () => { return (numbers.Steps() >= (settings.stepsgoal || 10000)) ? "on": "off"; };

  let drawMultiState = function(graphics, resources, element){
    startPerfLog("drawMultiState");
    //print("drawMultiState", element);
    let value = multistates[element.Value]();
    //print("drawImage from drawMultiState", element, value);
    drawImage(graphics, resources, element, value);
    element.lastDrawnValue = value;
    endPerfLog("drawMultiState");
  };

  let pulse,alt,temp,press;


  let requestedDraws = 0;
  let isDrawing = false;

  let start;
  
  let deferredTimout;

  let initialDraw = function(resources, face){
    //print("Free memory", process.memory(false).free);
    requestedDraws++;
    if (!isDrawing){
      cleanupDelays();
      //print(new Date().toISOString(), "Can draw,", requestedDraws, "draws requested so far");
      isDrawing = true;
      requestedDraws = 0;
      //print(new Date().toISOString(), "Drawing start");
      startPerfLog("initialDraw");
      //print("Precompiled");
      let promise = precompiledJs(watchfaceResources, watchface);

      promise.then(()=>{
        let currentDrawingTime = Date.now();
        lastDrawTime = Date.now() - start;
        isDrawing=false;
        s.fd=false;
        requestRefresh = false;
        endPerfLog("initialDraw");
        endPerfLog("fullDraw", true);
        
        if (!Bangle.uiRemove){
          setUi(); // Calls Bangle.setUI() (this comment also fixes lint warning)
          let orig = Bangle.drawWidgets;
          Bangle.drawWidgets = ()=>{};
          Bangle.loadWidgets();
          Bangle.drawWidgets = orig;
          require("widget_utils").swipeOn(0);
          Bangle.drawWidgets();
        }
      }).catch((e)=>{
        print("Error during drawing", e);
      });

      if (requestedDraws > 0){
        //print(new Date().toISOString(), "Had deferred drawing left, drawing again");
        requestedDraws = 0;
        //print("Clear deferred timeout", deferredTimout);
        clearTimeout(deferredTimeout);
        deferredTimout = setTimeout(()=>{initialDraw(resources, face);}, 10);
      }
    } //else {
      //print("queued draw");
    //}
  };

  let handleHrm = function(e){
    if (e.confidence > 70){
      pulse = e.bpm;
      if (!redrawEvents || redrawEvents.includes("HRM") && !Bangle.isLocked()){
        //print("Redrawing on HRM");
        initialDraw(watchfaceResources, watchface);
      }
    }
  };

  let handlePressure = function(e){
    alt = e.altitude;
    temp = e.temperature;
    press = e.pressure;
    if (!redrawEvents || redrawEvents.includes("pressure") && !Bangle.isLocked()){
      //print("Redrawing on pressure");
      initialDraw(watchfaceResources, watchface);
    }
  };

  let handleCharging = function(e){
    if (!redrawEvents || redrawEvents.includes("charging") && !Bangle.isLocked()){
      //print("Redrawing on charging");
      initialDraw(watchfaceResources, watchface);
    }
  };


  let getMatchedWaitingTime = function(time){
    let result = time - (Date.now() % time);
    //print("Matched wating time", time, result);
    return result;
  };

  let setMatchedInterval = function(callable, time, intervalHandler, delay){
    //print("Setting matched interval for", time, intervalHandler);
    if (!delay) delay = 0;
    let matchedTime = getMatchedWaitingTime(time + delay);
    return setTimeout(()=>{
      let interval = setInterval(callable, time);
      //print("setMatchedInterval", interval);
      if (intervalHandler) intervalHandler(interval);
      callable();
    }, matchedTime);
  };

  endPerfLog("loadFunctions");

  let lastDrawTime = 0;

  startPerfLog("loadProperties");
  let lockedRedraw = getByPath(watchface, ["Properties","Redraw","Locked"]) || 60000;
  let unlockedRedraw = getByPath(watchface, ["Properties","Redraw","Unlocked"]) || 1000;
  let defaultRedraw = getByPath(watchface, ["Properties","Redraw","Default"]) || "Always";
  let redrawEvents = getByPath(watchface, ["Properties","Redraw","Events"]);
  let clearOnRedraw = getByPath(watchface, ["Properties","Redraw","Clear"]);
  let events = getByPath(watchface, ["Properties","Events"]);
  endPerfLog("loadProperties");

  //print("events", events);
  //print("redrawEvents", redrawEvents);

  let initialDrawTimeoutUnlocked;
  let initialDrawTimeoutLocked;
  
  let handleLock = function(isLocked, forceRedraw){
    //print("isLocked", Bangle.isLocked());
    for (let i of s.udi){
      //print("Clearing unlocked", i);
      clearInterval(i);
    }
    for (let i of s.ldi){
      //print("Clearing locked", i);
      clearInterval(i);
    }
    s.udi = [];
    s.ldi = [];

    if (!isLocked){
      if (forceRedraw || !redrawEvents || (redrawEvents.includes("unlock"))){
        //print("Redrawing on unlock", isLocked);
        initialDraw(watchfaceResources, watchface);
      }
      if (initialDrawTimeoutUnlocked){
        //print("clear initialDrawTimeUnlocked timet", initialDrawTimeoutUnlocked);
        clearTimeout(initialDrawTimeoutUnlocked);
      }
      initialDrawTimeoutUnlocked = setMatchedInterval(()=>{
        //print("Redrawing on unlocked interval");
        initialDraw(watchfaceResources, watchface);
      },unlockedRedraw, (v)=>{
        //print("New matched unlocked interval", v);
        s.udi.push(v);
      }, lastDrawTime);
      if (!events || events.includes("HRM")) Bangle.setHRMPower(1, "imageclock");
      if (!events || events.includes("pressure")) Bangle.setBarometerPower(1, 'imageclock');
    } else {
      if (forceRedraw || !redrawEvents || (redrawEvents.includes("lock"))){
        //print("Redrawing on lock", isLocked);
        initialDraw(watchfaceResources, watchface);
      }
      if (initialDrawTimeoutLocked){
        clearTimeout(initialDrawTimeoutLocked);
        //print("clear initialDrawTimeLocked timet", initialDrawTimeoutLocked);
      }
      initialDrawTimeoutLocked = setMatchedInterval(()=>{
        //print("Redrawing on locked interval");
        initialDraw(watchfaceResources, watchface);
      },lockedRedraw, (v)=>{
        //print("New matched locked interval", v);
        s.ldi.push(v);
      }, lastDrawTime);
      Bangle.setHRMPower(0, "imageclock");
      Bangle.setBarometerPower(0, 'imageclock');
    }
  };

  if (!events || events.includes("pressure")){
    Bangle.on('pressure', handlePressure);
    try{
      Bangle.setBarometerPower(1, 'imageclock');
    } catch (e){
      //print("Error during barometer power up", e);
    }
  }
  if (!events || events.includes("HRM")) {
    Bangle.on('HRM', handleHrm);
    Bangle.setHRMPower(1, "imageclock");
  }
  if (!events || events.includes("lock")) {
    Bangle.on('lock', handleLock);
  }
  if (!events || events.includes("charging")) {
    Bangle.on('charging', handleCharging);
  }
  
  handleLock(Bangle.isLocked(), true);

  let setUi = function(){
    Bangle.setUI({ 
      mode : "clock",
      remove : function() {
        //print("remove calls");
        // Called to unload all of the clock app
        Bangle.setHRMPower(0, "imageclock");
        Bangle.setBarometerPower(0, 'imageclock');

        Bangle.removeListener('lock', handleLock);
        Bangle.removeListener('charging', handleCharging);
        Bangle.removeListener('HRM', handleHrm);
        Bangle.removeListener('pressure', handlePressure);

        if (deferredTimout) clearTimeout(deferredTimout);
        if (initialDrawTimeoutUnlocked) clearTimeout(initialDrawTimeoutUnlocked);
        if (initialDrawTimeoutLocked) clearTimeout(initialDrawTimeoutLocked);

        for (let i of global.s.udi){
          //print("Clearing unlocked", i);
          clearInterval(i);
        }
        for (let i of global.s.ldi){
          //print("Clearing locked", i);
          clearInterval(i);
        }

        delete Bangle.printPerfLog;
        if (settings.perflog){
          delete Bangle.resetPerfLog;
        }
        cleanupDelays();
        require("widget_utils").show();
      }
    });
  }
}
