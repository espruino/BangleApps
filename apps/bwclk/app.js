{ // must be inside our own scope here so that when we are unloaded everything disappears

/************************************************
 * Includes
 */
const locale = require('locale');
const storage = require('Storage');
const clock_info = require("clock_info");
const widget_utils = require("widget_utils");

/************************************************
 * Globals
 */
const SETTINGS_FILE = "bwclk.setting.json";
const W = g.getWidth();
const H = g.getHeight();

/************************************************
 * Settings
 */
let settings = {
  screen: "Normal",
  showLock: true,
  hideColon: false,
  menuPosX: 0,
  menuPosY: 0,
};

let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
for (const key in saved_settings) {
  settings[key] = saved_settings[key];
}

let isFullscreen = function() {
  var s = settings.screen.toLowerCase();
  if(s == "dynamic"){
    return Bangle.isLocked();
  } else {
    return s == "full";
  }
};

let getLineY = function(){
  return H/5*2 + (isFullscreen() ? 0 : 8);
}

/************************************************
 * Assets
 */
// Manrope font
Graphics.prototype.setLargeFont = function(scale) {
  // Actual height 47 (48 - 2)
  this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAB8AAAAAAAAA/gAAAAAAAAP4AAAAAAAAH/AAAAAAAAB/wAAAAAAAAf8AAAAAAAAH/AAAAAAAAB/wAAAAAAAAf8AAAAAAAAH+AAAAAAAAA/gAAAAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAB8AAAAAAAAA/AAAAAAAAAfwAAAAAAAAP4AAAAAAAAH+AAAAAAAAD/AAAAAAAAB/gAAAAAAAA/wAAAAAAAAf4AAAAAAAAP8AAAAAAAAH+AAAAAAAAD/AAAAAAAAD/gAAAAAAAB/wAAAAAAAA/4AAAAAAAAf8AAAAAAAAP8AAAAAAAAH+AAAAAAAAD/AAAAAAAAB/gAAAAAAAA/wAAAAAAAAf4AAAAAAAAP8AAAAAAAAH+AAAAAAAAD/AAAAAAAAB/gAAAAAAAA/wAAAAAAAAfwAAAAAAAAP4AAAAAAAAH8AAAAAAAAD+AAAAAAAAB/AAAAAAAAAfgAAAAAAAAHwAAAAAAAAA4AAAAAAAAAAAAOAAAAAAAAH//gAAAAAAP///AAAAAAP///8AAAAAP////wAAAAH////+AAAAD/////wAAAB/////+AAAA//4D//wAAAf/gAD/8AAAH/gAAP/AAAD/wAAB/4AAA/4AAAP+AAAP8AAAB/gAAD/AAAAf4AAA/gAAAP+AAAP4AAAD/gAAD/AAAB/wAAA/wAAA/8AAAP+AAAf/AAAD/wAAf/gAAAf/gA//wAAAH/////8AAAA/////+AAAAH/////AAAAA/////AAAAAH////gAAAAAf///AAAAAAA//+AAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAADwAAAAAAAAB+AAAAAAAAAfAAAAAAAAAPwAAAAAAAAD8AAB/+AAAB/A////wAAAf/////+AAAP//////gAAD//////4AAA//////+AAAP//////gAAB//////wAAAf/////wAAAB////4AAAAAB/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAD8AAAAD+AAB/gAAAB/wAA/8AAAA/4AAf/AAAAf+AAH/wAAAH/AAD/8AAAD/gAB//gAAA/gAA//4AAAf4AAf/+AAAH8AAP//gAAB/AAH//4AAAfgAB/n+AAAP4AA/x/gAAD+AAf4P4AAA/gAP+H+AAAP4AH/B/gAAD+AD/gf4AAAfwD/wH+AAAH+B/4B/AAAB///8AfwAAAf//+AH8AAAH///AB/AAAA///gAfwAAAP//wAP8AAAB//4AD+AAAAP/8AAfgAAAB/8AAHwAAAAD4AAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAOAAAAPAAAAHwAAAH4AAAD8AAAB/AAAA/AAAAfwAAAfwAAAH+AAAH8AAAA/gAAB+AAAAP4AAAfgAAAD+AAAH4AAAAfwAAD+AAAAH8AAA/gAIAB/AAAP4APgAfwAAD+AH4AH8AAA/gB/AB/AAAP4A/wAPwAAD+AP+AH8AAA/gD/gB/AAAP4B/4AfwAAD+Af+AH8AAAfwP/wB/AAAH+H/8A/wAAB//+fgf4AAAf//H8P+AAAD//w///gAAA//4P//wAAAH/+D//8AAAB//Af/+AAAAP/gH//gAAAA/gA//wAAAABAAH/4AAAAAAAA/4AAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAH/+AAAAAAAP//wAAAAAAf//8AAAAAA////gAAAAAf///4AAAAAP///+AAAAAD////gAAAAA//gP4AAAAAP8AB+AAAAAAwAAfgAAAAAAAAH4AAAAAAAAB/AAAAAAAAAfwAAAAAAAAH8AAAAAAAAB/AAAAAAAAAf//AAAAH/////wAAAP/////+AAAH//////gAAB//////4AAAf/////8AAAH/////+AAAA/////wAAAAAAAB+AAAAAAAAAfgAAAAAAAAH4AAAAAAAAB+AAAAAAAAAfgAAAAAAAADwAAAAAAAAA8AAAAAAABgAAcAAAAAP/AAPgAAAAf/4AH4AAAAf//AB+AAAAf//wAfwAAAH//8AH8AAAD///AB/AAAA///wAfwAAAP/z8AH8AAAH+AfAB/AAAB/AHwAfwAAAfgB8AH8AAAH4A/AB/AAAB+APwAfwAAAfgD8AH4AAAH4A/AD+AAAB+APwA/gAAAfgD8AP4AAAH4A/AH+AAAB+AP4D/AAAAfgD/B/wAAAH4Af//8AAAB+AH//+AAAAfgB///gAAAH4AP//wAAAA+AD//4AAAAPgAf/8AAAABwAD/+AAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf4AAAAAAAD//4AAAAAAH///wAAAAAP///+AAAAAP////4AAAAH////+AAAAD/////wAAAB/////+AAAA//////gAAAf/4/Af4AAAH/wfAD/AAAB/wPwAfwAAAfwD4AD8AAAH4A+AA/AAAAYAfgAHwAAAAAH4AB8AAAAAB+AA/AAAAAAfgAPwAAAAAH4AD8AAAAAB+AB/AAAAAAfwAfwAAAAAH+AP4AAAAAB/wP+AAAAAAP///AAAAAAD///wAAAAAA///4AAAAAAH//8AAAAAAA//+AAAAAAAH//AAAAAAAAf/AAAAAAAAB+AAAAAAAAAAAAAAAAYAAAAAAAAAPAAAAAAAAAHwAAAAAAAAB8AAAAAAAAAfAAAAAAAAAPwAAAAAAAAD8AAAD/gAAA/AAAH/8AAAPwAAP//AAAD8AAP//wAAA/AAH//8AAAPwAH///AAAH8AD///wAAB+AD///wAAAfgB//+AAAAH4A//4AAAAB+Af/wAAAAAfgP/wAAAAAH8H/wAAAAAB/H/4AAAAAAf//4AAAAAAH//8AAAAAAA//+AAAAAAAP//AAAAAAAD//AAAAAAAA//gAAAAAAAH/wAAAAAAAA/wAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAA/AAAAAADgA/8AAAAAH+A//wAAAAD/4f/+AAAAB//P//gAAAA//z//8AAAAf/////AAAAH/////4AAAD////f+AAAA/x/+A/gAAAPwH/AH8AAAH4B/gB/AAAB+AP4APwAAAfAD8AD8AAAHwAfAA/AAAB8AHwAPwAAAfAB8AD8AAAHwAfAA/AAAB8AHwAPwAAAfAB8AD8AAAHwAfAA/AAAB8APwAPwAAAfgD8AD8AAAH4B/gB/AAAB/Af8A/gAAAP4P/gf4AAAD/////+AAAAf/////gAAAH/////wAAAA//7//8AAAAP/8f/+AAAAB//D//AAAAAP/A//gAAAAA/gD/wAAAAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAAB/8AAAAAAAB//wAAAAAAA//+AAAAAAAf//wAAAAAAP//8AAAAAAD///gA4AAAB///4AfAAAAf4H+AHwAAAP4A/wD8AAAD8AH8A/AAAA/AA/AfwAAAPgAPwH8AAAD4AD8D/AAAA+AA/B/gAAAPgAPwf4AAAD4AD4P8AAAA+AA+H+AAAAPgAPj/gAAAD8AHx/wAAAA/AD9/4AAAAP4B//8AAAAB/x///AAAAAf////gAAAAD////wAAAAA////4AAAAAH///4AAAAAA///8AAAAAAH//8AAAAAAAf/4AAAAAAAAfgAAAAAAAAAAAAAAAAAAAAAAwAAAAAAOAA/AAAAAAHwAfwAAAAAD+AH+AAAAAA/gB/gAAAAAP4Af4AAAAAD+AH+AAAAAA/gB/gAAAAAPwAPwAAAAAB8AB4AAAAAAeAAAAAAAAAAAAAAAA'),
    46,
    atob("DyQfEyAiIB8hHSUhDA=="),
    62+(scale<<8)+(1<<16)
  );
  
  return this;
};


Graphics.prototype.setMediumFont = function(scale) {
  // Actual height 41 (42 - 2)
  this.setFontCustom(
    atob('AAAAAAAAAAAAAADwAAAAAAAH4AAAAAAAP8AAAAAAAP8AAAAAAAP8AAAAAAAP8AAAAAAAP8AAAAAAAP8AAAAAAAP4AAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAHwAAAAAAAPwAAAAAAAfwAAAAAAA/gAAAAAAB/AAAAAAAD/AAAAAAAH+AAAAAAAP8AAAAAAAf4AAAAAAA/wAAAAAAB/AAAAAAAD+AAAAAAAH8AAAAAAAP4AAAAAAAfwAAAAAAA/gAAAAAAB/AAAAAAAD+AAAAAAAP8AAAAAAAf4AAAAAAA/wAAAAAAB/gAAAAAAD+AAAAAAAH8AAAAAAAP4AAAAAAAfwAAAAAAAfgAAAAAAA/AAAAAAAA+AAAAAAAA8AAAAAAAAAAAAAAAAAAAP4AAAAAAH//wAAAAAf//8AAAAB////AAAAH////gAAAP////wAAAf////4AAAf/wP/8AAA/8AA/8AAA/wAAP8AAB/gAAH+AAB/AAAH+AAB/AAAH+AAB/AAAH+AAB/AAAH8AAB/AAAP8AAB/AAAf8AAB/wAB/4AAA/8AH/4AAA/////wAAAf////gAAAP////AAAAH///+AAAAD///4AAAAA///AAAAAAD/wAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAPgAAAAAAAPAAAAAAAAfAAAAAAAA/AAA/4AAA/D///8AAA/////+AAB/////+AAB/////+AAB/////+AAB/////8AAA/////4AAAf///4AAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAABgAAAB8AAH4AAAD+AAP4AAAH+AAf8AAAP8AA/8AAAf4AB/8AAAfwAD/8AAA/gAH/+AAA/AAH/+AAA/AAP/+AAA/AAf7+AAB+AA/z+AAB+AB/j+AAB+AD/D+AAB+AH+D8AAB/AP8D8AAA/A/4D8AAA///wD8AAA///gD8AAA///AH8AAAf/+AH8AAAf/8AH4AAAP/4AH4AAAH/wADwAAAB/AADwAAAAAAAAAAAAAAAAAAAAAAAAABwAAAOAAAD4AAAfAAAD4AAAfAAAD8AAA/AAAD8AAA/AAAD+AAA/AAAB+AAA+AAAB+AAB+AAAB+AAB+AAAB/AAB+AHAA/AAB+APgA/AAB+APwA/AAB+AfwA/AAB+Af4A/AAB+Af4A/AAB+A/4A/AAB/A/4B+AAA/B/8B+AAA//58D+AAA//4/H+AAA//w//+AAAf/w//8AAAP/gf/8AAAP/Af/4AAAD+AP/wAAAA4AH/gAAAAAAD/AAAAAAAAYAAAAAAAAAAAAAAAf4AAAAAAH/+AAAAAA///AAAAAH///AAAAAP///AAAAAf///AAAAAf///gAAAAf+AfgAAAAfgAfgAAAAAAAfgAAAAAAAfgAAAAAAAfgAAAAAAAfgAAAAAAAfgAAAAAAH//8AAAP////8AAA/////+AAA/////+AAA/////8AAA/////8AAAf///8AAAAAAAfgAAAAAAAfAAAAAAAAfAAAAAAAAfAAAAAAAAPAAAAAAAAOAAAAAAB4ABwAAAAf+AD4AAAD//AD4AAAP//AD8AAAf//gD8AAAf//gD8AAAf//gD8AAA/+fgD8AAA/gPAD8AAA/APAD8AAA+AfAD8AAA+AfAD8AAA+AfAH4AAA+AfAH4AAA+AfAH4AAA+AfAP4AAA+AfgP4AAA+Afw/wAAA+Af//wAAA+AP//gAAA+AP//gAAA+AP//AAAAeAH/+AAAAeAD/8AAAAAAB/4AAAAAAAPAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAAAD//4AAAAAf//+AAAAB////gAAAH////wAAAP////wAAAf////4AAA/////4AAA/+PgP8AAA/4fAD8AAA/gfAD8AAA+AeAB8AAAYA+AB8AAAAA+AB8AAAAA+AB8AAAAA+AB8AAAAA+AD8AAAAA/AD8AAAAA/gP4AAAAA/4/4AAAAAf//4AAAAAf//wAAAAAP//gAAAAAP//AAAAAAH/+AAAAAAB/4AAAAAAAfAAAAAAAAAAAAAAcAAAAAAAAcAAAAAAAA+AAAAAAAA+AAAAAAAB+AAAAAAAB8AAAP4AAB8AAD/8AAB8AAP/8AAB8AA//8AAB8AD//8AAB8AH//8AAD8Af//4AAD8A//+AAAD8B//AAAAD8D/8AAAAD8H/wAAAAD8P/AAAAAD+/+AAAAAB//4AAAAAB//wAAAAAB//gAAAAAB//AAAAAAA/8AAAAAAA/4AAAAAAAfgAAAAAAAAAAAAAAAAAAAH8AAAAA+Af/AAAAB/g//gAAAD/x//gAAAH/7//wAAAP/7//wAAAf////4AAAf//8f4AAAfh/wH4AAA/A/gD8AAA+AfgD8AAA+AfgD8AAA8AfAB8AAA8APAB8AAA8APAB8AAA8APAB8AAA8APAB8AAA8APAB8AAA+AfAB8AAA+AfgD8AAA+A/gD8AAA/A/wH4AAAf//8f4AAAf////4AAAP////wAAAP/9//wAAAH/5//gAAAD/w//AAAAB/gf+AAAAAeAH8AAAAAAAAAAAAAAAAAAAAAAAP4AAAAAAA/+AAAAAAB//gAAAAAD//gAAAAAH//wAAAAAP//4A4AAAP//4B8AAAfwP4B8AAAfgH4B8AAAfAD8D8AAAeAD8H8AAA+AB8H8AAA+AB8P4AAA+AB4P4AAA+AD4fwAAA+AD4/gAAAfADx/gAAAfAH3/AAAAfgP/+AAAAf///8AAAAP///4AAAAP///wAAAAH///gAAAAD///AAAAAB//8AAAAAAf/wAAAAAAD4AAAAAAAAAAAAAAAAAAAOAAAAABwAfAAAAAD4A/gAAAAH4A/gAAAAH8A/gAAAAH8A/gAAAAH4A/gAAAAH4AfgAAAADwAPAAAAABgAAAAAAAAAAAAAA='),
    46,
    atob("DSAbERwdHBsdGSAdCw=="),
    54+(scale<<8)+(1<<16)
  );
  return this;
};


Graphics.prototype.setSmallFont = function(scale) {
  // Actual height 28 (27 - 0)
  this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/w4A//zgD//uAP/84Af+DAAAAAAP4AAA/gAAD+AAADAAAA/AAAD+AAAPwAAABgwAAGDgAAYOAABw4AAHPkAB//4Af//gD//+AP//AAfg4AAODgAA4OAADg4AAODgAA4f4AP//gB//+AP//wAf/4AAGDgAAYOAABg4AAGDAAAYAAABwYAAPhwAA/HAAH8cAAfxwAH3j4A/OPgD85+ABzngAHH8AAcfwABx/AADD4AAAPAAAAAAAHgAAA/AAAH+BgAc4PABhh4AGOPgAY58AB/PgAH98AAPvgAAB74AAPfwAB5/AAPOOAB444APDjgB4OOAHA/wAYB/AAAD4AAAAAAAA8AAAP8AAA/4AAH/gB4+fAP7w8A/+BwD/wHAcPAcBw+DwHH8PAP/54A/n/gB+H8ADg/gAAH+AAAf8AABz4AAAHgAAAEAHAAAA/AAAD8AAAPwAAAAAAAAB/wAA//4AH//4A///wH///g/AB/DwAB8eAADwwAACDAAA8OAAHw8AA/D8AP4H///AP//4Af/+AAf/gAMYAAAzgAADuAAAPwAAAeAAAP/gAB/+AAD/4AAB4AAAPwAAA7gAADOAAAMYAAAAAAAADgAAAOAAAA4AAADgAAAOAAAA4AAB//AAH/8AAf/wAA/8AAAOAAAA4AAADgAAAOAAAA4AAAAAwAAAHAAAA/wAAB/AAAH4AAAOAAAAAAAOAAAA4AAADgAAAOAAAA4AAAHgAAAeAAAB4AAAHgAAAeAAAB4AAADgAAAOAAAA4AAADgAAAOAAAAAcAAADwAAAPgAAA+AAADwAAAHAAAAAAAABwAAAPAAAB4AAAPAAAB4AAAPAAAB4AAAPAAAB4AAAPAAAD4AAAfAAAD4AAAfAAAB4AAAHAAAAA/wAAf/wAD//wAf//AB+B+APgD4A8AHgDwAeAPgH4A/h/AB//4AD//AAH/4AAD8AADAAAAMAAABwB8AH//4A///gD//+AH//4AP/gAAAAAAAQAgAHgPAA+B+AHwP4AeA/gBwH+APA94A8H3gDw+eAH/x4Af+HgB/wcAD+BwAHgGAAwAcAHAB4AcAHgBwAOAPAA4A8ODwDw4PAPHw8A8fDwD78OAH+/4Afz/gA/P8AB4fwAAA+AAA8AAA/4AAP/wAB//AAH88AAIBwAAAHAAAAfwAf//gB//+AH//4AP/4AAAHAAAAYAAABgAAPwcAD/BwAf+HgB/4eAHjh4AcMHgBwwcAHHBwAcePABw/8AHD/gAcP+ABgfwAAAcAAAPwAAH/wAB//gAf//AB//8AHzh4AccDgABwOAAHA4AAcHgAB/8AAH/wAAP+AAAfwAAAcAAYAAABgAAAOADwA4B/gDgf+AOD/4A4f/ADj+AAO/gAA/4AAD/AAAP4AAAfAAAAADgAB8/gAP//AA//8AH//wAceHgBw4eAODg4A4MDgDg4OAHHh4AcfHAB//8AD//wAP7+AAfPwAAAEAAB4AAAf4AAD/gAAP/DgB88OAHBx4AcHHABwc8AHB3gAcP+AB//wAD/+AAP/wAAf8AAAOAAAAwOAADh4AAeHgAB4eAADg4AAAAAAAAAAADgYAAeD+AB4P4ADgfAAEAgAAAAAAB8AAAPwAAA/gAAH/AAA+8AAHh4AAeHgADwOAAOA4AAwBgAAYYAABxwAAHHAAAccAABxwAAHHAAAccAABxwAAHHAAAccAABxwAAHGAAAYIAAMAAAA4BgADgGAAOA4AAcHgAB48AADnwAAP+AAAfwAAA+AAABgAABAAAAOAAAB4AAAHAAQA4DzgDgfOAOD84A4PzADh4AAOPAAA/4AAB/gAAH8AAAPgAAAB/AAAf/AAD/+AAf/4AD4HwAfAHAB4YeAHH44A4fjgDj/GAOMcYAxxxgDGHGAMYcYAxxzgDH+OAOP44A4/HADh/cAPB8AAeA4AB8DgAD8eAAH/wAAP/AAAf4AAAAPAAAH8AAD/4AA//gAP/8AB//AAP/gAB/OAAHw4AAeDgABwOAAHA4AAfDgAB/OAAD/8AAH/+AAP/+AAP/4AAH/gAAD+AAAAAAAAAAAP/8AD//wAP//gB//+AHjx4AcODgBw4OAHDg4AcODgBw4OAHvx4AP/PAA//8AB8/wADj+AAAHwAAAAAAAPgAAH/wAA//gAH//AA//8AD//4APgPgB4AeAHgB4AcAHgBwAeAHgB4AeAHgA4A8ADgDwAGAOAAAAAAAH4AAP/+AB//8AH//4Af//gB8D+AHgB4AeAPgB4A8AHgDwAfAPAA8B8AD4PgAH/+AAP/wAA/+AAB/wAAB+AAABAAAAfAAAf/wAD//wAf//AB//+AH/j4A8OHgDg4OAODg4A4ODgDg4OAODg4A4MHgBgAcAGAAwAAAAAABgAAB//AAP//AB//+AH//4A///AD4cAAPBwAA4HAADgYAAOBgAA4GAADgYAAGAAAAYAAAAB+AAAf+AAH/+AA//4AD//wAfw/gB8A+AHgB4A8ADgDwwOAPDg4A8ODgDw4OAPDh4AcPPgBw/+ADD/wAAH/AAAf4AAAeAAAfgAA//8AH//wA///gB//8AD//AAAeAAAB4AAAHgAAAeAAAB4AAAHgAAAeAAA//8AP//4A///gD//8AH//gAAAAAAAAAAD//wAf//AB//+AH//wAP/+AAAAAAAAfAAAD/AAAP8AAAf4AAAPgAAAeAAAB4AAAHgAAA+AH4f4Af//gD//8AP//gAf/8AA//AAAAAAAADwAAf/8AH//4A///gD//8AP//gAffgAAB/AAAP+AAB78AAPn4AB8PgAHwfAA+B8ADwD4AeAHAA4AAAAAcAAH/+AB//8AH//4Af//gB//+AAAD4AAAPgAAAeAAAB4AAAHgAAAeAAABwAAAHAAAAcAAA8AAD//AA//+AD//4Af//gB//4AHwAAAf4AAA//AAB/+AAAf8AAAfwAA//AAP/4AB/wAAH4AAAfwAAB//8AH//4AP//gAf/8AAH/AAB4AAA//8AD//4Af//gB//+AD//wAH4AAAPwAAAfwAAAfgAAA/AAAB/AAAB+AAAD8AB//wAP//gB//+AH//wAP/+AAAAAAAD4AAA/8AAP/4AB//wAH//AA//+AD4H4AfAPwB4AfAHgB8AeAHwBwAfAHgB8AeAHwB4AeADwD4APw/AA//8AB//gAD/8AAH/gAAH4AAA4AAAf/4AD//wAf//gB//+AH//wAcHAABwcAAHBwAAcHAABwcAAHjwAAP/AAA/4AAB/gAAH8AAAHgAAADwAAB/4AAP/wAB//gAP//AA/H8AHwHwAeAPgB4A+AHgD4AcAPgBwA+AHgDwAeAPAB8B8AD8f4AP//wAf//gA//+AB/z4AA4HgAAAAAB/+AAf/8AD//4Af//gB//+APDwAA4PgADg/AAOD/AA4N+ADxz4AH/HwAf4PgA/geAB8AwABAAAAOAYAD8BwAf4HAB/geAH/B4A/8HgDz4eAPHh4A4PHgDg++APB/4A8H/gBwP8AHA/wAMB+AAABgABAAAAOAAAA4AAAHgAAAeAAAB4AAAH//wAf//gB//+AH//4Af//AB/wAAHgAAAeAAAB4AAAHgAAAOAAAAwAAAB/wAAf/4AB//wAH//gAP//AAAH8AAAH4AAAPgAAAeAAAD4AAAPgAAB8AAD/wAP/+AB//4AH/+AAP/gAAPgAADwAAAf4AAB/4AAH/4AAP/4AAP/4AAH/wAAD/AAAB+AAAH4AAB/AAAf4AAH/AAB/4AA//AAD/wAAf8AAB/AAADwAAAP+AAB//gAH//gAf//AB//8AAB/4AAAfAAAP8AAf/gAP/8AB/+AAP8AAA/4AAB//AAD//gAB//AAAH8AAAHwAAP/AA//8AH//gAf/8AB//AAD+AAAMAHAB4A+AHwH4Afg/AA/H8AB8/gAD/4AAH/AAAP4AAAfAAAH+AAA/+AAH78AA/H4AH4fwAfA/gB4A+ACABwAfAAAB/AAAH+AAAf8AAAf4AAAfwAAAf/AAA/+AAD/4AAP/AAB/wAAfwAAD+AAA/wAAH+AAAfwAAA8AAACADwAcAfABwD+AHAf4AcD/gBwf+AHD94AcfngBz8eAHfh4Af4HgB/AcAH4BwAfAHAA4AIAD///Af//+D///8P///w4AAHDgAAcMAABwwAACBwAAAHwAAAfgAAA/AAAA/AAAB+AAAD+AAAD8AAAH4AAAP4AAAPwAAAfAAAAcAAAAAAwAACDAAAcOAABw4AAHD+Af8P///wf///A///wA4AAAPgAAB8AAAPgAAA8AAADgAAAcAAAA4AAAD4AAAHwAAAPgAAAeAAAAAAGAAAAYAAABgAAAGAAAAYAAADgAAAOAAAA4AAADgAAAOAAAA4AAADgAAAOAAAA4AAADgAAAOAAAAYAAABgAAAGAAAAABgAAAPAAAAcAAAB4AAADgAAAOAAAAYAAAAAAAAAAOAADj8AAOP4AB5/gAHn/AAcccABxhwAHGHAAcYcABxjgAHmeAAf/wAA//AAD/8AAH/4AABDgAAAAAAP8AAP/8AD//4AP//wA///AD/w+AAOB4AA4DgADgOAAOA4AA4HAAD58AAP/wAAf+AAB/4AAD+AAAAAAAA/gAAP/gAB/+AAH/8AA//4ADwPgAOAeAB4B4AHgHgAeAeAA4B4ADgHgAOA8AAYDwAAAOAAAAQAAB/AAAP+AAB/8AAH/wAA+HgADwOAAOA4AA4DgADgOAGHA4A///gD//8AP//wA//+AA//wAADwAAAD4AAA/4AAP/wAA//AAH/+AAeZ4ADxjgAOGOAA4Y4ADhjgAOOOAA/x4AB/HgAH8cAAPhwAAAAAAAYAAABgAAAOAAAI4AAH/+AAf//gD//+AP//4A4f/gDhwAAOOAAAw4AADDgAAAMAAAAH4EAA/44AH/zwA//PAD/88AfB5wB4HngHgOeAcA54B4HHAHgc8AfD/wA//+AD//4AH//AAP/4AAP8AAAAAAB//AA//+AH//4A///gD//8AH/gAAA8AAADgAAAOAAAA4AAADwAAAP/wAA//gAD/+AAH/wAAH+AAAAAAAAAAAYP/ABz/+APP/4A8//ADz/8APDgAAYAAAAAAAAAAAB4YAAHjx//+PP//w8///Dz//4HH//AYADAAAAAAAAHwAB//gB//+AP//4A//+AD//AAAB8AAAP4AAB/wAAPvgAA8eAAHg8AAMDwAAAHAAAAMAAAAAAf/+AD//8AP//4A///gAAAeAAAA4AAAHgAAAcAAAAgAAD/AAA/+AAP/4AB//AAH/AAAfAAAB8AAAH+AAAP8AAAP4AAAPgAAB+AAAfwAAD+AAAfgAAB4AAAH/4AAf/wAB//gAD/8AAH/gAAAAAAAP8AAD/4AAf/gAD/8AAf/wAB+AAAHgAAAcAAABwAAAHAAAAeAAAB/AAAH/8AAP/4AAf/gAA/8AAA/gAAAAAAA/gAAH/gAA/+AAH/8AA//wADwPgAOAeAA4B4AHgHgAeAeAA4B4ADwPgAPB+AA//wAB//AAH/4AAP/AAAPwAAAAAAAAf/gAH//gB//+AH//4A///ADwOAAeA4AB4DgAHAOAAcA4AB4HgADw+AAP/wAAf/AAB/4AAB/AAAAAAAAfAAAH/AAA/+AAD/8AAf/wAB8fAAHAeAA8B4ADwHgAPAeAA8B4ADwH4AHg/wAf//gA///AD/58AH/BgADgAAAPAAAH/gAA//AAH/+AAf/4AD//AAPAAAA8AAADwAAAPAAAA8AAADwAAAHAAAAIAAAAcHAAD4cAAfhwAB/HgAP8OAA9w4ADjjgAOOOAA454ADj/gAHH8AAYfwABg+AAABwAAMAAAA4AAADgAAAOAAAH/4AB//8AH//wAf//gA//+AAOA4AA4HAADgcAAOBgAAQAAAB/AAAf/AAB/+AAH/8AAf/4AAAfgAAAeAAAB4AAAHgAAAeAAAB4AAAfgAB/8AAf/wAB/+AAH/wAAP8AAAAAAAHgAAAfgAAB/gAAH/gAAP/AAAP+AAAP8AAAP4AAAPgAAA+AAAP4AAD/AAB/4AAP/AAB/wAAH8AAAfAAAAgAAAH+AAA//gAD//AAH/8AAH/wAAAfAAAf8AAf/gAD/8AAP4AAA+AAAD/gAAH/4AAH/wAAA/AAAH8AAP/wAB//AAP/4AAf/AAB/AAAAAMAAcB4AD4PgAHx+AAfHwAA++AAB/wAAD+AAAHwAAAfAAAH+AAA/8AAH74AAfHwAD4fgAHA+AAYBwAAACAADwAAAPwBgA/gPAD/A8AH+HgAH8+AAH/wAAH/AAAP4AAD/AAA/4AAP/AAD/wAAf+AAB/gAAD4AAAAAAAAAPAAHB8AAcH4ABw/gAHH+AAcf4ADz3gAPeeAA5x4ADvHgAP4eAA/B4AD8HAAHgcAAcAgAABgAAAPAAB//AAf//4D/7/4P/H/g8AP/DAAAcH///B///+H///4f///AAAAADAAAYMAADw4AP+D/7/4H///Af//4Af/AAAA4AAAAAAAAAAABgAAAOAAAB4AAAHAAAAcAAAA4AAABgAAAOAAAA4AAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='),
    32,
    atob("CQYHGA8VFAUJCA4PBxAHEA4JDg8PDg8NEQ8GBwoNCw4aFRIRExAPFBMHEBEPFhQWERYQEBISExgSEQ8IDggMEwkRERAQEA4SEQkJDwoWEhMREg4ODhISFRIRDwgFCA4O"),
    28+(scale<<8)+(1<<16)
  );
  return this;
};


Graphics.prototype.setMiniFont = function(scale) {
  // Actual height 16 (15 - 0)
  this.setFontCustom(
    atob('AAAAAAAAAAAAAD/Yf/g/0DwAPAA8ADwADMAMwA/wP/g/8D7ADMAMwB/4P/g/8AzADMAOYA5gH2A7eDt4G+AZ4AnAHAA+MDZwNuA/wB/gB/AO8B2YOfAw8ADgAPAB+Dv4Pxh/GGcYf7g98DnwAfAAODgAeAA4AA/wH/w//ngfcAZwBngeP/4f/A/wFgAeABwAfwB/ABwANgASAAMAAwADAB/gH+APwAMAAwADAAAwADwAPAAYAwADAAMAAwADAAMAAwADAAMAADAAOAA4ADAAMABwAOABwAOADwAeADwAOAAP4B/wP/gwODB4P/A/8A/AEAA/8D/4P/gfwBwwPHg4+DH4M/g/uD8wHjAwMDA4MBgzGDOYP7g/+BzwAOAPgD/AP8AAwB/4P/g/8ADAHzA/MD84MzAzMDPwM/AR4A/gH/A/8Ds4BxgHMAPwA+AAwDAAMHAx+Hfwf4B+ADwAOAAN4B/wP/AzODM4Mzg/8D/wH/AIwA8AHxA/uDG4MfA78B/gH8AGcAZwBmAGMAY8BjgAAAeAB8APwBzAGOAQYATADMAMwAzADMAMwAzABAAQABhgGMAdwA+ABwAYADgAMdhz+GPQPwA+ADwAB+Af8B/wOTg3mHfYZNhk2GfYZ7g38DHAPMAfwA/AAPAD+A/wH8A/gDmAOYA/gB/gD/gD+ABwD/Af8D/4MzgzGDMYP7gf8B/wAOAH4A/wH/A/+Dg4MDg4ODg4GHAAIB/gP/A/+Dh4ODA4MBxwH/AP4A/AA4AP4B/wP/g/ODMYMzgzODMwMBAP4D/wP/g/8HGAcwAzADEAIAAPwB/wH/A8eDA4MxgzGDM4M/gT8AHwAMAf8D/wP/Af4AMAAwADAB/wP/g/8B/AH/A/8D/wH+AB8AHwAPgAOAA4P/g/8D/wH8AP8D/4P/A/4AfAD+Ae8BxwODAYEA/wP/A/+D/4ADgAOAA4ADAAMA/wH/g/+D/gP4Af4APgH+A/AD/gP/Af8AfgH/A/+D/4HvAPAAfAAeAA8B/4P/gf8AAAB8AP8B/wH/g4ODg4MDg4ODg4H/Af8A/gA4Af4B/wP/g/8DGAMYA7gB8AHwAOAAfAD+Af8DzwODgwODA4OHA88B/8H/wH3B/wP/g/+DOAM+Az8D/wPngcEBwwPjA/OD84Mzgz+DHwMfAQ4BgAOAA4AD/wP/g/+D/gOAA4ADgAH8A/4D/wAPgAOAA4APAf8D/gP8A+AD+AP+AP8AH4APgD8A/gH8A/ADwAP8A/8D/wAfAH8D/gPwA/wB/wAfAP8D/wP+AfADgwOHg88B/gD8AHgA/AH/A88DhwPAA+AB8AB/AD+APwD4AfAD4APAAwcDD4Mfgz+De4Pzg+MDwwGBA//j/+eB9gAyACOAA8AB8AB4ADwAHwAHAAMCACYAM//z/+H/4cADwAeABgAHAAOAAcAAAMAAwADAAMAAwADAAMAAwADAAMAAwgADAAOAAYABgABnAG+A74DpgMmA64D/gH8AP4ABAf4D/wP/A/OAYYBjgH8AfwA+ABwAfgB/AP8Aw4DDgMOAw4DHAAMAPgA/AH+AYYBhg/OH/wP/Af4APgB/AP+A64DJgMmA+4D7AHMAEAAwA/8D/4f/hmAGYAJgAD5gf2B/cGPw47DjcHfwf+A/wB+B/wP/g/8D8ABgAGAAfwB/gD8ADAA/A3+Hfwd/AwAAADN/83/zf+MPAH8D/4P/A/wAPgB3AGcAQwABA/4D/wP/gAGAAwABAD8AfwD/APAAfAA8ABwAfABwAP8AfwB/AD8Af4B/APAA4ADgAP4AfwB/gB8APgB/AP8Aw4DDgMOAw4D/AP8AfgAYAB/wP/B/8GGAYYBjgH+AfwA/AAwAPgB/AH8A54DDgMOA48D/4H/gPmA+AH8A/4DnAMAAwADAAEAAcwDzAPuA24DbgM8AzwAGAGAAYAH+A/8D/4BjgGMAYwB+AP8Af4AHgAOAA4APgH8A/wB8AHAA/AB+AB8AB4AHgB8AfwD8APAA/gD/AH8APwD/APgA/AB/AA8A/wD/APwAQwDjgPcAfwA8ADwAfgD3AOcAQwBwIHxgfuAf4AfAD4A/AH4AeABHAMcAz4DfgNuA+4DzgOMAQQAcAf+D/+f34gBn/+f/4/+CAGPn4//h/8AYAAABgAOAAwABgAGAAQAAAAAAAAAAAAAAAAAAAAAAAAAA=='),
    32,
    atob("BQMEDQgMCwMFBQgJBAkECQgFCAkICAkICggDBAYIBggPDAoKCwkJDAsECQoJDQwNCgwJCQoKCw4KCgkFCAUHCwUKCgkJCQgKCgUFCQYMCgsKCggICAoKDAoJCQUDBQgI"),
    16+(scale<<8)+(1<<16)
  );
  return this;
};

function imgLock(){
  return {
    width : 16, height : 16, bpp : 1,
    transparent : 0,
    buffer : E.toArrayBuffer(atob("A8AH4A5wDDAYGBgYP/w//D/8Pnw+fD58Pnw//D/8P/w="))
  }
}


/************************************************
 * Clock Info
 */
let clockInfoItems = clock_info.load();

// Add some custom clock-infos
let weekOfYear = function() {
  var date = new Date();
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

clockInfoItems[0].items.unshift({ name : "weekofyear",
  get : function() { return { text : "Week " + weekOfYear(),
                              img : null}},
  show : function() {},
  hide : function() {},
})

// Empty for large time
clockInfoItems[0].items.unshift({ name : "nop",
  get : function() { return { text : null,
                              img : null}},
  show : function() {},
  hide : function() {},
})



let clockInfoMenu = clock_info.addInteractive(clockInfoItems, {
  app: "bwclk",
  x : 0,
  y: 135,
  w: W,
  h: H-135,
  draw : (itm, info, options) => {
    var hideClkInfo = info.text == null;

    g.setColor(g.theme.fg);
    g.fillRect(options.x, options.y, options.x+options.w, options.y+options.h);

    g.setFontAlign(0,0);
    g.setColor(g.theme.bg);

    if (options.focus){
      var y = hideClkInfo ? options.y+20 : options.y+2;
      var h = hideClkInfo ? options.h-20 : options.h-2;
      g.drawRect(options.x, y, options.x+options.w-2, y+h-1); // show if focused
      g.drawRect(options.x+1, y+1, options.x+options.w-3, y+h-2); // show if focused
    }

    // In case we hide the clkinfo, we show the time again as the time should
    // be drawn larger.
    if(hideClkInfo){
      drawTime();
      return;
    }

    // Set text and font
    var image = info.img;
    var text = String(info.text);
    if(text.split('\n').length > 1){
      g.setMiniFont();
    } else {
      g.setSmallFont();
    }

    // Compute sizes
    var strWidth = g.stringWidth(text);
    var imgWidth = image == null ? 0 : 24;
    var midx = options.x+options.w/2;

    // Draw
    if (image) {
      var scale = imgWidth / image.width;
      g.drawImage(image, midx-parseInt(imgWidth*1.3/2)-parseInt(strWidth/2), options.y+6, {scale: scale});
    }
    g.drawString(text, midx+parseInt(imgWidth*1.3/2), options.y+20);

    // In case we are in focus and the focus box changes (fullscreen yes/no)
    // we draw the time again. Otherwise it could happen that a while line is
    // not cleared correctly.
    if(options.focus) drawTime();
  }
});


/************************************************
 * Draw
 */
let draw = function() {
  // Queue draw again
  queueDraw();

  // Draw clock
  drawDate();
  drawTime();
  drawLock();
  drawWidgets();
};


let drawDate = function() {
    // Draw background
    var y = getLineY()
    g.reset().clearRect(0,0,W,y);

    // Draw date
    y = parseInt(y/2)+4;
    y += isFullscreen() ? 0 : 8;
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
    g.drawString(dayStr, W/2 - fullDateW/2 + 10 + dateW, y-12);
    g.drawString(monthStr, W/2 - fullDateW/2 + 10 + dateW, y+11);

    g.setMediumFont();
    g.setColor(g.theme.fg);
    g.drawString(dateStr, W/2 - fullDateW / 2, y+2);
};


let drawTime = function() {
  var hideClkInfo = clockInfoMenu.menuA == 0 && clockInfoMenu.menuB == 0;

  // Draw background
  var y1 = getLineY();
  var y = y1;
  var date = new Date();

  var hours = String(date.getHours());
  var minutes = date.getMinutes();
  minutes = minutes < 10 ? String("0") + minutes : minutes;
  var colon = settings.hideColon ? "" : ":";
  var timeStr = hours + colon + minutes;

  // Set y coordinates correctly
  y += parseInt((H - y)/2) + 5;

  if (hideClkInfo){
    g.setLargeFont();
  } else {
    y -= 15;
    g.setMediumFont();
  }

  // Clear region and draw time
  g.setColor(g.theme.fg);
  g.fillRect(0,y1,W,y+20 + (hideClkInfo ? 1 : 0) + (isFullscreen() ? 3 : 0));

  g.setColor(g.theme.bg);
  g.setFontAlign(0,0);
  g.drawString(timeStr, W/2, y);
};


let drawLock = function() {
  if(settings.showLock && Bangle.isLocked()){
    g.setColor(g.theme.fg);
    g.drawImage(imgLock(), W-16, 2);
  }
};


let drawWidgets = function() {
  if(isFullscreen()){
    widget_utils.hide();
  } else {
    Bangle.drawWidgets();
  }
};


/************************************************
 * Listener
 */
// timeout used to update every minute
let drawTimeout;

// schedule a draw for the next minute
let queueDraw = function() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};


// Stop updates when LCD is off, restart when on
let lcdListenerBw = function(on) {
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
};
Bangle.on('lcdPower', lcdListenerBw);

let lockListenerBw = function(isLocked) {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;

  if(!isLocked && settings.screen.toLowerCase() == "dynamic"){
    // If we have to show the widgets again, we load it from our
    // cache and not through Bangle.loadWidgets as its much faster!
    widget_utils.show();
  }

  draw();
};
Bangle.on('lock', lockListenerBw);

let charging = function(charging){
  // Jump to battery
  clockInfoMenu.setItem(0, 2);
  drawTime();
}
Bangle.on('charging', charging);

let kill = function(){
  clockInfoMenu.remove();
  delete clockInfoMenu;
};
E.on("kill", kill);

/************************************************
 * Startup Clock
 */

// The upper part is inverse i.e. light if dark and dark if light theme
// is enabled. In order to draw the widgets correctly, we invert the
// dark/light theme as well as the colors.
let themeBackup = g.theme;
g.setTheme({bg:g.theme.fg,fg:g.theme.bg, dark:!g.theme.dark}).clear();

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    Bangle.removeListener('lcdPower', lcdListenerBw);
    Bangle.removeListener('lock', lockListenerBw);
    Bangle.removeListener('charging', charging);
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    // save settings
    kill();
    E.removeListener("kill", kill);
    g.setTheme(themeBackup);
    widget_utils.show();
  }
});

// Load widgets and draw clock the first time
Bangle.loadWidgets();

// Draw first time
draw();

} // End of app scope
