/**
 * NOT ANALOG CLOCK
 */
const TIMER_IDX = "notanalog";
const locale = require('locale');
const storage = require('Storage')
const widget_utils = require('widget_utils');
const SETTINGS_FILE = "notanalog.setting.json";
let settings = {
    alarm: -1,
};
let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
for (const key in saved_settings) {
    settings[key] = saved_settings[key]
}
const is12Hour = (require("Storage").readJSON("setting.json", 1) || {})[
  "12hour"
];

/*
 * Set some important constants such as width, height and center
 */
var W = g.getWidth(),R=W/2;
var H = g.getHeight();
var cx = W/2;
var cy = H/2;
var drawTimeout;

var state = {
    color: "#ff0000",
    steps: 0,
    maxSteps: 10000,
    bat: 0,
    has_weather: false,
    temp: "-",
    sleep: false,
}

var chargeImg = {
    width : 32, height : 32, bpp : 1,
    transparent : 0,
    buffer : E.toArrayBuffer(atob("AAAMAAAAHgAAADMAAABjAAAAxgAAD44AAB8cAAA7uAAAcfAMAODgPgDAcHMBgDjjAYAdxgGBj4wBg8cYAYZjsAGGYeABg8DgAQGAYAMAAOAHgAHAB8ADgAzgBwAYc/4AGD/4AAw4AAAOcAAAH8AAADmAAABwAAAA4AAAAMAAAAA="))
};

var alarmImg = {
    width : 32, height : 32, bpp : 1,
    transparent : 0,
    buffer : E.toArrayBuffer(atob("AA/wAAAP8AAAD/AAAAGAAAABgAAAA8AABh/4YAd//uAH+B/gA+AHwAOAAcAHAPDgDgD4cA4A/HAcAP44HAD+OBwA/zgYAP8YGAD/GBj//xgc//84HH/+OBx//jgOP/xwDh/4cAcP8OAHg8HgA8ADwAHwD4AA//8AAD/8AAAP8AA="))
};

var stepsImg = {
    width : 32, height : 32, bpp : 1,
    transparent : 0,
    buffer : E.toArrayBuffer(atob("AcAAAAPwAAAH8AAAB/gAAAf4AAAH/AAAD/wAAAf8AAAH/AfAB/wP4Af8H+AH/B/gB/wf4AP8P+AD+D/gAfg/4AGAP+AAPD/gAPw/4AD+P+AAfj/AAH4/wAB+H8AAPAeAAAAwAAAAPgAAAH8AAAB/AAAAfgAAAH4AAAA8AAAAOAA="))
};

var gpsImg = {
    width : 32, height : 32, bpp : 1,
    transparent : 0,
    buffer : E.toArrayBuffer(atob("AAAMAAAAD4AAAAHAAAAA4AAADjABAA8YAYADmAPAAcwD4DzMB/B8zAf4fAAH/HwAB/74AAf/wAAH/4AAB//AAAP/4AAD//AAA//4AAH//AAA//4AAH//AAA//4ABH/4AAYP4AAHgAAAB/AAAA/4AAAP+AAAD/gAAP//gAD//4AA="))
};

var sleepImg = {
    width : 128, height : 128, bpp : 1,
    transparent : 0,
    buffer : require("heatshrink").decompress(atob("ABk//+AB5l///AB5wfDh4kIF4s/8AgIj4ED//wB5E+AYUB//8B5F8AYUD+F+B5H4AYUH8E/Bw8BHIcHwEfMA4PEh4RBQo8DNIYPBIIIPGDAkeEwJGDAAaZEB4MAOAisB+COEngCBOAn///4NAgPCMAgfCZ4gPCaIpWBd4l4QQZtFD4gPCgYPEQw3wRo41FgHxfw5tEB4sHfg7DC8IPDFQb8DB4XgB4ZDDWosD4DNCbAbsEB4zRDB5bRDfghKDB4bRCRwwPBuAFCbISOCgP/EYMPK4kPDgKOCgbiBDIJLDEoIYBRwQPD//DD4hQBbgPgF4QCB84PDBgICCDgJTBEQP/B4QFCwAIDKYIRB/84bQX/x+AD4YPCwF+nguC+B9FMYJuBngPBIgKmCeQoPEg5dBB4ryBB4kPPoMfdohRCB4McSYPAg5dBeQoPCjxOBCIIPBcQYUBL4N4j0B/hQBAATPBV4RnB/EegYFB//AbYYPCgfh+EeZgJNDAYYWBCQUedgN/NoUD/xhDEwUOj67BBQd/IAIFEh8+gZ3CNQMfSQkMBQN8g/wMATKBCQIAEh/4IAMPdoQlCB4vwn7sC/5OBSIQPE8F+KoRoBfIIPFPwP8cASyBQoIPG4JABJQUHAoJwEBAODIAUBAIIlBOAg/BgfgcAMDBYN+A4IPFC4I+BB4U/wKAFh8PwJ5BB4SFBB40fFANggPAg5nBSAsPzwwBDIRGB+F8L4v+NAIZCh8B+E8B4v8RAN4AwMOgH4jwPEY4M+gEwB4d8UA34E4sAn0PA4pHGgEeWApHBfA8HB4vgQ4oPBw4PF8IPGbALQEgfB8IXF4/DB4vD8YHG4LgEEwPDA4oPIA4w3BA4pWBF4poGdAJOEAAQPFQwyoDB4q2GB6VwB5twvAFDhwPIvAPFhwPNjwPTgaSDBwgPBj//wH//6qCnAPI4IPEvgPY4APEngPGjxPOL5KvER4gPFV5IPKZ4gPEZ4oPJd5QPF+APEg+AB5kHB5+HB40B8APFwfBVgIPCgeB8K0CB4fDB4kH4YXCLQfDB4oHBB43B8ZABB4UB4/DKgYPCCwRPDHAIPEKwgPDh+HB434B4yIDQwbGCB4ceB434ngPFnzIDewc+gEwB4MEgF8j4PFA4V4B4MOE4MeB4s8h+AB4QsBG4YADI4PA+APCgfwvgPFj8D8FwB4L2B8BnCAAcPwKQBL4UPEoIPFFwP8B4cfCwQPGvwPDv42BB4oHBn+AB4MB/gXBB4sB/Ef8BPC/B2BB4sADIP8B4M/8CeGAAN+gP/4fB//AWwIAGn5LB/4ABEwIPHj/Aj4OB/BGBB46ZBgYPBKAJ+GOAQZBj4sBEoIPHgP+Aod/Nw4KCDQQUFKAw6Ch5eIKAX/FYP/JxArCPwQSCABM/BwI+KGAYuLEAYeGA="))
};


/*
 * Based on the great multi clock from https://github.com/jeffmer/BangleApps/
 */
Graphics.prototype.drawRotRect = function(w, r1, r2, angle) {
    angle = angle % 360;
    var w2=w/2, h=r2-r1, theta=angle*Math.PI/180;
    return this.fillPoly(this.transformVertices([-w2,0,-w2,-h,w2,-h,w2,0],
        {x:cx+r1*Math.sin(theta),y:cy-r1*Math.cos(theta),rotate:theta}));
};

// The following font was used:
// <link href="https://fonts.googleapis.com/css2?family=Staatliches&display=swap" rel="stylesheet">
Graphics.prototype.setTimeFont = function(scale) {
    // Actual height 26 (26 - 1)
    this.setFontCustom(atob("AAAAAAAAAD4AAAAD4AAAAD4AAAAD4AAAAB4AAAAAAAAAAAAAAAAD4AAAD/4AAD//4AD///4Af///gAf//gAAf/gAAAfwAAAAQAAAAAAAAAAAAAAAAAB//+AAH///gAP///wAP///wAfwAP4AfAAD4AfAAD4AfAAD4AfAAD4AfAAD4AfgAH4AP///wAP///wAH///gAB//+AAAP/wAAAAAAAAAAAAAAf///4Af///4Af///4Af///4Af///4AAAAAAAAAAAAAAAAAAAB+AD4AH+AP4AP+Af4AP+B/4AfwD/4AfAH/4AfAf74AfA/z4AfD/j4Af/+D4AP/8D4AH/wD4AD/gD4AB+AD4AAAAAAAB8B8AAD8B/AAH8B/gAP8B/wAf8A/4AfAAD4AfB8D4AfB8D4AfD8D4Af3/P4AP///wAP///wAH///gAB/H+AAAAAAAAAAAAAAAAB+AAAAP+AAAA/+AAAD/+AAAP/+AAA/8+AAD/w+AAf/A+AAf///4Af///4Af///4Af///4AD///4AAAA+AAAAA+AAAAAAAAAAAYAAf/8/AAf/8/gAf/8/wAf/8/wAfD4H4AfD4D4AfD4D4AfD4D4AfD8H4AfD//4AfB//wAfA//gAeAf/AAAAH8AAAAAAAAAAAAAAB//+AAD///AAH///gAP///wAf///4AfD4D4AfD4D4AfD4D4AfD4D4Afz+P4AP5//wAP5//wAH4//gAB4P+AAAAAAAAAAAAAAfAAAAAfAAAAAfAAAIAfAAB4AfAAP4AfAB/4AfAP/4AfA//4AfH//AAf//4AAf/+AAAf/wAAAf+AAAAfwAAAAAAAAAAAAAAAAB8P+AAH///gAP///wAP///wAf/+P4AfH4D4AfD4D4AfD4D4Afn8D4Af///4AP///wAH///gAD/f/AAA4P+AAAAAAAAAAAQAAB/w+AAH/4/gAP/8/wAP/+/wAfh+P4AfA/D4AfAfD4AfAfD4AfA+H4Af///4AP///wAH///gAD///AAA//8AAAAAAAAAAAAAAAB8D4AAB8D4AAB8D4AAB8D4AAA8B4AAAAAAA=="), 46, atob("BwsSCBAQEBAQEBAQBw=="), 36+(scale<<8)+(1<<16));
    return this;
};

Graphics.prototype.setNormalFont = function(scale) {
    // Actual height 19 (18 - 0)
    this.setFontCustom(atob("AAAAAAAAAAAAAAD/5wP/3A/+cAAAAPwAA/AADAAAAgAA/AAD8AAIAAAAAAAxgADGAA/+AD/4ADGAAMYAD/4AP/gAMYAAxgAB84AP7wD3jwPHPA+f8A+/AB54AAAAB+AAP8BAwwcDnHwP8/AfPwAD8AA/AAPxwB+fgPh/A4GMCAfwAA+AAAAA+/AH/+A//8DjhwOOHA4/8Dj/wAP/AA4AADgAAAAAAAAD8AAPwAAwAAAAAAB/4Af/4D//wPAPA4AcDgBwAAAAAAADgBwOAHA//8B//gD/8AD/AAoAAGwAA/gAD+AAHwAAbAAAAAAAAAAAAAABgAAGAAAYAA/+AD/4AAYAABgAAGAAAYAAAByAAH4AAfAAAAAGAAA4AADgAAOAAA4AAAAAAAAAAAAAABwAAHAAAcAAAAAA/AD/8D//gP+AA8AAAAAAD/8Af/4D//wOAHA4AcDgBwPAPA//8B//gB/4AAAAAAAAP//A//8D//wAAAADAMA8DwHw/A+H8Dg/wOP3A/8cB/hwD4HAAAAAYEAHw8AfD4D4HwOOHA44cD//wH/+APvwAAAAAB4AAfgAH+AB/4AfjgD//wP//A//8AAOAAA4AAAAD/vAP++A/58DnBwOcHA5/8Dj/gOH8AAHAA//AH/+A//8DnhwOcHA548D7/wHv+AOPgAAAAOAAA4AADgBwOA/A4f8Dv/AP/gA/wAD4AAAAAAACAA9/AH/+A//8DnBwOcHA//8B//gD38AAHAA/HAH++A/98DhzwOHHA4c8D//wH/+AP/wAAAAAAAAA4cADhwAOHAA4cgDh+AOHwAAAABgAAPAAB8AAH4AA5wAHDgAYGAAAQAAAAAGYAAZgABmAAGYAAZgABmAAGYAAZgABmAAAAAAAQAGDgAcOAA5wAB+AAHwAAPAAAYAAAAADwAAfgAD8AAOD3A4fcDz9wP+AAfwAAcAAAAAAP/wB//gP//A4A8Dn5wOf3A5/cD/9wH/3AP+cAABwAAAAAH8AP/wP//A/84D/zgP//AH/8AAfwAABAAAAD//wP//A//8DjhwOOHA488D//wH/+APngA//AH/+A//8DgBwOAHA8A8D8PwHw+AHDgAAAAAAAA//8D//wP//A4AcDgBwPAPA//8B//gD/4AAAAD//wP//A//8DjhwOOHA44cDjhwOOHAAAAD//wP//A//8DjgAOOAA44ADjgAOOAAP/wB//gP//A4AcDhxwOHPA/f8B9/gDn4AAAAAAAAP//A//8D//wAOAAA4AADgAP//A//8D//wAAAA//8D//wP//AAAAAAPAAA+AAD8AABwAAHAAA8D//wP/+A//gAAAAAAAA//8D//wP//AD8AA/8AH/8A+H8DgHwIAHAAAAD//wP//A//8AABwAAHAAAcAABwAAHAAAAD//wP//A//8D8AAD4AAPgAB8AAP//A//8D//wAAAAAAAD//wP//Af/8Af4AAf4A//4D//wP//AAAAA//AH/+A//8DgBwOAHA4A8D//wH/+AP/wAAAAAAAA//8D//wP//A4cADhwAOPAA/8AB/gAD4AAP/wB//gP//A4AcDgBwPAPA//8B//4D//gAAEAAAAP//A//8D//wOOAA44ADjwAP//Af/8A+fwAAAAPjwB/PgP+/A48cDhxwPn/Afv4B+fgBw4AAAADgAAOAAA4AAD//wP//A//8DgAAOAAA4AAD//AP/+A//8AABwAAHAAA8D//wP/+A//wAAAAPAAA/4AD//gA//AAP8Af/wP/8A/4ADgAAAAAA4AAD/gAP//AH/8AB/wP//A//AD//gB//AAP8D//wP/4A/gACAAAOAHA/D8D//wB/4AH/gD//wPx/A4AcAAAAMAAA+AAD/AAD//AB/8B//wP8AA+AADAAAOAfA4H8Dh/wOf3A/8cD/BwPwHA8AcAAAAP//A//8D//wOAHA4AcDgBwAAAAAAAD8AAP/wAf/8AD/wAAPAAAAAAAAOAHA4AcDgBwP//A//8D//wA=="), 32, atob("AwQJCggPCwUHBwgKBAcEBwsFCgoKCgoKCgoEBAkKCQoMCQoKCgkJCgoFCgoJDAoKCgoLCgkKCg4JCQkHBwc="), 22+(scale<<8)+(1<<16));
    return this;
};


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

    return steps;
}


function drawBackground() {
    g.setFontAlign(0,0,0);
    g.setNormalFont();

    g.setColor(g.theme.fg);
    for (let a=0;a<360;a+=6){
        if (a % 30 == 0 || (a > 345 || a < 15) || (a > 90-15 && a < 90+15) || (a > 180-15 && a < 180+15) || (a > 270-15 && a < 270+15)) {
            continue;
        }

        var theta=a*Math.PI/180;
        g.drawLine(cx,cy,cx+125*Math.sin(theta),cy-125*Math.cos(theta));
    }

    g.clearRect(10,10,W-10,H-10);
    for (let a=0;a<360;a+=30){
        if(a == 0 || a == 90 || a == 180 || a == 270){
            continue;
        }
        g.drawRotRect(6,R-80,125,a);
    }

    g.clearRect(16,16,W-16,H-16);
}


function drawState(){
    g.setFontAlign(1,0,0);

    // Draw alarm
    var highPrioImg = isAlarmEnabled() ? alarmImg :
        Bangle.isCharging() ? chargeImg :
        Bangle.isGPSOn() ? gpsImg :
        undefined;

    var imgColor = isAlarmEnabled() ? state.color :
        Bangle.isCharging() ? g.theme.fg :
        Bangle.isGPSOn() ? g.theme.fg :
        state.color;

    // As default, we draw weather if available, otherwise the steps symbol is shown.
    if(!highPrioImg && state.has_weather){
        g.setColor(g.theme.fg);
        g.drawString(state.temp, cx+cx/2+15, cy+cy/2+10);
    } else {
        g.setColor(imgColor);
        var img = highPrioImg ? highPrioImg : stepsImg;
        g.drawImage(img, cx+cx/2 - img.width/2 + 5, cy+cy/2 - img.height/2+5);
    }
}

function drawData() {
    g.setFontAlign(0,0,0);
    g.setNormalFont();

    // Set hand functions
    var drawBatteryHand = g.drawRotRect.bind(g,6,12,R-38);
    var drawDataHand = g.drawRotRect.bind(g,5,12,R-24);

    // Draw battery hand
    g.setColor(g.theme.fg);
    g.setFontAlign(0,0,0);
    drawBatteryHand(parseInt(state.bat*360/100));

    // Draw data hand - depending on state
    g.setColor(state.color);
    if(isAlarmEnabled()){
        var alrm = getAlarmMinutes();
        drawDataHand(parseInt(alrm*360/60));
        return;
    }

    // Default are the steps
    drawDataHand(parseInt(state.steps*360/12000));
}

function drawTextCleared(s, x, y){
    g.clearRect(x-15, y-22, x+15, y+15);
    g.drawString(s, x, y);
}


function drawTime(){
    g.setTimeFont();
    g.setFontAlign(0,0,0);
    g.setColor(g.theme.fg);

    var posX = 14;
    var posY = 14;

    // Hour
    var h = state.currentDate.getHours();
    if (is12Hour && h > 12) {
      h = h - 12;
    }
    var h1 = parseInt(h / 10);
    var h2 = h < 10 ? h : h - h1*10;
    drawTextCleared(h1, cx, posY+8);
    drawTextCleared(h2, W-posX, cy+5);

    // Minutes
    var m = state.currentDate.getMinutes();
    var m1 = parseInt(m / 10);
    var m2 = m < 10 ? m : m - m1*10;
    drawTextCleared(m2, cx, H-posY);
    drawTextCleared(m1, posX-1, cy+5);
}


function drawDate(){
    // Date
    g.setFontAlign(-1,0,0);
    g.setNormalFont();
    g.setColor(g.theme.fg);
    var dayStr = locale.dow(state.currentDate, true).toUpperCase();
    g.drawString(dayStr, cx/2-15, cy/2-5);
    g.drawString(state.currentDate.getDate(), cx/2-15, cy/2+17);
}


function drawLock(){
    g.setColor(g.theme.fg);
    g.fillCircle(cx, cy, 7);

    var c = Bangle.isLocked() ? state.color : g.theme.bg;
    g.setColor(c);
    g.fillCircle(cx, cy, 4);
}


function handleState(fastUpdate){
    state.currentDate = new Date();

    /*
     * Sleep modus
     */
    var minutes = state.currentDate.getMinutes();
    var hours = state.currentDate.getHours();
    if(!isAlarmEnabled() && fastUpdate && hours == 0 && minutes == 1){
        state.sleep = true;
        return;
    }

    // Set steps
    state.steps = getSteps();

    // Color based on state
    state.color = isAlarmEnabled() ? "#FF6A00" :
        state.steps > state.maxSteps ? "#00ff00" :
        "#ff0000";

    /*
     * 5 Minute updates
     */
    if(minutes % 5 == 0 && fastUpdate){
        return;
    }

    // Set battery
    state.bat = E.getBattery();

    // Set weather
    state.has_weather = true;
    try {
        const weather = require('weather').get();
        if (weather === undefined){
            state.has_weather = false;
            state.temp = "-";
        } else {
            state.temp = locale.temp(Math.round(weather.temp-273.15));
        }
    } catch(ex) {
        state.has_weather = false;
    }
}


function drawSleep(){
    g.reset();
    g.clearRect(0, 0, g.getWidth(), g.getHeight());
    drawBackground();

    g.setColor(1,1,1);
    g.drawImage(sleepImg, cx - sleepImg.width/2, cy- sleepImg.height/2);
}


function draw(fastUpdate){
    // Queue draw in one minute
    queueDraw();

    // Execute handlers
    handleState(fastUpdate);

    if(state.sleep){
        drawSleep();
        // We don't queue draw again - so its sleeping until
        // the user presses the btn again.
        return;
    }

    // Clear watch face
    if(fastUpdate){
        var innerRect = 20;
        g.clearRect(innerRect, innerRect, g.getWidth()-innerRect, g.getHeight()-innerRect);
    } else {
        g.reset();
        g.clearRect(0, 0, g.getWidth(), g.getHeight());
    }

    // Draw again
    g.setColor(1,1,1);

    if(!fastUpdate){
        drawBackground();
    }

    drawDate();
    drawLock();
    drawState();
    drawTime();
    drawData();
}


/*
 * Listeners
 */
Bangle.on('lcdPower',on=>{
    if (on) {
        draw(true);
    } else { // stop draw timer
        if (drawTimeout) clearTimeout(drawTimeout);
        drawTimeout = undefined;
    }
});

Bangle.on('charging',function(charging) {
    draw(true);
});

Bangle.on('lock', function(isLocked) {
    if(state.sleep){
        state.sleep=false;
        draw(false);
    } else {
        drawLock();
    }
});

Bangle.on('touch', function(btn, e){
    var upper = parseInt(g.getHeight() * 0.2);
    var lower = g.getHeight() - upper;

    var is_upper = e.y < upper;
    var is_lower = e.y > lower;

    if(is_upper){
        feedback();
        increaseAlarm();
        draw(true);
    }

    if(is_lower){
        feedback();
        decreaseAlarm();
        draw(true);
    }
});


/*
 * Some helpers
 */
function queueDraw() {

    // Faster updates during alarm to ensure that it is
    // shown correctly...
    var timeout = isAlarmEnabled() ? 10000 : 60000;

    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, timeout - (Date.now() % timeout));
}


/*
 * Handle alarm
 */
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

function feedback(){
    Bangle.buzz(40, 0.6);
}


/*
 * Lets start widgets, listen for btn etc.
 */
// Show launcher when middle button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 */
widget_utils.hide();

// Clear the screen once, at startup and draw clock
// g.setTheme({bg:"#fff",fg:"#000",dark:false}).clear();
draw(false);

// After drawing the watch face, we can draw the widgets
// Bangle.drawWidgets();
