var watchface = require("Storage").readJSON("imageclock.face.json");
var watchfaceResources = require("Storage").readJSON("imageclock.resources.json");
var precompiledJs = require("Storage").read("imageclock.draw.js");

var performanceLog = {};

var startPerfLog = () => {};
var endPerfLog = () => {};
var printPerfLog = () => print("Deactivated");
var resetPerfLog = () => {performanceLog = {};};

if (false){
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

function drawNumber(resources, element, offset){
  startPerfLog("drawNumber");
  var number = getValue(element.Value);
  var spacing = element.Spacing ? element.Spacing : 0;
  var unit = element.Unit;
  
  var imageIndexMinus = element.ImageIndexMinus;
  var imageIndexUnit = element.ImageIndexUnit;
  var numberOfDigits = element.Digits;
  
  
  //print("drawNumber: ", number, element, offset);
  if (number) number = number.toFixed(0);

  //var numberOffset = updateOffset(element, offset);
  var numberOffset = offset;

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
      drawElement(resources, {X:currentX,Y:firstDigitY}, numberOffset, element.ImagePath, "" + (0 + imageIndexMinus));
    } else {
      drawElement(resources, {X:currentX,Y:firstDigitY}, numberOffset, element.ImagePath, "minus");
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
    drawElement(resources, {X:currentX,Y:firstDigitY}, numberOffset, element.ImagePath, currentDigit + imageIndex);
    currentX += firstImage.width + spacing;
  }
  if (imageIndexUnit){
    //print("Draw unit at", currentX);
    drawElement(resources, {X:currentX,Y:firstDigitY}, numberOffset, element.ImagePath, "" + (0 + imageIndexUnit));
  } else if (element.Unit){
    drawElement(resources, {X:currentX,Y:firstDigitY}, numberOffset, element.ImagePath, getMultistate(element.Unit,"unknown"));
  }
  element.lastDrawnValue = number;

  endPerfLog("drawNumber");
}

function setColors(properties){
  if (properties.fg) g.setColor(properties.fg);
  if (properties.bg) g.setBgColor(properties.bg);
}

function drawElement(resources, pos, offset, path, lastElem){
  startPerfLog("drawElement");
  //print("drawElement ",pos, offset, path, lastElem);
  //print("drawElement offset", offset, pos.X, pos.Y);
  var resource = getByPath(resources, path, lastElem);
  //print("Got resource", resource);
  if (resource){
    //print("resource ", resource,pos, offset, path, lastElem);
    var image = prepareImg(resource);
    if (image){
      var imageOffset = updateColors(pos, offset);
      setColors(imageOffset);
      //print("drawImage from drawElement", image, pos, offset);
      var options={};
      if (pos.RotationValue){
        options.rotate = radians(pos);
      }
      if (pos.Scale){
        options.scale = pos.ScaleValue;
      }
      //print("options", options);
      //print("Memory before drawing", process.memory(false));
      startPerfLog("drawElement_g.drawImage");
      g.drawImage(image ,(imageOffset.X ? imageOffset.X : 0) + (pos.X ? pos.X : 0),(imageOffset.Y ? imageOffset.Y :0) + (pos.Y ? pos.Y : 0), options);
      endPerfLog("drawElement_g.drawImage");
    } else {
      //print("Could not create image from", resource);
    }
  } else {
    //print("Could not get resource from", path, lastElem);
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

function drawScale(resources, scale, offset){
  startPerfLog("drawScale");
  //print("drawScale", scale, offset);
  var segments = scale.Segments;
  var imageIndex = scale.ImageIndex !== undefined ? scale.ImageIndex : 0;

  var value = scaledown(scale.Value, scale.MinValue, scale.MaxValue);

  //print("Value is ", value, "(", maxValue, ",", minValue, ")");
  
  var scaleOffset = updateOffset(scale, offset);
  
  var segmentsToDraw = Math.ceil(value * segments.length);

  for (var i = 0; i < segmentsToDraw; i++){
    drawElement(resources, segments[i], scaleOffset, scale.ImagePath, imageIndex + i);
  }
  scale.lastDrawnValue = segmentsToDraw;

  endPerfLog("drawScale");
}

function drawDigit(resources, element, offset, digit){
  drawElement(resources, element, offset, element.ImagePath, digit);
}

function drawImage(resources, image, offset, name){
  startPerfLog("drawImage");
  var imageOffset = updateColors(image, offset);
  //print("drawImage", image, offset, name);
  if (image.Value && image.Steps){
    var steps = Math.floor(scaledown(image.Value, image.MinValue, image.MaxValue) * (image.Steps - 1));
    //print("Step", steps, "of", image.Steps);
    drawElement(resources, image, imageOffset, image.ImagePath, "" + steps);
  } else if (image.ImageIndex !== undefined) {
    drawElement(resources, image, imageOffset, image.ImagePath, image.ImageIndex);
  } else {
    drawElement(resources, image, imageOffset, image.ImagePath, name ? "" + name: undefined);
  }
  
  endPerfLog("drawImage");
}

function drawCodedImage(resources, image, offset){
  startPerfLog("drawCodedImage");
  var code = getValue(image.Value);
  //print("drawCodedImage", image, offset, code);

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
      drawImage(resources, image, offset, currentCode);
    } else {
      //print("fallback");
      drawImage(resources, image, offset, "fallback");
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

function updateOffset(element, offset){
  startPerfLog("updateOffset");
  var newOffset = { X: offset.X ? offset.X : 0, Y: offset.Y ? offset.Y : 0 };
  if (element && element.X) newOffset.X += element.X;
  if (element && element.Y) newOffset.Y += element.Y;
  newOffset = updateColors(element, newOffset);
  //print("Updated offset from ", offset, "to", newOffset);
  endPerfLog("updateOffset");
  return newOffset;
}

function updateColors(element, offset){
  var newOffset = { X: offset.X ? offset.X : 0, Y: offset.Y ? offset.Y : 0 };
  if (element){
    newOffset.fg = element.ForegroundColor ? element.ForegroundColor: offset.fg;
    newOffset.bg = element.BackgroundColor ? element.BackgroundColor: offset.bg;
  }
  //print("Updated offset from ", offset, "to", newOffset);
  return newOffset;
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

function drawPoly(resources, element, offset){
    startPerfLog("drawPoly");
    var vertices = [];
    var primitiveOffset = offset.clone();
    if (element.X) primitiveOffset.X += element.X;
    if (element.Y) primitiveOffset.Y += element.Y;

    startPerfLog("drawPoly_transform");
    for (var c of element.Vertices){
      vertices.push(c.X);
      vertices.push(c.Y);
    }
    var transform = { x: primitiveOffset.X,
      y: primitiveOffset.Y
    };
    if (element.RotationValue){
      transform.rotate = radians(element);
    }
    vertices = g.transformVertices(vertices, transform);

    endPerfLog("drawPoly_transform");

    if (element.ForegroundColor) g.setColor(element.ForegroundColor);

    if (element.Filled){
      startPerfLog("drawPoly_g.fillPoly");
      g.fillPoly(vertices,true);
      endPerfLog("drawPoly_g.fillPoly");
    }

    if (element.BackgroundColor) g.setColor(element.BackgroundColor);
    startPerfLog("drawPoly_g.drawPoly");
    g.drawPoly(vertices,true);
    endPerfLog("drawPoly_g.drawPoly");
    
    endPerfLog("drawPoly");
}

function drawRect(resources, element, offset){
    startPerfLog("drawRect");
    var vertices = [];
    var primitiveOffset = offset.clone();
    if (element.X) primitiveOffset.X += element.X;
    if (element.Y) primitiveOffset.Y += element.Y;

    if (element.ForegroundColor) g.setColor(element.ForegroundColor);

    if (element.Filled){
      startPerfLog("drawRect_g.fillRect");
      g.fillRect(primitiveOffset.X, primitiveOffset.Y, primitiveOffset.X + element.Width, primitiveOffset.Y + element.Height);
      endPerfLog("drawRect_g.fillRect");
    } else {
      startPerfLog("drawRect_g.fillRect");
      g.drawRect(primitiveOffset.X, primitiveOffset.Y, primitiveOffset.X + element.Width, primitiveOffset.Y + element.Height);
      endPerfLog("drawRect_g.fillRect");
    }
    endPerfLog("drawRect");
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
numbers.StepsGoal = () => { return stepsgoal; };
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
multistates.StepsGoal = () => { return (numbers.Steps() >= stepsgoal) ? "on": "off"; };

function drawMultiState(resources, element, offset){
  startPerfLog("drawMultiState");
  //print("drawMultiState", element, offset);
  var value = multistates[element.Value]();
  //print("drawImage from drawMultiState", element, offset, value);
  drawImage(resources, element, offset, value);
  element.lastDrawnValue = value;
  endPerfLog("drawMultiState");
}

function drawIteratively(resources, items){
  //print("drawIteratively");
  startPerfLog("drawIteratively");
  for (var c of items){
    startPerfLog("drawIteratively_handling_" + c.type);
    if (c.value.HideOn && c.value.HideOn == "Lock" && Bangle.isLocked()){
      //print("Hiding", current);
      continue;
    }
    switch(c.type){
      case "MultiState":
        drawMultiState(resources, c.value, zeroOffset);
        break;
      case "Image":
        drawImage(resources, c.value, zeroOffset);
        break;
      case "CodedImage":
        drawCodedImage(resources, c.value, zeroOffset);
        break;
      case "Number":
        drawNumber(resources, c.value, zeroOffset);
        break;
      case "Poly":
        drawPoly(resources, c.value, zeroOffset);
        break;
      case "Scale":
        drawScale(resources, c.value, zeroOffset);
        break;
    }
    endPerfLog("drawIteratively_handling_" + c.type);
  }
  endPerfLog("drawIteratively");
}

function draw(resources, root, path, offset){
  //print("draw", path);
  startPerfLog("draw_"+ path.join("_"));

  var element = getByPath(root, path);
  var elementOffset = updateOffset(element, offset);
  setColors(elementOffset);
  //print("Using offset", elementOffset);
  if (Array.isArray(element))
    drawIteratively(element);
  else {
    //print("Using offset", elementOffset);

    for (var current in element){
      //print("Handling ", current, " with offset ", elementOffset);
      startPerfLog("draw_handling_"+ path.join("_")+"_"+current);
      var currentElement = element[current];
      try {
        switch(current){
          case "X":
          case "Y":
          case "Properties":
          case "ForegroundColor":
          case "BackgroundColor":
          case "HideOn":
            //print("Hiding", current);
            break;
          case "MultiState":
            drawMultiState(resources, currentElement, elementOffset);
            break;
          case "Image":
            drawImage(resources, currentElement, elementOffset);
            break;
          case "CodedImage":
            drawCodedImage(resources, currentElement, elementOffset);
            break;
          case "Number":
            drawNumber(resources, currentElement, elementOffset);
            break;
          case "Poly":
            drawPoly(currentElement, elementOffset);
            break;
          case "Scale":
            drawScale(resources, currentElement, elementOffset);
            break;
          default:
            //print("Enter next level", elementOffset);
            if (currentElement.HideOn && currentElement.HideOn == "Lock" && Bangle.isLocked()){
              //print("Hiding", current);
              continue;
            }
            draw(resources, root, path.concat(current), elementOffset);
            //print("Done next level");
        }
        endPerfLog("draw_handling_"+ path.join("_")+"_"+current);
        //print("Drawing of", current, "in", (Date.now() - start).toFixed(0), "ms");
      } catch (e){
        print("Error during drawing of", current, "in", element, e, e.stack);
      }
    }
  }
  //print("Finished drawing loop");
  
  endPerfLog("draw_"+ path.join("_"));
}

var pulse,alt,temp,press;


var zeroOffset={X:0,Y:0};


var requestedDraws = 0;
var isDrawing = false;


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
    //var start = Date.now();
    if (clearOnRedraw) g.clear(true);
    if (precompiledJs && precompiledJs.length > 7){
      //print("Precompiled");
      eval(precompiledJs);
    } else if (face.Collapsed){
      //print("Collapsed");
      drawIteratively(resources, face.Collapsed);
    } else {
      //print("Full");
      draw(resources, face, [], zeroOffset);
    }
    endPerfLog("initialDraw");
    lastDrawTime = (Date.now() - start);
    //print(new Date().toISOString(), "Drawing done", lastDrawTime.toFixed(0));
    firstDraw = false;
    isDrawing = false;
    if (requestedDraws > 0){
      //print(new Date().toISOString(), "Had deferred drawing left, drawing again");
      requestedDraws = 0;
      setTimeout(()=>{initialDraw(resources, face);}, 10);
    }
  } else {
    print("queued draw");
  }
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

var stepsgoal = 2000;

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
    Bangle.setHRMPower(1, "imageclock");
    Bangle.setBarometerPower(1, 'imageclock');
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

Bangle.setUI("clock");

if (!events || events.includes("pressure")){
  Bangle.on('pressure', handlePressure);
  Bangle.setBarometerPower(1, 'imageclock');
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

function clearWidgetsDraw(){
  if (WIDGETS && typeof WIDGETS === "object") {
    for (let wd of WIDGETS) {
      wd.draw = () => {};
      wd.area = "";
    }
  }
}

setTimeout(()=>{
  Bangle.loadWidgets();
  clearWidgetsDraw();
}, 100);

handleLock(Bangle.isLocked());
