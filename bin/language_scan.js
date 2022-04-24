#!/usr/bin/env node
/* Scans for strings that may be in English in each app, and
outputs a list of strings that have been found.

See https://github.com/espruino/BangleApps/issues/1311
*/

var childProcess = require('child_process');

let refresh = false;

function handleCliParameters ()
{
    let usage = "USAGE: language_scan.js [options]";
    let die = function (message) {
        console.log(usage);
        console.log(message);
        process.exit(3);
    };
    let hadTURL = false,
        hadDEEPL = false;
    for(let i = 2; i < process.argv.length; i++)
    {
        const param = process.argv[i];
        switch(param)
        {
            case '-r':
            case '--refresh':
                refresh = true;
                break;
            case '--deepl':
                i++;
                let KEY = process.argv[i];
                if(KEY === '' || KEY === null || KEY === undefined)
                {
                    die('--deepl requires a parameter: the API key to use');
                }
                process.env.DEEPL = KEY;
                hadDEEPL = true;
                break;
            case '--turl':
                i++;
                let URL = process.argv[i];
                if(URL === '' || URL === null || URL === undefined)
                {
                    die('--turl requires a parameter: the URL to use');
                }
                process.env.TURL = URL;
                hadTURL = true;
                break;
            case '-h':
            case '--help':
                console.log(usage+"\n");
                console.log("Parameters:");
                console.log("  -h, --help       Output this help text and exit");
                console.log("  -r, --refresh    Auto-add new strings into lang/*.json");
                console.log('      --deepl KEY  Enable DEEPL as auto-translation engine and');
                console.log('                   use KEY as its API key. You also need to provide --turl');
                console.log('      --turl URL   In combination with --deepl, use URL as the API base URL');
                process.exit(0);
            default:
                die("Unknown parameter: "+param);
        }
    }
    if((hadTURL !== false || hadDEEPL !== false) && hadTURL !== hadDEEPL)
    {
        die("Use of deepl requires both a --deepl API key and --turl URL");
    }
}
handleCliParameters();

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
if (appsFile.indexOf("---") === 0 && fs.existsSync(BASEDIR+"bin/create_apps_json.sh"))
{
    console.log("apps.json has not been generated, running bin/create_apps_json.sh to build it...");
    childProcess.execFileSync(BASEDIR+'bin/create_apps_json.sh',[],{
        stdio: 'inherit'
    });
  appsFile = fs.readFileSync(BASEDIR+"apps.json").toString();
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
          } else if(refresh && !translate) {
            translationPromises.push(new Promise(async (resolve) => {
                translations.GLOBAL[translationItem.str] = translationItem.str;
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
