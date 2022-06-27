/*
 * Includes
 */
const locale = require('locale');
const storage = require('Storage');

/*
 * Statics
 */
const SETTINGS_FILE = "bwclk.setting.json";
const TIMER_IDX = "bwclk";
const W = g.getWidth();
const H = g.getHeight();

/*
 * Settings
 */
let settings = {
  fullscreen: false,
  showLock: true,
  hideColon: false,
  showInfo: 0,
};

let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
for (const key in saved_settings) {
  settings[key] = saved_settings[key]
}


/*
 * Assets
 */

// Manrope font
Graphics.prototype.setLargeFont = function(scale) {
  // Actual height 48 (49 - 2)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    46,
    atob("EhooGyUkJiUnISYnFQ=="),
    63+(scale<<8)+(1<<16)
  );
  return this;
};

Graphics.prototype.setXLargeFont = function(scale) {
  // Actual height 53 (55 - 3)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    46,
    atob("FR4uHyopKyksJSssGA=="),
    70+(scale<<8)+(1<<16)
  );
};

Graphics.prototype.setMediumFont = function(scale) {
  // Actual height 41 (42 - 2)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAB/AAAAAAAP/AAAAAAD//AAAAAA///AAAAAP///AAAAB///8AAAAf///AAAAH///wAAAB///+AAAAH///gAAAAH//4AAAAAH/+AAAAAAH/wAAAAAAH8AAAAAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///8AAAAH////AAAAP////wAAAf////4AAA/////8AAB/////+AAD/gAAH+AAD+AAAD/AAH8AAAB/AAH4AAAA/gAH4AAAAfgAH4AAAAfgAPwAAAAfgAPwAAAAfgAPwAAAAfgAHwAAAAfgAH4AAAAfgAH4AAAA/gAH8AAAA/AAD+AAAD/AAD/gAAH/AAB/////+AAB/////8AAA/////4AAAf////wAAAH////gAAAB///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAAAAAAAfwAAAAAAA/gAAAAAAA/AAAAAAAB/AAAAAAAD+AAAAAAAD8AAAAAAAH8AAAAAAAH//////AAH//////AAH//////AAH//////AAH//////AAH//////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAA/AAAP4AAB/AAAf4AAD/AAA/4AAD/AAB/4AAH/AAD/4AAP/AAH/AAAf/AAH8AAA//AAH4AAB//AAP4AAD//AAPwAAH+/AAPwAAP8/AAPwAAf4/AAPwAA/4/AAPwAA/w/AAPwAB/g/AAPwAD/A/AAP4AH+A/AAH8AP8A/AAH/A/4A/AAD///wA/AAD///gA/AAB///AA/AAA//+AA/AAAP/8AA/AAAD/wAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAH4AAAHwAAH4AAAH4AAH4AAAH8AAH4AAAP+AAH4AAAH+AAH4A4AB/AAH4A+AA/AAH4B/AA/gAH4D/AAfgAH4H+AAfgAH4P+AAfgAH4f+AAfgAH4/+AAfgAH5/+AAfgAH5//AAfgAH7+/AA/gAH/8/gB/AAH/4f4H/AAH/wf//+AAH/gP//8AAH/AH//8AAH+AD//wAAH8AB//gAAD4AAf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAD/AAAAAAAP/AAAAAAB//AAAAAAH//AAAAAAf//AAAAAB///AAAAAH///AAAAAf/8/AAAAB//w/AAAAH/+A/AAAA//4A/AAAD//gA/AAAH/+AA/AAAH/4AA/AAAH/gAA/AAAH+AAA/AAAHwAAA/AAAHAAf///AAEAAf///AAAAAf///AAAAAf///AAAAAf///AAAAAf///AAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAP/AHgAAH///AP4AAH///gP8AAH///gP8AAH///gP+AAH///gD/AAH/A/AB/AAH4A/AA/gAH4A+AAfgAH4B+AAfgAH4B+AAfgAH4B8AAfgAH4B8AAfgAH4B+AAfgAH4B+AAfgAH4B+AA/gAH4B/AA/AAH4A/gD/AAH4A/4H+AAH4Af//+AAH4AP//8AAH4AP//4AAHwAD//wAAAAAB//AAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///8AAAAD////AAAAP////wAAAf////4AAA/////8AAB/////+AAD/gP4H+AAD/AfgD/AAH8A/AB/AAH8A/AA/gAH4B+AAfgAH4B+AAfgAPwB8AAfgAPwB8AAfgAPwB+AAfgAPwB+AAfgAH4B+AAfgAH4B/AA/gAH8B/AB/AAH+A/wD/AAD+A/8P+AAB8Af//+AAB4AP//8AAAwAH//4AAAAAD//gAAAAAA//AAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAAPwAAAAAAAPwAAAAAAAPwAAAAAAAPwAAAAHAAPwAAAA/AAPwAAAD/AAPwAAAf/AAPwAAB//AAPwAAP//AAPwAA//8AAPwAH//wAAPwAf/+AAAPwB//4AAAPwP//AAAAPw//8AAAAP3//gAAAAP//+AAAAAP//wAAAAAP//AAAAAAP/4AAAAAAP/gAAAAAAP+AAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAH+A//gAAAf/h//4AAA//z//8AAB/////+AAD/////+AAD///+H/AAH+H/4B/AAH8B/wA/gAH4A/gAfgAH4A/gAfgAPwA/AAfgAPwA/AAfgAPwA/AAfgAPwA/AAfgAH4A/gAfgAH4A/gAfgAH8B/wA/gAH/H/4B/AAD///+H/AAD/////+AAB/////+AAA//z//8AAAf/h//4AAAH+A//gAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gAAAAAAD/8AAAAAAP/+AAAAAAf//AAcAAA///gA8AAB///wB+AAD/x/4B/AAD+AP4B/AAH8AH8A/gAH4AH8A/gAH4AD8AfgAP4AD8AfgAPwAB8AfgAPwAB8AfgAPwAB8AfgAPwAB8AfgAH4AD8AfgAH4AD4A/gAH8AH4B/AAD+APwD/AAD/g/wP+AAB/////+AAA/////8AAAf////4AAAP////wAAAH////AAAAA///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8APwAAAAD8APwAAAAD8APwAAAAD8APwAAAAD8APwAAAAD8APwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("DxcjFyAfISAiHCAiEg=="), 54+(scale<<8)+(1<<16));
  return this;
};

Graphics.prototype.setSmallFont = function(scale) {
  // Actual height 28 (27 - 0)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    32,
    atob("BgkMGhEZEgYMDAwQCAwICxILEBAREBEOEREJCREVEQ8ZEhEUExAOFBQHDREPGBMUERQSEhEUERsREBIMCwwTEg4QERAREQoREQcHDgcYEREREQoPDBEPFg8PDwwIDBMcCgoAAAAAAAAAAAAAACERESEAAAAAAAAAAAAAAAAhIQAGCRAQEhAIDw8XCQ8RABIODRELCw4REwcLCQoPHBscDxISEhISEhoUEBAQEAcHBwcTExQUFBQUDhQUFBQUEBEREBAQEBAQGhARERERBwcHBxAREREREREPEREREREPEQ8="),
    28+(scale<<8)+(1<<16)
  );
  return this;
};

var imgLock = {
  width : 16, height : 16, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("A8AH4A5wDDAYGBgYP/w//D/8Pnw+fD58Pnw//D/8P/w="))
};

var imgSteps = {
  width : 24, height : 24, bpp : 1,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("/H///wv4CBn4CD8ACCj4IBj8f+Eeh/wjgCBngCCg/4nEH//4h/+jEP/gRBAQX+jkf/wgB//8GwP4FoICDHgICCBwIA=="))
};

var imgBattery = {
  width : 24, height : 24, bpp : 1,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("/4AN4EAg4TBgd///9oEAAQv8ARQRDDQQgCEwQ4OA"))
};

var imgBpm = {
  width : 24, height : 24, bpp : 1,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("/4AOn4CD/wCCjgCCv/8jF/wGYgOA5MB//BC4PDAQnjAQPnAQgANA"))
};

var imgTemperature = {
  width : 24, height : 24, bpp : 1,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("//D///wICBjACBngCNkgCP/0kv/+s1//nDn/8wICEBAIOC/08v//IYJECA=="))
};

var imgWind = {
  width : 24, height : 24, bpp : 1,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("/0f//8h///Pn//zAQXzwf/88B//mvGAh18gEevn/DIICB/PwgEBAQMHBAIADFwM/wEAGAP/54CD84CE+eP//wIQU/A=="))
};

var imgTimer = {
  width : 24, height : 24, bpp : 1,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("/+B/4CD84CEBAPygFP+F+h/x/+P+fz5/n+HnAQNn5/wuYCBmYCC5kAAQfOgFz80As/ngHn+fD54mC/F+j/+gF/HAQA=="))
};

var imgCharging = {
  width : 24, height : 24, bpp : 1,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("//+v///k///4AQPwBANgBoMxBoMb/P+h/w/kH8H4gfB+EBwfggHH4EAt4CBn4CBj4CBh4FCCIO/8EB//Agf/wEH/8Gh//x////fAQIA="))
};

var imgWatch = {
  width : 24, height : 24, bpp : 1,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("/8B//+ARANB/l4//5/1/+f/n/n5+fAQnf9/P44CC8/n7/n+YOB/+fDQQgCEwQsCHBBEC"))
};


/*
 * INFO ENTRIES
 * List of [Data, Icon, left/right, HomeAssistant Trigger]
 */
var infoArray = [
  function(){ return [ null, null, "left", null ] },
  function(){ return [ "Bangle", imgWatch, "right", null ] },
  function(){ return [ E.getBattery() + "%", imgBattery, "left", null ] },
  function(){ return [ getSteps(), imgSteps, "left", null ] },
  function(){ return [ Math.round(Bangle.getHealthStatus("last").bpm) + " bpm", imgBpm, "left", null] },
  function(){ return [ getWeather().temp, imgTemperature, "left", null ] },
  function(){ return [ getWeather().wind, imgWind, "left", null ] },
];

/*
 * We append the HomeAssistant integrations if HomeAssistant is available
 */
try{
  var triggers = require("ha.lib.js").getTriggers();
  triggers.forEach(trigger => {
    infoArray.push(function(){
      return [trigger.display, trigger.getIcon(), "left", trigger.trigger]
    });
  })
} catch(ex){
  // Nothing to do if HomeAssistant is not available...
}
const NUM_INFO=infoArray.length;


function getInfoEntry(){
  if(isAlarmEnabled()){
    return [getAlarmMinutes() + " min.", imgTimer, "left", null]
  } else if(Bangle.isCharging()){
    return [E.getBattery() + "%", imgCharging, "left", null]
  } else{
    // In case the user removes HomeAssistant entries, showInfo
    // could be larger than infoArray.length...
    settings.showInfo = settings.showInfo % infoArray.length;
    return infoArray[settings.showInfo]();
  }
}


/*
 * Helper
 */
function getSteps() {
  var steps = 0;
  try{
      if (WIDGETS.wpedom !== undefined) {
          steps = WIDGETS.wpedom.getSteps();
      } else if (WIDGETS.activepedom !== undefined) {
          steps = WIDGETS.activepedom.getSteps();
      } else {
        steps = Bangle.getHealthStatus("day").steps;
      }
  } catch(ex) {
      // In case we failed, we can only show 0 steps.
  }

  steps = Math.round(steps/100) / 10; // This ensures that we do not show e.g. 15.0k and 15k instead
  return steps + "k";
}


function getWeather(){
  var weatherJson;

  try {
    weatherJson = storage.readJSON('weather.json');
    var weather = weatherJson.weather;

    // Temperature
    weather.temp = locale.temp(weather.temp-273.15);

    // Humidity
    weather.hum = weather.hum + "%";

    // Wind
    const wind = locale.speed(weather.wind).match(/^(\D*\d*)(.*)$/);
    weather.wind = Math.round(wind[1]) + " km/h";

    return weather

  } catch(ex) {
    // Return default
  }

  return {
    temp: "? °C",
    hum: "-",
    txt: "-",
    wind: "? km/h",
    wdir: "-",
    wrose: "-"
  };
}

function isAlarmEnabled(){
  try{
    var alarm = require('sched');
    var alarmObj = alarm.getAlarm(TIMER_IDX);
    if(alarmObj===undefined || !alarmObj.on){
      return false;
    }

    return true;

  } catch(ex){ }
  return false;
}

function getAlarmMinutes(){
  if(!isAlarmEnabled()){
    return -1;
  }

  var alarm = require('sched');
  var alarmObj =  alarm.getAlarm(TIMER_IDX);
  return Math.round(alarm.getTimeToAlarm(alarmObj)/(60*1000));
}

function increaseAlarm(){
  try{
    var minutes = isAlarmEnabled() ? getAlarmMinutes() : 0;
    var alarm = require('sched')
    alarm.setAlarm(TIMER_IDX, {
      timer : (minutes+5)*60*1000,
    });
    alarm.reload();
  } catch(ex){ }
}

function decreaseAlarm(){
  try{
    var minutes = getAlarmMinutes();
    minutes -= 5;

    var alarm = require('sched')
    alarm.setAlarm(TIMER_IDX, undefined);

    if(minutes > 0){
      alarm.setAlarm(TIMER_IDX, {
        timer : minutes*60*1000,
      });
    }

    alarm.reload();
  } catch(ex){ }
}


/*
 * DRAW functions
 */

function draw() {
  // Queue draw again
  queueDraw();

  // Draw clock
  drawDate();
  drawTime();
  drawLock();
  drawWidgets();
}


function drawDate(){
    // Draw background
    var y = H/5*2;
    g.reset().clearRect(0,0,W,W);

    // Draw date
    y = parseInt(y/2);
    y += settings.fullscreen ? 2 : 15;
    var date = new Date();
    var dateStr = date.getDate();
    dateStr = ("0" + dateStr).substr(-2);
    g.setMediumFont();  // Needed to compute the width correctly
    var dateW = g.stringWidth(dateStr);

    g.setSmallFont();
    var dayStr = locale.dow(date, true);
    var monthStr = locale.month(date, 1);
    var dayW = Math.max(g.stringWidth(dayStr), g.stringWidth(monthStr));
    var fullDateW = dateW + 10 + dayW;

    g.setFontAlign(-1,0);
    g.setMediumFont();
    g.setColor(g.theme.fg);
    g.drawString(dateStr, W/2 - fullDateW / 2, y+1);

    g.setSmallFont();
    g.drawString(dayStr, W/2 - fullDateW/2 + 10 + dateW, y-12);
    g.drawString(monthStr, W/2 - fullDateW/2 + 10 + dateW, y+11);
}


function drawTime(){
  // Draw background
  var y = H/5*2 + (settings.fullscreen ? 0 : 8);
  g.setColor(g.theme.fg);
  g.fillRect(0,y,W,H);
  var date = new Date();

  // Draw time
  g.setColor(g.theme.bg);
  g.setFontAlign(0,0);

  var hours = String(date.getHours());
  var minutes = date.getMinutes();
  minutes = minutes < 10 ? String("0") + minutes : minutes;
  var colon = settings.hideColon ? "" : ":";
  var timeStr = hours + colon + minutes;

  // Set y coordinates correctly
  y += parseInt((H - y)/2) + 5;

  var infoEntry = getInfoEntry();
  var infoStr = infoEntry[0];
  var infoImg = infoEntry[1];
  var printImgLeft = infoEntry[2] == "left";

  // Show large or small time depending on info entry
  if(infoStr == null){
    if(settings.hideColon){
      g.setXLargeFont();
    } else {
      g.setLargeFont();
    }
  } else {
    y -= 15;
    g.setMediumFont();
  }
  g.drawString(timeStr, W/2, y);

  // Draw info if set
  if(infoStr == null){
    return;
  }

  y += 35;
  g.setFontAlign(0,0);
  g.setSmallFont();
  var imgWidth = 0;
  if(infoImg !== undefined){
    imgWidth = 26.0;
    var strWidth = g.stringWidth(infoStr);
    var scale = imgWidth / infoImg.width;
    g.drawImage(
      infoImg,
      W/2 + (printImgLeft ? -strWidth/2-2 : strWidth/2+2) - parseInt(imgWidth/2),
      y - parseInt(imgWidth/2),
      { scale: scale }
    );
  }
  g.drawString(infoStr, printImgLeft ? W/2 + imgWidth/2 + 2 : W/2 - imgWidth/2 - 2, y+3);
}


function drawLock(){
  if(settings.showLock && Bangle.isLocked()){
    g.setColor(g.theme.fg);
    g.drawImage(imgLock, W-16, 2);
  }
}


function drawWidgets(){
  if(settings.fullscreen){
    for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
  } else {
    Bangle.drawWidgets();
  }
}



/*
 * Draw timeout
 */
// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.on('lock', function(isLocked) {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  draw();
});

Bangle.on('charging',function(charging) {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  draw();
});

Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.2);
  var right = g.getWidth() - left;
  var upper = parseInt(g.getHeight() * 0.2);
  var lower = g.getHeight() - upper;

  var is_left = e.x < left;
  var is_right = e.x > right;
  var is_upper = e.y < upper;
  var is_lower = e.y > lower;
  var is_center = !is_upper && !is_lower && !is_left && !is_right;

  if(is_upper){
    Bangle.buzz(40, 0.6);
    increaseAlarm();
    drawTime();
  }

  if(is_lower){
    Bangle.buzz(40, 0.6);
    decreaseAlarm();
    drawTime();
  }

  if(is_right){
    Bangle.buzz(40, 0.6);
    settings.showInfo = (settings.showInfo+1) % NUM_INFO;
    drawTime();
  }

  if(is_left){
    Bangle.buzz(40, 0.6);
    settings.showInfo = settings.showInfo-1;
    settings.showInfo = settings.showInfo < 0 ? NUM_INFO-1 : settings.showInfo;
    drawTime();
  }

  if(is_center){
    var infoEntry = getInfoEntry();
    var trigger = infoEntry[3];
    if(trigger != null){
      try{
        require("ha.lib.js").sendTrigger("TRIGGER_BW");
        Bangle.buzz(80, 0.6).then(()=>{
          require("ha.lib.js").sendTrigger(trigger);
          setTimeout(()=>{
            Bangle.buzz(80, 0.6);
          }, 250);
        });
      }catch(ex){
        print(ex);
        // Without ha -> nop.
      }
    }
  }
});


E.on("kill", function(){
  try{
    storage.write(SETTINGS_FILE, settings);
  } catch(ex){
    // If this fails, we still kill the app...
  }
});


/*
 * Draw clock the first time
 */
// The upper part is inverse i.e. light if dark and dark if light theme
// is enabled. In order to draw the widgets correctly, we invert the
// dark/light theme as well as the colors.
g.setTheme({bg:g.theme.fg,fg:g.theme.bg, dark:!g.theme.dark}).clear();

// Load widgets and draw clock the first time
Bangle.loadWidgets();
draw();

// Show launcher when middle button pressed
Bangle.setUI("clock");
