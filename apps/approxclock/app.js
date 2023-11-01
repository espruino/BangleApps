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

const width = g.getWidth();
const height = g.getHeight();
let idTimeout = null;

const getMinuteString = (minutes) => {
  if (minutes >= 10 && minutes < 20){
    return "Fifteen";
  }
  else if (minutes >= 20 && minutes < 40) {
    return "Thirty";
  }
  else if (minutes >= 40 && minutes < 50){
    return "Fourty-Five";
  }
  else {
    return "O'Clock";
  }
};

const getNearestHour = (hours, minutes) => {
  if (minutes > 49){
    return hours + 1;
  }
  return hours;
};

const getApproximatePrefix = () => {
  var date = Date();
  var minutes = date.getMinutes();
  
  if(minutes === 0 || minutes === 15 || minutes === 30 || minutes === 45){
    return " exactly";
  }
  else{
    return " about";
  }
};

const drawTime = () => {
  //Grab time vars
  var date = Date();
  var hour = date.getHours();
  var minutes = date.getMinutes();
  
  //reset graphics
  g.clear();
  g.reset();
  
  g.setColor(0,0,0);
  g.fillRect(0, 0, width, height);
  g.setFont("Vector", 24);
  g.setColor(1,1,1);
  g.drawString("It's about", (width - g.stringWidth("It's" + getApproximatePrefix()))/2, height * 0.2, false);
  g.setFont("Vector", 24);
  g.drawString(numbers[getNearestHour(hour, minutes)], (width - g.stringWidth(numbers[getNearestHour(hour, minutes)]))/2, height * 0.4, false);
  g.setFont("Vector", 24);
  g.drawString(getMinuteString(minutes), (width - g.stringWidth(getMinuteString(minutes)))/2, height * 0.6, false);
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