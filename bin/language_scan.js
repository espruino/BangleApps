#!/usr/bin/nodejs
/* Scans for strings that may be in English in each app, and
outputs a list of strings that have been found.

See https://github.com/espruino/BangleApps/issues/1311
*/

var IGNORE_STRINGS = [
  "5x5",
  "5x9Numeric7Seg",
  "Vector"
];

var BASEDIR = __dirname+"/../";
Espruino = require(BASEDIR+"core/lib/espruinotools.js");
var fs = require("fs");
var APPSDIR = BASEDIR+"apps/";

function ERROR(s) {
  console.error("ERROR: "+s);
  process.exit(1);
}
function WARN(s) {
  console.log("Warning: "+s);
}
function log(s) {
  console.log(s);
}

var appsFile, apps;
try {
  appsFile = fs.readFileSync(BASEDIR+"apps.json").toString();
} catch (e) {
  ERROR("apps.json not found");
}
try{
  apps = JSON.parse(appsFile);
} catch (e) {
  ERROR("apps.json not valid JSON");
}

// Given a string value, work out if it's obviously not a text string
function isNotString(s) {
  if (s.length<2) return true; // too short
  if (s.length>40) return true; // too long
  if (s[0]=="#") return true; // a color
  if (s.endsWith(".json") || s.endsWith(".img")) return true; // a filename
  if (s.endsWith("=")) return true; // probably base64
  if (s.startsWith("BTN")) return true; // button name
  if (IGNORE_STRINGS.includes(s)) return true; // one we know to ignore
  return false;
}

// A string that *could* be translated?
var untranslatedStrings = [];
// Strings that are marked with 'LANG'
var translatedStrings = [];

console.log("Scanning apps...");
apps.forEach((app,appIdx) => {
  var appDir = APPSDIR+app.id+"/";
  app.storage.forEach((file) => {
    if (!file.url || !file.name.endsWith(".js")) return;
    var fileContents = fs.readFileSync(appDir+file.url).toString();
    var lex = Espruino.Core.Utils.getLexer(fileContents);
    var lastIdx = 0;
    var tok = lex.next();
    while (tok!==undefined) {
      var previousString = fileContents.substring(lastIdx, tok.startIdx);
      if (tok.type=="STRING") {
        if (previousString.includes("/*LANG*/")) { // translated!
          if (!translatedStrings.includes(tok.value))
            translatedStrings.push(tok.value);
        } else { // untranslated - potential to translate?
          if (!isNotString(tok.value)) {
            if (!untranslatedStrings.includes(tok.value))
              untranslatedStrings.push(tok.value);
          }
        }
      }
      lastIdx = tok.endIdx;
      tok = lex.next();
    }
  });
});
untranslatedStrings.sort();
translatedStrings.sort();

var report = "";
/* // too many! don't output these
log("Possible English Strings that could be translated");
log("=================================================================");
log("");
log("Add these to IGNORE_STRINGS if the don't make sense...");
log("");
log(untranslatedStrings.map(s=>JSON.stringify(s)).join(",\n"));*/
log("");

var languages = JSON.parse(fs.readFileSync(BASEDIR+"/lang/index.json").toString());
languages.forEach(language => {
  console.log("Scanning "+language.code);
  log(language.code);
  log("==========");
  var translations = JSON.parse(fs.readFileSync(BASEDIR+"/lang/"+language.url).toString());
  translatedStrings.forEach(str => {
    if (!translations.GLOBAL[str])
      console.log(`Missing translation for ${JSON.stringify(str)}`);
  });
  log("");
});
console.log("Done.");
