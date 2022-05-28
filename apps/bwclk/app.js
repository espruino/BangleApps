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
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//84D//zgP/+GAAAAAAAAAAAAAAAAAAAD4AAAPgAAA+AAAAAAAAAAAAA+AAAD4AAAPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAg4AAHDgAAcOCABw54AHD/gAf/8AD/8AB//gAP8OAA9w4YCHD/gAcf+AB//gAf/gAP/uAA/w4ADnDgAAcOAABw4AAHAAAAcAAAAAAAAAAAAAAAIAA+A4AH8HwA/4PgHjgOAcHAcBwcBw/BwH78DgfvwOB8HA4HAOBw8A+HngB4P8ADgfgAAAYAAAAAAAAAAB4AAAf4AQB/gDgOHAeA4cDwDhweAOHDwA88eAB/nwAD88AAAHgAAA8AAAHn4AA8/wAHnvgA8cOAHhg4A8GDgHgcOA8B74BgD/AAAH4AAAAAAAAAAAAAAAAAMAAAH8AD8/4Af/3wB/8HgODwOA4HA4DgODgOAcOA4A44DwDzgHAH8AMAPwAQP+AAA/8AAAB4AAADAAAAAA+AAAD4AAAPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/8AD//+A/+/+H4AD98AAB3gAADIAAAAAAAAAAAAAIAAABwAAAXwAAHPwAB8P8D/gP//4AH/8AAAAAAAAAAAAAAAAAAAAAAAAGAAAA4gAAB/AAAH8AAD/AAAP8AAAH4AAAfwAADiAAAOAAAAAAAAAAAAAAGAAAAYAAABgAAAGAAAAYAAABgAAD/+AAP/4AABgAAAGAAAAYAAABgAAAGAAAAYAAAAAAAAAAAAAADkAAAPwAAA/AAAAAAAAAAAAAAAAAAAAAAAAABgAAAGAAAAYAAABgAAAGAAAAYAAABgAAAGAAAAYAAAAAAAAAAAAAAAAAAAAAAADgAAAOAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAA4AAA/gAA/+AA//AA//AAP/AAA/AAADAAAAAAAAAAAAAAAAAAA//gAP//gB///AHgA8A8AB4DgADgOAAOA4AA4DgADgPAAeAeADwB///AD//4AD/+AAAAAAAAAAAAAAAA4AAAHgAAAcAAADwAAAP//+A///4D///gAAAAAAAAAAAAAAAAAAAAAAYAeADgD4AeAfAD4DwAfgOAD+A4Ae4DgDzgOAeOA4Dw4DweDgH/wOAP+A4AfwDgAAAAAAAAAAAAIAOAA4A4ADwDggHAOHgOA48A4DnwDgO/AOA7uA4D84HgPh/8A8H/gDgH8AAACAAAAAAAAAAAAAHgAAB+AAA/4AAP7gAD+OAA/g4AP4DgA+AOADAA4AAB/+AAH/4AAf/gAADgAAAOAAAAAAAAAAAAAAAAD4cAP/h4A/+HwDw4HgOHAOA4cA4DhwDgOHAOA4cA4Dh4HAOD58A4H/gAAP8AAAGAAAAAAAAAAAAAAAAD/+AAf/8AD//4AePDwDw4HgOHAOA4cA4DhwDgOHAOA4cB4Bw8PAHD/8AIH/gAAH4AAAAAAAAAADgAAAOAAAA4AAYDgAHgOAD+A4B/wDgf4AOP+AA7/AAD/gAAP4AAA8AAAAAAAAAAAAAAAAAAeH8AD+/4Af//wDz8HgOHgOA4OA4Dg4DgODgOA4eA4Dz8HgH//8AP7/gAeH8AAAAAAAAAAAAAAAA+AAAH+AgB/8HAHh4cA8Dg4DgODgOAcOA4Bw4DgODgPA4eAeHDwB///AD//4AD/+AAAAAAAAAAAAAAAAAAAAAAAAAAODgAA4OAADg4AAAAAAAAAAAAAAAAAAAAAAAAAAAAABwA5AHAD8AcAPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAB8AAAP4AAB5wAAPDgAB4HAAHAOAAIAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGMAAAYwAABjAAAGMAAAYwAABjAAAGMAAAYwAABjAAAGMAAAYwAABjAAAGMAAAYwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAEAAcA4AB4HAADw4AADnAAAH4AAAPAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAB8AAAHgAAA4AAADgDzgOA/OA4D84DgeAAPHwAAf+AAA/wAAB8AAAAAAAAAAAAAAAAAAD+AAB/+AAP/8AB4B4AOABwBwADgHB8OA4P4cDhxxwMGDDAwYMMDBgwwOHHHA4f4cDh/xwHAHCAcAMAA8AwAB8PAAD/4AAD/AAAAAAAAAAAAAACAAAB4AAB/gAA/8AAf+AAP/wAH/nAA/gcADwBwAPwHAA/4cAA/9wAAf/AAAP/AAAD/gAAB+AAAA4AAAAAAAAAAAAAAD///gP//+A///4DgcDgOBwOA4HA4DgcDgOBwOA4HA4Dg8DgPHwOAf/h4A///AB8f4AAAfAAAAAAAP+AAD/+AAf/8AD4D4AeADwBwAHAOAAOA4AA4DgADgOAAOA4AA4DgADgOAAOAcABwB4APAD4D4AHgPAAOA4AAAAAAAAAAAAAAAP//+A///4D///gOAAOA4AA4DgADgOAAOA4AA4DgADgOAAOA8AB4BwAHAHwB8AP//gAP/4AAP+AAAAAAAAAAAAAAAA///4D///gP//+A4HA4DgcDgOBwOA4HA4DgcDgOBwOA4HA4DgcDgOBgOA4AA4AAAAAAAAAAAAAAD///gP//+A///4DgcAAOBwAA4HAADgcAAOBwAA4HAADgcAAOAwAA4AAAAAAAAAf+AAD/+AA//+ADwB4AeADwDwAHgOAAOA4AA4DgADgOAAOA4AA4DgMDgPAweAcDBwB8MfADw/4AHD/AAAPwAAAAAAAAAAAAAAAP//+A///4D///gABwAAAHAAAAcAAABwAAAHAAAAcAAABwAAAHAAAAcAAABwAA///4D///gP//+AAAAAAAAAAAAAAAAAAAD///gP//+A///4AAAAAAAAAAAADgAAAPAAAA+AAAA4AAADgAAAOAAAA4AAAHgP//8A///wD//8AAAAAAAAAAAAAAAAAAAA///4D///gP//+AAHAAAA+AAAP8AAB54AAPDwAB4HgAPAPAB4AfAPAA+A4AA4DAABgAAACAAAAAAAAAAP//+A///4D///gAAAOAAAA4AAADgAAAOAAAA4AAADgAAAOAAAA4AAADgAAAAAAAAAAAAAAP//+A///4D///gD+AAAD+AAAB+AAAB/AAAB/AAAB/AAAB+AAAH4AAB+AAA/gAAP4AAD+AAA/AAAfwAAD///gP//+A///4AAAAAAAAAAAAAAAAAAAP//+A///4D///gHwAAAPwAAAPgAAAfgAAAfAAAAfAAAA/AAAA+AAAB+AAAB8A///4D///gP//+AAAAAAAAAAAP+AAD/+AAf/8AD4D4AeADwBwAHAOAAOA4AA4DgADgOAAOA4AA4DgADgOAAOAcABwB4APAD4D4AH//AAP/4AAP+AAAAAAAAAAAP//+A///4D///gOAcAA4BwADgHAAOAcAA4BwADgHAAOAcAA4DgAD4eAAH/wAAP+AAAPgAAAAAAAA/4AAP/4AB//wAPgPgB4APAHAAcA4AA4DgADgOAAOA4AA4DgADgOAAOA4AO4BwA/AHgB8APgPwAf//gA//uAA/4QAAAAAAAAAA///4D///gP//+A4BwADgHAAOAcAA4BwADgHAAOAcAA4B8ADgP8APh/8Af/H4A/4HgA+AGAAAAAAAAAAAABgAHwHAA/g+AH/A8A8cBwDg4DgODgOA4OA4DgcDgOBwOA4HA4DwODgHg4cAPh/wAcH+AAwPwAAAAADgAAAOAAAA4AAADgAAAOAAAA4AAAD///gP//+A///4DgAAAOAAAA4AAADgAAAOAAAA4AAADgAAAAAAAAAAAAAAAAAP//AA///AD//+AAAB8AAABwAAADgAAAOAAAA4AAADgAAAOAAAA4AAAHgAAA8A///gD//8AP//gAAAAAAAAAAIAAAA8AAAD+AAAH/AAAD/wAAB/4AAA/8AAAf4AAAPgAAB+AAA/4AAf+AAP/AAH/gAD/wAAP4AAA4AAAAAAAAPAAAA/gAAD/4AAA/+AAAf/AAAH/gAAB+AAAf4AAf/AAf/AAP/gAD/gAAPwAAA/4AAA/+AAAf/AAAH/wAAB/gAAB+AAB/4AA/+AA/+AA/+AAD/AAAPAAAAgAAAAAAAAMAAGA4AA4D4APgHwB8APwfAAPn4AAf+AAAfwAAB/AAAf+AAD4+AA/B8AHwB8A+AD4DgADgMAAGAwAAADwAAAPwAAAPwAAAfgAAAfgAAAf/4AAf/gAH/+AB+AAAPwAAD8AAA/AAADwAAAMAAAAgAAAAAAAAMAACA4AA4DgAPgOAD+A4Af4DgH7gOB+OA4Pw4Dj8DgO/AOA/4A4D+ADgPgAOA4AA4DAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////////gAAAOAAAA4AAADAAAAAAAAAAAAAAAAAAAAAAA4AAAD+AAAP/gAAH/4AAB/+AAAf+AAAH4AAABgAAAAAAAAADAAAAOAAAA4AAADgAAAP////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAADgAAAcAAADgAAAcAAADgAAAcAAAB4AAADwAAADgAAAHAAAAOAAAAYAAAAAAAAAAAAAAAAAAAAMAAAAwAAADAAAAMAAAAwAAADAAAAMAAAAwAAADAAAAMAAAAwAAADAAAAMAAAAwAAADAAAAMAAAAwAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAHH8AA8/4AHzjgAcMOABxwYAHHBgAccOABxwwAHGHAAP/4AA//4AA//gAAAAAAAAAAAAAAAAAAA///4D///gP//+AA4BwAHADgAcAOABwA4AHADgAcAOAB4B4ADwPAAP/8AAf/AAAf4AAAAAAAAAAAAPwAAD/wAAf/gADwPAAeAeABwA4AHADgAcAOABwA4AHADgAeAeAA8DwABwOAADAwAAAAAAAAAAAA/AAAP/AAD//AAPA8AB4B4AHADgAcAOABwA4AHADgAcAOAA4BwD///gP//+A///4AAAAAAAAAAAAAAAAPwAAD/wAAf/gAD2PAAeYeABxg4AHGDgAcYOABxg4AHGDgAeYeAA/jwAB+OAAD4wAABgAAAAAAAAAAABgAAAGAAAB//+Af//4D///gPcAAA5gAADGAAAMYAAAAAAAAAPwAAD/wMA//w4DwPHgeAePBwA4cHADhwcAOHBwA4cHADhwOAcPB///4H///Af//wAAAAAAAAAAAAAAAAAAD///gP//+AA//4ADgAAAcAAABwAAAHAAAAcAAABwAAAHgAAAP/+AAf/4AA//gAAAAAAAAAAAAAAMf/+A5//4Dn//gAAAAAAAAAAAAAAAAAAHAAAAfn///+f//+5///wAAAAAAAAAAAAAAAAAAP//+A///4D///gAAcAAAD8AAAf4AADzwAAeHgAHwPAAeAeABgA4AEABgAAAAAAAAAD///gP//+A///4AAAAAAAAAAAAAAAAAAAAf/+AB//4AH//gAOAAABwAAAHAAAAcAAABwAAAHgAAAP/+AA//4AB//gAOAAABwAAAHAAAAcAAABwAAAHgAAAf/+AA//4AA//gAAAAAAAAAAAAAAAf/+AB//4AD//gAOAAABwAAAHAAAAcAAABwAAAHAAAAeAAAA//4AB//gAD/+AAAAAAAAAAAAAAAAD8AAA/8AAH/4AA8DwAHgHgAcAOABwA4AHADgAcAOABwA4AHgHgAPh8AAf/gAA/8AAA/AAAAAAAAAAAAAAAAB///8H///wf///A4BwAHADgAcAOABwA4AHADgAcAOAB4B4ADwPAAP/8AAf/AAAf4AAAAAAAAAAAAPwAAD/wAA//wADwPAAeAeABwA4AHADgAcAOABwA4AHADgAOAcAB///8H///wf///AAAAAAAAAAAAAAAAAAAH//gAf/+AB//4ADwAAAcAAABwAAAHAAAAcAAAAAAAAAAMAAHw4AA/jwAH+HgAcYOABxw4AHHDgAcMOABw44AHjjgAPH+AA8fwAAw+AAAAAABgAAAGAAAAcAAAf//wB///AH//+ABgA4AGADgAYAOABgA4AAAAAAAAAAAAAAAH/AAAf/wAB//wAAB/AAAAeAAAA4AAADgAAAOAAAA4AAADgAAAcAB//4AH//gAf/+AAAAAAAAAAAAAAABwAAAH4AAAf8AAAP8AAAH+AAAD+AAAD4AAA/gAAf8AAP+AAH/AAAfgAABwAAAAAAAAAAAABwAAAH8AAAf+AAAP/gAAD/gAAB+AAAf4AAP8AAP+AAB/AAAH4AAAf8AAAP+AAAD/gAAB+AAAf4AAf/AAP/AAB/gAAHgAAAQAAABAAIAHADgAeAeAA8HwAB8+AAD/gAAD8AAAPwAAD/gAAfPgADwfAAeAeABwA4AEAAgAAAAABAAAAHgAAAfwAAA/wAAAf4BwAP4/AAP/8AAP+AAD/AAB/wAA/4AAP8AAB+AAAHAAAAQAAAAAAIAHADgAcAeABwD4AHA/gAcHuABx84AHPDgAf4OAB/A4AHwDgAeAOABgA4AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAH4Af//////n//AAAA4AAADgAAAAAAAAAAAAAAAAAP//+A///4D///gAAAAAAAAAAAAAAAAAAA4AAADgAAAOAAAA//5/9////wAH4AAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAeAAAD4AAAOAAAA4AAADgAAAHAAAAcAAAA4AAADgAAAOAAAD4AAAPAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"), 32, atob("BgkMGhEZEgYMDAwQCAwICxILEBAREBEOEREJCREVEQ8ZEhEUExAOFBQHDREPGBMUERQSEhEUERsREBIMCwwTEg4QERAREQoREQcHDgcYEREREQoPDBEPFg8PDwwIDBMc"), 28+(scale<<8)+(1<<16));
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
 */
var infoArray = [
  function(){ return [ null, null, "left" ] },
  function(){ return [ "Bangle", imgWatch, "right" ] },
  function(){ return [ E.getBattery() + "%", imgBattery, "left" ] },
  function(){ return [ getSteps(), imgSteps, "left" ] },
  function(){ return [ Math.round(Bangle.getHealthStatus("last").bpm) + " bpm", imgBpm, "left"] },
  function(){ return [ getWeather().temp, imgTemperature, "left" ] },
  function(){ return [ getWeather().wind, imgWind, "left" ] },
];
const NUM_INFO=infoArray.length;


function getInfoEntry(){
  if(isAlarmEnabled()){
    return [getAlarmMinutes() + " min.", imgTimer, "left"]
  } else if(Bangle.isCharging()){
    return [E.getBattery() + "%", imgCharging, "left"]
  } else{
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
    imgWidth = infoImg.width;
    var strWidth = g.stringWidth(infoStr);
    g.drawImage(
      infoImg,
      W/2 + (printImgLeft ? -strWidth/2-2 : strWidth/2+2) - infoImg.width/2,
      y - infoImg.height/2
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
});


E.on("kill", function(){
  storage.write(SETTINGS_FILE, settings);
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
