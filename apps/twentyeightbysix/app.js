const HARDWARE_VERSION = process.env.HWVERSION;


const timeWidth = 42;
const screenWidth = HARDWARE_VERSION == 1 ? 239: 175;
const screenHeight = HARDWARE_VERSION == 1 ? 239: 175;

const weirdDayWidth = 28;
const weirdWeekDayHeight = HARDWARE_VERSION == 1 ? 230: 166;
const weirdSleepDayHeight = HARDWARE_VERSION == 1 ? 213: 149;
const weirdDayBoxHeight = HARDWARE_VERSION == 1 ? 9: 7;
const weirdAwakeHours = 19;
const weirdSleepHours = 9;

const normalDayWidth = HARDWARE_VERSION == 1 ? 24: 28;
const normalWeekDayHeight = HARDWARE_VERSION == 1 ? 10: 9;
const normalDayBoxHeight = HARDWARE_VERSION == 1 ? 9: 4;
const normalSleepDayHeight = HARDWARE_VERSION == 1 ? 28: 27;
const normalAwakeHours = 15;
const normalSleepHours = 9;

const timeSetHeight = HARDWARE_VERSION == 1 ? 30: 34;
const timeSetDistance = HARDWARE_VERSION == 1 ? 50: 29;

const backgroundColor = HARDWARE_VERSION == 1 ? "#2c2e3a": "#000000";
const mainTextColor = "#FFFFFF";
const watchColor = HARDWARE_VERSION == 1 ? "#aaaaaa": "#FFFFFF";

const sleepTextColor = "#FFFFFF";
const sleepBlockColor = HARDWARE_VERSION == 1 ? "#D8D8D8": "#000000";

const awakeTextColor = "#000000";
const awakeBlockColor = "#FFFFFF";

const dayTextColor = "#FFFFFF";
const dayBlockColor = HARDWARE_VERSION == 1 ? "#2c2e3a": "#000000";

const quotes = [
  ["", "Drop the", "ancient", "way of", "sleeping", ""],
  ["Four day work", "weeks and you", "still get the", "two day.", "weekend", ""],
  ["", "New", "and", "improved", "28 hour days.", ""],
  ["", "18.5 hours of", "wakeful time.", "8.5 hours free.", "", ""],
  ["", "Six 28 hour days", "a week instead", "of seven 24", "hour days.", ""],
  ["", "18 Hours", "between", "work periods.", "Not 16.", ""],
  ["", "Sleep late on", "weekends without", "missing all the", "daylight.", ""],
  ["Trouble", "sleeping?", "Stay up until", "you are exhausted", "with four extra", "hours a day."],
  ["", "56 hour", "weekends", "beats a 48", "hour weekend.", ""],
  ["", "Still syncs up", "every Monday", "with the old 24", "hour a day week.", ""],
  ["", "Circadian", "rhythm", "shmircadian", "shrhythm.", ""],
  ["Studies showed", "people calculate", "better and have", "worse reaction", "times on this", "schedule."],
  ["", "This schedule", "will eventually", "drive one stark", "raving mad.", ""],
  ["No more", "Tuesdays.", "Nobody has ever", "missed", "Tuesdays.", ""],
  ["Step 1.", "Don't pay any", "attention", "to the", "sun anymore.", ""]
];

var quoteId = Math.floor(Math.random() * Math.floor(quotes.length - 1));

function hoursFromWeekStart(dayOfTheWeek, todayHours) {
  var previousDayHours;
  if(dayOfTheWeek == 0) {
    previousDayHours = 6 * 24;
  }
  else {
    previousDayHours = (dayOfTheWeek - 1) * 24;
  }
  return previousDayHours + todayHours;
}

function normalTo28HourDate(date) {

  var hourCount = hoursFromWeekStart(date.getDay(), date.getHours());
  // Weird Days: 0-Tuesday to 5-Sunday
  var weirdDayOfTheWeek = Math.round((hourCount / 28) - 0.5);

  var weirdDate = {
    "dayText": getWeirdDayName(weirdDayOfTheWeek),
    "day": weirdDayOfTheWeek,
    "hourText": addLeadingZero(zeroTo28(hourCount - (weirdDayOfTheWeek * 28))),
    "hour": zeroTo28(hourCount - (weirdDayOfTheWeek * 28)),
    "minuteText": addLeadingZero(date.getMinutes()),
    "minute": date.getMinutes(),
    "secondText": addLeadingZero(date.getSeconds()),
  };
  return weirdDate;
}

function zeroTo28(hour) {
  if (hour == 0) {
    return 28;
  }
  return hour;
}

function getWeirdDayName(weirdDayOfTheWeek) {
  if(weirdDayOfTheWeek == 0) {
    return "Monday";
  }
  else if(weirdDayOfTheWeek == 1) {
    return "Wednesday";
  }
  else if(weirdDayOfTheWeek == 2) {
    return "Thursday";
  }
  else if(weirdDayOfTheWeek == 3) {
    return "Friday";
  }
  else if(weirdDayOfTheWeek == 4) {
    return "Saturday";
  }
  else if(weirdDayOfTheWeek == 5) {
    return "Sunday";
  }
}

function getNormalDayName(normalDayOfTheWeek) {
  if(normalDayOfTheWeek == 0) {
    return "Sunday";
  }
  else if(normalDayOfTheWeek == 1) {
    return "Monday";
  }
  else if(normalDayOfTheWeek == 2) {
    return "Tuesday";
  }
  else if(normalDayOfTheWeek == 3) {
    return "Wednesday";
  }
  else if(normalDayOfTheWeek == 4) {
    return "Thursday";
  }
  else if(normalDayOfTheWeek == 5) {
    return "Friday";
  }
  else if(normalDayOfTheWeek == 6) {
    return "Saturday";
  }
}

function addLeadingZero(number) {
  if(number < 10) {
    return "0" + number;
  }
  return "" + number;
}

function getNormalDateText(date) {
  var normalDate = {
    "dayText": getNormalDayName(date.getDay()),
    "day": date.getDay(),
    "hourText": addLeadingZero(date.getHours()),
    "hour": date.getHours(),
    "minuteText": addLeadingZero(date.getMinutes()),
    "minute": date.getMinutes(),
    "secondText": addLeadingZero(date.getSeconds()),
  };
  return normalDate;
}

function dailyHourCount(hours, minutes) {
  return hours + (minutes / 60);
}






function getWeirdDayBlockSize() {
  return ((weirdDayWidth / timeWidth) * screenWidth);
}

function printWeirdWeekDay(dayText, percentOfBlock, startingPoint) {
  g.setColor(dayBlockColor);
  g.fillRect(startingPoint - (percentOfBlock * getWeirdDayBlockSize()), weirdWeekDayHeight - 10, startingPoint - (percentOfBlock * getWeirdDayBlockSize()) + getWeirdDayBlockSize(), weirdWeekDayHeight + 10);
  g.setColor(dayTextColor);
  g.drawRect(startingPoint - (percentOfBlock * getWeirdDayBlockSize()), weirdWeekDayHeight - 10, startingPoint - (percentOfBlock * getWeirdDayBlockSize()) + getWeirdDayBlockSize(), weirdWeekDayHeight + 10);
  g.drawString(dayText, startingPoint - (percentOfBlock * getWeirdDayBlockSize()) + (getWeirdDayBlockSize() / 2), weirdWeekDayHeight);
}

function printWeirdWeekDays(weirdDate) {
  var percentOfBlock = dailyHourCount(weirdDate.hour, weirdDate.minute) / weirdDayWidth;
  printWeirdWeekDay(weirdDate.dayText, percentOfBlock, screenWidth / 2);
  printWeirdWeekDay(getWeirdDayName((weirdDate.day + 6 - 1) % 6), percentOfBlock, screenWidth / 2 - getWeirdDayBlockSize());
  printWeirdWeekDay(getWeirdDayName((weirdDate.day + 6 + 1) % 6), percentOfBlock, screenWidth / 2 + getWeirdDayBlockSize());
}




function printWeirdSleepDay(sleepText, blockSize, textColor, blockColor, startingPoint) {
  g.setColor(blockColor);
  g.fillRect(startingPoint, weirdSleepDayHeight - 7, startingPoint + blockSize, weirdSleepDayHeight + 7);
  g.setColor(textColor);
  g.drawString(sleepText, startingPoint + (blockSize / 2), weirdSleepDayHeight);
}



function printWeirdSleepDays(weirdDate) {
  var sleepInfo = getWeirdSleepInfo(weirdDate.hour);
  var percentOfBlock = sleepInfo.internalBlockTime / sleepInfo.blockWidth;
  var startingPoint = (screenWidth / 2) - (percentOfBlock * sleepInfo.blockSize);

  printWeirdSleepDay(sleepInfo.text, sleepInfo.blockSize, sleepInfo.textColor, sleepInfo.blockColor, startingPoint);

  printWeirdSleepDay(sleepInfo.otherText, sleepInfo.otherBlockSize, sleepInfo.otherTextColor, sleepInfo.otherBlockColor, startingPoint - sleepInfo.otherBlockSize);
  printWeirdSleepDay(sleepInfo.text, sleepInfo.blockSize, sleepInfo.textColor, sleepInfo.blockColor, startingPoint - sleepInfo.otherBlockSize - sleepInfo.blockSize);

  printWeirdSleepDay(sleepInfo.otherText, sleepInfo.otherBlockSize, sleepInfo.otherTextColor, sleepInfo.otherBlockColor, startingPoint + sleepInfo.blockSize);
  printWeirdSleepDay(sleepInfo.text, sleepInfo.blockSize, sleepInfo.textColor, sleepInfo.blockColor, startingPoint + sleepInfo.otherBlockSize + sleepInfo.blockSize);
}

function getWeirdSleepInfo(weirdHour) {
  var text;
  var otherText;
  var blockSize;
  var otherBlockSize;
  var blockWidth;
  var internalBlockTime;
  var textColor;
  var blockColor;
  var otherTextColor;
  var otherBlockColor;
  if(weirdHour >= 8 && weirdHour <= 27) {
    text = "Awake";
    otherText = "Sleep";
    blockSize = (weirdDayWidth / timeWidth) * screenWidth * (weirdAwakeHours / weirdDayWidth);
    otherBlockSize = (weirdDayWidth / timeWidth) * screenWidth * (weirdSleepHours / weirdDayWidth);
    blockWidth = weirdAwakeHours;
    textColor = awakeTextColor;
    blockColor = awakeBlockColor;
    otherBlockColor = sleepBlockColor;
    otherTextColor = sleepTextColor;
    internalBlockTime = weirdHour - 8;
  } else {
    text = "Sleep";
    otherText = "Awake";
    blockSize = (weirdDayWidth / timeWidth) * screenWidth * (weirdSleepHours / weirdDayWidth);
    otherBlockSize = (weirdDayWidth / timeWidth) * screenWidth * (weirdAwakeHours / weirdDayWidth);
    blockWidth = weirdSleepHours;
    textColor = sleepTextColor;
    blockColor = sleepBlockColor;
    otherBlockColor = awakeBlockColor;
    otherTextColor = awakeTextColor;
    if(weirdHour <= 8) {
      internalBlockTime = weirdHour + 1;
    } else {
      internalBlockTime = 0;
    }
  }

  return {
    "text": text,
    "otherText": otherText,
    "blockSize": blockSize,
    "otherBlockSize": otherBlockSize,
    "blockWidth": blockWidth,
    "textColor": textColor,
    "blockColor": blockColor,
    "otherBlockColor": otherBlockColor,
    "otherTextColor": otherTextColor,
    "internalBlockTime": internalBlockTime
  };
}










function getNormalDayBlockSize() {
  return ((normalDayWidth / timeWidth) * screenWidth);
}

function printNormalWeekDay(dayText, percentOfBlock, startingPoint) {
  g.setColor(dayBlockColor);
  g.fillRect(startingPoint - (percentOfBlock * getNormalDayBlockSize()), normalWeekDayHeight - 10, startingPoint - (percentOfBlock * getNormalDayBlockSize()) + getNormalDayBlockSize(), normalWeekDayHeight + 10);

  g.setColor(dayTextColor);
  g.drawRect(startingPoint - (percentOfBlock * getNormalDayBlockSize()), normalWeekDayHeight - 10, startingPoint - (percentOfBlock * getNormalDayBlockSize()) + getNormalDayBlockSize(), normalWeekDayHeight + 10);
  g.drawString(dayText, startingPoint - (percentOfBlock * getNormalDayBlockSize()) + (getNormalDayBlockSize() / 2), normalWeekDayHeight);
}

function printNormalWeekDays(normalDate) {
  var percentOfBlock = dailyHourCount(normalDate.hour, normalDate.minute) / normalDayWidth;
  printNormalWeekDay(normalDate.dayText, percentOfBlock, screenWidth / 2);
  printNormalWeekDay(getNormalDayName((normalDate.day + 7 - 1) % 7), percentOfBlock, screenWidth / 2 - getNormalDayBlockSize());
  printNormalWeekDay(getNormalDayName((normalDate.day + 7 + 1) % 7), percentOfBlock, screenWidth / 2 + getNormalDayBlockSize());
}










function printNormalSleepDay(sleepText, blockSize, textColor, blockColor, startingPoint) {
  g.setColor(blockColor);
  g.fillRect(startingPoint, normalSleepDayHeight - 8, startingPoint + blockSize, normalSleepDayHeight + 6);
  g.setColor(textColor);
  g.drawString(sleepText, startingPoint + (blockSize / 2), normalSleepDayHeight);
}




function printNormalSleepDays(normalDate) {
  var sleepInfo = getNormalSleepInfo(normalDate.hour);
  var percentOfBlock = sleepInfo.internalBlockTime / sleepInfo.blockWidth;
  var startingPoint = (screenWidth / 2) - (percentOfBlock * sleepInfo.blockSize);

  printNormalSleepDay(sleepInfo.text, sleepInfo.blockSize, sleepInfo.textColor, sleepInfo.blockColor, startingPoint);

  printNormalSleepDay(sleepInfo.otherText, sleepInfo.otherBlockSize, sleepInfo.otherTextColor, sleepInfo.otherBlockColor, startingPoint - sleepInfo.otherBlockSize);
  printNormalSleepDay(sleepInfo.text, sleepInfo.blockSize, sleepInfo.textColor, sleepInfo.blockColor, startingPoint - sleepInfo.otherBlockSize - sleepInfo.blockSize);

  printNormalSleepDay(sleepInfo.otherText, sleepInfo.otherBlockSize, sleepInfo.otherTextColor, sleepInfo.otherBlockColor, startingPoint + sleepInfo.blockSize);
  printNormalSleepDay(sleepInfo.text, sleepInfo.blockSize, sleepInfo.textColor, sleepInfo.blockColor, startingPoint + sleepInfo.otherBlockSize + sleepInfo.blockSize);
}

function getNormalSleepInfo(normalHour) {
  var text;
  var otherText;
  var blockSize;
  var otherBlockSize;
  var blockWidth;
  var internalBlockTime;
  var textColor;
  var blockColor;
  var otherTextColor;
  var otherBlockColor;
  if(normalHour >= 8 && normalHour <= 23) {
    text = "Awake";
    otherText = "Sleep";
    blockSize = (normalDayWidth / timeWidth) * screenWidth * (normalAwakeHours / normalDayWidth);
    otherBlockSize = (normalDayWidth / timeWidth) * screenWidth * (normalSleepHours / normalDayWidth);
    blockWidth = normalAwakeHours;
    internalBlockTime = normalHour - 8;
    textColor = awakeTextColor;
    blockColor = awakeBlockColor;
    otherBlockColor = sleepBlockColor;
    otherTextColor = sleepTextColor;
  } else {
    text = "Sleep";
    otherText = "Awake";
    blockSize = (normalDayWidth / timeWidth) * screenWidth * (normalSleepHours / normalDayWidth);
    otherBlockSize = (normalDayWidth / timeWidth) * screenWidth * (normalAwakeHours / normalDayWidth);
    blockWidth = normalSleepHours;
    textColor = sleepTextColor;
    blockColor = sleepBlockColor;
    otherBlockColor = awakeBlockColor;
    otherTextColor = awakeTextColor;
    if(normalHour <= 8) {
      internalBlockTime = normalHour + 1;
    } else {
      internalBlockTime = 0;
    }
  }

  return {
    "text": text,
    "otherText": otherText,
    "blockSize": blockSize,
    "otherBlockSize": otherBlockSize,
    "blockWidth": blockWidth,
    "textColor": textColor,
    "blockColor": blockColor,
    "otherBlockColor": otherBlockColor,
    "otherTextColor": otherTextColor,
    "internalBlockTime": internalBlockTime
  };
}


function drawClockPointer() {
  g.setColor(watchColor);
  var middle = screenWidth / 2;
  var circleTop = normalSleepDayHeight + 38;
  var circleBottom = weirdSleepDayHeight - 40;

  g.fillPoly([
    middle, circleBottom,
    middle - 25, circleBottom - 5,
    middle - 40, circleBottom - 16,
    middle - 10, circleBottom + 5,
    middle - 3, circleBottom + 10,
    middle, circleBottom + 15
  ]);

  g.fillPoly([
    middle, circleBottom,
    middle + 25, circleBottom - 5,
    middle + 40, circleBottom - 16,
    middle + 10, circleBottom + 5,
    middle + 3, circleBottom + 10,
    middle, circleBottom + 15
  ]);

  if (HARDWARE_VERSION == 1) {
    g.fillPoly([
      middle, circleTop,
      middle - 25, circleTop + 5,
      middle - 40, circleTop + 16,
      middle - 10, circleTop - 5,
      middle - 3, circleTop - 10,
      middle, circleTop - 15
    ]);
  
    g.fillPoly([
      middle, circleTop,
      middle + 25, circleTop + 5,
      middle + 40, circleTop + 16,
      middle + 10, circleTop - 5,
      middle + 3, circleTop - 10,
      middle, circleTop - 15
    ]);
  
  }

}

function getNormalEvent(date) {
  if(date.hour == 8) {
    if(date.minute <= 15) {
      return "Starting Breakfast";
    }
    else if(date.minute >= 45) {
      return "Ending Breakfast";
    }
    return "Breakfast";
  }
  else if(date.hour == 12) {
    if(date.minute <= 15) {
      return "Starting Lunch";
    }
    else if(date.minute >= 45) {
      return "Ending Lunch";
    }
    return "Lunch";
  }
  else if(date.hour == 18) {
    if(date.minute <= 15) {
      return "Starting Dinner";
    }
    else if(date.minute >= 45) {
      return "Ending Dinner";
    }
    return "Dinner";
  }
  else if(date.dayText == "Saturday" || date.dayText == "Sunday") {
    if(date.dayText == "Sunday" && date.hour == 23 && date.minute >= 45) {
      return "Weekend Ending";
    }
    return "Weekend";
  }
  else if(date.hour >= 9 && date.hour <= 17) {
    if(date.dayText == "Monday" && date.hour == 9 && date.minute <= 15) {
      return "Starting Work";
    }
    else if(date.dayText == "Friday" && date.hour == 17 && date.minute >= 45) {
      return "Work Ending";
    }
    return "Work";
  }
  return "";
}

function getWeirdEvent(date) {
  if (date.hour == 28) {
    return "THE VOID";
  }
  else if(date.hour == 8) {
    if(date.minute <= 15) {
      return "Starting Breakfast";
    }
    else if(date.minute >= 45) {
      return "Ending Breakfast";
    }
    return "Breakfast";
  }
  else if(date.hour == 13) {
    return "Mid-day Nothingness";
  }
  else if(date.hour == 14) {
    if(date.minute <= 15) {
      return "Starting Lincoln Lunch";
    }
    else if(date.minute >= 45) {
      return "Ending Lincoln Lunch";
    }
    return "Forescoreteen! Lincoln Lunch";
  }
  else if(date.hour == 23) {
    if(date.minute <= 15) {
      return "Starting Dinner";
    }
    else if(date.minute >= 45) {
      return "Ending Dinner";
    }
    return "Dinner";
  }
  else if(date.hour == 27) {
    return "Threeteen";
  }
  else if(date.dayText == "Saturday" || date.dayText == "Sunday") {
    if(date.dayText == "Sunday" && date.hour == 27 && date.minute >= 45) {
      return "Weekend Ending";
    }
    return "Weekend";
  }
  else if(date.hour >= 9 && date.hour <= 19) {
    if(date.dayText == "Monday" && date.hour == 9 && date.minute <= 15) {
      return "Starting Work";
    }
    else if(date.dayText == "Friday" && date.hour == 19 && date.minute >= 45) {
      return "Work Ending";
    }
    return "Work";
  }
  return "";
}

function getWeirdHourLabel(hour){
  if(hour == 13) {
    return ["Mid-day", "Nothingness", ""];
  }
  else if(hour == 14) {
    return ["Forescoreteen", "Lincoln's", "Hour"];
  }
  else if(hour == 27) {
    return ["", "Threeteen", ""];
  } else if (hour == 28) {
    return ["", "THE VOID", ""];
  }
  return ["", "", ""];
}

function printTime(thisDate, isShowTime) {

  printBackground();

  var weirdDate = normalTo28HourDate(thisDate);
  var normalDate = getNormalDateText(thisDate);

  var normalTime = normalDate.hourText + ":" + normalDate.minuteText;
  var weirdTime = weirdDate.hourText + ":" + weirdDate.minuteText;

  g.setFontAlign(0, 0, 0);
  g.setColor(mainTextColor);

  if(isShowTime) {
    g.setFont("Vector", 36);
    g.drawString(weirdTime, (screenWidth / 2) + 3,  (screenHeight / 2) + 3);

    g.setFont("6x8", 2);
    if (HARDWARE_VERSION == 1) {
      g.drawString(normalTime, screenWidth / 2 + 3, 84);

      g.setFont("6x8", 1);
      var threeLabels = getWeirdHourLabel(weirdDate.hour);
      g.drawString(threeLabels[0], screenWidth / 2 + 3, weirdSleepDayHeight - 70);
      g.drawString(threeLabels[1], screenWidth / 2 + 3, weirdSleepDayHeight - 60);
      g.drawString(threeLabels[2], screenWidth / 2 + 3, weirdSleepDayHeight - 50);
  
    } 
    else {
      g.drawString(normalTime, screenWidth / 2 + 3, 64);
    }

  } else {

    if (HARDWARE_VERSION == 1) {

      g.setFont("6x8", 1);
      g.drawString(quotes[quoteId][0], (screenWidth / 2) + 1,  (screenHeight / 2) - 25);
      g.drawString(quotes[quoteId][1], (screenWidth / 2) + 1,  (screenHeight / 2) - 15);
      g.drawString(quotes[quoteId][2], (screenWidth / 2) + 1,  (screenHeight / 2) - 5);
      g.drawString(quotes[quoteId][3], (screenWidth / 2) + 1,  (screenHeight / 2) + 5);
      g.drawString(quotes[quoteId][4], (screenWidth / 2) + 1,  (screenHeight / 2) + 15);
      g.drawString(quotes[quoteId][5], (screenWidth / 2) + 1,  (screenHeight / 2) + 25);

      g.setFont("6x8", 1);
      g.drawString("Forward ->", screenWidth - 40, normalSleepDayHeight + 35);
      g.drawString("Backwards ->", screenWidth - 40, weirdSleepDayHeight - 35);

    } else {
      g.setFont("Vector", 36);
      g.drawString(weirdTime, (screenWidth / 2) + 3,  (screenHeight / 2) + 3);
  
      g.setFont("6x8", 2);
      g.drawString(normalTime, screenWidth / 2 + 3, 64);
    
    }

  }

  g.setFont("6x8", 1);
  g.drawString(getNormalEvent(normalDate), screenWidth / 2 + 3, normalSleepDayHeight + 16);
  g.drawString(getWeirdEvent(weirdDate), screenWidth / 2 + 3, weirdSleepDayHeight - 16);

  g.setFont("6x8", 2);
  printWeirdWeekDays(weirdDate);
  printNormalWeekDays(normalDate);

  g.setColor(sleepTextColor);
  g.setFont("6x8", 1);
  printWeirdSleepDays(weirdDate);
  printNormalSleepDays(normalDate);
}

function printBackground() {
  g.setFontAlign(0, 0, 0);
  g.setColor(backgroundColor);
  g.fillRect(0, normalSleepDayHeight + normalDayBoxHeight, screenWidth, weirdSleepDayHeight - weirdDayBoxHeight);

  g.setColor(mainTextColor);
  if (HARDWARE_VERSION == 1) {
    g.drawLine(0, screenHeight / 2, 64, screenHeight / 2);
    g.drawLine(173, screenHeight / 2, screenWidth, screenHeight / 2);
  } else {
    g.drawLine(0, screenHeight / 2, 32, screenHeight / 2);
    g.drawLine(140, screenHeight / 2, screenWidth, screenHeight / 2);
  }

  g.setFont("6x8", 2);
  g.drawString("24x7", timeSetHeight, normalSleepDayHeight + timeSetDistance);
  g.drawString("28x6", timeSetHeight, weirdSleepDayHeight - timeSetDistance);

  g.setColor(watchColor);
  if (HARDWARE_VERSION == 1) {
    g.drawCircle(screenWidth / 2, screenHeight / 2, 55);
    g.drawCircle(screenWidth / 2, screenHeight / 2, 54);
    g.drawCircle(screenWidth / 2, screenHeight / 2, 53);
  }
  drawClockPointer();

}

var now = new Date();
var minute = now.getMinutes();
var lookingDate = false;
var lookBack = false;
var timeout = false;
printTime(now, true);

function isPrintTime() {
  var currentTime = new Date();
  var thisMinute = currentTime.getMinutes();
  if(thisMinute != minute || lookBack) {
    if(lookBack) {
      lookBack = false;
      timeout = false;
      minute = thisMinute;
      printTime(currentTime, true);
    }
  }
}


var secondInterval = setInterval(isPrintTime, 1000);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(isPrintTime, 1000);
  }
});


function lookCurrent() {
  lookBack = true;
}

if (HARDWARE_VERSION == 1) {
  setWatch(() => {

    var timeBehind = 3600000 * 12;
    if(quoteId <= 0) {
      quoteId = quotes.length - 1;
    } else {
      quoteId = quoteId - 1;
    }
    if(!lookingDate) {
      lookingDate = new Date();
    }
    lookingDate = new Date(lookingDate.getTime() - timeBehind);
    printTime(lookingDate, false);
    if(timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(()=>lookCurrent(), 6000);
  }, BTN2, { repeat: true, edge: "falling" });

  setWatch(() => {
    var timeAhead = 3600000 * 12;
    if(quoteId >= quotes.length - 1) {
      quoteId = 0;
    } else {
      quoteId = quoteId + 1;
    }
    if(!lookingDate) {
      lookingDate = new Date();
    }
    lookingDate = new Date(lookingDate.getTime() + timeAhead);
    printTime(lookingDate, false);
    if(timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(()=>lookCurrent(), 6000);
  }, BTN3, { repeat: true, edge: "falling" });
}

let onSwipe = (x, y) => {
    if (x == 1) {
      var timeBehind = 3600000 * 1;
      if(quoteId <= 0) {
        quoteId = quotes.length - 1;
      } else {
        quoteId = quoteId - 1;
      }
      if(!lookingDate) {
        lookingDate = new Date();
      }
      lookingDate = new Date(lookingDate.getTime() - timeBehind);
      printTime(lookingDate, false);
      if(timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(()=>lookCurrent(), 6000);
    }
    else if (x == -1) {
      var timeAhead = 3600000 * 1;
      if(quoteId >= quotes.length - 1) {
        quoteId = 0;
      } else {
        quoteId = quoteId + 1;
      }
      if(!lookingDate) {
        lookingDate = new Date();
      }
      lookingDate = new Date(lookingDate.getTime() + timeAhead);
      printTime(lookingDate, false);
      if(timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(()=>lookCurrent(), 6000);

    }
};
Bangle.on("swipe", onSwipe);

setWatch(Bangle.showLauncher, BTN, { repeat: false, edge: "falling" });
