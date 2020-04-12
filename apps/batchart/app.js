const GraphXZero = 40;
const GraphYZero = 180;
const GraphY100 = 80;
const GraphMarkerOffset = 5;
const MaxValueCount = 144;
const GraphXMax = GraphXZero + MaxValueCount;
var Storage = require("Storage");

function renderCoordinateSystem() {
  g.setFont("6x8", 1);
  g.drawString("t", GraphXMax + GraphMarkerOffset, GraphYZero - GraphMarkerOffset);
  g.drawLine(GraphXZero, GraphYZero + GraphMarkerOffset, GraphXZero, GraphY100);
  
  g.drawString("%", 39, 70);
  
  g.setFontAlign(1, -1, 0);
  g.drawString("100", 30, GraphY100 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, GraphY100, GraphXZero, GraphY100);
  
  g.drawString("50", 30, GraphYZero - 50 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, 130, GraphXZero, 130);
  
  g.drawString("0", 30, GraphYZero - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, GraphYZero, GraphXMax, GraphYZero);
}

function decrementDay(dayToDecrement) {
  return dayToDecrement === 0 ? 6 : dayToDecrement-1;
}
function loadData() {
  const MaxValueCount = 144;
  const startingDay = new Date().getDay();

  // Load data for the current day
  var logFileName = "bclog" + startingDay;
  
  var dataLines = loadLinesFromFile(MaxValueCount, logFileName);
  
  // Top up to MaxValueCount from previous days as required
  var previousDay = decrementDay(startingDay);
  while (dataLines.length < MaxValueCount
    && previousDay !== startingDay) {
    
    var topUpLogFileName = "bclog" + previousDay;
    var remainingLines = MaxValueCount - dataLines.length;
    var topUpLines = loadLinesFromFile(remainingLines, topUpLogFileName);
    dataLines = topUpLines.concat(dataLines);
    
    previousDay = decrementDay(previousDay);
  }

  return dataLines;
}

function loadLinesFromFile(requestedLineCount, fileName) {
  var allLines = [];
  var returnLines = [];

  var readFile = Storage.open(fileName, "r");
  
  while ((nextLine = readFile.readLine())) {
    if(nextLine) {
      allLines.push(nextLine);
    }
  }

  if (allLines.length <= 0) return;

  linesToReadCount = Math.min(requestedLineCount, allLines.length);
  startingLineIndex = Math.max(0, allLines.length - requestedLineCount - 1);

  for (let i = startingLineIndex; i < linesToReadCount + startingLineIndex; i++) {
    if(allLines[i]) {
      returnLines.push(allLines[i]);
    }
  }
  
  allLines = null;
  
  return returnLines;
}

function renderData(dataArray) {
  g.setColor(1, 1, 0);
  for (let i = 0; i < dataArray.length; i++) {
    const element = dataArray[i];
    var dataInfo = element.split(",");
    var batteryPercentage = parseInt(dataInfo[1]);

    g.setPixel(GraphXZero + i, GraphYZero - batteryPercentage);
  }
}

function renderBatteryChart() {
  renderCoordinateSystem();
  var data = loadData();
  renderData(data);
}

// special function to handle display switch on
Bangle.on('lcdPower', (on) => {
  if (on) {
    // call your app function here
    // If you clear the screen, do Bangle.drawWidgets();
    //g.clear()
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    //renderBatteryChart();
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
// call your app function here

renderBatteryChart();
