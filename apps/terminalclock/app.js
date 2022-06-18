const locale = require("locale");
var heartRate = 0;
var altitude = -9001;

const fontColor = g.theme.dark ? "#0f0" : "#000";
// handling the differents versions of the Banglejs smartwatch screen sizes
if (process.env.HWVERSION == 1){
  var paddingY = 3;
  var font6x8At4Size = 48;
  var font6x8At2Size = 27;
  var font6x8FirstTextSize = 6;
  var font6x8DefaultTextSize = 3;
} else{
  var paddingY = 2;
  var font6x8At4Size = 32;
  var font6x8At2Size = 18;
  var font6x8FirstTextSize = 4;
  var font6x8DefaultTextSize = 2;
}

// initialising the clockface
const ClockFace = require("ClockFace");
const clock = new ClockFace({
  init: function () {
    // check settings and set default if needed
    if (this.HRMinConfidence === undefined) this.HRMinConfidence = 50;
    if (this.PowerOnInterval === undefined) this.PowerOnInterval = 15;
    if (this.showAltitude === undefined){
      this.showAltitude = true && process.env.HWVERSION == 2;
    }else {
      this.showAltitude = this.showAltitude && process.env.HWVERSION == 2;
    }
    ["showHRM", "showActivity", "showStepCount", "powerSaving"].forEach(k => {
      if (this[k]===undefined) this[k] = true;
    });
    
    Bangle.on("lock", on => {
      if (on) lock();
      else unlock();
    });

    turnOnServices();
    if(this.powerSaving){
      setInterval(turnOnServices, this.PowerOnInterval*60000); // every PowerOnInterval min
    }

  },

  draw: function (date) {
    var curPos = 1;
    g.setFontAlign(-1, -1);
    g.setColor(fontColor);
    drawTime(date, curPos);
    curPos++;
    if(this.showDate){
      drawDate(date, curPos);
      curPos++;
    }
    if(this.showAltitude){
      drawAltitude(curPos);
      curPos++;
    }
    if(this.showHRM){
      drawHRM(curPos);
      curPos++;
    }
    if(this.showActivity){
      drawActivity(curPos);
      curPos++;
    }
    if(this.showStepCount){
      drawStepCount(curPos);
      curPos++;
    }
    drawInput(curPos);
  },

  settingsFile: "terminalclock.json"
});


/* ---------------------------- 
Draw related of specific lines
-------------------------------- */

function drawLine(line, pos){
  if(pos == 1)
    g.setFont("6x8", font6x8FirstTextSize);
  else
    g.setFont("6x8", font6x8DefaultTextSize);

  var yPos = Bangle.appRect.y +
      paddingY * (pos - 1) +
      font6x8At4Size * Math.min(1, pos-1) +
      font6x8At2Size * Math.max(0, pos-2);
  g.drawString(line, 5, yPos, true);
}

function drawTime(now, pos){
  var h = now.getHours();
  var m = now.getMinutes();
  var time = ">" + (""+h).substr(-2) + ":" + ("0"+m).substr(-2);
  drawLine(time, pos);
}

function drawDate(now, pos){
  var dow = locale.dow(now, 1);
  var date = locale.date(now, 1).substr(0,6) + locale.date(now, 1).substr(-2);
  var locale_date = ">" + dow + " " + date;
  drawLine(locale_date, pos);
}

function drawInput(pos){
  drawLine(">", pos);
}

function drawStepCount(pos){
  var health = Bangle.getHealthStatus("day");
  var steps_formated = ">Steps: " + health.steps;
  drawLine(steps_formated, pos);
}

function drawHRM(pos){
  if(heartRate != 0)
    drawLine(">HR: " + parseInt(heartRate), pos);
  else
    drawLine(">HR: unknown", pos);
}

function drawAltitude(pos){
  if(altitude > 0)
    drawLine(">Alt: " + altitude.toFixed(1) + "m", pos);
  else
    drawLine(">Alt: unknown", pos);
}
 
function drawActivity(pos){
  var health = Bangle.getHealthStatus('last');
  var steps_formated = ">Motion: " + parseInt(health.movement);
  drawLine(steps_formated, pos);
}


/* -----------------------------------------------
Services functions (HRM, pressure, etc...)
-------------------------------------------------- */

function turnOnServices(){
  if(clock.showHRM){
    Bangle.setHRMPower(true, "terminalclock");
  }
  if(clock.showAltitude){
    Bangle.setBarometerPower(true, "terminalclock");
  }
  if(clock.powerSaving){
    setTimeout(function () {
      turnOffServices();
    }, 45000);
  }
}

function turnOffServices(){
  if(clock.showHRM){
    Bangle.setHRMPower(false, "terminalclock");
  }
  if(clock.showAltitude){
    Bangle.setBarometerPower(false, "terminalclock");
  }
}

Bangle.on('HRM',function(hrmInfo) {
  if(hrmInfo.confidence >= clock.HRMinConfidence)
    heartRate = hrmInfo.bpm;
});

const MEDIANLENGTH = 20; // technical
var avr = [], median; // technical
Bangle.on('pressure', function(e) {
  while (avr.length>MEDIANLENGTH) avr.pop();
  avr.unshift(e.altitude);
  median = avr.slice().sort();
  if (median.length>10) {
    var mid = median.length>>1;
    altitude = E.sum(median.slice(mid-4,mid+5)) / 9;
  }
});

/* -------------------------------------------------
Clock related functions but not in the ClockFace module
---------------------------------------------------- */

function unlock(){
  if(clock.powerSaving){
    turnOnServices();
  }
  clock.old_precision = clock.precision;
  clock.precision = 1;
  clock.tick();
}

function lock(){
  clock.precision = clock.old_precision;
  clock.tick();
}

// starting the clock
clock.start();
