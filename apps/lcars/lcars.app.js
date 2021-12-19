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

/*
 * Colors to use
 */
let cBlue = "#0094FF";
let cOrange = "#FF9900";
let cPurple = "#FF00DC";
let cWhite = "#FFFFFF";

/*
 * Requirements and globals
 */
const locale = require('locale');

var backgroundImage =  {
  width : 27, height : 176, bpp : 3,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AAUM2XLlgCCwAJBBAuy4EAmQIF5cggAIGlmwgYIG2XIF42wF4ImGF4ImHJoQmGJoQdJhZNHNY47CgRNGBIJZHHgRiGBIRQ/KH5QCAFCh/eX5Q/KAwdCAGVbtu27YCCoAJBkuWrNlAQRGCiwRDAQPQBIMJCIYCBsAJBgomEtu0WoQmEy1YBIMBHYttIwQ7FyxQ/KHFlFAQ7F2weCHYplKChRTCCg5TCHw5TMAD0GzVp0wCCBBGaBIMaBAtpwECBA2mwEJBAugDgMmCIwJBF5EABAtoeQQvGCYQdPJoI7LMQzTCLJKAGzAJBO4xQ/KGQA8UP7y/KH5QnAHih/eX5Q/GQ4JCGRJlKCgxTDBAwgCCg5TCHwxTCNA4A=="))
}

var logo = {
  width : 56, height : 56, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AAUEAwsOAwseAwsfAws/AwtzwAGEuIGF8PgAocH8H4AwcP4H+FAnAv4cDveAufAAwXzwFxEYUB4cAmFwAwMDw8AnE4F4UGgEYjBmCM4McjgGEhhxCBQUMC4IYBAwMOg4GBnAfBgwGCmAtBg8DAwxUBuEwIIIGDJIMDwYGCsAGBwIGBsAGBgIGDMoMB4IGIuB6C4YGBuIGJ8YGBmOAgPgsYJBAwMH+AGCneAh84u4GBjeAPAIGCcgM4hk+YQQ5BhwGE8EHninCgPAgYGCgxzBge4AwSPBgLnCVwQGEU4MH/gGCn+An98AwV///+AwUMuP/+AwChngJwIGCh52CjxaCPIIfBAxICBJIIXEAAb+CACA"))
}

var iconEarth = {
  text: "EARTH",
  width : 50, height : 50, bpp : 3,
  buffer : require("heatshrink").decompress(atob("AFtx48ECBsDwU5k/yhARLjgjBjlzAQMQEZcIkOP/fn31IEZgCBnlz58cEpM4geugEgwU/8+WNZJHDuHHvgmBCQ8goEOnVgJoMnyV58mACItHI4X8uAFBuVHnnz4BuGxk4////Egz3IkmWvPgNw8f/prB//BghTC+AjE7848eMjNnzySBwUJkmf/BuGuPDAQIjBiPHhhTCSQnjMo0ITANJn44Dg8MuFBggCCiFBcAJ0Bv5xEh+ITo2OhHkyf/OIQdBWwVHhgjBNwUE+fP/5EEgePMoYLBhMgyVJk/+BQQdC688I4XxOIc8v//NAvr+QEBj/5NwKVBy1/QYUciPBhk1EAJrC+KeC489QYaMBgU/8BNB9+ChEjz1Jkn/QYMBDQIgCcYTCCiP/nlzJQmenMAgV4//uy/9wRaB/1J8iVCcAfHjt9TYYICnhKCgRKBw159/v//r927OIeeoASBDQccvv3791KYVDBYPLJQeCnPnz//AAP6ocEjEkXgMgJQtz79fLAP8KYkccAcJ8Gf/f/xu/cAMQ4eP5MlyQRCMolx40YsOGBAPfnnzU4KVDpKMBvz8Dh0/8me7IICgkxJQXPIgZTD58sEgcJk+eNoONnFBhk4/5uB/pcDg5KD+4mEv4CBXISVDhEn31/8/+mH7x//JQK5CAAMB4JBCnnxJQf/+fJEgkAa4L+CAQOOjMn/1bXIRxDJQXx58f//Hhlz/88EgsChMgz/Zs/+nfkyV/8huDOI6SD498NwoACi1Z8+S/Plz17/+QCI7jC+ZxBmfPnojIAAMDcYWSp//2wRJEwq2GABECjMgNYwAmA="))
}

var iconSaturn = {
  text: "SATURN",
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("AH4A/AEkQuPHCJ0ChEAwARNjAjBjgjOhs06Q2OEYVx4ARMhEggUMkANIDoIgBoEEgEBNxJEC6ZrBAAMwNxAjDNYcHNxIjB7dtEwIHBwRoKj158+cuPEjlwCRAjC23bpu0wRNDAAsHEYWeEwaSJ6YjCAQUNSRQjEzxQBWZMNEYlsmg2JWAIjCz95SoJuJggjDtuw6dMG5JKCz998wFBJRVNEYW0yaVBJRNhJQN9+4pCzhKJmBKC4YpB/fINxIgCzFxSoQ3J4ENm3CAQPb98wbpEcAQMYWwKYBNxMDXgc2/fv3g2IEAOAgAjBjy5CEhEMfYICBgfPnjdLjj+CgMHiC3JknDhhoINw4jCAB0IJQIANR4QjPAH4A/AFA"))
}

var iconMoon = {
  text: "MOON",
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("AH4AQjlx44CCCZsg8eOkHDwAQKEYgmPhEgEQM48AOIgMHEYoCB4ATI8UAmH/x04JoRuJsImHuBKLn37EwZuIgEQOI8cEpXj/yYBhE8+YNGgkYoJxITBUPnAaC///nC+FjBuIOJZEB8YeCh/8AoYACoMEEAnEjhQDPQJKJ/DCDAoi5DoLdHAoMQgLjFWYPOnngh02IwXzwDjEgPGEYS8BI4MBYoSVG4fP/nghkAgZrDkngJQqSG4gvBg4sBQgkImHihEAWwP8ZBMBEYl5/+cSoVAGQIUFh04weJn///0gj/OEw5KEz45BzhuCTYQAEgePB4IACAoJuBnAQEa4XHjxKB//xFgWHJQsCRgMDEonipwjENwUBDQNx8+evvn/hTDLw3igE+EgZxB8UOXIvEJQUfEYOfv53DEQkgga5BJQvzx84cAj+CDoNh8/eEYJKDuCSEcocnEon+/7xEgFBIIcfB4Mf/IICXI2DgDdBAAn758gCIq5Dv4zBvJuIOIfjEgvP/ARHgwdCB4P3AoTdFAAk4EYk8SQgAFTALaDSQwAGh08//vnDmBABYmEEZYAzA=="))
}

var iconMars = {
  text: "MARS",
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("AH4ATjlwCJ+Dh0wwAQMg0cuPHjFhCZkDps0yVJkmQCBMEjFx42atOmzQmLhMkEYQCCCREQoOGEYmmzB0IEY4CBkARGoJKBEYQCEzgSGkGSpAjDyYCCphuGiFhJQgCD8ASFgRHGAQKbB6BuHJRGeOIsINxEk6dNmARDgMEjQjHAQPnVQojIyZKB6YSDNwK5FAQt54BuDXJIjBEwK5EgxKKXgq5BJRdgXIojJAQJKMcAM0EwM2JUApDoCVFExa7FkGCgAmIkAREEwUEjAmHCIgABhEggQmFpACBCIojBEwRQCzVhwkQU4YADgQmBwQCCI4IFBCAojFAQojGJQQjDAQgRGEZICBEo4gFyUIkilFJQUYEAZrBAQMYNw5KDSQSbCNwwABgOGEwgCBsPACQ5xGwdNnARJcAVh48evvnCJK8Chs+/fv33gCRcB48cuPHCBYA/ADAA=="))
}

var iconSatellite =  {
  text: "GPS ON",
  width : 50, height : 50, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQC/ATGXhIRPyNl0gmPjlwCJ9ly1aCJ1c+fHJR1Hy1ZJR1I+fPnlx6QRLpe+/JKBr5KMuYjBJQMdCJce/fvJQW0CJUlEYQCBSpvvJQbXJjl0NwnzNxGQwEOnHhgF78+WqQyIrFx48cAQXz4ShJgAABh0+8cP//9LJEhg4jDuP3//0LhGQgYlBgeAn///5cIy8MuAmDCIP/9I4HkmCEYMOgHfCQWkCI0cuBuDgF/CIP+CI1Ny1IkeAgHANwIAB/QRFrj7BhkxEwQRC/4RFpbXDgSVBg4RCSorXDI4MJAQMfCIP8cwImDn37fwN58+kwHgLgSVFub7CI4NyBAJKDLgkuEYX78+evKtCLg0jEYRKC58JMoRcFkwjDJQTFDl65EkojEAQMdcwn/+gFC3YjEJQLXEpYRDWwQmEdI6SHAQO0CJUkx4jDF4gCIJQgRMXIjCEARIjCCJ2XEYPKCJqJBJQIROcAUpCJ0kybaDARtdCKAC2kAA="))
}

var iconAlarm = {
  text: "TIMER",
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("kmSpICEp//BAwCJn/+CJ8k//5CKAABCJs8uPH//x48EI5YjCAARNKEYUcv//jgFBExEnEYoAC+QmHIgIgC/gpCuPBCI2fIgU4AQXjA4P8CIuTEYZKBAolwHApXBEAWP//jxwpBAALaFDoYCIiQmDDIP4EAT+CEwnJEwYjLAQLaFEYomDKALmDNwoCIOIZuD8AkFgCYDHAQjMAQTdDNwOAEg0Dx0/cYeREZtxQYOTHgJuHOIvkXJy8DNwIACJQ8Ah4NDAAfxEZARHOIIkHg4jQAQb1CQ4KVJgEOnDIBSoIjNAQPBcAaVJcAKVBcDGOcD7OBMQM48BuH8f//JKCnhKNggRBkmfTQJxBEwhuD/gRCyVHJRlyCIVJXgYmB8ZQBAoIKBXIQmCOIt/NxAUCOIImCIgIpCBAJuDAQZEE/huIAQWTDgImBTYQGC8gRFcYpKFCI8kDwQAFCJBfBEAX/+IjBiQRIEw4jJAQc8v//NYwCIOgJrIJpA1OcwbaFAQWQA="))
}

var iconCharging =   {
  text: "CHARGE",
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
Graphics.prototype.setFontAntonioSmall = function(scale) {
  // Actual height 18 (17 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAf4Mf/sYAMAAAAAAfgAfAAAAAfgAeAAAAAAiAAj8H/4fyEAv8f/gfiAAgAAAAD54H98eOPHn8Hz8AhwAAAP8Af+AYGAYCAf+AP8MAB8AHwA+AD4AfAAcf4A/8AwMAwMA/8Af4AAAAAwGD8f/8f8MY/cfz4PD8AHMAAAfAAeAAAAAAAAP/+f//YADAAAQABYADf//P/+AAAAAANAAPAAfwAfgAPAANAAAAAAEAAEAA/AA/AAEAAEAAAAAAZAAfAAYAAAAIAAIAAIAAIAAAAAAAAAMAAMAAAAAAAAEAB8Af4H+AfwAcAAAAAP/4f/8YAMf/8f/8H/wAAAAAAEAAMAAf/8f/8f/8AAAAAAAAAHgcfh8cH8YPMf8MPwEAAAAAAOB4eB8YYMY4Mf/8Pn4AAAAAgAHwA/wPwwf/8f/8AAwAAgAAAf54f58ZwMZwMY/8Qf4AAAAAAP/4f/8YYMYYMff8HP4AAAQAAYAAYD8Y/8f/AfgAcAAAAAAAAPv4f/8YYMY8Mf/8Pn4AAAAAAP94f98YGMcMMf/8H/wAAAAAABgwBgwAAAAAABgABg/Bg8AAAAEAAOAAbAA7gAxgBwwASAAbAAbAAbAAbAASAAAAAxwA5gAbAAPAAOAAAAPAAfHcYPcf8Af4AHgAAAAAAAB/gH/wOA4Y/MZ/sbAsbBkb/MZ/sOBsH/AAAAAAMAP8f/4fwwf4wH/8AH8AAMAAAf/8f/8YYMYYMf/8P/4ADgAAAP/4f/8YAMYAMfj8Pj4AAAAAAf/8f/8YAMYAMf/8P/4B/AAAAf/8f/8YMMYMMYIMAAAAAAf/8f/8YYAYYAYYAAAAAAAP/4f/8YAMYIMfP8Pv8AAAAAAf/8f/8AMAAMAf/8f/8f/8AAAAAAf/8f/8AAAAAAAD4AB8AAMf/8f/4f/gAAAAAAf/8f/8A+AD/gfj4eA8QAEAAAf/8f/8AAMAAMAAMAAAf/8f/8f8AB/wAB8AP8P/Af/8f/8AAAAAAf/8f/8HwAA+AAPwf/8f/8AAAAAAP/4f/8YAMYAMf/8P/4AAAAAAf/8f/8YGAYGAf8AP8ABAAAAAf/w//4wAYwAc//+f/yAAAAAAf/8f/8YMAYMAf/8f/8DA8CAAPj4fz8Y4MeeMfP8HD4YAAYAAf/8f/8YAAQAAAAAf/4f/8AAMAAMf/8f/4AAAYAAf4AP/4AP8AP8f/4fwAQAAYAAf8AP/8AD8D/8f8Af8AD/8AD8f/8f8AAAAQAEeB8P/4B/AP/4fA8QAEYAAfAAP4AB/8H/8fwAcAAAAMYD8Y/8f/MfwMcAMAAAf/+f//YADYADAAAAAAfAAf8AB/wAH8AAMQACYADf//f//AAAAA"), 32, atob("BAUHCAcTCAQFBQgGBAYFBggICAgICAgICAgEBQYGBggNCAgICAcHCAkECAgGCwkICAgIBwYICAwHBwYGBgY="), 18+(scale<<8)+(1<<16));
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
    g.drawString("BAT:", 30, y);
    g.drawString(bat+ "%", 68, y);

  } else if(key == "Steps"){
    var steps = getSteps();
    g.drawString("STEP:", 30, y);
    g.drawString(steps, 68, y);

  } else if(key == "Temp."){
    var temperature = Math.floor(E.getTemperature());
    g.drawString("TEMP:", 30, y);
    g.drawString(temperature + "C", 69, y);

  } else if(key == "HRM"){
    g.drawString("HRM:", 30, y);
    g.drawString(hrmValue, 69, y);

  } else {
    g.drawString("NOT FOUND", 30, y);
  }
}

function drawHoriztonatlBgLine(color, x1, x2, y, h){
  g.setColor(color);

  for(var i=0; i<h; i++){
    g.drawLine(x1, y+i, x2,y+i);
  }
}


Bangle.on('lock', function(isLocked) {
  if(Bangle.isLocked()){
    g.setColor(cPurple);
  } else {
    g.setColor(cBlue);
  }
  g.drawImage(logo, 120, 10);
});


function draw(){

  // First handle alarm to show this correctly afterwards
  handleAlarm();

  // Next draw the watch face
  g.reset();
  g.clearRect(0, 0, g.getWidth(), g.getHeight());

  // Draw background image
  g.drawImage(backgroundImage, 0, 0);
  drawHoriztonatlBgLine(cBlue, 35, 120, 0, 4);
  drawHoriztonatlBgLine(cBlue, 130, 176, 0, 4);
  drawHoriztonatlBgLine(cPurple, 35, 120, 81, 3);
  drawHoriztonatlBgLine(cPurple, 130, 176, 81, 3);
  drawHoriztonatlBgLine(cOrange, 35, 120, 87, 3);
  drawHoriztonatlBgLine(cOrange, 130, 176, 87, 3);
  drawHoriztonatlBgLine(cOrange, 35, 176, 173, 3);

  // Draw logo
  if(Bangle.isLocked()){
    g.setColor(cPurple);
  } else {
    g.setColor(cBlue);
  }
  g.drawImage(logo, 120, 10);


  // Write time
  g.setColor(cBlue);
  g.setFontAlign(-1,-1, 0);
  var currentDate = new Date();
  var timeStr = locale.time(currentDate,1);
  g.setFontAntonioLarge();
  g.drawString(timeStr, 25, 12);

  // Write date
  g.setColor(cPurple);
  g.setFontAntonioSmall();
  var dayStr = locale.dow(currentDate, true).toUpperCase();
  dayStr += " " + currentDate.getDate();
  dayStr += " " + currentDate.getFullYear();
  g.drawString(dayStr, 30, 60);
  g.setColor("#FFFFFF");

  // Draw data
  g.setColor(cOrange);
  printData(settings.dataRow1, 98);
  printData(settings.dataRow2, 121);
  printData(settings.dataRow3, 144);

  // Draw symbol
  g.setColor(cOrange);
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
  g.drawImage(iconImg, 115, 115);

  // Alarm within symbol
  g.setFontAlign(0,0,0);
  g.setFontAntonioSmall();
  g.drawString(iconImg.text, 115+25, 105);
  if(isAlarmEnabled() > 0){
    g.drawString(getAlarmMinutes(), 115+25, 115+25);
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
  return "???";
}

function stepsWidget() {
  if (WIDGETS.activepedom !== undefined) {
    return WIDGETS.activepedom;
  } else if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom;
  }
  return undefined;
}

/*
 * HRM Listener
 */
Bangle.on('HRM', function (hrm) {
  hrmValue = hrm.bpm;
});

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
 * Swipe to set an alarm
 */
Bangle.on('swipe',function(dir) {
  // Increase alarm
  if(dir == -1){
    if(isAlarmEnabled()){
      settings.alarm += 5;
    } else {
      settings.alarm = getCurrentTimeInMinutes() + 5;
    }
  }

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
});


/*
 * Stop updates when LCD is off, restart when on
 */
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

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