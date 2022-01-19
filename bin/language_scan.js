#!/usr/bin/nodejs
/* Scans for strings that may be in English in each app, and
outputs a list of strings that have been found.

See https://github.com/espruino/BangleApps/issues/1311
*/

var IGNORE_STRINGS = [
  "5x5","6x8","6x8:2","12x20","---","...",
  "5x9Numeric7Seg",
  "Vector",
  "sortorder","tl","tr"
];

var IGNORE_FUNCTION_PARAMS = [
  "read",
  "readJSON",
  "require",
  "setFont",
  "on",
  "RegExp",
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
function isNotString(s, wasFnCall) {
  // wasFnCall is set to the function name if 's' is the first argument to a function
  if (wasFnCall && IGNORE_FUNCTION_PARAMS.includes(wasFnCall)) return true;
  if (s=="Storage") console.log("isNotString",s,wasFnCall);

  if (s.length<2) return true; // too short
  if (s.length>40) return true; // too long
  if (s[0]=="#") return true; // a color
  if (s.endsWith(".json") || s.endsWith(".img")) return true; // a filename
  if (s.endsWith("=")) return true; // probably base64
  if (s.startsWith("BTN")) return true; // button name
  if (IGNORE_STRINGS.includes(s)) return true; // one we know to ignore
  return false;
}

function getTextFromString(s) {
  return s.replace(/^([.<>\- ]*)([^<>\!\?]*?)([.<>\!\?\- ]*)$/,"$2");
}

// A string that *could* be translated?
var untranslatedStrings = [];
// Strings that are marked with 'LANG'
var translatedStrings = [];

function addString(list, str, file) {
  str = getTextFromString(str);
  var entry = list.find(e => e.str==str);
  if (!entry) {
    entry = { str:str, uses:0, files : [] };
    list.push(entry);
  }
  entry.uses++;
  if (!entry.files.includes(file))
    entry.files.push(file)
}

console.log("Scanning apps...");
//apps = apps.filter(a=>a.id=="wid_edit");
apps.forEach((app,appIdx) => {
  var appDir = APPSDIR+app.id+"/";
  app.storage.forEach((file) => {
    if (!file.url || !file.name.endsWith(".js")) return;
    var filePath = appDir+file.url;
    var fileContents = fs.readFileSync(filePath).toString();
    var lex = Espruino.Core.Utils.getLexer(fileContents);
    var lastIdx = 0;
    var wasFnCall = undefined; // set to 'setFont' if we're at soemthing like setFont(".."
    var tok = lex.next();
    while (tok!==undefined) {
      var previousString = fileContents.substring(lastIdx, tok.startIdx);
      //console.log(wasFnCall,tok.type,tok.value);
      if (tok.type=="STRING") {
        if (previousString.includes("/*LANG*/")) { // translated!
          addString(translatedStrings, tok.value, filePath);
        } else { // untranslated - potential to translate?
          if (!isNotString(tok.value, wasFnCall)) {
            addString(untranslatedStrings, tok.value, filePath);
          }
        }
      } else if (tok.value!="(") wasFnCall=undefined;
      if (tok.type=="ID") wasFnCall=tok.value;
      lastIdx = tok.endIdx;
      tok = lex.next();
    }
  });
});
untranslatedStrings.sort((a,b)=>a.uses - b.uses);
translatedStrings.sort((a,b)=>a.uses - b.uses);
untranslatedStrings.filter(e => e.uses>2); // ignore individual uses

var report = "";
// too many! don't output these
log("Possible English Strings that could be translated");
log("=================================================================");
log("");
log("Add these to IGNORE_STRINGS if the don't make sense...");
log("");
log(untranslatedStrings.map(e=>`${JSON.stringify(e.str)} (${e.uses} uses)`).join("\n"));
log("");

var languages = JSON.parse(fs.readFileSync(BASEDIR+"/lang/index.json").toString());
languages.forEach(language => {
  if (language.code=="en_GB") {
    console.log("Ignoring "+language.code);
    return;
  }
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
