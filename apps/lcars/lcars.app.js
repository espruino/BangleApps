const SETTINGS_FILE = "lcars.setting.json";
const Storage = require("Storage");


// ...and overwrite them with any saved values
// This way saved values are preserved if a new version adds more settings
const storage = require('Storage')
let settings = {
  alarm: -1,
  dataRow1: "Battery",
  dataRow2: "Steps",
  dataRow3: "Temp."
};
let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
for (const key in saved_settings) {
  settings[key] = saved_settings[key]
}
let hrmValue = 0;
var stepsData = new Array(24).fill(0);
var hrmData = new Array(24).fill(0);


/*
 * Colors to use
 */
let cBlue = "#0094FF";
let cOrange = "#FF9900";
let cPurple = "#FF00DC";
let cWhite = "#FFFFFF";

/*
 * Position in lcars
 */
let lcarsViewPos = 0;
let drag;

/*
 * Requirements and globals
 */
const locale = require('locale');

var bgLeft =  {
  width : 27, height : 176, bpp : 3,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AAUM2XLlgCCwAJBBAuy4EAmQIF5cggAIGlmwgYIG2XIF42wF4ImGF4ImHJoQmGJoQdJhZNHNY47CgRNGBIJZHHgRiGBIRQ/KH5QCAFCh/eX5Q/KAwdCAGVbtu27YCCoAJBkuWrNlAQRGCiwRDAQPQBIMJCIYCBsAJBgomEtu0WoQmEy1YBIMBHYttIwQ7FyxQ/KHFlFAQ7F2weCHYplKChRTCCg5TCHw5TMAD0GzVp0wCCBBGaBIMaBAtpwECBA2mwEJBAugDgMmCIwJBF5EABAtoeQQvGCYQdPJoI7LMQzTCLJKAGzAJBO4xQ/KGQA8UP7y/KH5QnAHih/eX5Q/GQ4JCGRJlKCgxTDBAwgCCg5TCHwxTCNA4A=="))
}

var bgRight =  {
  width : 27, height : 176, bpp : 3,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("lmy5YCDBIUyBAmy5AJBhYUG2EAhgIFAQMAgQIGCgQABCg4ABEAwUNFI2AKZHAKZEgGRZTGOIUDQxJxGKH5Q/agwAnUP7y/KH4yGeVYAJrdt23bAQVABIMly1ZsoCCMgUWCIYCB6AJBhIRDAQNgBIMFEwlt2i1CEwmWrAJBgI7FtpGCHYuWKH5QxEwpQDlo7F0A7IqBZBEwo7BCIwCBJo53CJoxiCJpIAdgOmzVpAQR/CgAIEAQJ2CBAoCBBIMmCg1oD4QLGFQUCCjQ+CKYw+CKY4JCKYwoCGRMaGREJDoroCgwdFzBlLKH5QvAHih/eX5Q/KE4A8UP7y/KH5QGDpg7HJoxZCCIx3CJowmCF4yACJox/CgAA="))
}

var iconEarth = {
  width : 50, height : 50, bpp : 3,
  buffer : require("heatshrink").decompress(atob("AFtx48ECBsDwU5k/yhARLjgjBjlzAQMQEZcIkOP/fn31IEZgCBnlz58cEpM4geugEgwU/8+WNZJHDuHHvgmBCQ8goEOnVgJoMnyV58mACItHI4X8uAFBuVHnnz4BuGxk4////Egz3IkmWvPgNw8f/prB//BghTC+AjE7848eMjNnzySBwUJkmf/BuGuPDAQIjBiPHhhTCSQnjMo0ITANJn44Dg8MuFBggCCiFBcAJ0Bv5xEh+ITo2OhHkyf/OIQdBWwVHhgjBNwUE+fP/5EEgePMoYLBhMgyVJk/+BQQdC688I4XxOIc8v//NAvr+QEBj/5NwKVBy1/QYUciPBhk1EAJrC+KeC489QYaMBgU/8BNB9+ChEjz1Jkn/QYMBDQIgCcYTCCiP/nlzJQmenMAgV4//uy/9wRaB/1J8iVCcAfHjt9TYYICnhKCgRKBw159/v//r927OIeeoASBDQccvv3791KYVDBYPLJQeCnPnz//AAP6ocEjEkXgMgJQtz79fLAP8KYkccAcJ8Gf/f/xu/cAMQ4eP5MlyQRCMolx40YsOGBAPfnnzU4KVDpKMBvz8Dh0/8me7IICgkxJQXPIgZTD58sEgcJk+eNoONnFBhk4/5uB/pcDg5KD+4mEv4CBXISVDhEn31/8/+mH7x//JQK5CAAMB4JBCnnxJQf/+fJEgkAa4L+CAQOOjMn/1bXIRxDJQXx58f//Hhlz/88EgsChMgz/Zs/+nfkyV/8huDOI6SD498NwoACi1Z8+S/Plz17/+QCI7jC+ZxBmfPnojIAAMDcYWSp//2wRJEwq2GABECjMgNYwAmA="))
}

var iconSaturn = {
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("AH4A/AEkQuPHCJ0ChEAwARNjAjBjgjOhs06Q2OEYVx4ARMhEggUMkANIDoIgBoEEgEBNxJEC6ZrBAAMwNxAjDNYcHNxIjB7dtEwIHBwRoKj158+cuPEjlwCRAjC23bpu0wRNDAAsHEYWeEwaSJ6YjCAQUNSRQjEzxQBWZMNEYlsmg2JWAIjCz95SoJuJggjDtuw6dMG5JKCz998wFBJRVNEYW0yaVBJRNhJQN9+4pCzhKJmBKC4YpB/fINxIgCzFxSoQ3J4ENm3CAQPb98wbpEcAQMYWwKYBNxMDXgc2/fv3g2IEAOAgAjBjy5CEhEMfYICBgfPnjdLjj+CgMHiC3JknDhhoINw4jCAB0IJQIANR4QjPAH4A/AFA"))
}

var iconMoon = {
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("AH4AQjlx44CCCZsg8eOkHDwAQKEYgmPhEgEQM48AOIgMHEYoCB4ATI8UAmH/x04JoRuJsImHuBKLn37EwZuIgEQOI8cEpXj/yYBhE8+YNGgkYoJxITBUPnAaC///nC+FjBuIOJZEB8YeCh/8AoYACoMEEAnEjhQDPQJKJ/DCDAoi5DoLdHAoMQgLjFWYPOnngh02IwXzwDjEgPGEYS8BI4MBYoSVG4fP/nghkAgZrDkngJQqSG4gvBg4sBQgkImHihEAWwP8ZBMBEYl5/+cSoVAGQIUFh04weJn///0gj/OEw5KEz45BzhuCTYQAEgePB4IACAoJuBnAQEa4XHjxKB//xFgWHJQsCRgMDEonipwjENwUBDQNx8+evvn/hTDLw3igE+EgZxB8UOXIvEJQUfEYOfv53DEQkgga5BJQvzx84cAj+CDoNh8/eEYJKDuCSEcocnEon+/7xEgFBIIcfB4Mf/IICXI2DgDdBAAn758gCIq5Dv4zBvJuIOIfjEgvP/ARHgwdCB4P3AoTdFAAk4EYk8SQgAFTALaDSQwAGh08//vnDmBABYmEEZYAzA=="))
}

var iconMars = {
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("AH4ATjlwCJ+Dh0wwAQMg0cuPHjFhCZkDps0yVJkmQCBMEjFx42atOmzQmLhMkEYQCCCREQoOGEYmmzB0IEY4CBkARGoJKBEYQCEzgSGkGSpAjDyYCCphuGiFhJQgCD8ASFgRHGAQKbB6BuHJRGeOIsINxEk6dNmARDgMEjQjHAQPnVQojIyZKB6YSDNwK5FAQt54BuDXJIjBEwK5EgxKKXgq5BJRdgXIojJAQJKMcAM0EwM2JUApDoCVFExa7FkGCgAmIkAREEwUEjAmHCIgABhEggQmFpACBCIojBEwRQCzVhwkQU4YADgQmBwQCCI4IFBCAojFAQojGJQQjDAQgRGEZICBEo4gFyUIkilFJQUYEAZrBAQMYNw5KDSQSbCNwwABgOGEwgCBsPACQ5xGwdNnARJcAVh48evvnCJK8Chs+/fv33gCRcB48cuPHCBYA/ADAA=="))
}

var iconSatellite =  {
  width : 50, height : 50, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQC/ATGXhIRPyNl0gmPjlwCJ9ly1aCJ1c+fHJR1Hy1ZJR1I+fPnlx6QRLpe+/JKBr5KMuYjBJQMdCJce/fvJQW0CJUlEYQCBSpvvJQbXJjl0NwnzNxGQwEOnHhgF78+WqQyIrFx48cAQXz4ShJgAABh0+8cP//9LJEhg4jDuP3//0LhGQgYlBgeAn///5cIy8MuAmDCIP/9I4HkmCEYMOgHfCQWkCI0cuBuDgF/CIP+CI1Ny1IkeAgHANwIAB/QRFrj7BhkxEwQRC/4RFpbXDgSVBg4RCSorXDI4MJAQMfCIP8cwImDn37fwN58+kwHgLgSVFub7CI4NyBAJKDLgkuEYX78+evKtCLg0jEYRKC58JMoRcFkwjDJQTFDl65EkojEAQMdcwn/+gFC3YjEJQLXEpYRDWwQmEdI6SHAQO0CJUkx4jDF4gCIJQgRMXIjCEARIjCCJ2XEYPKCJqJBJQIROcAUpCJ0kybaDARtdCKAC2kAA="))
}

var iconAlarm = {
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("kmSpICEp//BAwCJn/+CJ8k//5CKAABCJs8uPH//x48EI5YjCAARNKEYUcv//jgFBExEnEYoAC+QmHIgIgC/gpCuPBCI2fIgU4AQXjA4P8CIuTEYZKBAolwHApXBEAWP//jxwpBAALaFDoYCIiQmDDIP4EAT+CEwnJEwYjLAQLaFEYomDKALmDNwoCIOIZuD8AkFgCYDHAQjMAQTdDNwOAEg0Dx0/cYeREZtxQYOTHgJuHOIvkXJy8DNwIACJQ8Ah4NDAAfxEZARHOIIkHg4jQAQb1CQ4KVJgEOnDIBSoIjNAQPBcAaVJcAKVBcDGOcD7OBMQM48BuH8f//JKCnhKNggRBkmfTQJxBEwhuD/gRCyVHJRlyCIVJXgYmB8ZQBAoIKBXIQmCOIt/NxAUCOIImCIgIpCBAJuDAQZEE/huIAQWTDgImBTYQGC8gRFcYpKFCI8kDwQAFCJBfBEAX/+IjBiQRIEw4jJAQc8v//NYwCIOgJrIJpA1OcwbaFAQWQA="))
}

var iconCharging =   {
  width : 50, height : 50, bpp : 3,
  transparent : 5,
  buffer : require("heatshrink").decompress(atob("23btugAwUBtoICARG0h048eODQYCJ6P/AAUCCJfbo4SDxYRLtEcuPHjlwgoRJ7RnIloUHoYjDAQfAExEAwUIkACEkSAIEYwCBhZKH6EIJI0CJRFHEY0BJRWBSgf//0AJRYSE4BKLj4SE8BKLv4RD/hK/JS2AXY0gXwRKG4cMmACCJQMAg8csEFJQsBAwfasEAm379u0gFbcBfHzgFBz1xMQZKBjY/D0E2+BOChu26yVEEYdww+cgAFCg+cgIfB6RKF4HbgEIkGChEAthfCJQ0eEAIjBBAMxk6GCJQtgtyVBwRKBAQMbHAJKGXIIFCgACBhl54qVG2E+EAJKBJoWAm0WJQ6SCXgdxFgMLJQvYjeAEAUwFIUitEtJQ14NwUHgEwKYZKGwOwNYX7XgWCg3CJQ5rB4MevPnAoPDJRJrCgEG/ECAoNsJRUwoEesIIBiJKI3CVDti/CJRKVDiJHBSo0YsOGjED8AjBcAcIgdhcAXAPIUAcAYIBcA4dBAQUG8BrBgBuCgOwcBEeXIK2BBAIFBgRqBGoYAChq8CcYUE4FbUYOACQsHzgjDgwFBCIImBAQsDtwYD7cAloRI22B86YBw5QBgoRJ7dAgYEDCJaeBJoMcsARMAQNoJIIRE6A"))
}

var iconNoBattery = {
  text: "NO BAT",
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("kmSpIC/AWMyoQIFsmECJFJhMmA4QXByVICIwODAQ4RRFIQGD5JVLkIGDzJqMyAGDph8MiRKGyApEAoZKFyYIDQwMkSQNkQZABBhIIOOJRuEL5gRIAUKACVQMhmUSNYNDQYJTBBwYFByGTkOE5FJWYNMknCAQKYCiaSCpmGochDoSYBhMwTAZrChILBhmEzKPBF4ImBTAREBDoMmEwJVDoYjBycJFgWEJQRuLJQ1kmQCCjJlCBYbjCagaDBwyDBmBuBF4TjJAUQKINBChCDQxZBcZIIQF4NIgEAgKSDiQmEVQKMBoARBAAMCSQLLBVoxqKL4gaCChVCNwoRKOIo4CJIgABBoSMHpIRFgDdJOIJUBCAUJRgJuEAQb+DIIgRIAX4C/ASOQA"))
}

// Font to use:
// <link href="https://fonts.googleapis.com/css2?family=Antonio:wght@400;700&display=swap" rel="stylesheet">
Graphics.prototype.setFontAntonioMedium = function(scale) {
  // Actual height 20 (19 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAA//mP/5gAAAAAAAAAAAAA/gAMAAAAAA/gAPAAAEIIBP+H/8D+IYBP+H/8D+IABCAAwIAfnwP8+PHh448eP3+B4fAAAAAAAH/AD/4AwGAMBgD/4Af8GAAPgAPgAfgAfAAfAA+AAOP/AH/4BgGAYBgH/4A/8AAAAAAAAAQAA/B+f4/+GMPhjv/4/h8Dg/gAcYwAAPwADgAAAAAAAAB//8///sAAaAACAAAMAAb//+f//AAAAAAAbAAGwAA4AA/wADgABsAAbAAAAAAAgAAMAAPwAD8AAMAADAAAAAAAAAAHAAB/AAOAAAAAAAAMAADAAAwAAMAACAAAAAAAAAABgAAYAAAAAAAAA4AD+AP+A/4A/gAOAAAAAAAAAH//j//8wADMAAz//8f/+AAAAAAAMAADAABgAA//+P//gAAAAAAAAAAAAAfgfP4fzAfswfDP/gx/gMAAAHgPj4D8wMDMHAz//8f3+AAEAAAAADwAH8APzA/AwP//j//4AAwAAAD/Hw/x+MwBjOAYz/+Mf/AAAAAAAH//j//8wYDMGAz9/8fP+AAcDAAAwAAMAfjB/4z/wP+AD4AAwAAAAOB/f4///MHAzBwM///H9/gAAAAAAH/Pj/78wGDMBgz//8f/+AAAAAAADhwA4cAAAAAAAAAAAAAADh/A4fgAAAAOAAHwABsAA7gAccAGDAAAAANgADYAA2AANgADYAA2AAAAAAAABgwAccADuAAbAAHwAA4AAAAHwAD8c4/POMHAD/wAfwAAAAAAAAD/wD//B4B4Y/HMf8zMBMyATMwczP+M4BzHwcgf+AA+AAAAAAD4A/+P/8D+DA/4wH/+AB/4AAeAAAAAAA//+P//jBgYwYGP//j//4PH4AAAAAAAf/+P//zgAcwADP4fz+P4Ph8AAAAAAA//+P//jAAYwAGPADj//4P/4AAAAAAA//+P//jBgYwYGMGBgAAAAAAP//j//4wYAMGADBgAAAAAAAA//w///PAHzAQM4MHP7/x+/8AAAAAAD//4//+AGAABgAAYAP//j//4AAAAAAAAAA//+P//gAAAAAAAAAAAHwAB+AABgAAY//+P//AAAAAAAAAAD//4//+APgAf+Afj8PgPjAAYAAAAAAD//4//+AABgAAYAAGAAAAAAA//+P//j/gAD/wAB/gAP4B/4P/AD//4//+AAAAAAAAAAP//j//4P4AAfwAA/g//+P//gAAAAAAAAAA//g//+PAHjAAY4AOP//h//wAAAAAAD//4//+MDADAwA4cAP/AB/gAAAAAAAA//g//+PAHjAAc4APv//5//yAAAAAAD//4//+MGADBgA48AP//h+f4AAAAAAB+Pw/z+MOBjBwY/P+Hx/AAHgwAAMAAD//4//+MAADAAAAAAP//D//4AAOAABgAA4//+P//AAAAwAAP8AD//AA/+AAfgP/4//gPwAAAAA+AAP/4Af/4AD+A//j/wA/wAD/+AA/4B/+P/+D+AAAAAMADj8P4P/4A/4B//w+A+MABgAAA4AAPwAB/gAB/+A//j/gA+AAMAAAAAYwB+MH/jf+Y/8GPwBjAAAAAAP//7//+wABsAAYAAAAAAPAAD/gAH/gAD/gAD4AACAAADAAGwABv//7//+AAAA=="), 32, atob("BQUHCAgVCQQFBQkHBQcFBwgICAgICAgICAgFBQcHBwgPCQkJCQcHCQoFCQkHDQoJCQkJCAYJCQ0ICAcGBwY="), 20+(scale<<8)+(1<<16));
}

Graphics.prototype.setFontAntonioLarge = function(scale) {
  // Actual height 39 (39 - 1)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAAAAAPgAAAAAB8AAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAD8AAAAAH/gAAAAP/8AAAAf//gAAA///AAAB//+AAAD//8AAAH//4AAAP//wAAAB//gAAAAP/AAAAAB+AAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///AAAf////8AP/////4B//////Af/////8D8AAAAfgeAAAAA8DwAAAAHgeAAAAA8D//////gf/////8B//////AP/////wAf////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAHgAAAAAA8AAAAAAPgAAAAAB4AAAAAAf/////gP/////8B//////gP/////8B//////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAD/+AAP8A//wAP/gP/+AH/8D//wD//gfgAA//8DwAAf+HgeAAP/A8DwAH/gHgfgP/wA8D///4AHgP//+AA8A///AAHgB//AAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AA/gAD/AAH/gA/4AA/+AP/AAH/4D/4AA//gfgA4AB8DwAPAAHgeAB4AA8DwAPgAHgfAD+AB8D//////gP/////4B//5//+AD/+H//gAH/AH/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAP/AAAAAP/4AAAAP//AAAAP/x4AAAf/wPAAAf/gB4AAf/AAPAAP/AAB4AB//////gP/////8B//////gP/////8AAAAAPAAAAAAB4AAAAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//wD/AB///Af+AP//4D/4B///Af/gP//4B/8B4D4AAPgPAeAAA8B4DwAAHgPAfAAB8B4D////gPAf///4B4B////APAD///gAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB///AAAP////4AH/////wB//////Af/////8D8APAA/geADwAB8DwAeAAHgeADwAA8D4AeAAPgf/j+AH8B/8f///gP/h///4Af8H//+AAPgP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAPAAAAAAB4AAAABgPAAAA/8B4AAB//gPAAD//8B4AH///gPAH///8B4P//+AAPH//wAAB///gAAAP//AAAAB/+AAAAAP+AAAAAB+AAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4A/+AAf/w//+AP//v//4B//////Af/////8D4AfwAPgeAB8AA8DwAHAAHgeAB8AA8D4Af4APgf/////8B//////AP//v//4A//4//8AA/4A/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/+AAAAD//+D/gB///4f+AP///j/4D///8f/gfAAHgB8DwAA8AHgeAAHgA8DwAA8AHgfgAHgB8D//////gP/////4A/////+AD/////gAD////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAfgAAB+AD8AAAPwAfgAAB+AD8AAAPwAfgAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("DBATExMTExMTExMTCw=="), 45+(scale<<8)+(1<<16));
}

/*
 * Draw watch face
 */
var drawTimeout;
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function printData(key, y){
  g.setFontAlign(-1,-1,0);

  if(key == "Battery"){
    var bat = E.getBattery();
    g.drawString("BAT:", 28, y);
    g.drawString(bat+ "%", 70, y);

  } else if(key == "Steps"){
    var steps = getSteps();
    g.drawString("STEP:", 28, y);
    g.drawString(steps, 70, y);

  } else if(key == "Temp."){
    var temperature = Math.floor(E.getTemperature());
    g.drawString("TMP:", 28, y);
    g.drawString(temperature + "C", 70, y);

  } else if(key == "HRM"){
    g.drawString("HRM:", 28, y);
    g.drawString(hrmValue, 70, y);

  } else {
    g.drawString("NOT FOUND", 28, y);
  }
}

function drawHoriztonatlBgLine(color, x1, x2, y, h){
  g.setColor(color);

  for(var i=0; i<h; i++){
    g.drawLine(x1, y+i, x2,y+i);
  }
}


function drawLock(){
  if(lcarsViewPos != 0){
    return;
  }

  g.setFontAntonioMedium();
  g.setColor(cOrange);
  g.clearRect(120, 10, g.getWidth(), 75);
  g.drawString("LCARS", 130, 15);
  g.drawString("B-JS2", 130, 35);
  if(Bangle.isLocked()){
    g.drawString("LOCK", 130, 55);
  }
}

function drawState(){
  if(lcarsViewPos != 0){
    return;
  }

  g.setColor(cWhite);
  var bat = E.getBattery();
  var timeInMinutes = getCurrentTimeInMinutes();

  var iconImg =
      isAlarmEnabled() ? iconAlarm :
      Bangle.isCharging() ? iconCharging :
      bat < 30 ? iconNoBattery :
      Bangle.isGPSOn() ? iconSatellite :
      timeInMinutes % 4 == 0 ? iconSaturn :
      timeInMinutes % 4 == 1 ? iconMars :
      timeInMinutes % 4 == 2 ? iconMoon :
      iconEarth;
  g.drawImage(iconImg, 120, 118);

  // Alarm within symbol
  g.setFontAlign(-1, -1, 0);
  g.setFontAntonioMedium();
  g.drawString("STATUS", 123, 97);
  if(isAlarmEnabled() > 0){
    g.setFontAlign(0, 0, 0);
    g.setColor(cWhite);
    g.drawString(getAlarmMinutes(), 120+25, 118+25+1);
  }
}


function drawPosition0(){
  // Draw background image
  g.drawImage(bgLeft, 0, 0);
  drawHoriztonatlBgLine(cBlue, 25, 120, 0, 4);
  drawHoriztonatlBgLine(cBlue, 130, 176, 0, 4);
  drawHoriztonatlBgLine(cPurple, 20, 70, 80, 4);
  drawHoriztonatlBgLine(cPurple, 80, 176, 80, 4);
  drawHoriztonatlBgLine(cOrange, 35, 110, 87, 4);
  drawHoriztonatlBgLine(cOrange, 120, 176, 87, 4);
  drawHoriztonatlBgLine(cOrange, 20, 176, 171, 5);

  // Draw logo
  drawLock();

  // Write time
  g.setColor(cWhite);
  var currentDate = new Date();
  var timeStr = locale.time(currentDate,1);
  g.setFontAntonioLarge();
  g.drawString(timeStr, 25, 12);

  // Write date
  g.setColor(cWhite);
  g.setFontAntonioMedium();
  var dayStr = locale.dow(currentDate, true).toUpperCase();
  dayStr += " " + currentDate.getDate();
  dayStr += " " + currentDate.getFullYear();
  g.drawString(dayStr, 28, 58);

  // Draw data
  g.setColor(cWhite);
  printData(settings.dataRow1, 97);
  printData(settings.dataRow2, 122);
  printData(settings.dataRow3, 147);

  // Draw state
  drawState();
}

function drawPosition1(){
  // Draw background image
  g.drawImage(bgRight, 149, 0);
  drawHoriztonatlBgLine(cBlue, 0, 140, 0, 4);
  drawHoriztonatlBgLine(cPurple, 0, 80, 80, 4);
  drawHoriztonatlBgLine(cPurple, 90, 150, 80, 4);
  drawHoriztonatlBgLine(cOrange, 0, 50, 87, 4);
  drawHoriztonatlBgLine(cOrange, 60, 140, 87, 4);
  drawHoriztonatlBgLine(cOrange, 0, 150, 171, 5);

  // Draw steps bars
  g.setColor(cWhite);

  // HRM
  require("graph").drawBar(g, hrmData, {
    axes : true,
    gridx : 4,
    gridy : 100,
    width : 140,
    height : 50,
    x: 5,
    y: 25
  });

  // Steps
  require("graph").drawBar(g, stepsData, {
    axes : true,
    gridx : 4,
    gridy : 2500,
    width : 140,
    height : 50,
    x: 5,
    y: 115
  });

  g.setFontAntonioMedium();
  g.drawString("HRM", 123, 7);
  g.drawString("STEPS", 116, 94);
}

function draw(){
  // First handle alarm to show this correctly afterwards
  handleAlarm();

  // Handle steps for graph data
  handleSteps();

  // Next draw the watch face
  g.reset();
  g.clearRect(0, 0, g.getWidth(), g.getHeight());

  // Draw current lcars position
  if(lcarsViewPos == 0){
    drawPosition0();
  } else if (lcarsViewPos == 1) {
    drawPosition1();
  }

  // Queue draw in one minute
  queueDraw();
}


/*
 * Step counter via widget
 */
function getSteps() {
  if (stepsWidget() !== undefined)
    return stepsWidget().getSteps();
  return 0;
}

function stepsWidget() {
  if (WIDGETS.activepedom !== undefined) {
    return WIDGETS.activepedom;
  } else if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom;
  }
  return undefined;
}

function handleSteps(){
  var current_h = (new Date()).getHours();
  if(current_h == 0){
    stepsData[current_h] = getSteps();
  } else {
    stepsData[current_h] = getSteps() - stepsData[current_h-1];
  }
}


/*
 * Handle alarm
 */
function getCurrentTimeInMinutes(){
  return Math.floor(Date.now() / (1000*60));
}

function isAlarmEnabled(){
 return settings.alarm > 0;
}

function getAlarmMinutes(){
  var currentTime = getCurrentTimeInMinutes();
  return settings.alarm - currentTime;
}

function handleAlarm(){
  if(!isAlarmEnabled()){
    return;
  }

  if(getAlarmMinutes() > 0){
    return;
  }

  // Alarm
  var t = 300;
  Bangle.buzz(t, 1)
  .then(() => new Promise(resolve => setTimeout(resolve, t)))
  .then(() => Bangle.buzz(t, 1))
  .then(() => new Promise(resolve => setTimeout(resolve, t)))
  .then(() => Bangle.buzz(t, 1))
  .then(() => new Promise(resolve => setTimeout(resolve, t)))
  .then(() => Bangle.buzz(t, 1));

  // Update alarm state to disabled
  settings.alarm = -1;
  Storage.writeJSON(SETTINGS_FILE, settings);
}


/*
 * Listeners
 */
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.on('lock', function(isLocked) {
  drawLock();
});

Bangle.on('charging',function(charging) {
  drawState();
});

Bangle.on('HRM', function (hrm) {
  var current_h = (new Date()).getHours();

  hrmValue = hrm.bpm;
  hrmData[current_h] =  (hrmData[current_h] + hrmValue) / 2
});


function increaseAlarm(){
  if(isAlarmEnabled()){
    settings.alarm += 5;
  } else {
    settings.alarm = getCurrentTimeInMinutes() + 5;
  }

  Storage.writeJSON(SETTINGS_FILE, settings);
}


function decreaseAlarm(){
  if(isAlarmEnabled() && (settings.alarm-5 > getCurrentTimeInMinutes())){
    settings.alarm -= 5;
  } else {
    settings.alarm = -1;
  }

  Storage.writeJSON(SETTINGS_FILE, settings);
}


// Thanks to the app "gbmusic" for this code to detect swipes in all 4 directions.
Bangle.on("drag", e => {
  if (!drag) { // start dragging
    drag = {x: e.x, y: e.y};
  } else if (!e.b) { // released
    const dx = e.x-drag.x, dy = e.y-drag.y;
    drag = null;

    // Horizontal swipe
    if (Math.abs(dx)>Math.abs(dy)+10) {
      if(dx > 0){
        lcarsViewPos = 0;
      } else {
        lcarsViewPos = 1;
      }

    // Vertical swipe
    } else if (Math.abs(dy)>Math.abs(dx)+10) {
      if(lcarsViewPos != 0){
        return;
      }

      if(dy > 0){
        decreaseAlarm();
      } else {
        increaseAlarm();
      }
    }

    draw();
  }
});


/*Bangle.on('swipe',function(dir) {


  // Decrease alarm
  if(dir == +1){
    if(isAlarmEnabled() && (settings.alarm-5 > getCurrentTimeInMinutes())){
      settings.alarm -= 5;
    } else {
      settings.alarm = -1;
    }
  }

  // Update UI
  draw();

  // Update alarm state
  Storage.writeJSON(SETTINGS_FILE, settings);
});*/

/*
 * Lets start widgets, listen for btn etc.
 */
// Show launcher when middle button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 * so we will blank out the draw() functions of each widget and change the
 * area to the top bar doesn't get cleared.
 */
for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}

// Clear the screen once, at startup and draw clock
g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear();
draw();

// After drawing the watch face, we can draw the widgets
// Bangle.drawWidgets();