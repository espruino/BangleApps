//load fonts
require("FontSinclair").add(Graphics);
require("FontTeletext5x9Ascii").add(Graphics);

//const

const numbers = {
  "0": "Twelve",
  "1": "One",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  "10": "Ten",
  "11": "Eleven",
  "12": "Twelve",
  "13": "One",
  "14": "Two",
  "15": "Three",
  "16": "Four",
  "17": "Five",
  "18": "Six",
  "19": "Seven",
  "20": "Eight",
  "21": "Nine",
  "22": "Ten",
  "23": "Eleven",
  "24": "Twelve",
};

const minutesByQuarterString = {
  0: "O'Clock",
  15: "Fifteen",
  30: "Thirty",
  45: "Fourty-Five"
};

const width = g.getWidth();
const height = g.getHeight();
let idTimeout = null;

const getNearestHour = (hours, minutes) => {
  if (minutes > 49){
    return hours + 1;
  }
  return hours;
};

const getApproximatePrefix = (minutes, minutesByQuarter) => {
  if (minutes === minutesByQuarter){
    return " exactly";
  } else if (minutesByQuarter - minutes < -5){
    return " after";
  } else if (minutesByQuarter - minutes < 0){
           return " just after";
  } else if (minutesByQuarter - minutes > 5){
    return " before";
  } else {
    return " nearly";
  }
};

const getMinutesByQuarter = minutes => {
  if (minutes < 10){
    return 0;
  } else if (minutes < 20) {
    return 15;
  } else if (minutes < 40){
    return 30;
  } else {
    return 45;
  }
};

const drawTime = () => {
  //Grab time vars
  var date = Date();
  var hour = date.getHours();
  var minutes = date.getMinutes();
  var minutesByQuarter = getMinutesByQuarter(minutes);
  
  //reset graphics
  g.clear();
  g.reset();
  
  g.setBgColor(0,0,0);
  g.clearRect(0, 0, width, height);
  g.setFont("Vector", 22);
  g.setColor(1,1,1);
  g.drawString("It's" + getApproximatePrefix(minutes, minutesByQuarter), (width - g.stringWidth("It's" + getApproximatePrefix(minutes, minutesByQuarter)))/2, height * 0.25, false);
  g.setFont("Vector", 30);
  g.drawString(numbers[getNearestHour(hour, minutes)], (width - g.stringWidth(numbers[getNearestHour(hour, minutes)]))/2, height * 0.45, false);
  g.setFont("Vector", 22);
  g.drawString(minutesByQuarterString[minutesByQuarter], (width - g.stringWidth(minutesByQuarterString[minutesByQuarter]))/2, height * 0.7, false);
  let d = Date();
  let t = d.getSeconds()*1000 + d.getMilliseconds();
  idTimeout = setTimeout(drawTime, 60000 - t);
};

g.clear();
drawTime();

Bangle.on('lcdPower', function(on){
  if (on) {
    drawTime();
  } else {
    if(idTimeout) {
      clearTimeout(idTimeout);
    }
  }
});

//var secondInterval = setInterval(draw, 1000);
// Stop updates when LCD is off, restart when on
//Bangle.on('lcdPower',on=>{
//  if (secondInterval) clearInterval(secondInterval);
//  secondInterval = undefined;
//  if (on) {
//   secondInterval = setInterval(draw, 1000);
//    g.clear();
//    draw(); // draw immediately
//  }
//});

// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();