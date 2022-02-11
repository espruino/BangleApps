#!/usr/bin/nodejs
/* Scans for strings that may be in English in each app, and
outputs a list of strings that have been found.

See https://github.com/espruino/BangleApps/issues/1311
*/

let translate = false;
if (process.env.DEEPL) {
  // Requires translate
  // npm i translate
  translate = require("translate");
  translate.engine = "deepl"; // Or "yandex", "libre", "deepl"
  translate.key = process.env.DEEPL; // Requires API key (which are free)
  translate.url = process.env.TURL;
}

var IGNORE_STRINGS = [
  "5x5","6x8","6x8:2","4x6","12x20","6x15","5x9Numeric7Seg", "Vector", // fonts
  "---","...","*","##","00","GPS","ram",
  "12hour","rising","falling","title",
  "sortorder","tl","tr",
  "function","object", // typeof===
  "txt", // layout styles
  "play","stop","pause", "volumeup", "volumedown", // music state
  "${hours}:${minutes}:${seconds}", "${hours}:${minutes}",
  "BANGLEJS",
  "fgH", "bgH",  "m/s",
  "undefined", "kbmedia", "NONE",
];

var IGNORE_FUNCTION_PARAMS = [
  "read",
  "readJSON",
  "require",
  "setFont","setUI","setLCDMode",
  "on",
  "RegExp","sendCommand",
  "print","log"
];
var IGNORE_ARRAY_ACCESS = [
  "WIDGETS"
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
function isNotString(s, wasFnCall, wasArrayAccess) {
  if (s=="") return true;
  // wasFnCall is set to the function name if 's' is the first argument to a function
  if (wasFnCall && IGNORE_FUNCTION_PARAMS.includes(wasFnCall)) return true;
  if (wasArrayAccess && IGNORE_ARRAY_ACCESS.includes(wasArrayAccess)) return true;
  if (s=="Storage") console.log("isNotString",s,wasFnCall);

  if (s.length<3) return true; // too short
  if (s.length>40) return true; // too long
  if (s[0]=="#") return true; // a color
  if (s.endsWith('.log') || s.endsWith('.js') || s.endsWith(".info") || s.endsWith(".csv") || s.endsWith(".json") || s.endsWith(".img") || s.endsWith(".txt")) return true; // a filename
  if (s.endsWith("=")) return true; // probably base64
  if (s.startsWith("BTN")) return true; // button name
  if (IGNORE_STRINGS.includes(s)) return true; // one we know to ignore
  if (!isNaN(parseFloat(s)) && isFinite(s)) return true; //is number
  if (s.match(/^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/)) return true; //roman number
  if (!s.match(/.*[A-Z].*/i)) return true; // No letters
  if (s.match(/.*[0-9].*/i)) return true; // No letters
  if (s.match(/.*\(.*\).*/)) return true; // is function
  if (s.match(/[A-Za-z]+[A-Z]([A-Z]|[a-z])*/)) return true; // is camel case
  if (s.includes('_')) return true;
  return false;
}

function getTextFromString(s) {
  return s.replace(/^([.<>\-\n ]*)([^<>\!\?]*?)([.<>\!\?\-\n ]*)$/,"$2");
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
    var shortFilePath = "apps/"+app.id+"/"+file.url;
    var fileContents = fs.readFileSync(filePath).toString();
    var lex = Espruino.Core.Utils.getLexer(fileContents);
    var lastIdx = 0;
    var wasFnCall = undefined; // set to 'setFont' if we're at something like setFont(".."
    var wasArrayAccess = undefined; // set to 'WIDGETS' if we're at something like WIDGETS[".."
    var tok = lex.next();
    while (tok!==undefined) {
      var previousString = fileContents.substring(lastIdx, tok.startIdx);
      if (tok.type=="STRING") {
        if (previousString.includes("/*LANG*/")) { // translated!
          addString(translatedStrings, tok.value, shortFilePath);
        } else { // untranslated - potential to translate?
          // filter out numbers
          if (!isNotString(tok.value, wasFnCall, wasArrayAccess)) {
            addString(untranslatedStrings, tok.value, shortFilePath);
          }
        }
      } else {
        if (tok.value!="(") wasFnCall=undefined;
        if (tok.value!="[") wasArrayAccess=undefined;
      }
      //console.log(wasFnCall,tok.type,tok.value);
      if (tok.type=="ID") {
        wasFnCall = tok.value;
        wasArrayAccess = tok.value;
      }
      lastIdx = tok.endIdx;
      tok = lex.next();
    }
  });
});
untranslatedStrings.sort((a,b)=>a.uses - b.uses);
translatedStrings.sort((a,b)=>a.uses - b.uses);


/* 
 * @description Add lang to start of string
 * @param str string to add LANG to
 * @param file file that string is found
 * @returns void
 */
//TODO fix settings bug
function applyLANG(str, file) {
  fs.readFile(file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    const regex = new RegExp(`(.*)((?<!\/\*LANG\*\/)["|']${str}[^A-Z].*)`, 'gi');
    const result = data.replace(regex, '$1/*LANG*/$2');
    console.log(str, file);
    fs.writeFile(file, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
}

var report = "";

log("Translated Strings that are not tagged with LANG");
log("=================================================================");
log("");
log("Maybe we should add /*LANG*/ to these automatically?");
log("");
const wordsToAdd = untranslatedStrings.filter(e => translatedStrings.find(t=>t.str==e.str));

// Uncomment to add LANG to all strings
// THIS IS EXPERIMENTAL
//wordsToAdd.forEach(e => e.files.forEach(a => applyLANG(e.str, a)));

log(wordsToAdd.map(e=>`${JSON.stringify(e.str)} (${e.uses} uses)`).join("\n"));
log("");

//process.exit(1);
log("Possible English Strings that could be translated");
log("=================================================================");
log("");
log("Add these to IGNORE_STRINGS if they don't make sense...");
log("");
 // ignore ones only used once or twice
log(untranslatedStrings.filter(e => e.uses>2).filter(e => !translatedStrings.find(t=>t.str==e.str)).map(e=>`${JSON.stringify(e.str)} (${e.uses} uses)`).join("\n"));
log("");
//process.exit(1);

let languages = JSON.parse(fs.readFileSync(`${BASEDIR}/lang/index.json`).toString());
for (let language of languages) {
  if (language.code == "en_GB") {
    console.log(`Ignoring ${language.code}`);
    continue;
  }
  console.log(`Scanning ${language.code}`);
  log(language.code);
  log("==========");
  let translations = JSON.parse(fs.readFileSync(`${BASEDIR}/lang/${language.url}`).toString());
  let translationPromises = [];
  translatedStrings.forEach(translationItem => {
    if (!translations.GLOBAL[translationItem.str]) {
      console.log(`Missing GLOBAL translation for ${JSON.stringify(translationItem)}`);
      translationItem.files.forEach(file => {
        let m = file.match(/\/([a-zA-Z0-9_-]*)\//g);
        if (m && m[0]) {
          let appName = m[0].replaceAll("/", "");
          if (translations[appName] && translations[appName][translationItem.str]) {
            console.log(`     but LOCAL translation found in \"${appName}\"`);
          } else if (translate && language.code !== "tr_TR") { // Auto Translate
            translationPromises.push(new Promise(async (resolve) => {
                const translation = await translate(translationItem.str, language.code.split("_")[0]);
                console.log("Translating:", translationItem.str, translation);
                translations.GLOBAL[translationItem.str] = translation;
                resolve()
            }))
          }
        }
      });
    }
  });
  Promise.all(translationPromises).then(() => {
    fs.writeFileSync(`${BASEDIR}/lang/${language.url}`, JSON.stringify(translations, null, 4))
  });
  log("");
}
console.log("Done.");
