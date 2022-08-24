const TIMER_IDX = "lcars";
const SETTINGS_FILE = "lcars.setting.json";
const locale = require('locale');
const storage = require('Storage')
let settings = {
  alarm: -1,
  dataRow1: "Steps",
  dataRow2: "HRM",
  dataRow3: "Battery",
  speed: "kph",
  fullscreen: false,
  themeColor1BG: "#FF9900",
  themeColor2BG: "#FF00DC",
  themeColor3BG: "#0094FF",
  disableAlarms: false,
};
let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
for (const key in saved_settings) {
  settings[key] = saved_settings[key]
}

/*
 * Colors to use
 */
let color1 = settings.themeColor3BG;
let color2 = settings.themeColor1BG;
let color3 = settings.themeColor2BG;
let cWhite = "#FFFFFF";
let cBlack = "#000000";
let cGrey = "#424242";

/*
 * Global lcars variables
 */
let lcarsViewPos = 0;
// let hrmValue = 0;
var plotMonth = false;


function convert24to16(input)
{
  let RGB888 = parseInt(input.replace(/^#/, ''), 16);
  let r = (RGB888 & 0xFF0000) >> 16;
  let g = (RGB888 & 0xFF00) >> 8;
  let b = RGB888 & 0xFF;

  r = (r * 249 + 1014) >> 11;
  g = (g * 253 + 505) >> 10;
  b = (b * 249 + 1014) >> 11;
  let RGB565 = 0;
  RGB565 = RGB565 | (r << 11);
  RGB565 = RGB565 | (g << 5);
  RGB565 = RGB565 | b;

  return "0x"+RGB565.toString(16);
}

var color1C = convert24to16(color1);
var color2C = convert24to16(color2);
var color3C = convert24to16(color3);

/*
* Requirements and globals
*/

var colorPalette = new Uint16Array([
  0x0000, // not used
  color2C,  // second
  color3C, // third
  0x0000,  //  not used
  color1C, // first
  0x0000, //  not used
  0x0000, // not used
  0x0000, // not used
  0x0000, // not used
  0x0000, // not used
  0x0000, // not used
  0x0000, // not used
  0x0000, // not used
  0x0000, // not used
  0x0000, // not used
  0x0000  // not used
],0,1);

var bgLeftFullscreen =  {
  width : 27, height : 176, bpp : 3,
  transparent : 0,
  buffer : require("heatshrink").decompress((atob("/4AB+VJkmSAQV///+BAtJn//5IIFkmf/4IGyVP/gIGpMnF41PHIImGF4ImHJoQmGJoIdK8hNHNY47C/JNGBIJZGyYJBQA5GCKH5Q/KAQAoUP7y/KH5QGDoQAy0hGF34JB6RGFr4JB9JkFl4JB+gdFy4JB/QdFpYJB/odFkqrCS4xGCWoyDCKH5Q1GShlJChQLCCg5TCHw5TMAD35FAoIIkgJB8hGGv/8Mg8/+QIFp4cB5IRGBIIvI/4IFybyCF4wTCDp5NBHZZiGz4JBLJKAGk4JBO4xQ/KGQA8UP7y/KH5QnAHih/eX5Q/GQ4JCGRJlKCgxTDBAwgCCg5TCHwxTCNA4"))),
  palette: colorPalette
};

var bgLeftNotFullscreen = {
  width : 27, height : 152, bpp : 3,
  transparent : 0,
  buffer : require("heatshrink").decompress((atob("/4AB+VJkmSAQV///+BAtJn//5IIFkmf/4IGyVP/gIGpMnF41PHIImGF4ImHJoQmGJoIdK8hNHNY47C/JNGBIJZGyYJBQA5GCKH5Q/KAQAy0hGF34JB6RGFr4JB9JkFl4JB+gdFy4JB/QdFpYJB/odFkqrCS4xGCWoyhCKH5Q1GShlJChQLCCg5TCHw5TMAD35FAoIIkgJB8hGGv/8Mg8/+QIFp4cB5IRGBIIvI/4IFybyCF4wTCDp5NBHZZiGz4JBLJKAGk4JBO4xQ/KGQA8UP7y/KH5QnAHih/eX5Q/GQ4JCGRJlKCgxTDBAwgCCg5TCHwxTCNA4A=="))),
  palette: colorPalette
};

var bgRightFullscreen =  {
  width : 27, height : 176, bpp : 3,
  transparent : 0,
  buffer : require("heatshrink").decompress((atob("yVJkgCCyf/AAPJBAYCBk4JB8gUFyVP//yBAoCB//5BAwUCAAIUHAAIgGChopGv5TIn5TIz4yLKYxxC/iGI/xxGKH5Q/agwAnUP7y/KH4yGeVYAJ0hGF34JB6RGFr4JB9JkFl4JB+gdFy4JB/QdFpYJB/odFkp4CS4xGCWoyhCKH5QuDoxQCDpI7GDoJZGHYIRGLIQvGO4QvGMQRNJADv+GIqTC/5PGz4JBJ41JBIPJCg2TD4QLGn4JB/gUaHwRTGHwRTHBIRTGNAQyJ8gyI+QdFp4JB/IdFk5lLKH5QvAHih/eX5Q/KE4A8UP7y/KH5QGDpg7HJoxZCCIx3CJowmCF4yACJoyJC/4A=="))),
  palette: colorPalette
};

var bgRightNotFullscreen =  {
  width : 27, height : 152, bpp : 3,
  transparent : 0,
  buffer : require("heatshrink").decompress((atob("yVJkgCCyf/AAPJBAYCBk4JB8gUFyVP//yBAoCB//5BAwUCAAIUHAAIgGChopGv5TIn5TIz4yLKYxxC/iGI/xxGKH5Q/agwAx0hGF34JB6RGFr4JB9JkFl4JB+gdFy4JB/QdFpYJB/odFkqrCS4xGCWoyhCKH5QuDoxQCDpI7GDoJZGHYIRGLIQvGO4QvGMQRNJADv+GIqTC/5PGz4JBJ41JBIPJCg2TD4QLGn4JB/gUaHwRTGHwRTHBIRTGNAQyJ8gyI+QdFp4JB/IdFk5lLKH5QvAHih/eX5Q/KE4A8UP7y/KH5QGDpg7HJoxZCCIx3CJowmCF4yACJoyJC/4A="))),
  palette: colorPalette
};

var bgLeft = settings.fullscreen ? bgLeftFullscreen : bgLeftNotFullscreen;
var bgRight= settings.fullscreen ? bgRightFullscreen : bgRightNotFullscreen;

var iconEarth = {
  width : 50, height : 50, bpp : 3,
  buffer : require("heatshrink").decompress(atob("AFtx48ECBsDwU5k/yhARLjgjBjlzAQMQEZcIkOP/fn31IEZgCBnlz58cEpM4geugEgwU/8+WNZJHDuHHvgmBCQ8goEOnVgJoMnyV58mACItHI4X8uAFBuVHnnz4BuGxk4////Egz3IkmWvPgNw8f/prB//BghTC+AjE7848eMjNnzySBwUJkmf/BuGuPDAQIjBiPHhhTCSQnjMo0ITANJn44Dg8MuFBggCCiFBcAJ0Bv5xEh+ITo2OhHkyf/OIQdBWwVHhgjBNwUE+fP/5EEgePMoYLBhMgyVJk/+BQQdC688I4XxOIc8v//NAvr+QEBj/5NwKVBy1/QYUciPBhk1EAJrC+KeC489QYaMBgU/8BNB9+ChEjz1Jkn/QYMBDQIgCcYTCCiP/nlzJQmenMAgV4//uy/9wRaB/1J8iVCcAfHjt9TYYICnhKCgRKBw159/v//r927OIeeoASBDQccvv3791KYVDBYPLJQeCnPnz//AAP6ocEjEkXgMgJQtz79fLAP8KYkccAcJ8Gf/f/xu/cAMQ4eP5MlyQRCMolx40YsOGBAPfnnzU4KVDpKMBvz8Dh0/8me7IICgkxJQXPIgZTD58sEgcJk+eNoONnFBhk4/5uB/pcDg5KD+4mEv4CBXISVDhEn31/8/+mH7x//JQK5CAAMB4JBCnnxJQf/+fJEgkAa4L+CAQOOjMn/1bXIRxDJQXx58f//Hhlz/88EgsChMgz/Zs/+nfkyV/8huDOI6SD498NwoACi1Z8+S/Plz17/+QCI7jC+ZxBmfPnojIAAMDcYWSp//2wRJEwq2GABECjMgNYwAmA="))
};

var iconSaturn = {
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("AH4A/AEkQuPHCJ0ChEAwARNjAjBjgjOhs06Q2OEYVx4ARMhEggUMkANIDoIgBoEEgEBNxJEC6ZrBAAMwNxAjDNYcHNxIjB7dtEwIHBwRoKj158+cuPEjlwCRAjC23bpu0wRNDAAsHEYWeEwaSJ6YjCAQUNSRQjEzxQBWZMNEYlsmg2JWAIjCz95SoJuJggjDtuw6dMG5JKCz998wFBJRVNEYW0yaVBJRNhJQN9+4pCzhKJmBKC4YpB/fINxIgCzFxSoQ3J4ENm3CAQPb98wbpEcAQMYWwKYBNxMDXgc2/fv3g2IEAOAgAjBjy5CEhEMfYICBgfPnjdLjj+CgMHiC3JknDhhoINw4jCAB0IJQIANR4QjPAH4A/AFA"))
};

var iconMoon = {
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("AH4AQjlx44CCCZsg8eOkHDwAQKEYgmPhEgEQM48AOIgMHEYoCB4ATI8UAmH/x04JoRuJsImHuBKLn37EwZuIgEQOI8cEpXj/yYBhE8+YNGgkYoJxITBUPnAaC///nC+FjBuIOJZEB8YeCh/8AoYACoMEEAnEjhQDPQJKJ/DCDAoi5DoLdHAoMQgLjFWYPOnngh02IwXzwDjEgPGEYS8BI4MBYoSVG4fP/nghkAgZrDkngJQqSG4gvBg4sBQgkImHihEAWwP8ZBMBEYl5/+cSoVAGQIUFh04weJn///0gj/OEw5KEz45BzhuCTYQAEgePB4IACAoJuBnAQEa4XHjxKB//xFgWHJQsCRgMDEonipwjENwUBDQNx8+evvn/hTDLw3igE+EgZxB8UOXIvEJQUfEYOfv53DEQkgga5BJQvzx84cAj+CDoNh8/eEYJKDuCSEcocnEon+/7xEgFBIIcfB4Mf/IICXI2DgDdBAAn758gCIq5Dv4zBvJuIOIfjEgvP/ARHgwdCB4P3AoTdFAAk4EYk8SQgAFTALaDSQwAGh08//vnDmBABYmEEZYAzA=="))
};

var iconMars = {
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("AH4ATjlwCJ+Dh0wwAQMg0cuPHjFhCZkDps0yVJkmQCBMEjFx42atOmzQmLhMkEYQCCCREQoOGEYmmzB0IEY4CBkARGoJKBEYQCEzgSGkGSpAjDyYCCphuGiFhJQgCD8ASFgRHGAQKbB6BuHJRGeOIsINxEk6dNmARDgMEjQjHAQPnVQojIyZKB6YSDNwK5FAQt54BuDXJIjBEwK5EgxKKXgq5BJRdgXIojJAQJKMcAM0EwM2JUApDoCVFExa7FkGCgAmIkAREEwUEjAmHCIgABhEggQmFpACBCIojBEwRQCzVhwkQU4YADgQmBwQCCI4IFBCAojFAQojGJQQjDAQgRGEZICBEo4gFyUIkilFJQUYEAZrBAQMYNw5KDSQSbCNwwABgOGEwgCBsPACQ5xGwdNnARJcAVh48evvnCJK8Chs+/fv33gCRcB48cuPHCBYA/ADAA=="))
};

var iconSatellite =  {
  width : 50, height : 50, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQC/ATGXhIRPyNl0gmPjlwCJ9ly1aCJ1c+fHJR1Hy1ZJR1I+fPnlx6QRLpe+/JKBr5KMuYjBJQMdCJce/fvJQW0CJUlEYQCBSpvvJQbXJjl0NwnzNxGQwEOnHhgF78+WqQyIrFx48cAQXz4ShJgAABh0+8cP//9LJEhg4jDuP3//0LhGQgYlBgeAn///5cIy8MuAmDCIP/9I4HkmCEYMOgHfCQWkCI0cuBuDgF/CIP+CI1Ny1IkeAgHANwIAB/QRFrj7BhkxEwQRC/4RFpbXDgSVBg4RCSorXDI4MJAQMfCIP8cwImDn37fwN58+kwHgLgSVFub7CI4NyBAJKDLgkuEYX78+evKtCLg0jEYRKC58JMoRcFkwjDJQTFDl65EkojEAQMdcwn/+gFC3YjEJQLXEpYRDWwQmEdI6SHAQO0CJUkx4jDF4gCIJQgRMXIjCEARIjCCJ2XEYPKCJqJBJQIROcAUpCJ0kybaDARtdCKAC2kAA="))
};

var iconCharging =   {
  width : 50, height : 50, bpp : 3,
  transparent : 5,
  buffer : require("heatshrink").decompress(atob("23btugAwUBtoICARG0h048eODQYCJ6P/AAUCCJfbo4SDxYRLtEcuPHjlwgoRJ7RnIloUHoYjDAQfAExEAwUIkACEkSAIEYwCBhZKH6EIJI0CJRFHEY0BJRWBSgf//0AJRYSE4BKLj4SE8BKLv4RD/hK/JS2AXY0gXwRKG4cMmACCJQMAg8csEFJQsBAwfasEAm379u0gFbcBfHzgFBz1xMQZKBjY/D0E2+BOChu26yVEEYdww+cgAFCg+cgIfB6RKF4HbgEIkGChEAthfCJQ0eEAIjBBAMxk6GCJQtgtyVBwRKBAQMbHAJKGXIIFCgACBhl54qVG2E+EAJKBJoWAm0WJQ6SCXgdxFgMLJQvYjeAEAUwFIUitEtJQ14NwUHgEwKYZKGwOwNYX7XgWCg3CJQ5rB4MevPnAoPDJRJrCgEG/ECAoNsJRUwoEesIIBiJKI3CVDti/CJRKVDiJHBSo0YsOGjED8AjBcAcIgdhcAXAPIUAcAYIBcA4dBAQUG8BrBgBuCgOwcBEeXIK2BBAIFBgRqBGoYAChq8CcYUE4FbUYOACQsHzgjDgwFBCIImBAQsDtwYD7cAloRI22B86YBw5QBgoRJ7dAgYEDCJaeBJoMcsARMAQNoJIIRE6A"))
};

var iconWarning = {
  width : 50, height : 50, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("kmSpIC/AWMyoQIFsmECJFJhMmA4QXByVICIwODAQ4RRFIQGD5JVLkIGDzJqMyAGDph8MiRKGyApEAoZKFyYIDQwMkSQNkQZABBhIIOOJRuEL5gRIAUKACVQMhmUSNYNDQYJTBBwYFByGTkOE5FJWYNMknCAQKYCiaSCpmGochDoSYBhMwTAZrChILBhmEzKPBF4ImBTAREBDoMmEwJVDoYjBycJFgWEJQRuLJQ1kmQCCjJlCBYbjCagaDBwyDBmBuBF4TjJAUQKINBChCDQxZBcZIIQF4NIgEAgKSDiQmEVQKMBoARBAAMCSQLLBVoxqKL4gaCChVCNwoRKOIo4CJIgABBoSMHpIRFgDdJOIJUBCAUJRgJuEAQb+DIIgRIAX4C/ASOQA"))
};

// Font to use:
// <link href="https://fonts.googleapis.com/css2?family=Antonio:wght@400;700&display=swap" rel="stylesheet">
Graphics.prototype.setFontAntonioMedium = function(scale) {
  // Actual height 20 (19 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAA//mP/5gAAAAAAAAAAAAA/gAMAAAAAA/gAPAAAEIIBP+H/8D+IYBP+H/8D+IABCAAwIAfnwP8+PHh448eP3+B4fAAAAAAAH/AD/4AwGAMBgD/4Af8GAAPgAPgAfgAfAAfAA+AAOP/AH/4BgGAYBgH/4A/8AAAAAAAAAQAA/B+f4/+GMPhjv/4/h8Dg/gAcYwAAPwADgAAAAAAAAB//8///sAAaAACAAAMAAb//+f//AAAAAAAbAAGwAA4AA/wADgABsAAbAAAAAAAgAAMAAPwAD8AAMAADAAAAAAAAAAHAAB/AAOAAAAAAAAMAADAAAwAAMAACAAAAAAAAAABgAAYAAAAAAAAA4AD+AP+A/4A/gAOAAAAAAAAAH//j//8wADMAAz//8f/+AAAAAAAMAADAABgAA//+P//gAAAAAAAAAAAAAfgfP4fzAfswfDP/gx/gMAAAHgPj4D8wMDMHAz//8f3+AAEAAAAADwAH8APzA/AwP//j//4AAwAAAD/Hw/x+MwBjOAYz/+Mf/AAAAAAAH//j//8wYDMGAz9/8fP+AAcDAAAwAAMAfjB/4z/wP+AD4AAwAAAAOB/f4///MHAzBwM///H9/gAAAAAAH/Pj/78wGDMBgz//8f/+AAAAAAADhwA4cAAAAAAAAAAAAAADh/A4fgAAAAOAAHwABsAA7gAccAGDAAAAANgADYAA2AANgADYAA2AAAAAAAABgwAccADuAAbAAHwAA4AAAAHwAD8c4/POMHAD/wAfwAAAAAAAAD/wD//B4B4Y/HMf8zMBMyATMwczP+M4BzHwcgf+AA+AAAAAAD4A/+P/8D+DA/4wH/+AB/4AAeAAAAAAA//+P//jBgYwYGP//j//4PH4AAAAAAAf/+P//zgAcwADP4fz+P4Ph8AAAAAAA//+P//jAAYwAGPADj//4P/4AAAAAAA//+P//jBgYwYGMGBgAAAAAAP//j//4wYAMGADBgAAAAAAAA//w///PAHzAQM4MHP7/x+/8AAAAAAD//4//+AGAABgAAYAP//j//4AAAAAAAAAA//+P//gAAAAAAAAAAAHwAB+AABgAAY//+P//AAAAAAAAAAD//4//+APgAf+Afj8PgPjAAYAAAAAAD//4//+AABgAAYAAGAAAAAAA//+P//j/gAD/wAB/gAP4B/4P/AD//4//+AAAAAAAAAAP//j//4P4AAfwAA/g//+P//gAAAAAAAAAA//g//+PAHjAAY4AOP//h//wAAAAAAD//4//+MDADAwA4cAP/AB/gAAAAAAAA//g//+PAHjAAc4APv//5//yAAAAAAD//4//+MGADBgA48AP//h+f4AAAAAAB+Pw/z+MOBjBwY/P+Hx/AAHgwAAMAAD//4//+MAADAAAAAAP//D//4AAOAABgAA4//+P//AAAAwAAP8AD//AA/+AAfgP/4//gPwAAAAA+AAP/4Af/4AD+A//j/wA/wAD/+AA/4B/+P/+D+AAAAAMADj8P4P/4A/4B//w+A+MABgAAA4AAPwAB/gAB/+A//j/gA+AAMAAAAAYwB+MH/jf+Y/8GPwBjAAAAAAP//7//+wABsAAYAAAAAAPAAD/gAH/gAD/gAD4AACAAADAAGwABv//7//+AAAA=="), 32, atob("BQUHCAgVCQQFBQkHBQcFBwgICAgICAgICAgFBQcHBwgPCQkJCQcHCQoFCQkHDQoJCQkJCAYJCQ0ICAcGBwY="), 20+(scale<<8)+(1<<16));
};

Graphics.prototype.setFontAntonioLarge = function(scale) {
  // Actual height 39 (39 - 1)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAAAAAPgAAAAAB8AAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAD8AAAAAH/gAAAAP/8AAAAf//gAAA///AAAB//+AAAD//8AAAH//4AAAP//wAAAB//gAAAAP/AAAAAB+AAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///AAAf////8AP/////4B//////Af/////8D8AAAAfgeAAAAA8DwAAAAHgeAAAAA8D//////gf/////8B//////AP/////wAf////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAHgAAAAAA8AAAAAAPgAAAAAB4AAAAAAf/////gP/////8B//////gP/////8B//////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAD/+AAP8A//wAP/gP/+AH/8D//wD//gfgAA//8DwAAf+HgeAAP/A8DwAH/gHgfgP/wA8D///4AHgP//+AA8A///AAHgB//AAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AA/gAD/AAH/gA/4AA/+AP/AAH/4D/4AA//gfgA4AB8DwAPAAHgeAB4AA8DwAPgAHgfAD+AB8D//////gP/////4B//5//+AD/+H//gAH/AH/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAP/AAAAAP/4AAAAP//AAAAP/x4AAAf/wPAAAf/gB4AAf/AAPAAP/AAB4AB//////gP/////8B//////gP/////8AAAAAPAAAAAAB4AAAAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//wD/AB///Af+AP//4D/4B///Af/gP//4B/8B4D4AAPgPAeAAA8B4DwAAHgPAfAAB8B4D////gPAf///4B4B////APAD///gAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB///AAAP////4AH/////wB//////Af/////8D8APAA/geADwAB8DwAeAAHgeADwAA8D4AeAAPgf/j+AH8B/8f///gP/h///4Af8H//+AAPgP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAPAAAAAAB4AAAABgPAAAA/8B4AAB//gPAAD//8B4AH///gPAH///8B4P//+AAPH//wAAB///gAAAP//AAAAB/+AAAAAP+AAAAAB+AAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4A/+AAf/w//+AP//v//4B//////Af/////8D4AfwAPgeAB8AA8DwAHAAHgeAB8AA8D4Af4APgf/////8B//////AP//v//4A//4//8AA/4A/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/+AAAAD//+D/gB///4f+AP///j/4D///8f/gfAAHgB8DwAA8AHgeAAHgA8DwAA8AHgfgAHgB8D//////gP/////4A/////+AD/////gAD////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAfgAAB+AD8AAAPwAfgAAB+AD8AAAPwAfgAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("DBATExMTExMTExMTCw=="), 45+(scale<<8)+(1<<16));
};


/*
 * Draw watch face
 */
var drawTimeout;
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

/**
 * This function plots a data row in LCARS style.
 * Note: It can be called async and therefore, the text alignment and
 * font is set each time the function is called.
 */
function printRow(text, value, y, c){
  g.setFontAntonioMedium();
  g.setFontAlign(-1,-1,0);

  // Print background
  g.setColor(c);
  g.setFontAlign(-1,-1,0);
  g.fillRect(80, y-2, 165 ,y+18);
  g.fillCircle(163, y+8, 10);
  g.setColor(cBlack);
  g.drawString(text, 135, y);

  // Plot text
  width = g.stringWidth(value);
  g.setColor(cBlack);
  g.fillRect(130-width-8, y-2, 130, y+18);
  g.setColor(c);
  g.setFontAlign(1,-1,0);
  g.drawString(value, 126, y);
}


function drawData(key, y, c){
  try{
    _drawData(key, y, c);
  } catch(ex){
    // Show last error - next try hopefully works.
  }
}


function _drawData(key, y, c){
  key = key.toUpperCase()
  var text = key;
  var value = "ERR";
  var should_print= true;

  if(key == "STEPS"){
    text = "STEP";
    value = getSteps();

  } else if(key == "BATTERY"){
    text = "BAT";
    value = E.getBattery() + "%";

  } else if (key == "VREF"){
    value = E.getAnalogVRef().toFixed(2) + "V";

  } else if(key == "HRM"){
    value = Math.round(Bangle.getHealthStatus("last").bpm);

  } else if (key == "TEMP"){
    var weather = getWeather();
    value = weather.temp;

  } else if (key == "HUMIDITY"){
    text = "HUM";
    var weather = getWeather();
    value = weather.hum;

  } else if (key == "WIND"){
    text = "WND";
    var weather = getWeather();
    value = weather.wind;

  } else if (key == "ALTITUDE"){
    should_print= false;
    text = "ALT";

    // Immediately print something - avoid that its empty
    printRow(text, "", y, c);
    Bangle.getPressure().then(function(data){
      if(data && data.altitude){
        value = Math.round(data.altitude);
        printRow(text, value, y, c);
      }
    })

  } else if(key == "CORET"){
    value = locale.temp(parseInt(E.getTemperature()));
  }

  // Print for all datapoints that are not async
  if(should_print){
    printRow(text, value, y, c);
  }
}

function drawHorizontalBgLine(color, x1, x2, y, h){
  g.setColor(color);

  for(var i=0; i<h; i++){
    g.drawLine(x1, y+i, x2,y+i);
  }
}


function drawInfo(){
  if(lcarsViewPos != 0 || !settings.fullscreen){
    return;
  }

  // Draw Infor is called from different sources so
  // we have to ensure that the alignment is always the same.
  g.setFontAlign(-1, -1, 0);
  g.setFontAntonioMedium();
  g.setColor(color2);
  g.clearRect(120, 10, g.getWidth(), 75);
  g.drawString("LCARS", 128, 13);

  if(NRF.getSecurityStatus().connected){
    g.drawString("CONN", 128, 33);
  } else {
    g.drawString("NOCON", 128, 33);
  }
  if(Bangle.isLocked()){
    g.setColor(color3);
    g.drawString("LOCK", 128, 53);
  }
}

function drawState(){
  if(lcarsViewPos != 0){
    return;
  }

  g.clearRect(20, 93, 75, 170);
  g.setFontAlign(0, 0, 0);
  g.setFontAntonioMedium();

  if(!isAlarmEnabled()){
    var bat = E.getBattery();
    var flash = storage.getFree() / process.env.STORAGE;
    var current = new Date();
    var hours = current.getHours();
    var iconMsg =
        Bangle.isCharging() ? { icon: iconCharging, text: "STATUS" } :
        bat < 30 ? { icon: iconWarning, text: "BAT" } :
        flash < 0.1 ? { icon: iconWarning, text: "DISK" } :
        Bangle.isGPSOn() ? { icon: iconSatellite, text: "STATUS" } :
        hours % 4 == 0 ? { icon: iconSaturn, text: "STATUS" } :
        hours % 4 == 1 ? { icon: iconMars, text: "STATUS" } :
        hours % 4 == 2 ? { icon: iconMoon, text: "STATUS" } :
        { icon: iconEarth, text: "STATUS" };
    g.drawImage(iconMsg.icon, 23, 118);
    g.setColor(cWhite);
    g.drawString(iconMsg.text, 23+26, 108);
  } else {
    // Alarm within symbol
    g.setColor(color2);
    g.drawString("ALARM", 23+26, 108);
    g.setColor(cWhite);
    g.setFontAntonioLarge();
    g.drawString(getAlarmMinutes(), 23+26, 108+35);
  }

  g.setFontAlign(-1, -1, 0);
}


function drawPosition0(){
  // Draw background image
  var offset = settings.fullscreen ? 0 : 24;
  g.drawImage(bgLeft, 0, offset);
  drawHorizontalBgLine(color1, 25, 120, offset, 4);
  drawHorizontalBgLine(color1, 130, 176, offset, 4);
  drawHorizontalBgLine(color3, 20, 70, 80, 4);
  drawHorizontalBgLine(color3, 80, 176, 80, 4);
  drawHorizontalBgLine(color2, 35, 110, 87, 4);
  drawHorizontalBgLine(color2, 120, 176, 87, 4);

  // The last line is a battery indicator too
  var bat = E.getBattery() / 100.0;
  var batStart = 19;
  var batWidth = 172 - batStart;
  var batX2 = parseInt(batWidth * bat + batStart);
  drawHorizontalBgLine(color2, batStart, batX2, 171, 5);
  drawHorizontalBgLine(cGrey, batX2, 172, 171, 5);
  for(var i=0; i+batStart<=172; i+=parseInt(batWidth/4)){
    drawHorizontalBgLine(cBlack, batStart+i, batStart+i+3, 168, 8)
  }

  // Draw Infos
  drawInfo();

  // Write time
  g.setFontAlign(-1, -1, 0);
  g.setColor(cWhite);
  var currentDate = new Date();
  var timeStr = locale.time(currentDate,1);
  g.setFontAntonioLarge();
  if(settings.fullscreen){
    g.drawString(timeStr, 27, 10);
  } else {
    g.drawString(timeStr, 27, 33);
  }

  // Write date
  g.setColor(cWhite);
  g.setFontAntonioMedium();
  if(settings.fullscreen){
    var dayStr = locale.dow(currentDate, true).toUpperCase();
    dayStr += " " + currentDate.getDate();
    dayStr += " " + locale.month(currentDate, 1).toUpperCase();
    g.drawString(dayStr, 30, 56);
  } else {
    var dayStr = locale.dow(currentDate, true).toUpperCase();
    var date = currentDate.getDate();
    g.drawString(dayStr, 128, 35);
    g.drawString(date, 128, 55);
  }

  // Draw data
  g.setFontAlign(-1, -1, 0);
  g.setColor(cWhite);
  drawData(settings.dataRow1, 97, color2);
  drawData(settings.dataRow2, 122, color3);
  drawData(settings.dataRow3, 147, color1);

  // Draw state
  drawState();
}

function drawPosition1(){
  // Draw background image
  var offset = settings.fullscreen ? 0 : 24;
  g.drawImage(bgRight, 149, offset);
  if(settings.fullscreen){
    drawHorizontalBgLine(color1, 0, 140, offset, 4);
  }
  drawHorizontalBgLine(color3, 0, 80, 80, 4);
  drawHorizontalBgLine(color3, 90, 150, 80, 4);
  drawHorizontalBgLine(color2, 0, 50, 87, 4);
  drawHorizontalBgLine(color2, 60, 140, 87, 4);
  drawHorizontalBgLine(color2, 0, 150, 171, 5);

  // Draw steps bars
  g.setColor(cWhite);
  let health;

  try {
    health = require("health");
  } catch(ex) {
    g.setFontAntonioMedium();
    g.drawString("MODULE HEALTH", 20, 110);
    g.drawString("REQUIRED.", 20, 130);
    g.drawString("MODULE HEALTH", 20, 20);
    g.drawString("REQUIRED.", 20, 40);
    return;
  }

  // Plot HRM graph
  if(plotMonth){
    var data = new Uint16Array(32);
    var cnt = new Uint8Array(32);
    health.readDailySummaries(new Date(), h=>{
      data[h.day]+=h.bpm;
      if (h.bpm) cnt[h.day]++;
    });
    require("graph").drawBar(g, data, {
      axes : true,
      minx: 1,
      gridx : 5,
      gridy : 100,
      width : 140,
      height : 50,
      x: 5,
      y: 25
    });

    // Plot step graph
    var data = new Uint16Array(32);
    health.readDailySummaries(new Date(), h=>data[h.day]+=h.steps/1000);
    var gridY = parseInt(Math.max.apply(Math, data)/2);
    gridY = gridY <= 0 ? 1 : gridY;
    require("graph").drawBar(g, data, {
      axes : true,
      minx: 1,
      gridx : 5,
      gridy : gridY,
      width : 140,
      height : 50,
      x: 5,
      y: 115
    });

    g.setFontAlign(1, 1, 0);
    g.setFontAntonioMedium();
    g.setColor(cWhite);

    if(settings.fullscreen){
      g.drawString("M-HRM", 154, 27);
      g.drawString("M-STEPS [K]", 154, 115);
    } else {
      g.drawString("MONTH", 154, 115);
    }

  // Plot day
  } else {
    var data = new Uint16Array(24);
    var cnt = new Uint8Array(24);
    health.readDay(new Date(), h=>{
      data[h.hr]+=h.bpm;
      if (h.bpm) cnt[h.hr]++;
    });
    require("graph").drawBar(g, data, {
      axes : true,
      minx: 1,
      gridx : 4,
      gridy : 100,
      width : 140,
      height : 50,
      x: 5,
      y: 25
    });

    // Plot step graph
    var data = new Uint16Array(24);
    health.readDay(new Date(), h=>data[h.hr]+=h.steps);
    var gridY = parseInt(Math.max.apply(Math, data)/1000)*1000;
    gridY = gridY <= 0 ? 1000 : gridY;
    require("graph").drawBar(g, data, {
      axes : true,
      minx: 1,
      gridx : 4,
      gridy : gridY,
      width : 140,
      height : 50,
      x: 5,
      y: 115
    });

    g.setFontAlign(1, 1, 0);
    g.setFontAntonioMedium();
    g.setColor(cWhite);

    if(settings.fullscreen){
      g.drawString("D-HRM", 154, 27);
      g.drawString("D-STEPS", 154, 115);
    } else {
      g.drawString("DAY", 154, 115);
    }
  }
}

function draw(){
    // Queue draw first to ensure that its called in one minute again.
    queueDraw();

    // Next draw the watch face
    g.reset();
    g.clearRect(0, 0, g.getWidth(), g.getHeight());

    // Draw current lcars position
    if(lcarsViewPos == 0){
      drawPosition0();
    } else if (lcarsViewPos == 1) {
      drawPosition1();
    }

    // After drawing the watch face, we can draw the widgets
    if(settings.fullscreen){
      for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
    } else {
      Bangle.drawWidgets();
    }
}


/*
 * Step counter via widget
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

  return steps;
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
    var speedFactor = settings.speed == "kph" ? 1.0 : 1.0 / 1.60934;
    weather.wind = Math.round(wind[1] * speedFactor);

    return weather

  } catch(ex) {
    // Return default
  }

  return {
    temp: " ? ",
    hum: " ? ",
    txt: " ? ",
    wind: " ? ",
    wdir: " ? ",
    wrose: " ? "
  };
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


/*
 * Listeners
 */
Bangle.on('lcdPower',on=>{
  if (on) {
    // Whenever we connect to Gadgetbridge, reading data from
    // health failed. Therefore, we update only partially...
    drawInfo();
    drawState();
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.on('lock', function(isLocked) {
  drawInfo();
});

Bangle.on('charging',function(charging) {
  drawState();
});

function feedback(){
  Bangle.buzz(40, 0.3);
}

// Touch gestures to control clock. We don't use swipe to be compatible with the bangle ecosystem
Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.2);
  var right = g.getWidth() - left;
  var upper = parseInt(g.getHeight() * 0.2);
  var lower = g.getHeight() - upper;

  var is_left = e.x < left;
  var is_right = e.x > right;
  var is_upper = e.y < upper;
  var is_lower = e.y > lower;

  if(is_left && lcarsViewPos == 1){
    feedback();
    lcarsViewPos = 0;
    draw();
    return;

  } else if(is_right  && lcarsViewPos == 0){
    feedback();
    lcarsViewPos = 1;
    draw();
    return;
  }

  if(lcarsViewPos == 0){
    if(is_upper && !settings.disableAlarms){
      feedback();
      increaseAlarm();
      drawState();
      return;
    } if(is_lower && !settings.disableAlarms){
      feedback();
      decreaseAlarm();
      drawState();
      return;
    }
  } else if (lcarsViewPos == 1 && (is_upper || is_lower) && plotMonth != is_lower){
    feedback();
    plotMonth = is_lower;
    draw();
    return;
  }
});


/*
 * Lets start widgets, listen for btn etc.
 */
// Show launcher when middle button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();

// Clear the screen once, at startup and draw clock
g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear();
draw();
