const h = g.getHeight();
const w = g.getWidth();
const SETTINGS_FILE = "primetimelato.json";
let settings;
let setStr = 'U';
    
Graphics.prototype.setFontLato = function(scale) {
  // Actual height 41 (43 - 3)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('ACEfAokB/AGEn+AAocDBgsfBgkB+A6Yg4FEgYgF/4FEv/gHIhAEh/+DwgYEgP/4AeJn4eF/hDEDwxrE/4eFKAgeFgJDERQ5DEXJI0Eh//IIZlB/4pDAoP/HgQYBAAIaBPARDDv4JBj5WBh5ZCv4CBPATPCeQcPwDYECAIMGPId4gEeSIYMHDIYMCExZAGh6ICn5QEK4RnGOgqBGaoKOECYSiDn78FAFgxFR4bcCKISOBgF+RwYCBTgQMCOIQMCj5eCBgIfDBgQfCBgSbDWoSHC/61CAwYMUAAYzCAAZNCBkYAfgYmBgJ7CTYsPTYQMBgJnBgYMCn4MBv64CBgMPXYSBBD4cfBgQIBgf3RwK7CvybCGQXPBgIfBGQIMBeoU/DoIMCF4IMDgP8BgQmBn8AEwb+BBgQIBIQJAC4BYBIgTNBDYIMBg///xRDn//OoIMBcYISBBgUHNATpCgjCngIEDFIM+AoV8TYKYCMIJQBAQLCCgZcBYQIJBX4UHCwSJBYQaSCMYQDCYQabEBgngW4V4WoQBBOgIMN+AoCEwY+BGYZfBYwQIBv+AG4X+j/8K4TCB+bECM4P+YgcD//B/67Ch/4h//K4SSBv5IBAAdAWqMYAokDD4t+AokfBgi0DAAX/Bgkf7wSE/IME/6PBCQfBBgcD/AME/ypCCQXABgYSBBgg+BBgYSBBgatBBggSBBgYSBBgcB/4ACZ4QGDZ4IMLFARAEAAJaEBjQAUhAnFMgIABuD5CVwWAboUDLwZ0DNYKLBM4IMBh50C55rBCoWACAIMC+EPFIN4EQQMBg4MSHgYzEBgIzBIAUAvhND+EH8DZCBAN/bIfwMQP/OgIMBLgalCBgKlDg//V4kfCQIAqWgYzC/gFDIAJgBZoS3CAwV//4TDh/+j5UCCQOAn4SD8DPCCQSbCCQR/BNAV/3i1CB4PzAYLCBgP8AYIMCv+HBgcP+AMDCQMHEwb2BYQLPDgYMBIAKoBOYLPCwDNBZ4UQBQPhJ4J0EDYJbCZ4R7EAoZiDSoaUDADBNBFQj5EKwQMEGAoMEOgQFCnAMEQIYFBgaOCBgTRBBgc/AYIMCaIQMCgb2CBgX/JQIMCDAQMCh/8JoYYBJoiNDBgIYDBgIYDBgPzUwkfUwisBOokfDAYMCQIq/ERwwAcn4pCgfwg42D//B/6hBCAP+KwYQBMQKbBgF//9+g5EBh4YB4CfC/EHDwK1Dn7PD8A0BgF4gEeAIUHBgQBBBi4mEGYpAEAIMP4BNELQpnGOgM/ZYaBFGQMPYos/JAIAuj4xEKgJrBfoX//hEE/4TDCQJSCCoN/gZfBjCBCj+AgaOCAIiKBg4OCgKKBvgbCWYMDToK1CgE8JIQMC4ZCBBgU4HYTNCz4JBEwV7KoQzCUIYvBLYZNBn60CLQPfCQcDM4LHCEALHDZ4TaCCYaODHYK8fh6FDEwKSCF4Uf4COCBgJsBn4MDDIJPDVgYAZA='))),
    46,
    atob("CxMeHh4eHh4eHh4eDQ=="),
    52+(scale<<8)+(1<<16)
  );
  return this;
};

Graphics.prototype.setFontLatoSmall = function(scale) {
  // Actual height 21 (20 - 0)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    32,
    atob("BAcIDAwRDwUGBggMBAcECAwMDAwMDAwMDAwFBQwMDAgRDg4OEAwMDxAGCQ4LExARDREOCwwPDhUODQ0GCAYMCAYLDAoMCwcLDAUFCwURDAwMDAgJCAwLEAsLCgYGBgwA"),
    21+(scale<<8)+(1<<16)
  );
  return this;
};

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)||{};
  settings.buzz_on_prime = (settings.buzz_on_prime === undefined ? false : settings.buzz_on_prime);
  settings.debug = (settings.debug === undefined ? false : settings.debug);

  switch(settings.buzz_on_prime) {
  case true:
    setStr = 'T';
    break;

  case false:
    setStr = 'F';
    break;

  case undefined:
  default:
    setStr = 'U';
    break;
  }
}
	
// creates a list of prime factors of n and outputs them as a string, if n is prime outputs "Prime Time!"
function primeFactors(n) {
  const factors = [];
  let divisor = 2;

  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  if (factors.length === 1) {
    return "Prime Time!";
  }
  else
    return factors.toString();
}


// converts time HR:MIN to integer HRMIN e.g. 15:35 => 1535
function timeToInt(t) {
    var arr = t.split(':');
    var intTime = parseInt(arr[0])*100+parseInt(arr[1]);

    return intTime;
}

function draw() {
  var date = new Date();
  var timeStr = require("locale").time(date,1);
  var intTime = timeToInt(timeStr);
  var primeStr = primeFactors(intTime);

  g.reset();
  g.setColor(0,0,0);
  g.fillRect(Bangle.appRect);

  g.setColor(100,100,100);

  if (settings.debug) {
    g.setFontLatoSmall();
    g.setFontAlign(0, 0);
    g.drawString(setStr, w/2, h/4);
  }
  
  g.setFontLato();
  g.setFontAlign(0, 0);
  g.drawString(timeStr, w/2, h/2);

  g.setFontLatoSmall();
  g.drawString(primeStr, w/2, 3*h/4);

  // Buzz if Prime Time and between 8am and 8pm
  if (settings.buzz_on_prime && primeStr == "Prime Time!" && intTime >= 800 && intTime <= 2000)
      buzzer(2);
  queueDraw();
}

// timeout for multi-buzzer
var buzzTimeout;

// n buzzes
function buzzer(n) {
  if (n-- < 1) return;
  Bangle.buzz(250);
  
  if (buzzTimeout) clearTimeout(buzzTimeout);
  buzzTimeout = setTimeout(function() {
    buzzTimeout = undefined;
    buzzer(n);
  }, 500);
}
	
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


loadSettings();
g.clear();
// Show launcher when middle button pressed
Bangle.setUI("clock");

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
