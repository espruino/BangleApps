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
let drawTimeout;

const getNearestHour = (hours, minutes) => {
  if (minutes > 54) {
    return hours + 1;
  }
  return hours;
};

const getApproximatePrefix = (minutes, minutesByQuarter) => {
  if (minutes === minutesByQuarter) {
    return " exactly";
  } else if (minutesByQuarter - minutes < -54) {
    return " nearly";
  } else if (minutesByQuarter - minutes < -5) {
    return " after";
  } else if (minutesByQuarter - minutes < 0) {
    return " just after";
  } else if (minutesByQuarter - minutes > 5) {
    return " before";
  } else {
    return " nearly";
  }
};

const getMinutesByQuarter = minutes => {
  if (minutes < 10) {
    return 0;
  } else if (minutes < 20) {
    return 15;
  } else if (minutes < 40) {
    return 30;
  } else if (minutes < 55) {
    return 45;
  } else {
    return 0;
  }
};

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    drawTime();
  }, 60000 - (Date.now() % 60000));
}

const drawTimeExact = () => {
  var dateTime = Date();
  var hours = dateTime.getHours();
  var minutes = dateTime.getMinutes().toString().padStart(2,0);
  //var day = dateTime.getDay();
  var date = dateTime.getDate();
  var month = dateTime.getMonth();
  var year = dateTime.getFullYear();
  g.clear();
  g.setBgColor(0,0,0);
  g.clearRect(0,0,width, height);
  g.setColor(1,1,1);
  g.setFont("Vector", 30);
  g.drawString(hours + ":" + minutes, (width - g.stringWidth(hours + ":" + minutes))/2, height * 0.3, false);
  g.setFont("Vector", 26);
  g.drawString(month + 1 + "/" + date + "/" + year, (width - g.stringWidth(month + 1 + "/" + date + "/" + year))/2, height * 0.6, false);
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

  //Build watch face
  g.setBgColor(0, 0, 0);
  g.clearRect(0, 0, width, height);
  g.setFont("Vector", 22);
  g.setColor(1, 1, 1);
  g.drawString("It's" + getApproximatePrefix(minutes, minutesByQuarter), (width - g.stringWidth("It's" + getApproximatePrefix(minutes, minutesByQuarter))) / 2, height * 0.25, false);
  g.setFont("Vector", 30);
  g.drawString(numbers[getNearestHour(hour, minutes)], (width - g.stringWidth(numbers[getNearestHour(hour, minutes)])) / 2, height * 0.45, false);
  g.setFont("Vector", 22);
  g.drawString(minutesByQuarterString[minutesByQuarter], (width - g.stringWidth(minutesByQuarterString[minutesByQuarter])) / 2, height * 0.7, false);

  queueDraw();
};

g.clear();
drawTime();

Bangle.on('lcdPower', function (on) {
  if (on) {
    drawTime();
  } else {
    if (idTimeout) {
      clearTimeout(idTimeout);
    }
  }
});

Bangle.on('touch', function(button, xy){
  drawTimeExact();
  setTimeout(drawTime, 7000);
});

// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();