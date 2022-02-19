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
  }

  var result = {
    width: resource.width,
    height: resource.height,
    bpp: resource.bpp,
    buffer: buffer
  };
  if (resource.transparent) result.transparent = resource.transparent;

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

function drawNumber(element, offset, number){
  //print("drawNumber: ", element, number);
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
  var firstDigitX = element.TopLeftX;
  var firstDigitY = element.TopLeftY;
  var firstImage = getByPath(resources, element.ImagePath, 0);

  if (element.Alignment == "BottomRight"){
    var digitWidth = firstImage.width + element.Spacing;
    var numberWidth = (numberOfDigits * digitWidth);
    if (isNegative){
      numberWidth += firstImage.width + element.Spacing;
    }
    //print("Number width: ", numberWidth, firstImage.width, element.Spacing);
    firstDigitX = element.BottomRightX - numberWidth + 1;
    firstDigitY = element.BottomRightY - firstImage.height + 1;
    //print("Calculated start " + firstDigitX + "," + firstDigitY + " From:" + element.BottomRightX + " " + firstImage.width + " " + element.Spacing);
  }
  var currentX = firstDigitX;
  
  if (isNegative){
    drawElement({X:currentX,Y:firstDigitY}, offset, element.ImagePath, "minus");
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
    drawElement({X:currentX,Y:firstDigitY}, offset, element.ImagePath, currentDigit);
    currentX += firstImage.width + element.Spacing;
  }
}

function setColors(properties){
  if (properties.fg) g.setColor(properties.fg);
  if (properties.bg) g.setBgColor(properties.bg);
}

function drawElement(pos, offset, path, lastElem){
  //print("drawElement ",pos, offset, path, lastElem);
  var image = getByPath(resources, path, lastElem);
  if (image){
    setColors(offset);
    g.drawImage(getImg(image),offset.X + pos.X,offset.Y + pos.Y);
  } else {
    print("Could not create image from", path, lastElem);
  }
}

function drawScale(scale, offset, value){
  var segments = scale.Segments;
  for (var i = 0; i < value * segments.length; i++){
    drawElement(segments[i], offset, scale.ImagePath, i);
  }
}

function drawDigit(element, offset, digit){
  drawElement(element, offset, element.ImagePath, digit);
}

function drawMonthAndDay(element, offset){
  var date = new Date();
  
  var dateOffset = updateOffset(element, offset);
  
  if (element.Separate){
    var separateOffset = updateOffset(element.Separate, dateOffset);
    drawNumber(element.Separate.Month, separateOffset, date.getMonth() + 1);
    drawNumber(element.Separate.Day, separateOffset, date.getDate());
  }
}

function drawImage(image, offset, name){
  if (image.ImagePath) {
    //print("drawImage", image, offset, name);
    drawElement(image, offset, image.ImagePath, name ? "" + name: undefined);
  } else if (image.ImageFile) {
    var file = require("Storage").readJSON(image.ImageFile);
    setColors(offset);
    g.drawImage(getImg(file),image.X + offset.X, image.Y + offsetY);
  }
}

function drawWeather(element, offset){
  var jsonWeather = require("Storage").readJSON('weather.json');
  var weather = jsonWeather && jsonWeather.weather ? jsonWeather.weather : undefined;

  var weatherOffset = updateOffset(element, offset);
  
  var iconOffset = updateOffset(element.Icon, weatherOffset);
  if (weather && weather.code && element.Icon){
    var weathercode = weather.code;
    //print(getByPath(resources, element.Icon.CustomIcon.ImagePath, weathercode));
    if (!getByPath(resources, element.Icon.CustomIcon.ImagePath, weathercode)){
      weathercode = Math.floor(weathercode/10)*10;
      //print("Weathercode ", weathercode);
    }
    if (!getByPath(resources, element.Icon.CustomIcon.ImagePath, weathercode)){
      weathercode = Math.floor(weathercode/100)*100;
      //print("Weathercode ", weathercode);
    }
    if (getByPath(resources, element.Icon.CustomIcon.ImagePath, weathercode)){
      //print("Weathercode ", weathercode);
      drawImage(element.Icon.CustomIcon, offset, weathercode);
    }
  } else if (getByPath(resources, element.Icon.CustomIcon.ImagePath, "000")) {
    drawImage(element.Icon.CustomIcon, iconOffset, "000");
  }

  if (element.Temperature){
    var tempOffset = updateOffset(element.Temperature, weatherOffset);
    if (weather && weather.temp && element.Temperature){
      drawNumber(element.Temperature.Current.Number, tempOffset, (weather.temp - 273.15).toFixed(0));
    } else {
      drawNumber(element.Temperature.Current.Number, tempOffset);
    }
    drawImage(element.Temperature.Current, tempOffset, "centigrade");
  }

}

function updateOffset(element, offset){
  var newOffset = { X: offset.X, Y: offset.Y };
  if (element.X) newOffset.X += element.X;
  if (element.Y) newOffset.Y += element.Y;
  newOffset.fg = element.ForegroundColor ? element.ForegroundColor: offset.fg;
  newOffset.bg = element.BackgroundColor ? element.BackgroundColor: offset.bg;
  //print("Updated offset from ", offset, "to", newOffset);
  return newOffset;
}

function drawTime(element, offset){
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  
  var offsetTime = updateOffset(element, offset);

  var offsetHours = updateOffset(element.Hours, offsetTime);
  if (element.Hours.Tens) {
    drawDigit(element.Hours.Tens, offsetHours, Math.floor(hours/10));
  }

  if (element.Hours.Ones) {
    drawDigit(element.Hours.Ones, offsetHours, hours % 10);
  }

  var offsetMinutes = updateOffset(element.Minutes, offsetTime);
  if (element.Minutes.Tens) {
    drawDigit(element.Minutes.Tens, offsetMinutes, Math.floor(minutes/10));
  }

  if (element.Minutes.Ones) {
    drawDigit(element.Minutes.Ones, offsetMinutes, minutes % 10);
  }
}

function drawSteps(element, offset){
  //print("drawSteps", element, offset);
  if (Bangle.getHealthStatus) {
    drawNumber(element.Number, offset, Bangle.getHealthStatus("day").steps);
  } else {
    drawNumber(element.Number, offset);
  }
}

function drawBattery(element, offset){
  if (element.Scale){
    drawScale(element.Scale, offset, E.getBattery()/100);
  }
}

function drawStatus(element, offset){
  var statusOffset = updateOffset(element, offset);
  if (element.Lock) drawImage(element.Lock, statusOffset, Bangle.isLocked() ? "on" : "off");
  if (element.Charge) drawImage(element.Charge, statusOffset, Bangle.isCharging() ? "on" : "off");
  if (element.Bluetooth) drawImage(element.Bluetooth, statusOffset, NRF.getSecurityStatus().connected ? "on" : "off");
  if (element.Alarm) drawImage(element.Alarm, statusOffset, (require('Storage').readJSON('alarm.json',1)||[]).some(alarm=>alarm.on) ? "on" : "off");
  if (element.Notifications) drawImage(element.Notifications, statusOffset, ((require("Storage").readJSON("setting.json", 1) || {}).quiet|0) ? "soundoff" : "vibrate");
}

function draw(element, offset){
  if (!element){
    element = face;
    g.clear();
  }
  g.setColor(g.theme.fg);
  g.setBgColor(g.theme.bg);

  var elementOffset = updateOffset(element, offset);
  setColors(elementOffset);
  //print("Using offset", elementOffset);

  //print("Starting drawing loop", element);
  for (var current in element){
    //print("Handling ", current, " with offset ", elementOffset);
    var currentElement = element[current];
    switch(current){
      case "X":
      case "Y":
      case "Properties":
      case "ForegroundColor":
      case "BackgroundColor":
        //Nothing to draw for these
        break;
      case "Background":
        drawImage(currentElement, elementOffset);
        break;
      case "Time":
        drawTime(currentElement, elementOffset);
        break;
      case "Battery":
        drawBattery(currentElement, elementOffset);
        break;
      case "Steps":
        drawSteps(currentElement, elementOffset);
        break;
      case "Pulse":
        if (pulse) drawNumber(currentElement.Number, elementOffset, pulse);
        break;
      case "Pressure":
        if (press) drawNumber(currentElement.Number, elementOffset, press.toFixed(0));
        break;
      case "Altitude":
        if (alt) drawNumber(currentElement.Number, elementOffset, alt.toFixed(0));
        break;
      case "Temperature":
        if (temp) drawNumber(currentElement.Number, elementOffset, temp.toFixed(0));
        break;
      case "MonthAndDay":
        drawMonthAndDay(currentElement, elementOffset);
        break;
      case "Weather":
        drawWeather(currentElement, elementOffset);
        break;
      case "Status":
        drawStatus(currentElement, elementOffset);
        break;
      default:
        //print("Enter next level", currentElement, elementOffset);
        draw(currentElement, elementOffset);
    }
  }
  //print("Finished drawing loop");
}

var pulse,alt,temp,press;


var zeroOffset={X:0,Y:0};


function handleHrm(e){
  if (e.confidence > 70){
    pulse = e.bpm;
  }
}

function handlePressure(e){
  alt = e.altitude;
  temp = e.temperature;
  press = e.pressure;
}


var unlockedDrawInterval;

var lockedRedraw = getByPath(face, ["Properties","Redraw","Locked"]);
var unlockedRedraw = getByPath(face, ["Properties","Redraw","Unlocked"]);

function handleLock(isLocked){
  if (!isLocked){
    Bangle.setHRMPower(1, "imageclock");
    Bangle.setBarometerPower(1, 'imageclock');
    unlockedDrawInterval = setInterval(()=>{
      draw(face, zeroOffset);
    },unlockedRedraw?unlockedRedraw:1000);
    draw(face, zeroOffset);
  } else {
    Bangle.setHRMPower(0, "imageclock");
    Bangle.setBarometerPower(0, 'imageclock');
    clearInterval(unlockedDrawInterval);
  }

}

Bangle.setUI("clock");

Bangle.on('pressure', handlePressure);
Bangle.on('HRM', handleHrm);
Bangle.on('lock', handleLock);



draw(face, zeroOffset);


setInterval(()=>{
  draw(face, zeroOffset);
}, lockedRedraw ? lockedRedraw : 6000);
