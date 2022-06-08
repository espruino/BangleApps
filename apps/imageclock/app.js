var watchface = require("Storage").readJSON("imageclock.face.json");
var watchfaceResources = require("Storage").readJSON("imageclock.resources.json");
var precompiledJs = eval(require("Storage").read("imageclock.draw.js"));
var settings = require('Storage').readJSON("imageclock.json", true) || {};

var performanceLog = {};

var startPerfLog = () => {};
var endPerfLog = () => {};
var printPerfLog = () => print("Deactivated");
var resetPerfLog = () => {performanceLog = {};};

var colormap={
"#000":0,
"#00f":1,
"#0f0":2,
"#0ff":3,
"#f00":4,
"#f0f":5,
"#ff0":6,
"#fff":7
};

var palette = new Uint16Array([
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
])

var p0 = g;
var p1;

if (settings.perflog){
  startPerfLog = function(name){
    var time = getTime();
    if (!performanceLog.start) performanceLog.start={};
    performanceLog.start[name] = time;
  };
  endPerfLog = function (name){
    var time = getTime();
    if (!performanceLog.last) performanceLog.last={};
    var duration = time - performanceLog.start[name];
    performanceLog.last[name] = duration;
    if (!performanceLog.cum) performanceLog.cum={};
    if (!performanceLog.cum[name]) performanceLog.cum[name] = 0;
    performanceLog.cum[name] += duration;
    if (!performanceLog.count) performanceLog.count={};
    if (!performanceLog.count[name]) performanceLog.count[name] = 0;
    performanceLog.count[name]++;
  };

  printPerfLog = function(){
    var result = "";
    var keys = [];
    for (var c in performanceLog.cum){
      keys.push(c);
    }
    keys.sort();
    for (var k of keys){
      print(k, "last:", (performanceLog.last[k] * 1000).toFixed(0), "average:", (performanceLog.cum[k]/performanceLog.count[k]*1000).toFixed(0), "count:", performanceLog.count[k], "total:", (performanceLog.cum[k] * 1000).toFixed(0));
    }
  };
}

function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t);
    });
}

function prepareImg(resource){
  startPerfLog("prepareImg");
  //print("prepareImg: ", resource);

  if (resource.dataOffset !== undefined){
    resource.buffer = E.toArrayBuffer(require("Storage").read("imageclock.resources.data", resource.dataOffset, resource.dataLength));
    delete resource.dataOffset;
    delete resource.dataLength;
    if (resource.paletteData){
      result.palette = new Uint16Array(resource.paletteData);
      delete resource.paletteData;
    }
  }
  endPerfLog("prepareImg");
  return resource;
}

function getByPath(object, path, lastElem){
  startPerfLog("getByPath");
  //print("getByPath", path,lastElem);
  var current = object;
  if (path.length) {
    for (var c of path){
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
}

function splitNumberToDigits(num){
  return String(num).split('').map(item => Number(item));
}

function isChangedNumber(element){
  return element.lastDrawnValue != getValue(element.Value);
}

function isChangedMultistate(element){
  return element.lastDrawnValue != getMultistate(element.Value);
}

function drawNumber(graphics, resources, element){
  startPerfLog("drawNumber");
  var number = getValue(element.Value);
  var spacing = element.Spacing ? element.Spacing : 0;
  var unit = element.Unit;
  
  var imageIndexMinus = element.ImageIndexMinus;
  var imageIndexUnit = element.ImageIndexUnit;
  var numberOfDigits = element.Digits;
  
  
  //print("drawNumber: ", number, element);
  if (number) number = number.toFixed(0);

  var isNegative;
  var digits;
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
  var firstDigitX = element.X;
  var firstDigitY = element.Y;
  var imageIndex = element.ImageIndex ? element.ImageIndex : 0;

  var firstImage;
  if (imageIndex){
    firstImage = getByPath(resources, [], "" + (0 + imageIndex));
  } else {
    firstImage = getByPath(resources, element.ImagePath, 0);
  }

  var minusImage;
  if (imageIndexMinus){
    minusImage = getByPath(resources, [], "" + (0 + imageIndexMinus));
  } else {
    minusImage = getByPath(resources, element.ImagePath, "minus");
  }

  var unitImage;
  //print("Get image for unit", imageIndexUnit);
  if (imageIndexUnit !== undefined){
    unitImage = getByPath(resources, [], "" + (0 + imageIndexUnit));
    //print("Unit image is", unitImage);
  } else if (element.Unit){
    unitImage = getByPath(resources, element.ImagePath, getMultistate(element.Unit, "unknown"));
  }

  var numberWidth = (numberOfDigits * firstImage.width) + (Math.max((numberOfDigits - 1),0) * spacing);
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

  var currentX = firstDigitX;
  if (isNegative && minusImage){
    //print("Draw minus at", currentX);
    if (imageIndexMinus){
      drawElement(graphics, resources, {X:currentX,Y:firstDigitY}, element, "" + (0 + imageIndexMinus));
    } else {
      drawElement(graphics, resources, {X:currentX,Y:firstDigitY}, element, "minus");
    }
    currentX += minusImage.width + spacing;
  }
  for (var d = 0; d < numberOfDigits; d++){
    var currentDigit;
    var difference = numberOfDigits - digits.length;
    if (d >= difference){
      currentDigit = digits[d-difference];
    } else {
      currentDigit = 0;
    }
    //print("Digit " + currentDigit + " " + currentX);
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
}

function drawElement(graphics, resources, pos, element, lastElem){
  startPerfLog("drawElement");
  var cacheKey = "_"+(lastElem?lastElem:"nole");
  if (!element.cachedImage) element.cachedImage={};
  if (!element.cachedImage[cacheKey]){
    var resource = getByPath(resources, element.ImagePath, lastElem);
    if (resource){
      prepareImg(resource);
      //print("lastElem", typeof resource)
      if (resource) {
        element.cachedImage[cacheKey] = resource;
        //print("cache res ",typeof element.cachedImage[cacheKey]);
      } else {
        element.cachedImage[cacheKey] = null;
        //print("cache null",typeof element.cachedImage[cacheKey]);
        //print("Could not create image from", resource);
      }
    } else {
      //print("Could not get resource from", element, lastElem);
    }
  }
  
  //print("cache ",typeof element.cachedImage[cacheKey], element.ImagePath, lastElem);
  if(element.cachedImage[cacheKey]){
    //print("drawElement ",pos, path, lastElem);
    //print("resource ", resource,pos, path, lastElem);
    //print("drawImage from drawElement", image, pos);
    var options={};
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
}

function getValue(value, defaultValue){
  if (typeof value == "string"){
    return numbers[value]();
  }
  if (value == undefined) return defaultValue;
  return value;
}

function getMultistate(name, defaultValue){
  if (typeof name == "string"){
    return multistates[name]();
  } else {
    if (name == undefined) return defaultValue;
  }
  return undefined;
}

function drawScale(graphics, resources, scale){
  startPerfLog("drawScale");
  //print("drawScale", scale);
  var segments = scale.Segments;
  var imageIndex = scale.ImageIndex !== undefined ? scale.ImageIndex : 0;

  var value = scaledown(scale.Value, scale.MinValue, scale.MaxValue);

  //print("Value is ", value, "(", maxValue, ",", minValue, ")");

  var segmentsToDraw = Math.ceil(value * segments.length);

  for (var i = 0; i < segmentsToDraw; i++){
    drawElement(graphics, resources, segments[i], scale, imageIndex + i);
  }
  scale.lastDrawnValue = segmentsToDraw;

  endPerfLog("drawScale");
}

function drawImage(graphics, resources, image, name){
  startPerfLog("drawImage");
  //print("drawImage", image.X, image.Y, name);
  if (image.Value && image.Steps){
    var steps = Math.floor(scaledown(image.Value, image.MinValue, image.MaxValue) * (image.Steps - 1));
    //print("Step", steps, "of", image.Steps);
    drawElement(graphics, resources, image, image, "" + steps);
  } else if (image.ImageIndex !== undefined) {
    drawElement(graphics, resources, image, image, image.ImageIndex);
  } else {
    drawElement(graphics, resources, image, image, name ? "" + name: undefined);
  }
  
  endPerfLog("drawImage");
}

function drawCodedImage(graphics, resources, image){
  startPerfLog("drawCodedImage");
  var code = getValue(image.Value);
  //print("drawCodedImage", image, code);

  if (image.ImagePath) {
    var factor = 1;
    var currentCode = code;
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
}

function getWeatherCode(){
  var jsonWeather = require("Storage").readJSON('weather.json');
  var weather = (jsonWeather && jsonWeather.weather) ? jsonWeather.weather : undefined;

  if (weather && weather.code){
    return weather.code;
  }
  return undefined;
}

function getWeatherTemperature(){
  var jsonWeather = require("Storage").readJSON('weather.json');
  var weather = (jsonWeather && jsonWeather.weather) ? jsonWeather.weather : undefined;

  var result = { unit: "unknown"};
  if (weather && weather.temp){
    //print("Weather is", weather);
    var temp = require('locale').temp(weather.temp-273.15);
    result.value = Number(temp.match(/[\d\-]*/)[0]);
    var unit;
    if (temp.includes("C")){
      result.unit = "celsius";
    } else if (temp.includes("F")){
      result.unit = "fahrenheit";
    }
  }
  return result;
}

function scaledown(value, min, max){
  //print("scaledown", value, min, max);
  var scaled = E.clip(getValue(value),getValue(min,0),getValue(max,1));
  scaled -= getValue(min,0);
  scaled /= getValue(max,1);
  return scaled;
}

function radians(rotation){
  var value = scaledown(rotation.RotationValue, rotation.MinRotationValue, rotation.MaxRotationValue);
  value -= rotation.RotationOffset ? rotation.RotationOffset : 0;
  value *= 360;
  value *= Math.PI / 180;
  return value;
}

function drawPoly(graphics, resources, element){
    startPerfLog("drawPoly");
    var vertices = [];

    startPerfLog("drawPoly_transform");
    for (var c of element.Vertices){
      vertices.push(c.X);
      vertices.push(c.Y);
    }
    var transform = { x: element.X ? element.X : 0,
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
}

function drawRect(graphics, resources, element){
    startPerfLog("drawRect");
    var vertices = [];

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
}

function drawCircle(graphics, resources, element){
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
}

var numbers = {};
numbers.Hour = () => { return new Date().getHours(); };
numbers.HourTens = () => { return Math.floor(new Date().getHours()/10); };
numbers.HourOnes = () => { return Math.floor(new Date().getHours()%10); };
numbers.Hour12 = () => { return new Date().getHours()%12; };
numbers.Hour12Analog = () => { var date = new Date(); return date.getHours()%12 + (date.getMinutes()/59); };
numbers.Hour12Tens = () => { return Math.floor((new Date().getHours()%12)/10); };
numbers.Hour12Ones = () => { return Math.floor((new Date().getHours()%12)%10); };
numbers.Minute = () => { return new Date().getMinutes(); };
numbers.MinuteAnalog = () => { var date = new Date(); return date.getMinutes() + (date.getSeconds()/59); };
numbers.MinuteTens = () => { return Math.floor(new Date().getMinutes()/10); };
numbers.MinuteOnes = () => { return Math.floor(new Date().getMinutes()%10); };
numbers.Second = () => { return new Date().getSeconds(); };
numbers.SecondAnalog = () => { var date = new Date(); return date.getSeconds() + (date.getMilliseconds()/999); };
numbers.SecondTens = () => { return Math.floor(new Date().getSeconds()/10); };
numbers.SecondOnes = () => { return Math.floor(new Date().getSeconds()%10); };
numbers.WeekDay = () => { return new Date().getDay(); };
numbers.WeekDayMondayFirst = () => {  var day = (new Date().getDay() - 1); if (day < 0) day = 7 + day; return day; };
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

var multistates = {};
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

function drawMultiState(graphics, resources, element){
  startPerfLog("drawMultiState");
  //print("drawMultiState", element);
  var value = multistates[element.Value]();
  //print("drawImage from drawMultiState", element, value);
  drawImage(graphics, resources, element, value);
  element.lastDrawnValue = value;
  endPerfLog("drawMultiState");
}

var pulse,alt,temp,press;


var requestedDraws = 0;
var isDrawing = false;

var drawingTime;

var start;

function initialDraw(resources, face){
  //print("Free memory", process.memory(false).free);
  requestedDraws++;
  if (!isDrawing){
    //print(new Date().toISOString(), "Can draw,", requestedDraws, "draws requested so far");
    isDrawing = true;
    resetPerfLog();
    requestedDraws = 0;
    //print(new Date().toISOString(), "Drawing start");
    startPerfLog("initialDraw");
    //start = Date.now();
    drawingTime = 0;
    //print("Precompiled");
    var promise = precompiledJs(watchfaceResources, watchface);

    promise.then(()=>{
      var currentDrawingTime = Date.now();
      if (showWidgets){
        //print("Draw widgets");
        Bangle.drawWidgets();
        g.setColor(g.theme.fg);
        g.drawLine(0,24,g.getWidth(),24);
      }
      lastDrawTime = Date.now() - start;
      drawingTime += Date.now() - currentDrawingTime;
      //print(new Date().toISOString(), "Drawing done in", lastDrawTime.toFixed(0), "active:", drawingTime.toFixed(0));
      isDrawing=false;
      firstDraw=false;
      requestRefresh = false;
      endPerfLog("initialDraw");
    }).catch((e)=>{
      print("Error during drawing", e);
    });

    if (requestedDraws > 0){
      //print(new Date().toISOString(), "Had deferred drawing left, drawing again");
      requestedDraws = 0;
      setTimeout(()=>{initialDraw(resources, face);}, 10);
    }
  } //else {
    //print("queued draw");
  //}
}

function handleHrm(e){
  if (e.confidence > 70){
    pulse = e.bpm;
    if (!redrawEvents || redrawEvents.includes("HRM") && !Bangle.isLocked()){
      //print("Redrawing on HRM");
      initialDraw(watchfaceResources, watchface);
    }
  }
}

function handlePressure(e){
  alt = e.altitude;
  temp = e.temperature;
  press = e.pressure;
  if (!redrawEvents || redrawEvents.includes("pressure") && !Bangle.isLocked()){
    //print("Redrawing on pressure");
    initialDraw(watchfaceResources, watchface);
  }
}

function handleCharging(e){
  if (!redrawEvents || redrawEvents.includes("charging") && !Bangle.isLocked()){
    //print("Redrawing on charging");
    initialDraw(watchfaceResources, watchface);
  }
}


function getMatchedWaitingTime(time){
  var result = time - (Date.now() % time);
  //print("Matched timeout", time, result);
  return result;
}



function setMatchedInterval(callable, time, intervalHandler, delay){
  //print("Setting matched interval for", time);
  var matchedTime = getMatchedWaitingTime(time + delay);
  setTimeout(()=>{
    var interval = setInterval(callable, time);
    if (intervalHandler) intervalHandler(interval);
    callable();
  }, matchedTime);
}

var unlockedDrawInterval;
var lockedDrawInterval;

var lastDrawTime = 0;
var firstDraw = true;

var lockedRedraw = getByPath(watchface, ["Properties","Redraw","Locked"]) || 60000;
var unlockedRedraw = getByPath(watchface, ["Properties","Redraw","Unlocked"]) || 1000;
var defaultRedraw = getByPath(watchface, ["Properties","Redraw","Default"]) || "Always";
var redrawEvents = getByPath(watchface, ["Properties","Redraw","Events"]);
var clearOnRedraw = getByPath(watchface, ["Properties","Redraw","Clear"]);
var events = getByPath(watchface, ["Properties","Events"]);

//print("events", events);
//print("redrawEvents", redrawEvents);

function handleLock(isLocked, forceRedraw){
  //print("isLocked", Bangle.isLocked());
  if (lockedDrawInterval) clearInterval(lockedDrawInterval);
  if (unlockedDrawInterval) clearInterval(unlockedDrawInterval);
  if (!isLocked){
    if (forceRedraw || !redrawEvents || (redrawEvents.includes("unlock"))){
      //print("Redrawing on unlock", isLocked);
      initialDraw(watchfaceResources, watchface);
    }
    setMatchedInterval(()=>{
      //print("Redrawing on unlocked interval");
      initialDraw(watchfaceResources, watchface);
    },unlockedRedraw, (v)=>{
      unlockedDrawInterval = v;
    }, lastDrawTime);
    if (!events || events.includes("HRM")) Bangle.setHRMPower(1, "imageclock");
    if (!events || events.includes("pressure")) Bangle.setBarometerPower(1, 'imageclock');
  } else {
    if (forceRedraw || !redrawEvents || (redrawEvents.includes("lock"))){
      //print("Redrawing on lock", isLocked);
      initialDraw(watchfaceResources, watchface);
    }
    setMatchedInterval(()=>{
      //print("Redrawing on locked interval");
      initialDraw(watchfaceResources, watchface);
    },lockedRedraw, (v)=>{
      lockedDrawInterval = v;
    }, lastDrawTime);
    Bangle.setHRMPower(0, "imageclock");
    Bangle.setBarometerPower(0, 'imageclock');
  }
}


var showWidgets = false;
var showWidgetsChanged = false;
var currentDragDistance = 0;

Bangle.setUI("clock");
Bangle.on('drag', (e)=>{
    currentDragDistance += e.dy;
    if (Math.abs(currentDragDistance) < 10) return;
    dragDown = currentDragDistance > 0;
    currentDragDistance = 0;
    if (!showWidgets && dragDown){
      //print("Enable widgets");
      if (WIDGETS && typeof WIDGETS === "object") {
        for (let w in WIDGETS) {
          var wd = WIDGETS[w];
          wd.draw = originalWidgetDraw[w];
          wd.area = originalWidgetArea[w];
        }
      }
      showWidgetsChanged = true;
    }
    if (showWidgets && !dragDown){
      //print("Disable widgets");
      clearWidgetsDraw();
      firstDraw = true;
      showWidgetsChanged = true;
    }
    if (showWidgetsChanged){
      showWidgetsChanged = false;
      //print("Draw after widget change");
      showWidgets = dragDown;
      initialDraw();
    }
  }
);

if (!events || events.includes("pressure")){
  Bangle.on('pressure', handlePressure);
  try{
    Bangle.setBarometerPower(1, 'imageclock');
  } catch (e){
    print("Error during barometer power up", e);
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

var originalWidgetDraw = {};
var originalWidgetArea = {};

function clearWidgetsDraw(){
  //print("Clear widget draw calls");
  if (WIDGETS && typeof WIDGETS === "object") {
    originalWidgetDraw = {};
    originalWidgetArea = {};
    for (let w in WIDGETS) {
      var wd = WIDGETS[w];
      originalWidgetDraw[w] = wd.draw;
      originalWidgetArea[w] = wd.area;
      wd.draw = () => {};
      wd.area = "";
    }
  }
}

setTimeout(()=>{
  Bangle.loadWidgets();
  clearWidgetsDraw();
}, 0);

handleLock(Bangle.isLocked());
