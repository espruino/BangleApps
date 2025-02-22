#!/usr/bin/env node
/* Checks for any obvious problems in apps.json
*/

var BASEDIR = __dirname+"/../";
var APPSDIR_RELATIVE = "apps/";
var APPSDIR = BASEDIR + APPSDIR_RELATIVE;
var showAllErrors = process.argv.includes("--show-all");

if (process.argv.includes("--help")) {
  console.log(`BangleApps Sanity Check
------------------------

Checks apps in this repository for common issues that might
cause problems.

USAGE:

bin/sanitycheck.js
  - default, runs all tests (hides known errors)
bin/sanitycheck.js --show-all
  - show all warnings/errors (including known ones)
bin/sanitycheck.js --help
  - show this message
`);
  process.exit(0);
}


var fs = require("fs");
var vm = require("vm");
var heatshrink = require("../webtools/heatshrink");
/*var apploader = require("../core/lib/apploader.js");
apploader.init({
  DEVICEID : "BANGLEJS2"
});*/

var jsparse = (() => {
  var acorn;
  try {
    acorn = require("acorn");
  } catch (e) {
    console.log("=====================================================");
    console.log("  ACORN NOT FOUND");
    console.log("  ---------------");
    console.log("");
    console.log("  This means we won't sanity-check uploaded JSON");
    console.log("=====================================================");
    return str => {throw new Error("no acorn")};
  }

  return str => acorn.parse(str, { ecmaVersion: 2020 });
})();


var knownWarningCount = 0;
var knownErrorCount = 0;
var warningCount = 0;
var errorCount = 0;
var warningList = [];
var errorList = [];

function ERROR(msg, opt) {
  // file=app.js,line=1,col=5,endColumn=7
  opt = opt||{};
  errorList.push(msg);
  if (KNOWN_ERRORS.includes(msg)) {
    knownErrorCount++;
    if (!showAllErrors) return;
    msg += " (KNOWN)"
  }
  console.log(`::error${Object.keys(opt).length?" ":""}${Object.keys(opt).map(k=>k+"="+opt[k]).join(",")}::${msg}`);
  errorCount++;
}
function WARN(msg, opt) {
  // file=app.js,line=1,col=5,endColumn=7
  opt = opt||{};
  warningList.push(msg);
  if (KNOWN_WARNINGS.includes(msg)) {
    knownWarningCount++;
    if (!showAllErrors) return;
    msg += " (KNOWN)"
  }
  console.log(`::warning${Object.keys(opt).length?" ":""}${Object.keys(opt).map(k=>k+"="+opt[k]).join(",")}::${msg}`);
  warningCount++;
}
/* These are errors that we temporarily allow */
var KNOWN_ERRORS = [
  "In locale en_CA, long date output must be shorter than 15 characters (Wednesday, September 10, 2024 -> 29)",
  "In locale fr_FR, long date output must be shorter than 15 characters (10 septembre 2024 -> 17)",
  "In locale sv_SE, speed must be shorter than 5 characters",
  "In locale en_SE, long date output must be shorter than 15 characters (September 10 2024 -> 17)",
  "In locale en_NZ, long date output must be shorter than 15 characters (Wednesday, September 10, 2024 -> 29)",
  "In locale en_AU, long date output must be shorter than 15 characters (Wednesday, September 10, 2024 -> 29)",
  "In locale de_AT, long date output must be shorter than 15 characters (Donnerstag, 10. September 2024 -> 30)",
  "In locale en_IL, long date output must be shorter than 15 characters (Wednesday, September 10, 2024 -> 29)",
  "In locale es_ES, long date output must be shorter than 15 characters (miércoles, 10 de septiembre de 2024 -> 35)",
  "In locale fr_BE, long date output must be shorter than 15 characters (dimanche septembre 10 2024 -> 26)",
  "In locale fi_FI, long date output must be shorter than 15 characters (keskiviikkona 10. maaliskuuta 2024 -> 34)",
  "In locale fi_FI, short month must be shorter than 5 characters",
  "In locale de_CH, meridian must be shorter than 4 characters",
  "In locale de_CH, meridian must be shorter than 4 characters",
  "In locale de_CH, long date output must be shorter than 15 characters (Donnerstag, 10. September 2024 -> 30)",
  "In locale fr_CH, long date output must be shorter than 15 characters (dimanche 10 septembre 2024 -> 26)",
  "In locale wae_CH, long date output must be shorter than 15 characters (Sunntag, 10. Herbštmánet 2024 -> 29)",
  "In locale tr_TR, long date output must be shorter than 15 characters (10 Haziran 2024 Pazartesi -> 25)",
  "In locale hu_HU, long date output must be shorter than 15 characters (2024 Szep 10, Csütörtök -> 23)",
  "In locale oc_FR, long date output must be shorter than 15 characters (divendres 10 setembre de 2024 -> 29)",
  "In locale oc_FR, short month must be shorter than 5 characters",
  "In locale ca_ES, long date output must be shorter than 15 characters (10 setembre 2024 -> 16)",
];
/* These are warnings we know about but don't want in our output */
var KNOWN_WARNINGS = [
  "App gpsrec data file wildcard .gpsrc? does not include app ID",
  "App owmweather data file weather.json is also listed as data file for app weather",
  "App carcrazy has a setting file but no corresponding data entry (add `\"data\":[{\"name\":\"carcrazy.settings.json\"}]`)",
  "App loadingscreen has a setting file but no corresponding data entry (add `\"data\":[{\"name\":\"loadingscreen.settings.json\"}]`)",
  "App trex has a setting file but no corresponding data entry (add `\"data\":[{\"name\":\"trex.settings.json\"}]`)",
  "widhwt isn't an app (widget) but has an app.js file (widhwtapp.js)",
  `In locale it_CH, long time format might not work in some apps if it is not "%HH:%MM:%SS"`,
  `In locale it_IT, long time format might not work in some apps if it is not "%HH:%MM:%SS"`,
  `In locale wae_CH, long time format might not work in some apps if it is not "%HH:%MM:%SS"`,
  `In locale test, long time format might not work in some apps if it is not "%HH:%MM:%SS"`,
  `In locale wae_CH, short time format might not work in some apps if it is not "%HH:%MM"`,
  `In locale test, short time format might not work in some apps if it is not "%HH:%MM"`,
];

var apps = [];
var dirs = fs.readdirSync(APPSDIR, {withFileTypes: true});
dirs.forEach(dir => {
  var appsFile;
  if (dir.name.startsWith("_example") || !dir.isDirectory())
    return;
  try {
    appsFile = fs.readFileSync(APPSDIR+dir.name+"/metadata.json").toString();
  } catch (e) {
    ERROR(dir.name+"/metadata.json does not exist");
    return;
  }
  try{
    apps.push(JSON.parse(appsFile));
  } catch (e) {
    console.log(e);
    var m = e.toString().match(/in JSON at position (\d+)/);
    var messageInfo = {
      file : "apps/"+dir.name+"/metadata.json",
    };
    if (m) {
      var char = parseInt(m[1]);
      messageInfo.line = appsFile.substr(0,char).split("\n").length;
      console.log("===============================================");
      console.log("LINE "+messageInfo.line);
      console.log("===============================================");
      console.log(appsFile.substr(char-10, 20));
      console.log("===============================================");
    }
    console.log(m);
    ERROR(messageInfo.file+" not valid JSON", messageInfo);
  }
});

const APP_KEYS = [
  'id', 'name', 'shortName', 'version', 'icon', 'screenshots', 'description', 'tags', 'type',
  'sortorder', 'readme', 'custom', 'customConnect', 'interface', 'storage', 'data',
  'supports', 'allow_emulator',
  'dependencies', 'provides_modules', 'provides_widgets', 'provides_features', "default"
];
const STORAGE_KEYS = ['name', 'url', 'content', 'evaluate', 'noOverwite', 'supports', 'noOverwrite'];
const DATA_KEYS = ['name', 'wildcard', 'storageFile', 'url', 'content', 'evaluate'];
const SUPPORTS_DEVICES = ["BANGLEJS","BANGLEJS2"]; // device IDs allowed for 'supports'
const METADATA_TYPES = ["app","clock","widget","bootloader","RAM","launch","scheduler","notify","locale","settings","textinput","module","clkinfo","defaultconfig"]; // values allowed for "type" field - listed in README.md
const FORBIDDEN_FILE_NAME_CHARS = /[,;]/; // used as separators in appid.info
const VALID_DUPLICATES = [ '.tfmodel', '.tfnames' ];
const GRANDFATHERED_ICONS = ["s7clk",  "snek", "astral", "alpinenav", "slomoclock", "arrow", "pebble", "rebble"];
const INTERNAL_FILES_IN_APP_TYPE = { // list of app types and files they SHOULD provide...
  'textinput' : ['textinput'],
  // notify?
};

function globToRegex(pattern) {
  const ESCAPE = '.*+-?^${}()|[]\\';
  const regex = pattern.replace(/./g, c => {
    switch (c) {
      case '?': return '.';
      case '*': return '.*';
      default: return ESCAPE.includes(c) ? ('\\' + c) : c;
    }
  });
  return new RegExp('^'+regex+'$');
}
const isGlob = f => /[?*]/.test(f)
// All storage+data files in all apps: {app:<appid>,[file:<storage.name> | data:<data.name|data.wildcard>]}
let allFiles = [];
let existingApps = [];
let promise = Promise.resolve();
apps.forEach((app,appIdx) => {
  if (!app.id) ERROR(`App ${appIdx} has no id`);
  var appDirRelative = APPSDIR_RELATIVE+app.id+"/";
  var appDir = APPSDIR+app.id+"/";
  var metadataFile = appDirRelative+"metadata.json";
  if (existingApps.includes(app.id)) ERROR(`Duplicate app '${app.id}'`, {file:metadataFile});
  existingApps.push(app.id);
  //console.log(`Checking ${app.id}...`);

  if (!fs.existsSync(APPSDIR+app.id)) ERROR(`App ${app.id} has no directory`);
  if (!app.name) ERROR(`App ${app.id} has no name`, {file:metadataFile});
  var isApp = !app.type || app.type=="app";
  var appTags = app.tags ? app.tags.split(",") : [];
  if (appTags.some(tag => tag!=tag.trim()))
    WARN(`App ${app.id} 'tag' list contains whitespace ("${app.tags}")`, {file:metadataFile});
  if (appTags.some(tag => tag!=tag.toLowerCase()))
    WARN(`App ${app.id} 'tag' list contains uppercase ("${app.tags}")`, {file:metadataFile});
  if (app.name.length>20 && !app.shortName && isApp) ERROR(`App ${app.id} has a long name, but no shortName`, {file:metadataFile});
  if (app.type && !METADATA_TYPES.includes(app.type))
    ERROR(`App ${app.id} 'type' is one one of `+METADATA_TYPES, {file:metadataFile});
  if (!Array.isArray(app.supports)) ERROR(`App ${app.id} has no 'supports' field or it's not an array`, {file:metadataFile});
  else {
    app.supports.forEach(dev => {
      if (!SUPPORTS_DEVICES.includes(dev))
        ERROR(`App ${app.id} has unknown device in 'supports' field - ${dev}`, {file:metadataFile});
    });
  }

  if (!app.version) ERROR(`App ${app.id} has no version`, {file:metadataFile});
  else {
    if (!fs.existsSync(appDir+"ChangeLog")) {
      var invalidChangeLog = fs.readdirSync(appDir).find(f => f.toLowerCase().startsWith("changelog") && f!="ChangeLog");
      if (invalidChangeLog)
        ERROR(`App ${app.id} has wrongly named ChangeLog (${invalidChangeLog})`, {file:appDirRelative+invalidChangeLog});
      else if (app.version != "0.01")
        WARN(`App ${app.id} has no ChangeLog`, {file:metadataFile});
    } else {
      var changeLog = fs.readFileSync(appDir+"ChangeLog").toString();
      var versions = changeLog.match(/\d+\.\d+:/g);
      if (!versions) {
        ERROR(`No versions found in ${app.id} ChangeLog (${appDir}ChangeLog)`, {file:metadataFile});
      } else {
        var lastChangeLog = versions.pop().slice(0,-1);
        if (lastChangeLog != app.version)
          ERROR(`App ${app.id} app version (${app.version}) and ChangeLog (${lastChangeLog}) don't agree`, {file:appDirRelative+"ChangeLog", line:changeLog.split("\n").length-1});
      }
    }
  }
  if (!app.description) ERROR(`App ${app.id} has no description`, {file:metadataFile});
  if (!app.icon) ERROR(`App ${app.id} has no icon`, {file:metadataFile});
  if (!fs.existsSync(appDir+app.icon)) ERROR(`App ${app.id} icon doesn't exist`, {file:metadataFile});
  if (app.screenshots) {
    if (!Array.isArray(app.screenshots)) ERROR(`App ${app.id} screenshots is not an array`, {file:metadataFile});
    app.screenshots.forEach(screenshot => {
      if (!fs.existsSync(appDir+screenshot.url))
        ERROR(`App ${app.id} screenshot file ${screenshot.url} not found`, {file:metadataFile});
    });
  }
  if (app.readme) {
    if (!fs.existsSync(appDir+app.readme))
      ERROR(`App ${app.id} README file doesn't exist`, {file:metadataFile});
  } else {
    let readme = fs.readdirSync(appDir).find(f => f.toLowerCase().includes("readme"));
    if (readme)
      ERROR(`App ${app.id} has a README in the directory (${readme}) but it's not linked`, {file:metadataFile});
  }
  if (app.custom && !fs.existsSync(appDir+app.custom)) ERROR(`App ${app.id} custom HTML doesn't exist`, {file:metadataFile});
  if (app.customConnect && !app.custom) ERROR(`App ${app.id} has customConnect but no customn HTML`, {file:metadataFile});
  if (app.interface && !fs.existsSync(appDir+app.interface)) ERROR(`App ${app.id} interface HTML doesn't exist`, {file:metadataFile});
  if (app.dependencies) {
    if (app.dependencies.clock_info && !appTags.includes("clkinfo"))
      WARN(`App ${app.id} uses clock_info but doesn't have clkinfo tag`, {file:metadataFile});
    if (("object"==typeof app.dependencies) && !Array.isArray(app.dependencies)) {
      Object.keys(app.dependencies).forEach(dependency => {
        if (!["type","app","module","widget"].includes(app.dependencies[dependency]))
          ERROR(`App ${app.id} 'dependencies' must all be tagged 'type/app/module/widget' right now`, {file:metadataFile});
        if (app.dependencies[dependency]=="type" && !METADATA_TYPES.includes(dependency))
          ERROR(`App ${app.id} 'type' dependency must be one of `+METADATA_TYPES, {file:metadataFile});
      });
    } else
      ERROR(`App ${app.id} 'dependencies' must be an object`, {file:metadataFile});
  }

  if (app.storage.find(f=>f.name.endsWith(".clkinfo.js")) && !appTags.includes("clkinfo"))
    WARN(`App ${app.id} provides ...clkinfo.js but doesn't have clkinfo tag`, {file:metadataFile});
  var fileNames = [];
  app.storage.forEach((file) => {
    if (!file.name) ERROR(`App ${app.id} has a file with no name`, {file:metadataFile});
    if (isGlob(file.name)) ERROR(`App ${app.id} storage file ${file.name} contains wildcards`, {file:metadataFile});
    let char = file.name.match(FORBIDDEN_FILE_NAME_CHARS)
    if (char) ERROR(`App ${app.id} storage file ${file.name} contains invalid character "${char[0]}"`, {file:metadataFile})
    if (fileNames.includes(file.name) && !file.supports)  // assume that there aren't duplicates if 'supports' is set
      ERROR(`App ${app.id} file ${file.name} is a duplicate`, {file:metadataFile});
    if (file.supports && !Array.isArray(file.supports))
      ERROR(`App ${app.id} file ${file.name} supports field must be an array`, {file:metadataFile});
    if (file.supports)
      file.supports.forEach(dev => {
        if (!SUPPORTS_DEVICES.includes(dev))
          ERROR(`App ${app.id} file ${file.name} has unknown device in 'supports' field - ${dev}`, {file:metadataFile});
      });
    fileNames.push(file.name);
    var fileInternal = false;
    if (app.type && INTERNAL_FILES_IN_APP_TYPE[app.type]) {
      if (INTERNAL_FILES_IN_APP_TYPE[app.type].includes(file.name))
        fileInternal = true;
    }
    if (!app.type=="defaultconfig")
      allFiles.push({app: app.id, file: file.name, internal:fileInternal});
    if (file.url) if (!fs.existsSync(appDir+file.url)) ERROR(`App ${app.id} file ${file.url} doesn't exist`, {file:metadataFile});
    if (!file.url && !file.content && !app.custom) ERROR(`App ${app.id} file ${file.name} has no contents`, {file:metadataFile});
    var fileContents = "";
    if (file.content) fileContents = file.content;
    if (file.url) fileContents = fs.readFileSync(appDir+file.url).toString();
    if (file.supports && !Array.isArray(file.supports)) ERROR(`App ${app.id} file ${file.name} supports field is not an array`, {file:metadataFile});
    if (file.evaluate) {
      try {
        jsparse("("+fileContents+")");
      } catch(e) {
        console.log("=====================================================");
        console.log("  PARSE OF "+appDir+file.url+" failed.");
        console.log("");
        console.log(e);
        console.log("=====================================================");
        console.log(fileContents);
        console.log("=====================================================");
        ERROR(`App ${app.id}'s ${file.name} has evaluate:true but is not valid JS expression`, {file:appDirRelative+file.url});
      }
    }
    if (file.name.endsWith(".js")) {
      // TODO: actual lint?
      var ast;
      try {
        ast = jsparse(fileContents);
      } catch(e) {
        console.log("=====================================================");
        console.log("  PARSE OF "+appDir+file.url+" failed.");
        console.log("");
        console.log(e);
        console.log("=====================================================");
        console.log(fileContents);
        console.log("=====================================================");
        ERROR(`App ${app.id}'s ${file.name} is a JS file but isn't valid JS`, {file:appDirRelative+file.url});
      }
      // clock app checks
      if (app.type=="clock") {
        var a = fileContents.indexOf("Bangle.loadWidgets()");
        var b = fileContents.indexOf("Bangle.setUI(");
        if (a>=0 && b>=0 && a<b)
          WARN(`Clock ${app.id} file calls loadWidgets before setUI (clock widget/etc won't be aware a clock app is running)`, {file:appDirRelative+file.url, line : fileContents.substr(0,a).split("\n").length});
      }
      // if settings
      if (/\.settings?\.js$/.test(file.name)) {
        // suggest adding to datafiles
        if (!app.data || app.data.every(d => !d.name || !d.name.endsWith(".json"))) {
          WARN(`App ${app.id} has a setting file but no corresponding data entry (add \`"data":[{"name":"${app.id}.settings.json"}]\`)`, {file:appDirRelative+file.url});
        }
        // check for manual boolean formatter
        const m = fileContents.match(/format: *\(?\w*\)? *=>.*["'](yes|on)["']/i);
        if (m) {
          WARN(`Settings for ${app.id} has a boolean formatter - this is handled automatically, the line can be removed`, {file:appDirRelative+file.url, line: fileContents.substr(0, m.index).split("\n").length});
        }
      }
      // something that needs to be evaluated with 'eval(require("Storage").read(fn))'
      if (/\.clkinfo\.js$/.test(file.name) ||
          /\.settings\.js$/.test(file.name)) {
        if (!fileContents.trim().endsWith(")"))
          WARN(`App ${app.id} file ${file.name} should be evaluated as a function but doesn't end in ')'`, {file:appDirRelative+file.url});
      }
        if (/\.clkinfo\.js$/.test(file.name) ||
            /\.wid\.js$/.test(file.name)) {
        if (fileContents.indexOf("g.clear(")>=0 ||
            fileContents.indexOf("g.reset().clear()")>=0)
          ERROR(`App ${app.id} widget/clkinfo ${file.name} should never totally clear the screen`, {file:appDirRelative+file.url});
      }
    }
    for (const key in file) {
      if (!STORAGE_KEYS.includes(key)) ERROR(`App ${app.id} file ${file.name} has unknown key ${key}`, {file:appDirRelative+file.url});
    }
    // warn if JS icon is the wrong size
    if (file.name == app.id+".img" && file.evaluate) {
        let icon;
        let match = fileContents.match(/^\s*E\.toArrayBuffer\(atob\(\"([^"]*)\"\)\)\s*$/);
        if (match==null) match = fileContents.match(/^\s*atob\(\"([^"]*)\"\)\s*$/);
        if (match) icon = Buffer.from(match[1], 'base64');
        else {
          match = fileContents.match(/^\s*require\(\"heatshrink\"\)\.decompress\(\s*atob\(\s*\"([^"]*)\"\s*\)\s*\)\s*$/);
          if (match) icon = heatshrink.decompress(Buffer.from(match[1], 'base64'));
          else ERROR(`JS icon ${file.name} does not match the pattern 'require("heatshrink").decompress(atob("..."))'`, {file:appDirRelative+file.url});
        }
        if (match) {
          if (icon[0] > 48 || icon[0] < 24 || icon[1] > 48 || icon[1] < 24) {
            if (GRANDFATHERED_ICONS.includes(app.id)) WARN(`JS icon ${file.name} should be 48x48px (or slightly under) but is instead ${icon[0]}x${icon[1]}px`, {file:appDirRelative+file.url});
            else ERROR(`JS icon ${file.name} should be 48x48px (or slightly under) but is instead ${icon[0]}x${icon[1]}px`, {file:appDirRelative+file.url});
          }
        }
    }
  });
  let dataNames = [];
  (app.data||[]).forEach((data)=>{
    if (!data.name && !data.wildcard) ERROR(`App ${app.id} has a data file with no name`, {file:metadataFile});
    if (dataNames.includes(data.name||data.wildcard))
      ERROR(`App ${app.id} data file ${data.name||data.wildcard} is a duplicate`, {file:metadataFile});
    dataNames.push(data.name||data.wildcard)
    allFiles.push({app: app.id, data: (data.name||data.wildcard)});
    if ('name' in data && 'wildcard' in data)
      ERROR(`App ${app.id} data file ${data.name} has both name and wildcard`, {file:metadataFile});
    if (isGlob(data.name))
      ERROR(`App ${app.id} data file name ${data.name} contains wildcards`, {file:metadataFile});
    if (data.wildcard) {
      if (!isGlob(data.wildcard))
        ERROR(`App ${app.id} data file wildcard ${data.wildcard} does not actually contains wildcard`, {file:metadataFile});
      if (data.wildcard.replace(/\?|\*/g,'') === '')
        ERROR(`App ${app.id} data file wildcard ${data.wildcard} does not contain regular characters`, {file:metadataFile});
      else if (data.wildcard.replace(/\?|\*/g,'').length < 3)
        WARN(`App ${app.id} data file wildcard ${data.wildcard} is very broad`, {file:metadataFile});
      else if (!data.wildcard.includes(app.id))
        WARN(`App ${app.id} data file wildcard ${data.wildcard} does not include app ID`, {file:metadataFile});
    }
    let char = (data.name||data.wildcard).match(FORBIDDEN_FILE_NAME_CHARS)
    if (char) ERROR(`App ${app.id} data file ${data.name||data.wildcard} contains invalid character "${char[0]}"`, {file:metadataFile})
    if ('storageFile' in data && typeof data.storageFile !== 'boolean')
      ERROR(`App ${app.id} data file ${data.name||data.wildcard} has non-boolean value for "storageFile"`, {file:metadataFile});
    for (const key in data) {
      if (!DATA_KEYS.includes(key))
        ERROR(`App ${app.id} data file ${data.name||data.wildcard} has unknown property "${key}"`, {file:metadataFile});
    }
  });
  // prefer "appid.json" over "appid.settings.json" (TODO: change to ERROR once all apps comply?)
 /* if (dataNames.includes(app.id+".settings.json") && !dataNames.includes(app.id+".json"))
    WARN(`App ${app.id} uses data file ${app.id+'.settings.json'} instead of ${app.id+'.json'}`)
  else if (dataNames.includes(app.id+".settings.json"))
    WARN(`App ${app.id} uses data file ${app.id+'.settings.json'}`)*/
  // settings files should be listed under data, not storage (TODO: change to ERROR once all apps comply?)
  if (fileNames.includes(app.id+".settings.json"))
    WARN(`App ${app.id} uses storage file ${app.id+'.settings.json'} instead of data file`, {file:metadataFile})
  if (fileNames.includes(app.id+".json"))
    WARN(`App ${app.id} uses storage file ${app.id+'.json'} instead of data file`, {file:metadataFile})
  // warn if storage file matches data file of same app
  dataNames.forEach(dataName=>{
    const glob = globToRegex(dataName)
    fileNames.forEach(fileName=>{
      if (glob.test(fileName)) {
        if (isGlob(dataName)) WARN(`App ${app.id} storage file ${fileName} matches data wildcard ${dataName}`, {file:metadataFile})
        else WARN(`App ${app.id} storage file ${fileName} is also listed in data`, {file:metadataFile})
      }
    })
  })
  //console.log(fileNames);
  const filenamesIncludesApp = fileNames.includes(app.id+".app.js");
  if (isApp && !filenamesIncludesApp)
    ERROR(`App ${app.id} has no entrypoint`, {file:metadataFile});
  else if (!isApp && !["clock", "bootloader", "launch"].includes(app.type) && filenamesIncludesApp)
    WARN(`${app.id} isn't an app (${app.type}) but has an app.js file (${app.id+"app.js"})`, {file:metadataFile});
  if (isApp && !fileNames.includes(app.id+".img")) ERROR(`App ${app.id} has no JS icon`, {file:metadataFile});
  if (app.type=="widget" && !fileNames.includes(app.id+".wid.js")) ERROR(`Widget ${app.id} has no entrypoint`, {file:metadataFile});
  for (const key in app) {
    if (!APP_KEYS.includes(key)) ERROR(`App ${app.id} has unknown key ${key}`, {file:metadataFile});
  }
  if (app.type && INTERNAL_FILES_IN_APP_TYPE[app.type]) {
    INTERNAL_FILES_IN_APP_TYPE[app.type].forEach(fileName => {
      if (!fileNames.includes(fileName))
        ERROR(`App ${app.id} should include file named ${fileName} but it doesn't`, {file:metadataFile});
    });
  }
  if (app.type=="module" && !app.provides_modules) {
    ERROR(`App ${app.id} has type:module but it doesn't have a provides_modules field`, {file:metadataFile});
  }
  if (app.provides_modules) {
    app.provides_modules.forEach(modulename => {
      if (!app.storage.find(s=>s.name==modulename))
        ERROR(`App ${app.id} has provides_modules ${modulename} but it doesn't provide that filename`, {file:metadataFile});
    });
  }
  /*
  // We could try to create the files we need to upload for this app to check it all works ok...
  promise = promise.then(() => apploader.getAppFiles(app).then(files => {
    files.forEach(file => {
      if (/\.clkinfo?\.js$/.test(file.name) ||
          /\.settings?\.js$/.test(file.name)) {
        if (!file.content.startsWith("(")) {
          ERROR(`App ${app.id} file ${file.name} should evaluate to a simple fn and doesn't (starts: ${JSON.stringify(file.content.substr(0,30))})`, {file:appDirRelative+file.url});
        }
      }
    });
  }));*/
});


// Do not allow files from different apps to collide
let fileA

while(fileA=allFiles.pop()) {
  if (VALID_DUPLICATES.includes(fileA.file))
    break;
  const nameA = (fileA.file||fileA.data),
    globA = globToRegex(nameA),
    typeA = fileA.file?'storage':'data'
  allFiles.forEach(fileB => {
    const nameB = (fileB.file||fileB.data),
      globB = globToRegex(nameB),
      typeB = fileB.file?'storage':'data'
    if (globA.test(nameB)||globB.test(nameA)) {
      if (isGlob(nameA)||isGlob(nameB))
        ERROR(`App ${fileB.app} ${typeB} file ${nameB} matches app ${fileA.app} ${typeB} file ${nameA}`);
      else if (fileA.app != fileB.app && (!fileA.internal) && (!fileB.internal))
        WARN(`App ${fileB.app} ${typeB} file ${nameB} is also listed as ${typeA} file for app ${fileA.app}`, {file:APPSDIR_RELATIVE+fileB.app+"/metadata.json"});
    }
  })
}

// Check each locale in the `locale` app.
sanityCheckLocales();
function sanityCheckLocales(){
  const { CODEPAGE_CONVERSIONS } = require("../core/js/utils");
  const { checkLocales } = require("../apps/locale/sanitycheck");
  const localesCode = fs.readFileSync(__dirname+'/../apps/locale/locales.js', 'utf-8');
  vm.runInThisContext(localesCode);
  /* global locales, speedUnits, distanceUnits, codePages */

  const {errors, warnings} = checkLocales(locales, {speedUnits, distanceUnits, codePages, CODEPAGE_CONVERSIONS});

  const file = "locale/locales.js";
  for(const w of warnings){
    WARN(`In locale ${w.lang}, ${w.name} ${w.error}`, {file, value: w.value});
  }
  for(const e of errors){
    ERROR(`In locale ${e.lang}, ${e.name} ${e.error}`, {file, value: e.value});
  }
}

promise.then(function() {
  KNOWN_ERRORS.forEach(msg => {
    if (!errorList.includes(msg))
      WARN(`Known error '${msg}' no longer occurs`);
  });
  KNOWN_WARNINGS.forEach(msg => {
    if (!warningList.includes(msg))
      WARN(`Known warning '${msg}' no longer occurs`);
  });
  console.log("==================================");
  console.log(`${errorCount} errors, ${warningCount} warnings`);
  console.log(`${knownErrorCount} known errors, ${knownWarningCount} known warnings${(knownErrorCount||knownWarningCount)?", run with --show-all to see them":""}`);
  console.log("==================================");
  if (errorCount)  {
    process.exit(1);
  } else if ("CI" in process.env && warningCount) {
    console.log("Running in CI, raising an error from warnings");
    process.exit(1);
  }
});
