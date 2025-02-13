

const board = process.env.BOARD;
const isBangle2 = board === "BANGLEJS2" || board === "EMSCRIPTEN2";
const GraphXZero = 40;
const GraphYZero = isBangle2? g.getHeight() - (g.getHeight() * 0.1): 180;
const GraphY100 = isBangle2? 50: 80;
const MaxValueCount = g.getWidth() - (GraphXZero * 2); // 144

const GraphMarkerOffset = 5;
const GraphXMax = GraphXZero + MaxValueCount;

const GraphLcdY = GraphYZero + 10;
const GraphCompassY = GraphYZero + 16;
const GraphBluetoothY = GraphYZero + 22;
const GraphGpsY = GraphYZero + 28;
const GraphHrmY = GraphYZero + 34;


const Storage = require("Storage");

function renderCoordinateSystem() {
  g.setBgColor(0,0,0);
  g.setFont("6x8", 1);
  
  // Left Y axis (Battery)
  g.setColor(1, 1, 0);
  g.drawLine(GraphXZero, GraphYZero + GraphMarkerOffset, GraphXZero, GraphY100);
  g.drawString("%", 39, GraphY100 - 10);
  
  g.setFontAlign(1, -1, 0);
  g.drawString("100", 30, GraphY100 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, GraphY100, GraphXZero, GraphY100);
  
  g.drawString("50", 30, GraphYZero - 50 - GraphMarkerOffset);
  g.drawLine(GraphXZero - GraphMarkerOffset, 130, GraphXZero, 130);
  
  g.drawString("0", 30, GraphYZero - GraphMarkerOffset);
  
  g.setColor(1,1,1);
  g.setFontAlign(1, -1, 0);
  g.drawLine(GraphXZero - GraphMarkerOffset, GraphYZero, GraphXMax + GraphMarkerOffset, GraphYZero);
  
  // Right Y axis (Temperature)
  if (isBangle2) {
    g.setColor(1, 0, 0);
  } else {
    g.setColor(0.4, 0.4, 1);
  }

  g.drawLine(GraphXMax, GraphYZero + GraphMarkerOffset, GraphXMax, GraphY100);
  g.drawString("°C", GraphXMax + GraphMarkerOffset, GraphY100 - 10);
  g.setFontAlign(-1, -1, 0);
  g.drawString("20", GraphXMax + 2 * GraphMarkerOffset, GraphYZero - GraphMarkerOffset);
  
  g.drawLine(GraphXMax + GraphMarkerOffset, 130, GraphXMax, 130);
  g.drawString("30", GraphXMax + 2 * GraphMarkerOffset, GraphYZero - 50 - GraphMarkerOffset);
  
  g.drawLine(GraphXMax + GraphMarkerOffset, 80, GraphXMax, 80);
  g.drawString("40", GraphXMax + 2 * GraphMarkerOffset, GraphY100 - GraphMarkerOffset);
  
  g.setColor(1,1,1);
}

function decrementDay(dayToDecrement) {
  return dayToDecrement === 0 ? 6 : dayToDecrement-1;
}

function loadData() {
  const startingDay = new Date().getDay();

  // Load data for the current day
  let logFileName = "bclog" + startingDay;
  
  let dataLines = loadLinesFromFile(MaxValueCount, logFileName);
  if (!dataLines) {
    console.log("Cannot load lines from file");
    dataLines = [];
  }
  
  // Top up to MaxValueCount from previous days as required
  let previousDay = decrementDay(startingDay);
  while (dataLines.length < MaxValueCount  && previousDay !== startingDay) {
    let topUpLogFileName = "bclog" + previousDay;
    let remainingLines = MaxValueCount - dataLines.length;
    let topUpLines = loadLinesFromFile(remainingLines, topUpLogFileName);

    if(topUpLines) {
      dataLines = topUpLines.concat(dataLines);
    }

    previousDay = decrementDay(previousDay);
  }

  return dataLines;
}

function loadLinesFromFile(requestedLineCount, fileName) {
  let allLines = [];
  let returnLines = [];

  var readFile = Storage.open(fileName, "r");
  
  let nextLine;
  while ((nextLine = readFile.readLine())) {
    if(nextLine) {
      allLines.push(nextLine);
    }
  }
  
  readFile = null;

  if (allLines.length <= 0) return;

  let linesToReadCount = Math.min(requestedLineCount, allLines.length);
  let startingLineIndex = Math.max(0, allLines.length - requestedLineCount - 1);

  for (let i = startingLineIndex; i < linesToReadCount + startingLineIndex; i++) {
    if(allLines[i]) {
      returnLines.push(allLines[i]);
    }
  }
  
  allLines = null;
  
  return returnLines;
}

function renderData(dataArray) {
  const switchableConsumers = {
    none: 0,
    lcd: 1,
    compass: 2,
    bluetooth: 4,
    gps: 8,
    hrm: 16
  };
  
  //const timestampIndex = 0;
  const batteryIndex = 1;
  const temperatureIndex = 2;
  const switchabelsIndex = 3;

  const minTemperature = 20;
  const maxTemparature = 40;

  const belowMinIndicatorValue = minTemperature - 1;
  const aboveMaxIndicatorValue = maxTemparature + 1;
  
  //var allConsumers = switchableConsumers.none | switchableConsumers.lcd | switchableConsumers.compass | switchableConsumers.bluetooth | switchableConsumers.gps | switchableConsumers.hrm;
  
  for (let i = 0; i < dataArray.length; i++) {
    const element = dataArray[i];
    
    var dataInfo = element.split(",");

    // Battery percentage
    g.setColor(1, 1, 0);
    g.setPixel(GraphXZero + i, GraphYZero - parseInt(dataInfo[batteryIndex]));
    
    // Temperature
    g.setColor(0.4, 0.4, 1);
        
    let datapointTemp = parseFloat(dataInfo[temperatureIndex]);

    if (datapointTemp < minTemperature) {
      datapointTemp = belowMinIndicatorValue;
    }
    if (datapointTemp > maxTemparature) {
      datapointTemp = aboveMaxIndicatorValue;
    }
    
    // Scale down the range of 20 - 40°C to a 100px y-axis, where 1px = .25°
    let scaledTemp = Math.floor(((datapointTemp * 100) - 2000) / 20) + ((((datapointTemp * 100) - 2000) % 100) / 25);
    
    g.setPixel(GraphXZero + i, GraphYZero - scaledTemp);
    
    // LCD state
    if (parseInt(dataInfo[switchabelsIndex]) & switchableConsumers.lcd) {
      g.setColor(1, 1, 1);
      g.setFontAlign(1, -1, 0);
      g.drawString("LCD", GraphXZero - GraphMarkerOffset, GraphLcdY - 2, true);
      g.drawLine(GraphXZero + i, GraphLcdY, GraphXZero + i, GraphLcdY + 1);
    }
    
    // Compass state
    if (parseInt(dataInfo[switchabelsIndex]) & switchableConsumers.compass) {
      g.setColor(0, 1, 0);
      g.setFontAlign(-1, -1, 0);
      g.drawString("Compass", GraphXMax + GraphMarkerOffset, GraphCompassY - 2, true);
      g.drawLine(GraphXZero + i, GraphCompassY, GraphXZero + i, GraphCompassY + 1);
    }
    
    // Bluetooth state
    if (parseInt(dataInfo[switchabelsIndex]) & switchableConsumers.bluetooth) {
      g.setColor(0, 0, 1);
      g.setFontAlign(1, -1, 0);
      g.drawString("BLE", GraphXZero - GraphMarkerOffset, GraphBluetoothY - 2, true);
      g.drawLine(GraphXZero + i, GraphBluetoothY, GraphXZero + i, GraphBluetoothY + 1);
    }
    
    // Gps state
    if (parseInt(dataInfo[switchabelsIndex]) & switchableConsumers.gps) {
      g.setColor(0.8, 0.5, 0.24);
      g.setFontAlign(-1, -1, 0);
      g.drawString("GPS", GraphXMax + GraphMarkerOffset, GraphGpsY - 2, true);
      g.drawLine(GraphXZero + i, GraphGpsY, GraphXZero + i, GraphGpsY + 1);
    }
    
    // Hrm state
    if (parseInt(dataInfo[switchabelsIndex]) & switchableConsumers.hrm) {
      g.setColor(1, 0, 0);
      g.setFontAlign(1, -1, 0);
      g.drawString("HRM", GraphXZero - GraphMarkerOffset, GraphHrmY - 2, true);
      g.drawLine(GraphXZero + i, GraphHrmY, GraphXZero + i, GraphHrmY + 1);
    }
  }
  
  dataArray = null;
}

function renderHomeIcon() {
  //Home for Btn2
  g.setColor(1, 1, 1);
  g.drawLine(220, 118, 227, 110);
  g.drawLine(227, 110, 234, 118);

  g.drawPoly([222,117,222,125,232,125,232,117], false);
  g.drawRect(226,120,229,125);
}

function renderBatteryChart() {
  renderCoordinateSystem();
  let data = loadData();
  renderData(data);
  data = null;
}

// Show launcher when middle button pressed
function switchOffApp(){
  Bangle.showLauncher();
}

// special function to handle display switch on
Bangle.on('lcdPower', (on) => {
  if (on) {
    g.clear();
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    renderBatteryChart();
  }
});

if (isBangle2) {
  setWatch(switchOffApp, BTN1, {edge:"falling", debounce:50, repeat:true});
  g.setBgColor(0,0,0);
} else {
  setWatch(switchOffApp, BTN2, {edge:"falling", debounce:50, repeat:true});
}
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

renderHomeIcon();

renderBatteryChart();
