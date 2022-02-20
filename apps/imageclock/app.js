var face = require("Storage").readJSON("imageclock.face.json");
var resources = require("Storage").readJSON("imageclock.resources.json");

function getImg(resource){
  //print("getImg: ", resource);
  var buffer;
  if (resource.img){
    buffer = E.toArrayBuffer(atob(resource.img));
    //print("buffer from img");
  } else if (resource.file){
    buffer = E.toArrayBuffer(atob(require("Storage").read(resource.file)));
    //print("buffer from file");
  } else if (resource.compressed){
    buffer = require("heatshrink").decompress(atob(resource.compressed));
  }

  var result = {
    width: resource.width,
    height: resource.height,
    bpp: resource.bpp,
    buffer: buffer
  };
  if (resource.transparent) result.transparent = resource.transparent;
  if (resource.palette) result.palette = new Uint16Array(resource.palette);

  return result;
}

function getByPath(object, path, lastElem){
  var current = object;
  for (var c of path){
    if (!current[c]) return undefined;
    current = current[c];
  }
  if (lastElem!==undefined){
    if (!current["" + lastElem]) return undefined;
    current = current["" + lastElem];
  }
  return current;
}

function splitNumberToDigits(num){
  return String(num).split('').map(item => Number(item));
}

function drawNumber(element, offset){
  var number = numbers[element.Value]();
  //print("drawNumber: ", number, element, offset);
  if (number) number = number.toFixed(0);

  if (!element.Refresh || element.Refresh == "Always" || (element.Refresh == "Change" && element.lastDrawnValue && element.lastDrawnValue != number)){
    //var numberOffset = updateOffset(element, offset);
    var numberOffset = offset;

    var isNegative;
    var digits;
    if (number == undefined){
      isNegative = false;
      digits = ["minus","minus","minus"];
    } else {
      isNegative = number < 0;
      if (isNegative) number *= -1;
      digits = splitNumberToDigits(number);
    }

    //print("digits: ", digits);
    var numberOfDigits = element.Digits;
    if (!numberOfDigits) numberOfDigits = digits.length;
    var firstDigitX = element.X;
    var firstDigitY = element.Y;
    var firstImage = getByPath(resources, element.ImagePath, 0);

    if (element.Alignment == "BottomRight"){
      var digitWidth = firstImage.width + element.Spacing;
      var numberWidth = (numberOfDigits * digitWidth);
      if (isNegative){
        numberWidth += firstImage.width + element.Spacing;
      }
      //print("Number width: ", numberWidth, firstImage.width, element.Spacing);
      firstDigitX = element.X - numberWidth + 1;
      firstDigitY = element.Y - firstImage.height + 1;
      //print("Calculated start " + firstDigitX + "," + firstDigitY + " From:" + element.BottomRightX + " " + firstImage.width + " " + element.Spacing);
    }
    var currentX = firstDigitX;
    if (isNegative){
      drawElement({X:currentX,Y:firstDigitY}, numberOffset, element.ImagePath, "minus");
      currentX += firstImage.width + element.Spacing;
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
      drawElement({X:currentX,Y:firstDigitY}, numberOffset, element.ImagePath, currentDigit);
      currentX += firstImage.width + element.Spacing;
    }
    element.lastDrawnValue = number;
  }
}

function setColors(properties){
  if (properties.fg) g.setColor(properties.fg);
  if (properties.bg) g.setBgColor(properties.bg);
}

function drawElement(pos, offset, path, lastElem){
  //print("drawElement ",pos, offset, path, lastElem);
  var resource = getByPath(resources, path, lastElem);
  if (resource){
    //print("resource ",pos, offset, path, lastElem);
    var image = getImg(resource);
    if (image){
      offset = updateColors(pos, offset);
      setColors(offset);
      //print("drawImage from drawElement", image, pos, offset);
      var options={};
      if (pos.RotationValue){
        options.rotate = numbers[pos.RotationValue]();
        if (pos.MaxRotationValue) options.rotate /= pos.MaxRotationValue;
        if (pos.MinRotationValue) options.rotate -= pos.MinRotationValue;
        options.rotate = options.rotate * Math.PI* 2;
      }
      if (pos.Scale){
        options.scale = pos.ScaleValue;
      }
      //print("options", options);
      g.drawImage(image ,offset.X + pos.X,offset.Y + pos.Y, options);
    } else {
      //print("Could not create image from", resource);
    }
  } else {
    //print("Could not get resource from", path, lastElem);
  }
}

function checkRedraw(element, newValue){
  var redrawConfig = element.Redraw ? element.Redraw : defaultRedraw;
  switch(redrawConfig){
    case "Change":
      return !element.lastDrawnValue || element.lastDrawnValue != newValue;
    case "Never":
      return false;
    case "Always":
    default:
      return true;
  }
}

function drawScale(scale, offset){
  //print("drawScale", scale, offset);
  var segments = scale.Segments;
  var value = numbers[scale.Value]();
  var maxValue = scale.MaxValue ? scale.MaxValue : 1;
  var minValue = scale.MinValue ? scale.MinValue : 0;

  value = value/maxValue;
  value -= minValue;

  //print("Value is ", value, "(", maxValue, ",", minValue, ")");
  
  var scaleOffset = updateOffset(scale, offset);
  
  var segmentsToDraw = Math.ceil(value * segments.length);

  if (checkRedraw(scale, segmentsToDraw)){
    for (var i = 0; i < segmentsToDraw; i++){
      drawElement(segments[i], scaleOffset, scale.ImagePath, i);
    }
    scale.lastDrawnValue = segmentsToDraw;
  }
}

function drawDigit(element, offset, digit){
  drawElement(element, offset, element.ImagePath, digit);
}

function drawImage(image, offset, name){
  if (image.ImagePath) {
    //print("drawImage", image, offset, name);
    offset = updateColors(image, offset);
    drawElement(image, offset, image.ImagePath, name ? "" + name: undefined);
  } else if (image.ImageFile) {
    var file = require("Storage").readJSON(image.ImageFile);
    setColors(offset);
    g.drawImage(getImg(file),image.X + offset.X, image.Y + offsetY);
  }
}

function drawCodedImage(image, offset){
  var code = numbers[image.Value]();
  //print("drawCodedImage", image, offset, code);
  
  if (checkRedraw(image, code)){
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
        drawImage(image, offset, currentCode);
      } else {
        //print("fallback");
        drawImage(image, offset, "fallback");
      }
    }
    image.lastDrawnValue = code;
  }
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

  if (weather && weather.temp){
    //print("Weather temp is", weather.temp);
    return weather.temp - 273.15;
  }
  return undefined;
}

function updateOffset(element, offset){
  var newOffset = { X: offset.X, Y: offset.Y };
  if (element.X) newOffset.X += element.X;
  if (element.Y) newOffset.Y += element.Y;
  newOffset = updateColors(element, newOffset);
  //print("Updated offset from ", offset, "to", newOffset);
  return newOffset;
}

function updateColors(element, offset){
  var newOffset = { X: offset.X, Y: offset.Y };
  newOffset.fg = element.ForegroundColor ? element.ForegroundColor: offset.fg;
  newOffset.bg = element.BackgroundColor ? element.BackgroundColor: offset.bg;
  //print("Updated offset from ", offset, "to", newOffset);
  return newOffset;
}

var numbers = {};
numbers.Hour = () => { return new Date().getHours(); };
numbers.HourTens = () => { return Math.floor(new Date().getHours()/10); };
numbers.HourOnes = () => { return Math.floor(new Date().getHours()%10); };
numbers.Hour12 = () => { return new Date().getHours()%12; };
numbers.Hour12Tens = () => { return Math.floor((new Date().getHours()%12)/10); };
numbers.Hour12Ones = () => { return Math.floor((new Date().getHours()%12)%10); };
numbers.Minute = () => { return new Date().getMinutes(); };
numbers.MinuteTens = () => { return Math.floor(new Date().getMinutes()/10); };
numbers.MinuteOnes = () => { return Math.floor(new Date().getMinutes()%10); };
numbers.Second = () => { return new Date().getSeconds(); };
numbers.SecondTens = () => { return Math.floor(new Date().getSeconds()/10); };
numbers.SecondOnes = () => { return Math.floor(new Date().getSeconds()%10); };
numbers.Day = () => { return new Date().getDate(); };
numbers.DayTens = () => { return Math.floor(new Date().getDate()/10); };
numbers.DayOnes = () => { return Math.floor(new Date().getDate()%10); };
numbers.Month = () => { return new Date().getMonth() + 1; };
numbers.MonthTens = () => { return Math.floor((new Date().getMonth() + 1)/10); };
numbers.MonthOnes = () => { return Math.floor((new Date().getMonth() + 1)%10); };
numbers.Pulse = () => { return pulse; };
numbers.Steps = () => { return Bangle.getHealthStatus ? Bangle.getHealthStatus("day").steps : undefined; };
numbers.Temperature = () => { return temp; };
numbers.Pressure = () => { return press; };
numbers.Altitude = () => { return alt; };
numbers.BatteryPercentage = () => { return E.getBattery(); };
numbers.BatteryVoltage = () => { return NRF.getBattery(); };
numbers.WeatherCode = () => getWeatherCode();
numbers.WeatherTemperature = () => getWeatherTemperature();

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

function drawMultiState(element, offset){
  //print("drawMultiState", element, offset);
  var value = multistates[element.Value]();
  if (checkRedraw(element, value)){
    //print("drawImage from drawMultiState", element, offset, value);
    drawImage(element, offset, value);
    element.lastDrawnValue = value;
  }
}

function draw(element, offset){
  var initial = !element;
  if (initial){
    element = face;
    g.clear();
  }

  var elementOffset = updateOffset(element, offset);
  setColors(elementOffset);
  //print("Using offset", elementOffset);

  for (var current in element){
    //print("Handling ", current, " with offset ", elementOffset);
    var currentElement = element[current];
    try {
      switch(current){
        case "X":
        case "Y":
        case "Properties":
        case "ForegroundColor":
        case "BackgroundColor":
          //Nothing to draw for these
          break;
        case "MultiState":
          drawMultiState(currentElement, elementOffset);
          break;
        case "Image":
          drawImage(currentElement, elementOffset);
          break;
        case "CodedImage":
          drawCodedImage(currentElement, elementOffset);
          break;
        case "Number":
          drawNumber(currentElement, elementOffset);
          break;
        case "Scale":
          drawScale(currentElement, elementOffset);
          break;
        default:
          //print("Enter next level", elementOffset);
          draw(currentElement, elementOffset);
          //print("Done next level");
      }
    } catch (e){
      print("Error during drawing of", current, "in", element, e);
    }
  }
  //print("Finished drawing loop");
}

var pulse,alt,temp,press;


var zeroOffset={X:0,Y:0};


var requestedDraws = 0;
var isDrawing = false;

function initialDraw(){
  print("Free memory", process.memory(false).free);
  requestedDraws++;
  if (!isDrawing){
    //print(new Date().toISOString(), "Can draw,", requestedDraws, "draws requested so far");
    isDrawing = true;
    requestedDraws = 0;
    //print(new Date().toISOString(), "Drawing start");
    draw(undefined, zeroOffset);
    //print(new Date().toISOString(), "Drawing done");
    isDrawing = false;
    if (requestedDraws > 0){
      //print(new Date().toISOString(), "Had deferred drawing left, drawing again");
      requestedDraws = 0;
      draw(undefined, zeroOffset);
    }
  }
}

function handleHrm(e){
  if (e.confidence > 70){
    pulse = e.bpm;
    if (!redrawEvents || redrawEvents.includes("HRM")){
      initialDraw();
    }
  }
}

function handlePressure(e){
  alt = e.altitude;
  temp = e.temperature;
  press = e.pressure;
  if (!redrawEvents || redrawEvents.includes("pressure")){
    initialDraw();
  }
}

var unlockedDrawInterval;

var lockedRedraw = getByPath(face, ["Properties","Redraw","Locked"]);
var unlockedRedraw = getByPath(face, ["Properties","Redraw","Unlocked"]);
var defaultRedraw = getByPath(face, ["Properties","Redraw","Default"]) || "Always";
var redrawEvents = getByPath(face, ["Properties","Redraw","Events"]);
var events = getByPath(face, ["Properties","Events"]);

//print("events", events);
//print("redrawEvents", redrawEvents);

function handleLock(isLocked){
  if (!isLocked){
    Bangle.setHRMPower(1, "imageclock");
    Bangle.setBarometerPower(1, 'imageclock');
    unlockedDrawInterval = setInterval(()=>{
      initialDraw();
    },unlockedRedraw?unlockedRedraw:1000);
  } else {
    Bangle.setHRMPower(0, "imageclock");
    Bangle.setBarometerPower(0, 'imageclock');
    if (unlockedDrawInterval) clearInterval(unlockedDrawInterval);
  }
  if (!redrawEvents || redrawEvents.includes("lock")){
    initialDraw();
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

setInterval(()=>{
  initialDraw();
}, lockedRedraw ? lockedRedraw : 60000);

initialDraw();
