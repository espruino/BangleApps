// PTLOGGER
// MEASURES p AND T PERIODICALLY AND UPDATES MIN & MAX VALS
// DISPLAYS EITHER OF BOTH


var settings = Object.assign({
  dt: 5, //time interval in minutes
}, require('Storage').readJSON("nightwatch.json", true) || {});

let dt = settings.dt;
delete settings;

var timerID;

const highColor = '#35b779';//#6dcd59;
const lowColor = '#eb005c';//#3d4a89;//#482878;
const normColor = '#000000';
const historyAmnt = 24;


const TData = {
  ondisplay:true,
  unit: '\xB0C',
  accuracy: 1,
  value  : 100,    t_value:'0:00',
  values : new Array(historyAmnt),
  maxval : -100, t_max:'0:00',
  minval : 100,  t_min:'0:00'
};

const PData = {
  ondisplay:false,
  unit: 'mbar',
  accuracy: 0,
  value  : 0,    t_value:'0:00',
  values : new Array(historyAmnt),
  maxval : 0, t_max:'0:00',
  minval : 10000,  t_min:'0:00'
};

function minMaxString(val,accuracy,unit,time){
  return time+' '+val.toFixed(accuracy)+unit;
//  return val.toFixed(accuracy)+unit+'('+time+')';
}

function updateScreen() {
  // what are we showing right now?
  let data;
  if (TData.ondisplay){data = TData;}
  else {data = PData;}

  // make strings
  let valueString =      data.value.toFixed(data.accuracy)+data.unit;
  let minString = minMaxString(data.minval, data.accuracy, data.unit, data.t_min);
  let maxString = minMaxString(data.maxval, data.accuracy, data.unit, data.t_max);

  // LETS PAINT
  g.clear();
  g.setFontAlign(0, 0);

  // MINUM AND MAXIMUM VALUES AND TIMES
  g.setFont("Vector:18");
  g.setColor(normColor);
  g.drawString(maxString, g.getWidth() / 2, 11);
  g.drawString(minString, g.getWidth() / 2, g.getHeight() - 11);

  g.setColor(normColor);

  // TIME OF LAST MEASURE AND SIZE OF INTERVAL
  g.setFontAlign(-1, 0);
  g.drawString(data.t_value, 0, g.getHeight()/2 - 25);
  g.setFontAlign(1, 0);
  g.drawString('dt='+dt+'min', g.getWidth() , g.getHeight()/2 - 25);

  ////////////////////////////////////////////////////////////
  // GRAPH OF MEASUREMENT HISTORY
  g.setFont("Vector:16");
  const graphHeight=35;
  const graphWidth=g.getWidth()-30;
  const graphLocX = 15;
  const graphLocY = g.getHeight() - 16 - 18 - graphHeight;

  // DRAW SOME KIND OF AXES
  g.setColor(0.4,0.4,0.4);
  g.drawRect(graphLocX,graphLocY,graphLocX+graphWidth,graphLocY+graphHeight);
  g.drawLine(graphLocX,graphLocY+graphHeight/2,graphLocX+graphWidth,graphLocY+graphHeight/2);
  g.drawLine(graphLocX+graphWidth/2,graphLocY,graphLocX+graphWidth/2,graphLocY+graphHeight);
  g.drawLine(graphLocX+graphWidth/4,graphLocY,graphLocX+graphWidth/4,graphLocY+graphHeight);
  g.drawLine(graphLocX+3*graphWidth/4,graphLocY,graphLocX+3*graphWidth/4,graphLocY+graphHeight);
  g.setColor(normColor);

  // DRAW LINE
  require("graph").drawLine(g, data.values, {
    x:graphLocX,
    y:graphLocY,
    width:graphWidth,
    height:graphHeight
  });

  let graphMax=Math.max.apply(Math,data.values);
  let graphMin=Math.min.apply(Math,data.values);
  g.setFontAlign(0, 0);
  g.setColor(highColor);
  g.drawString(graphMax.toFixed(data.accuracy), g.getWidth()/2, g.getHeight() - 16 - 18 - graphHeight);
  g.setColor(lowColor);
  g.drawString(graphMin.toFixed(data.accuracy), g.getWidth()/2, g.getHeight() - 16 - 18);
  g.setColor(normColor);

  let historyLength = (historyAmnt*dt >= 60)?('-'+historyAmnt*dt/60+'h'):('-'+historyAmnt*dt+'"');

  g.drawString(historyLength,25, g.getHeight() - 16 - 18 - graphHeight/2);

  ////////////////////////////////////////////////////////////
  // LAST MEASURE
  g.setFontAlign(0, 0);
  g.setFont('Vector:36');
  g.drawString(valueString, g.getWidth() / 2, g.getHeight() / 2);

  data.ondisplay = true;
}

function updateMinMax( data, currentValue ){
  data.values.push(currentValue);
  data.values.shift();
  data.value=currentValue;

  let now = new Date();
  data.t_value = now.getHours()+':'+String(now.getMinutes()).padStart(2, '0');
  if (currentValue < data.minval){data.t_min=data.t_value;data.minval = currentValue;}
  if (currentValue > data.maxval){data.t_max=data.t_value;data.maxval = currentValue;}
}

function switchDisplay(){
  if (TData.ondisplay) {TData.ondisplay=false;PData.ondisplay=true;updateScreen();}
  else {PData.ondisplay=false;TData.ondisplay=true;updateScreen();}
}

function settingsPage(){
  Bangle.on('swipe',function (){});
  eval(require("Storage").read("nightwatch.settings.js"))(()=>load());
  Bangle.on('swipe',switchDisplay);
  console.log(3);
}

function handlePressureSensorReading(data) {
  updateMinMax(TData,data.temperature);
  updateMinMax(PData,data.pressure);
}

function startup(){
  // testing in emulator
  // handlePressureSensorReading({ "temperature": 28.64251302083, "pressure": 1004.66520303803, "altitude": 71.72072902749 });
  // updateScreen();

  // ON STARTUP:
  // fill current reading into data,
  // before `updateMinMax` uses it
  Bangle.getPressure().then(d=>{TData.value=d.temperature;
                                TData.values.fill(d.temperature);
                                PData.value=d.pressure;
                                PData.values.fill(d.pressure);
                                handlePressureSensorReading(d);
                                updateScreen();});
  Bangle.on('swipe',switchDisplay);

  //Bangle.on('tap',settingsPage);

  timerID = setInterval( function() {
    Bangle.getPressure().then(d=>{handlePressureSensorReading(d);updateScreen();});
  }, dt * 60000);

}

startup();

