var SunCalc = require("https://raw.githubusercontent.com/mourner/suncalc/master/suncalc.js");
const SETTINGS_FILE = "rebble.json";
const LOCATION_FILE = "mylocation.json";
let settings;
let location;

Graphics.prototype.setFontLECO1976Regular22 = function(scale) {
  // Actual height 22 (21 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/nA/+cD/5wP/nAAAAAAAAPwAA/gAD+AAPwAAAAAD+AAP4AA/gAAAAAAAAAAAAAcOAP//A//8D//wP//AHDgAcOAP//A//8D//wP//AHDgAAAAAAAAH/jgf+OB/44H/jj8OP/w4//Dj/8OPxw/4HD/gcP+Bw/4AAAAAAAP+AA/8AD/wQOHHA4c8D//wP/8A//gAD4AAfAAH/8A//wP//A84cDjhwIP/AA/8AB/wAAAAAAAD//wP//A//8D//wOHHA4ccDhxwOHHA4f8Dh/wOH/A4f8ABwAAAAAAAAD8AAP4AA/gAD8AAAAAAAAAAAEAAD+AB//A///v/D//gB/wABwAAAAAADgAA/wAf/4P8///wf/4AP8AAOAAAAAAAAAyAAHcAAPwAD/gAP/AA/8AA/AAH8AAMwAAAAAAAAAAAAADgAAOAAA4AAf8AD/wAP/AA/8AAOAAA4AADgAAAAAAAAAAD8AAfwAB/AAD8AAAAAAAADgAAOAAA4AADgAAOAAA4AADgAAAAAAAAAADgAAOAAA4AADgAAAAAAAAABwAB/AA/8A//gP/gA/wADwAAIAAAAAAD//wP//A//8D//wOAHA4AcDgBwOAHA//8D//wP//A//8AAAAAAAA4AcDgBwOAHA//8D//wP//A//8AABwAAHAAAcAAAAAAAA+f8D5/wPn/A+f8DhxwOHHA4ccDhxwP/HA/8cD/xwP/HAAAAAAAAOAHA4AcDhxwOHHA4ccDhxwOHHA4ccD//wP//A//8D//wAAAAAAAD/wAP/AA/8AD/wAAHAAAcAABwAAHAA//8D//wP//A//8AAAAAAAA/98D/3wP/fA/98DhxwOHHA4ccDhxwOH/A4f8Dh/wOH/AAAAAAAAP//A//8D//wP//A4ccDhxwOHHA4ccDh/wOH/A4f8Dh/wAAAAAAAD4AAPgAA+AADgAAOAAA4AADgAAP//A//8D//wP//AAAAAAAAP//A//8D//wP//A4ccDhxwOHHA4ccD//wP//A//8D//wAAAAAAAD/xwP/HA/8cD/xwOHHA4ccDhxwOHHA//8D//wP//A//8AAAAAAAAOA4A4DgDgOAOA4AAAAAAAAOA/A4H8DgfwOA/AAAAAAAAB4AAPwAA/AAD8AAf4ABzgAPPAA8cAHh4AAAAAAAAAAAAHHAAccABxwAHHAAccABxwAHHAAccABxwAHHAAAAAAAAAOHAA4cADzwAPPAAf4AB/gAD8AAPwAAeAAB4AAAAAAAAA+AAD4AAPgAA+ecDh9wOH3A4fcDhwAP/AA/8AD/wAP/AAAAAAAAAP//4///j//+P//44ADjn/OOf845/zjnHOP8c4//zj//OP/84AAAAAAAP//A//8D//wP//A4cADhwAOHAA4cAD//wP//A//8D//wAAAAAAAD//wP//A//8D//wOHHA4ccDhxwOHHA//8D//wP9/A/j8AAAAAAAA//8D//wP//A//8DgBwOAHA4AcDgBwOAHA4AcDgBwOAHAAAAAAAAP//A//8D//wP//A4AcDgBwOAHA8A8D//wH/+AP/wAf+AAAAAAAAD//wP//A//8D//wOHHA4ccDhxwOHHA4ccDhxwOAHA4AcAAAAAAAA//8D//wP//A//8DhwAOHAA4cADhwAOHAA4cADgAAOAAAAAAD//wP//A//8D//wOAHA4ccDhxwOHHA4f8Dh/wOH/A4f8AAAAAAAA//8D//wP//A//8ABwAAHAAAcAABwAP//A//8D//wP//AAAAAAAAP//A//8D//wP//AAAAAAAAOAHA4AcDgBwOAHA4AcDgBwOAHA//8D//wP//A//8AAAAAAAA//8D//wP//A//8AHwAA/AAP8AB/wAPn/A8f8DB/wIH/AAAAAAAAP//A//8D//wP//AAAcAABwAAHAAAcAABwAAHAAAAAAAAP//A//8D//wP//Af8AAP+AAH/AAD8AAHwAD/AB/wAf8AP+AA//8D//wP//AAAAAAAAP//A//8D//wP//AfwAAfwAAfwAAfwAAfwP//A//8D//wAAAAAAAAAAAP//A//8D//wP//A4AcDgBwOAHA4AcD//wP//A//8D//wAAAAAAAD//wP//A//8D//wOHAA4cADhwAOHAA/8AD/wAP/AA/8AAAAAP//A//8D//wP//A4AcDgBwOAHA4AcD//+P//4///j//+AAA4AADgAAAP//A//8D//wP//A4eADh+AOH8A4f4D/3wP/HA/8MD/wQAAAAAAAD/xwP/HA/8cD/xwOHHA4ccDhxwOHHA4f8Dh/wOH/A4f8AAAAAAAA4AADgAAOAAA//8D//wP//A//8DgAAOAAA4AADgAAAAAA//8D//wP//A//8AABwAAHAAAcAABwP//A//8D//wP//AAAADAAAPgAA/wAD/4AB/8AA/8AAfwAB/AA/8Af+AP/AA/wAD4AAMAAA4AAD+AAP/gA//8AH/wAB/AAf8Af/wP/4A/4AD/gAP/4AH/8AB/wAB/AB/8D//wP/gA/gADgAAIABA4AcDwDwPw/Afn4Af+AA/wAD/AA//AH5+A/D8DwDwOAHAgAEAAAAP/AA/8AD/wAP/AAAf8AB/wAH/AAf8D/wAP/AA/8AD/wAAAAAAAADh/wOH/A4f8Dh/wOHHA4ccDhxwOHHA/8cD/xwP/HA/8cAAAAAAAAf//9///3///f//9wAA3AADcAAMAAAOAAA/gAD/wAH/8AB/8AA/wAAPAAAEAAAAHAADcAANwAB3///f//9///wAA"), 32, atob("BwYLDg4UDwYJCQwMBgkGCQ4MDg4ODg4NDg4GBgwMDA4PDg4ODg4NDg4GDQ4MEg8ODQ8ODgwODhQODg4ICQg="), 22+(scale<<8)+(1<<16));
}

Graphics.prototype.setFontKdamThmor = function(scale) {
  // Actual height 72 (71 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAH+AAAAAAAAAAAAAP/AAAAAAAAAAAAAf/gAAAAAAAAAAAA//gAAAAAAAAAAAA//wAAAAAAAAAAAA//wAAAAAAAAAAAA//wAAAAAAAAAAAA//wAAAAAAAAAAAA//gAAAAAAAAAAAAf/gAAAAAAAAAAAAf/AAAAAAAAAAAAAP+AAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAAAAAAAAAAAAB/AAAAAAAAAAAAAP/AAAAAAAAAAAAA//AAAAAAAAAAAAH/+AAAAAAAAAAAAf/+AAAAAAAAAAAD//+AAAAAAAAAAAf//8AAAAAAAAAAB///4AAAAAAAAAAP///wAAAAAAAAAA////AAAAAAAAAAH///4AAAAAAAAAAf///gAAAAAAAAAD///8AAAAAAAAAAf///wAAAAAAAAAB///+AAAAAAAAAAP///4AAAAAAAAAA////AAAAAAAAAAH///4AAAAAAAAAAf///gAAAAAAAAAD///8AAAAAAAAAAP///wAAAAAAAAAB///+AAAAAAAAAAP///4AAAAAAAAAA////AAAAAAAAAAD///4AAAAAAAAAAP///gAAAAAAAAAAf//8AAAAAAAAAAA///wAAAAAAAAAAA//+AAAAAAAAAAAA//4AAAAAAAAAAAA//AAAAAAAAAAAAA/4AAAAAAAAAAAAA/gAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//AAAAAAAAAAAP///+AAAAAAAAAD/////wAAAAAAAAP/////+AAAAAAAA///////gAAAAAAD///////4AAAAAAH///////8AAAAAAf///////+AAAAAA/////////gAAAAB/////////wAAAAB/////////wAAAAD/////////4AAAAH///AAA///8AAAAH//wAAAB//8AAAAP/+AAAAAP/+AAAAP/4AAAAAD/+AAAAf/gAAAAAA//AAAAf/AAAAAAAf/AAAAf+AAAAAAAP/AAAA/+AAAAAAAP/gAAA/8AAAAAAAH/gAAA/8AAAAAAAH/gAAA/8AAAAAAAH/gAAA/8AAAAAAAH/gAAA/8AAAAAAAH/gAAA/8AAAAAAAH/gAAA/8AAAAAAAH/gAAA/8AAAAAAAH/gAAA/+AAAAAAAP/gAAAf+AAAAAAAP/AAAAf/AAAAAAAf/AAAAf/gAAAAAA//AAAAP/4AAAAAD/+AAAAP/+AAAAAP/+AAAAH//gAAAA//8AAAAH///AAAf//8AAAAD/////////4AAAAD/////////wAAAAB/////////wAAAAA/////////gAAAAAf////////AAAAAAH///////8AAAAAAD///////4AAAAAAA///////gAAAAAAAP/////+AAAAAAAAD/////4AAAAAAAAAf////AAAAAAAAAAA///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAADwAAAAAAAAAAAAAD4AAAAAAAAAAAAAH8AAAAAAAAAAAAAP+AAAAAAAAAAAAAf/AAAAAH/AAAAAA//AAAAAH/AAAAAB//AAAAAH/AAAAAB//AAAAAH/AAAAAD/+AAAAAH/AAAAAH/8AAAAAH/AAAAAP/4AAAAAH/AAAAAf/wAAAAAH/AAAAA//gAAAAAH/AAAAB//gAAAAAH/AAAAB//AAAAAAH/AAAAD/+AAAAAAH/AAAAH/8AAAAAAH/AAAAP//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAAAAAAAAAAH/AAAAAAAAAAAAAH/AAAAAAAAAAAAAH/AAAAAAAAAAAAAH/AAAAAAAAAAAAAH/AAAAAAAAAAAAAH/AAAAAAAAAAAAAH/AAAAAAAAAAAAAH/AAAAAAAAAAAAAH/AAAAAAAAAAAAAH/AAAAAAAAAAAAAH/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/AAAAAAHgAAAAAD/AAAAAA/wAAAAAH/AAAAAD/wAAAAAP/AAAAAH/wAAAAAf/AAAAAP/wAAAAA//AAAAA//wAAAAB//AAAAB//wAAAAD//AAAAB//wAAAAH//AAAAD//wAAAAP//AAAAH//wAAAAf//AAAAH//gAAAA///AAAAP/+AAAAB///AAAAP/4AAAAD///AAAAf/gAAAAH///AAAAf/AAAAAP///AAAAf+AAAAAf///AAAAf+AAAAA//v/AAAA/8AAAAB//P/AAAA/8AAAAD/+P/AAAA/8AAAAH/8P/AAAA/8AAAAP/4P/AAAA/8AAAAf/wf/AAAA/8AAAA//gf/AAAA/8AAAD//Af/AAAA/8AAAH/+Af/AAAA/+AAAP/8Af/AAAA/+AAAf/4Af/AAAAf/AAB//wAf/AAAAf/gAD//gAf/AAAAf/wAf//AAf/AAAAf/+D//+AAf/AAAAP/////8AAf/AAAAP/////4AAf/AAAAH/////wAAf/AAAAH/////gAAf/AAAAD/////AAAf/AAAAB////8AAAf/AAAAA////4AAAf/AAAAAf///wAAAf/AAAAAP///AAAAf/AAAAAD//8AAAAf/AAAAAA//gAAAAP/AAAAAABwAAAAAH/AAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAfAAAAAAAAHgAAAA/wAAAAAAA/wAAAA/8AAAAAAD/wAAAB/+AAAAAAH/wAAAB//AAAAAAP/wAAAB//gAAAAA//wAAAB//wAAAAB//wAAAB//4AAAAB//wAAAB//8AAAAD//wAAAA//8AAAAH//wAAAAf/+AAAAH//gAAAAH/+AAAAP/+AAAAAB//AAAAP/4AAAAAA//AAAAf/gAAAAAAf/AAAAf/AAAAAAAf/AAAAf/AAAAAAAP/gAAAf+AAAAAAAP/gAAA/+AAD/gAAH/gAAA/8AAD/gAAH/gAAA/8AAD/gAAH/gAAA/8AAD/gAAH/gAAA/8AAD/gAAH/gAAA/8AAD/gAAH/gAAA/8AAD/gAAH/gAAA/8AAH/wAAH/gAAA/8AAH/wAAP/gAAA/+AAH/wAAP/AAAAf/AAP/4AAf/AAAAf/AAf/4AA//AAAAf/wA//8AB//AAAAf/+H//+AD/+AAAAP//////4f/+AAAAP////v////8AAAAH////v////8AAAAH////H////4AAAAD////H////wAAAAB///+D////wAAAAA///8D////gAAAAAf//4B////AAAAAAP//wA///+AAAAAAD//AAf//4AAAAAAAf4AAH//gAAAAAAAAAAAB/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAAAAAAAAAAAAD/gAAAAAAAAAAAAP/wAAAAAAAAAAAAf/wAAAAAAAAAAAA//wAAAAAAAAAAAD//wAAAAAAAAAAAH//wAAAAAAAAAAAP//wAAAAAAAAAAA///wAAAAAAAAAAB///wAAAAAAAAAAD///wAAAAAAAAAAP///wAAAAAAAAAAf///wAAAAAAAAAA//9/wAAAAAAAAAD//x/wAAAAAAAAAH//h/wAAAAAAAAAP/+B/wAAAAAAAAA//8B/wAAAAAAAAB//4B/wAAAAAAAAD//gB/wAAAAAAAAP//AB/wAAAAAAAAf/+AB/wAAAAAAAA//4AB/wAAAAAAAD//wAB/wAAAAAAAH//AAB/wAAAAAAAP/+AAB/wAAAAAAA//8AAB/wAAAAAAB//wAAB/wAAAAAAD//gAAB/wAAAAAAP/+AAAB/wAAAAAAf/8AAAB/wAAAAAAf/5////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAf//////////AAAAAAAAAAB/wAAAAAAAAAAAAB/wAAAAAAAAAAAAB/wAAAAAAAAAAAAB/wAAAAAAAAAAAAB/wAAAAAAAAAAAAB/wAAAAAAAAAAAAB/wAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAPgAAAAAAAAAAAAA/wAAAAAAAAD4AAB/4AAAAAAAD/4AAB/4AAAAAAD//4AAB/8AAAAAD///8AAB/8AAAAD////8AAB/+AAAAf////8AAA/+AAAAf////+AAA/+AAAAf////+AAAf/AAAAf////8AAAf/AAAAf////8AAAP/AAAAf////8AAAP/AAAAf//4/4AAAH/gAAAf/8A/4AAAH/gAAAf+AA/4AAAH/gAAAf+AA/4AAAH/gAAAf+AA/4AAAH/gAAAf+AA/4AAAH/gAAAf+AA/4AAAH/gAAAf+AB/4AAAH/gAAAf+AB/4AAAH/gAAAf+AA/8AAAP/gAAAf+AA/8AAAP/AAAAf+AA/8AAAP/AAAAf+AA/+AAAf/AAAAf+AA/+AAA//AAAAf+AA//AAB/+AAAAf+AAf/gAD/+AAAAf+AAf/4Af/8AAAAf+AAf/////8AAAAf+AAP/////4AAAAf+AAP/////wAAAAf+AAH/////wAAAAf+AAD/////gAAAAf+AAD/////AAAAAf+AAB////+AAAAAf8AAA////8AAAAAf4AAAP///wAAAAAfgAAAH///AAAAAAAAAAAA//8AAAAAAAAAAAAH/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/4AAAAAAAAAAAB///AAAAAAAAAAAP///wAAAAAAAAAA////8AAAAAAAAAB////+AAAAAAAAAH/////AAAAAAAAAP/////gAAAAAAAA//////wAAAAAAAB//////4AAAAAAAH//////8AAAAAAAP//////8AAAAAAAf//+AP/+AAAAAAB///4AB/+AAAAAAD///wAA/+AAAAAAH///gAAf/AAAAAAf///AAAP/AAAAAA///+AAAP/AAAAAB///+AAAH/gAAAAH//3+AAAH/gAAAAP//v8AAAH/gAAAAf//P8AAAH/gAAAB//+P8AAAH/gAAAD//4f8AAAH/gAAAH//wf8AAAH/gAAAP//gf8AAAH/gAAAf//Af8AAAH/gAAAf/8Af+AAAH/gAAAf/4Af+AAAP/AAAAf/wAf+AAAP/AAAAf/gAf/AAAf/AAAAf/AAP/gAA//AAAAf8AAP/wAB/+AAAAf4AAP/4AD/+AAAAfwAAP//Af/8AAAAfgAAH/////8AAAAeAAAH/////4AAAAcAAAD/////4AAAAYAAAD/////wAAAAQAAAB/////gAAAAAAAAA/////AAAAAAAAAAf///+AAAAAAAAAAP///8AAAAAAAAAAD///wAAAAAAAAAAB///AAAAAAAAAAAAP/8AAAAAAAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf8AAAAAAAAAAAAAf+AAAAAAAAAAAAAf+AAAAAAAAAAAAAf+AAAAAAAAAAAAAf+AAAAAAAAAAAAAf+AAAAAAAABAAAAf+AAAAAAAAHAAAAf+AAAAAAAAfAAAAf+AAAAAAAB/AAAAf+AAAAAAAH/AAAAf+AAAAAAAf/AAAAf+AAAAAAB//AAAAf+AAAAAAH//AAAAf+AAAAAAf//AAAAf+AAAAAB///AAAAf+AAAAAH///AAAAf+AAAAAf///AAAAf+AAAAB///+AAAAf+AAAAH///8AAAAf+AAAAf///wAAAAf+AAAA////AAAAAf+AAAD///8AAAAAf+AAAP///wAAAAAf+AAA////AAAAAAf+AAD///8AAAAAAf+AAP///wAAAAAAf+AA////AAAAAAAf+AD///8AAAAAAAf+AP///wAAAAAAAf+A////AAAAAAAAf+D///8AAAAAAAAf+P///wAAAAAAAAf+f//+AAAAAAAAAf////4AAAAAAAAAf////gAAAAAAAAAf///+AAAAAAAAAAf///4AAAAAAAAAAf///gAAAAAAAAAAf//+AAAAAAAAAAAf//4AAAAAAAAAAAf//gAAAAAAAAAAAf/+AAAAAAAAAAAAf/4AAAAAAAAAAAAf/gAAAAAAAAAAAAf+AAAAAAAAAAAAAfgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAAAAAAAAB//gAAAAAAADwAAH//4AAAAAAA//AAf//8AAAAAAD//wA////AAAAAAP//4B////gAAAAAf//+B////wAAAAA////D////wAAAAB////H////4AAAAD////n////8AAAAH/////////8AAAAH/////////+AAAAP//////wP/+AAAAP//////AB/+AAAAf/wD//8AA//AAAAf/AA//4AAf/AAAAf+AAf/4AAP/AAAAf8AAP/wAAH/AAAA/8AAH/wAAH/gAAA/4AAH/gAAH/gAAA/4AAH/gAAD/gAAA/4AAD/gAAD/gAAA/4AAD/gAAD/gAAA/4AAD/gAAD/gAAA/4AAD/gAAD/gAAA/4AAD/gAAD/gAAA/4AAH/gAAH/gAAA/8AAH/wAAH/gAAAf8AAP/wAAH/gAAAf+AAP/wAAP/AAAAf/AAf/4AAf/AAAAf/wB//8AAf/AAAAP/////+AB//AAAAP//////wH/+AAAAH/////////+AAAAH/////////8AAAAD////n////8AAAAB////H////4AAAAA////D////wAAAAAf//+B////wAAAAAP//8B////gAAAAAH//wA////AAAAAAB//AAf//8AAAAAAAH4AAH//4AAAAAAAAAAAB//gAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/8AAAAAAAAAAAAf//AAAAAAAAAAAB///wAAAAAAAAAAH///4AAAAAAAAAAP///+AAAAAAAAAAf////AAAAAAAAAA/////AAAADAAAAB/////gAAAHAAAAD/////wAAAPAAAAH/////wAAAfAAAAH/////4AAB/AAAAP//A//4AAD/AAAAP/4AH/8AAH/AAAAf/gAD/8AAP/AAAAf/AAB/8AA//AAAAf+AAA/8AB//AAAAf+AAA/8AD//AAAA/8AAAf8AH//AAAA/8AAAf8Af//AAAA/8AAAf8A//+AAAA/8AAAf8B//+AAAA/8AAAf8D//8AAAA/8AAAf8P//wAAAA/8AAAf8f//gAAAA/8AAAf4//+AAAAA/8AAAf5//8AAAAA/8AAAf3//4AAAAAf+AAA////gAAAAAf+AAB////AAAAAAf/AAB///8AAAAAAf/gAD///4AAAAAAP/4AP///gAAAAAAP//B////AAAAAAAH//////+AAAAAAAH//////4AAAAAAAD//////wAAAAAAAB//////AAAAAAAAA/////+AAAAAAAAAf////4AAAAAAAAAP////wAAAAAAAAAH////AAAAAAAAAAB///8AAAAAAAAAAAf//gAAAAAAAAAAAB/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAD8AAAAAAAA/4AAAP+AAAAAAAB/8AAAf/AAAAAAAB/+AAAf/gAAAAAAD/+AAA//gAAAAAAD//AAA//wAAAAAAD//AAA//wAAAAAAD//AAA//wAAAAAAD//AAA//wAAAAAAD/+AAA//gAAAAAAB/+AAAf/gAAAAAAA/8AAAP/AAAAAAAAf4AAAH+AAAAAAAAHgAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"), 46, atob("FCM0NDQ0NDQ0NDQ0GA=="), 90+(scale<<8)+(1<<16));
}

var boot_img = require("heatshrink").decompress(atob("oFAwkEogA/AH4A/AH4A/AH4A/AE8AAAoeXoAfeDQUBmcyD7A+Dh///8QD649CiAfaHwUvD4sEHy0DDYIfEICg+Cn4fHICY+DD4nxcgojOHwgfEIAYfRCIQaDD4ZAFD5r7DH4//kAfRCIZ/GAAnwD5p9DX44fTHgYSBf4ofVDAQEBl4fFUAgfOXoQzBgIfFBAIfPP4RAEAoYAB+cRiK/SG4h/WIBAfXIA7CBAAswD55AHn6fUIBMCD65AHl4gCmcziAfQQJqfQQJpiDgk0IDXxQLRAEECaBM+QgRYRYgUIA0CD4ggSQJiDCiAKBICszAAswD55AHABKBVD7BAFABIqBD5pAFABPxD55AOD6BADiIAJQAyxLABwf/gaAPAH4A/AH4ARA=="));
var sunrise_img = require("heatshrink").decompress(atob("oFAwkEogA/AH4A/AH4A/AH4ACp5A/AH4A/AH4AIoEAggfcgAABD/4f/D/4f/CiNPmgfUoYIHoEAggfSoEQgYJGmAUJD5QJBgQ/IIBBKJChiVSCYR1LBZAzTICQyNICAxOICAwPD40xA4UTc5xAFiAuDiAWCAAMBc5hgHDxAgFeCKEDh//AAPwdiKDHh9PD4X0EAX0DyQ+BHoYgFh4+UDwofB/68OAAlBHw6CEQKITBDxAABMCReHUQhgSLxRgDDx9CD4g8DD4sUbqEUH5SABUB4fBDxYfKkQAFkEAiQJGAAcjgECBQ6qBAH4A9Y5wA/AH4Aw"));
var sunset_img = require("heatshrink").decompress(atob("oFAwkEogA/AH4A/AH4A/AH4A/AH4A/AH4AMoEAggfcgAABD/4f/D/4f/CqU0D6lDBA9AgEED6VAiEDBI0wChIfKBIMCH5BAIJRIUMSqQTCOpYLIGaZASGRpAQGJxAQGB4fGmIHCibnOIAsQFwcQCwQABgLnMMA4eIEArwRQgY0DAwwARC44gC+geSORJ8PHw4KTABFBGhRAT+AzLgEPLzZgUKRhgBDx9CD50UbqARMUCBROD5MiAAsggESBIwADkcAgQKHVQIA/AHrHOAH4A/AGA"));

var drawCount = 0;
var sideBar = 0;
var sunRise = "00:00";
var sunSet = "00:00";

function log_debug(o) {
  //console.log(o);
}

// requires the myLocation app
function loadLocation() {
  location = require("Storage").readJSON(LOCATION_FILE,1)||{"lat":51.5072,"lon":0.1276,"location":"London"};
}

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'bg': '#0f0', 'color': 'Green'};
}

function extractTime(d){
  var h = d.getHours(), m = d.getMinutes();
  return(("0"+h).substr(-2) + ":" + ("0"+m).substr(-2));
}

function updateSunRiseSunSet(lat, lon){
  // get today's sunlight times for lat/lon
  var times = SunCalc.getTimes(new Date(), lat, lon);

  // format sunrise time from the Date object
  sunRise = extractTime(times.sunrise);
  sunSet = extractTime(times.sunset);
}

// wrapper, makes it easier if we want to switch to a different font later
function setSmallFont() {
  g.setFont('Vector', 20);
}

// set the text color of the sidebar elements that dont change with the Theme
function setTextColor() {
  // day and steps
  if (settings.color == 'Blue' || settings.color == 'Red') {
    g.setColor('#fff'); // white on blue or red best contrast
  } else {
    g.setColor('#000'); // otherwise black regardless of theme
  }
}

const h = g.getHeight();
const w = g.getWidth();
const ha = 2*h/5 - 8;
const h2 = 3*h/5 - 10;
const h3 = 7*h/8;
const w2 = 9*w/14;
const w3 = w2 + ((w - w2)/2);  // centre line of the sidebar
const ws = w - w2; // sidebar width
const wb = 40; // battery width

function draw() {
  log_debug("draw()");
  let date = new Date();
  let da = date.toString().split(" ");
  let hh = da[4].substr(0,2);
  let mm = da[4].substr(3,2);
  //const t = 6;

  if (drawCount % 60 == 0)
    updateSunRiseSunSet(location.lat, location.lon);
  
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(0, 0, w2, h);
  g.setColor(settings.bg);
  g.fillRect(w2, 0, w, h);

  // time
  g.setColor(g.theme.fg);
  g.setFontKdamThmor();
  g.setFontAlign(0, -1);
  g.drawString(hh, w2/2, 10 + 0);
  g.drawString(mm, w2/2, 10 + h/2);

  switch(sideBar) {
  case 0:
    drawSideBar1();
    break;
  case 1:
    drawSideBar2();
    break;
  case 2:
    drawSideBar3();
    break;
  }
  
  drawCount++;
  queueDraw();
}

function drawSideBar1() {
  let date = new Date();
  let da = date.toString().split(" ");

  drawBattery(w2 + (w-w2-wb)/2,  h/10, wb, 17);

  setTextColor();
  g.setFont('Vector', 20);
  g.setFontAlign(0, -1);
  g.drawString(E.getBattery() + '%', w3,  (h/10) + 17 + 7);
  
  drawDateAndCalendar(w3, h/2, da[0], da[2], da[1]);
}

function drawSideBar2() {
  drawBattery(w2 + (w-w2-wb)/2,  h/10, wb, 17);

  setTextColor();
  g.setFont('Vector', 20);
  g.setFontAlign(0, -1);
  g.drawString(E.getBattery() + '%', w3,  (h/10) + 17 + 7);

  // steps
  g.drawImage(boot_img, w2 + (ws - 64)/2, h/2, { scale: 1 });
  setSmallFont();
  g.setFontAlign(0, -1);
  g.drawString(formatSteps(), w3, 7*h/8);
}

// sunrise, sunset times
function drawSideBar3() {
  g.setColor('#fff'); // sunrise white
  g.drawImage(sunrise_img, w2 + (ws - 64)/2, 0, { scale: 1 });
  setTextColor();
  setSmallFont();
  g.setFontAlign(0, -1);
  g.drawString(sunRise, w3, 64);

  g.setColor('#000'); // sunset black
  g.drawImage(sunset_img, w2 + (ws - 64)/2, h/2, { scale: 1 });
  setTextColor();
  setSmallFont();
  g.setFontAlign(0, -1);
  g.drawString(sunSet, w3, (h/2) + 64);
}

function drawDateAndCalendar(x,y,dy,dd,mm) {
  // day
  setTextColor();
  setSmallFont();
  g.setFontAlign(0, -1);
  g.drawString(dy.toUpperCase(), x, y);

  drawCalendar(x - (w/10), y + 28, w/5, 3, dd);

  // month
  setTextColor();
  setSmallFont();
  g.setFontAlign(0, -1);
  g.drawString(mm.toUpperCase(), x, y + 70);
}

// at x,y width:wi thicknes:th
function drawCalendar(x,y,wi,th,str) {
  g.setColor(g.theme.fg);
  g.fillRect(x, y, x + wi, y + wi);
  g.setColor(g.theme.bg);
  g.fillRect(x + th, y + th, x + wi - th, y + wi - th);
  g.setColor(g.theme.fg);

  let hook_t = 6;
  // first calendar hook, one third in
  g.fillRect(x + (wi/3) - (th/2), y - hook_t, x + wi/3 + th - (th/2), y + hook_t);
  // second calendar hook, two thirds in
  g.fillRect(x + (2*wi/3) -(th/2), y - hook_t, x + 2*wi/3 + th - (th/2), y + hook_t);

  setSmallFont();
  g.setFontAlign(0, 0);
  g.drawString(str, x + wi/2 + th/2, y + wi/2 + th/2);
}

function drawBattery(x,y,wi,hi) {
  g.reset();
  g.setColor(g.theme.fg);
  g.fillRect(x,y+2,x+wi-4,y+2+hi); // outer
  g.clearRect(x+2,y+2+2,x+wi-4-2,y+2+hi-2); // centre
  g.setColor(g.theme.fg);
  g.fillRect(x+wi-3,y+2+(((hi - 1)/2)-1),x+wi-2,y+2+(((hi - 1)/2)-1)+4); // contact
  g.fillRect(x+3, y+5, x +4 + E.getBattery()*(wi-12)/100, y+hi-1); // the level
}
  
function getSteps() {
  if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom.getSteps();
  }
  return '????';
}

// format steps so they fit in the place
function formatSteps() {
  var s = getSteps();

  if ( s == '????') {
    return s;
  } else if (s < 1000) {
    return s + '';
  } else if (s < 10000) {
    return '' + (s/1000).toFixed(1) + 'K';
  }
  return Math.floor(s / 1000) + 'K';
}

function nextSidebar() {
  if (++sideBar > 2) sideBar = 0;
  log_debug("next: " + sideBar);
}

function prevSidebar() {
  if (--sideBar < 0) sideBar = 2;
  log_debug("prev: " + sideBar);
}

Bangle.setUI("clockupdown", btn=> {
  if (btn<0) prevSidebar();
  if (btn>0) nextSidebar();
  draw();
});


// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    nextSidebar();
    draw();
  }, 60000 - (Date.now() % 60000));
}


log_debug("starting..");
g.clear();
Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 * so we will blank out the draw() functions of each widget and change the
 * area to the top bar doesn't get cleared.
 */
for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
loadSettings();
loadLocation();
draw();  // queues the next draw for a minutes time
