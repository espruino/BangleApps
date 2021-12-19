#!/usr/bin/nodejs
/* Checks for any obvious problems in apps.json
*/

var fs = require("fs");
var heatshrink = require("../core/lib/heatshrink");
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
}

var BASEDIR = __dirname+"/../";
var APPSDIR = BASEDIR+"apps/";
function ERROR(s) {
  console.error("ERROR: "+s);
  process.exit(1);
}
function WARN(s) {
  console.log("Warning: "+s);
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
  console.log(e);
  var m = e.toString().match(/in JSON at position (\d+)/);
  if (m) {
    var char = parseInt(m[1]);
    console.log("===============================================");
    console.log("LINE "+appsFile.substr(0,char).split("\n").length);
    console.log("===============================================");
    console.log(appsFile.substr(char-10, 20));
    console.log("===============================================");
  }
  console.log(m);
  ERROR("apps.json not valid JSON");

}

const APP_KEYS = [
  'id', 'name', 'shortName', 'version', 'icon', 'screenshots', 'description', 'tags', 'type',
  'sortorder', 'readme', 'custom', 'customConnect', 'interface', 'storage', 'data',
  'supports', 'allow_emulator',
  'dependencies'
];
const STORAGE_KEYS = ['name', 'url', 'content', 'evaluate', 'noOverwite', 'supports'];
const DATA_KEYS = ['name', 'wildcard', 'storageFile', 'url', 'content', 'evaluate'];
const FORBIDDEN_FILE_NAME_CHARS = /[,;]/; // used as separators in appid.info
const VALID_DUPLICATES = [ '.tfmodel', '.tfnames' ];
const GRANDFATHERED_ICONS = ["s7clk",  "snek", "astral", "alpinenav", "slomoclock", "arrow", "pebble", "rebble"];

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
apps.forEach((app,appIdx) => {
  if (!app.id) ERROR(`App ${appIdx} has no id`);
  //console.log(`Checking ${app.id}...`);
  var appDir = APPSDIR+app.id+"/";
  if (!fs.existsSync(APPSDIR+app.id)) ERROR(`App ${app.id} has no directory`);
  if (!app.name) ERROR(`App ${app.id} has no name`);
  var isApp = !app.type || app.type=="app";
  if (app.name.length>20 && !app.shortName && isApp) ERROR(`App ${app.id} has a long name, but no shortName`);
  if (!Array.isArray(app.supports)) ERROR(`App ${app.id} has no 'supports' field or it's not an array`);
  else {
    app.supports.forEach(dev => {
      if (!["BANGLEJS","BANGLEJS2"].includes(dev))
        ERROR(`App ${app.id} has unknown device in 'supports' field - ${dev}`);
    });
  }

  if (!app.version) WARN(`App ${app.id} has no version`);
  else {
    if (!fs.existsSync(appDir+"ChangeLog")) {
      if (app.version != "0.01")
        WARN(`App ${app.id} has no ChangeLog`);
    } else {
      var changeLog = fs.readFileSync(appDir+"ChangeLog").toString();
      var versions = changeLog.match(/\d+\.\d+:/g);
      if (!versions) ERROR(`No versions found in ${app.id} ChangeLog (${appDir}ChangeLog)`);
      var lastChangeLog = versions.pop().slice(0,-1);
      if (lastChangeLog != app.version)
        WARN(`App ${app.id} app version (${app.version}) and ChangeLog (${lastChangeLog}) don't agree`);
    }
  }
  if (!app.description) ERROR(`App ${app.id} has no description`);
  if (!app.icon) ERROR(`App ${app.id} has no icon`);
  if (!fs.existsSync(appDir+app.icon)) ERROR(`App ${app.id} icon doesn't exist`);
  if (app.screenshots) {
    if (!Array.isArray(app.screenshots)) ERROR(`App ${app.id} screenshots is not an array`);
    app.screenshots.forEach(screenshot => {
      if (!fs.existsSync(appDir+screenshot.url))
        ERROR(`App ${app.id} screenshot file ${screenshot.url} not found`);
    });
  }
  if (app.readme && !fs.existsSync(appDir+app.readme)) ERROR(`App ${app.id} README file doesn't exist`);
  if (app.custom && !fs.existsSync(appDir+app.custom)) ERROR(`App ${app.id} custom HTML doesn't exist`);
  if (app.customConnect && !app.custom) ERROR(`App ${app.id} has customConnect but no customn HTML`);
  if (app.interface && !fs.existsSync(appDir+app.interface)) ERROR(`App ${app.id} interface HTML doesn't exist`);
  if (app.dependencies) {
    if (("object"==typeof app.dependencies) && !Array.isArray(app.dependencies)) {
      Object.keys(app.dependencies).forEach(dependency => {
        if (!["type","app"].includes(app.dependencies[dependency]))
          ERROR(`App ${app.id} 'dependencies' must all be tagged 'type' or 'app' right now`);
      });
    } else
      ERROR(`App ${app.id} 'dependencies' must be an object`);
  }
  var fileNames = [];
  app.storage.forEach((file) => {
    if (!file.name) ERROR(`App ${app.id} has a file with no name`);
    if (isGlob(file.name)) ERROR(`App ${app.id} storage file ${file.name} contains wildcards`);
    let char = file.name.match(FORBIDDEN_FILE_NAME_CHARS)
    if (char) ERROR(`App ${app.id} storage file ${file.name} contains invalid character "${char[0]}"`)
    if (fileNames.includes(file.name) && !file.supports)  // assume that there aren't duplicates if 'supports' is set
      ERROR(`App ${app.id} file ${file.name} is a duplicate`);
    fileNames.push(file.name);
    allFiles.push({app: app.id, file: file.name});
    if (file.url) if (!fs.existsSync(appDir+file.url)) ERROR(`App ${app.id} file ${file.url} doesn't exist`);
    if (!file.url && !file.content && !app.custom) ERROR(`App ${app.id} file ${file.name} has no contents`);
    var fileContents = "";
    if (file.content) fileContents = file.content;
    if (file.url) fileContents = fs.readFileSync(appDir+file.url).toString();
    if (file.supports && !Array.isArray(file.supports)) ERROR(`App ${app.id} file ${file.name} supports field is not an array`);
    if (file.evaluate) {
      try {
        acorn.parse("("+fileContents+")");
      } catch(e) {
        console.log("=====================================================");
        console.log("  PARSE OF "+appDir+file.url+" failed.");
        console.log("");
        console.log(e);
        console.log("=====================================================");
        console.log(fileContents);
        console.log("=====================================================");
        ERROR(`App ${app.id}'s ${file.name} has evaluate:true but is not valid JS expression`);
      }
    }
    if (file.name.endsWith(".js")) {
      // TODO: actual lint?
      try {
        acorn.parse(fileContents);
      } catch(e) {
        console.log("=====================================================");
        console.log("  PARSE OF "+appDir+file.url+" failed.");
        console.log("");
        console.log(e);
        console.log("=====================================================");
        console.log(fileContents);
        console.log("=====================================================");
        ERROR(`App ${app.id}'s ${file.name} is a JS file but isn't valid JS`);
      }
    }
    for (const key in file) {
      if (!STORAGE_KEYS.includes(key)) ERROR(`App ${app.id} file ${file.name} has unknown key ${key}`);
    }
    // warn if JS icon is the wrong size
    if (file.name == app.id+".img") {
        let icon;
        let match = fileContents.match(/E\.toArrayBuffer\(atob\(\"([^"]*)\"\)\)/);
        if (match) icon = Buffer.from(match[1], 'base64');
        else {
          match = fileContents.match(/require\(\"heatshrink\"\)\.decompress\(\s*atob\(\s*\"([^"]*)\"\s*\)\s*\)/);
          if (match) icon = heatshrink.decompress(Buffer.from(match[1], 'base64'));
          else ERROR(`JS icon ${file.name} does not match the pattern 'require("heatshrink").decompress(atob("..."))'`);
        }
        if (match) {
          if (icon[0] > 48 || icon[0] < 24 || icon[1] > 48 || icon[1] < 24) {
            if (GRANDFATHERED_ICONS.includes(app.id)) WARN(`JS icon ${file.name} should be 48x48px (or slightly under) but is instead ${icon[0]}x${icon[1]}px`);
            else ERROR(`JS icon ${file.name} should be 48x48px (or slightly under) but is instead ${icon[0]}x${icon[1]}px`);
          }
        }
    }
  });
  let dataNames = [];
  (app.data||[]).forEach((data)=>{
    if (!data.name && !data.wildcard) ERROR(`App ${app.id} has a data file with no name`);
    if (dataNames.includes(data.name||data.wildcard))
      ERROR(`App ${app.id} data file ${data.name||data.wildcard} is a duplicate`);
    dataNames.push(data.name||data.wildcard)
    allFiles.push({app: app.id, data: (data.name||data.wildcard)});
    if ('name' in data && 'wildcard' in data)
      ERROR(`App ${app.id} data file ${data.name} has both name and wildcard`);
    if (isGlob(data.name))
      ERROR(`App ${app.id} data file name ${data.name} contains wildcards`);
    if (data.wildcard) {
      if (!isGlob(data.wildcard))
        ERROR(`App ${app.id} data file wildcard ${data.wildcard} does not actually contains wildcard`);
      if (data.wildcard.replace(/\?|\*/g,'') === '')
        ERROR(`App ${app.id} data file wildcard ${data.wildcard} does not contain regular characters`);
      else if (data.wildcard.replace(/\?|\*/g,'').length < 3)
        WARN(`App ${app.id} data file wildcard ${data.wildcard} is very broad`);
      else if (!data.wildcard.includes(app.id))
        WARN(`App ${app.id} data file wildcard ${data.wildcard} does not include app ID`);
    }
    let char = (data.name||data.wildcard).match(FORBIDDEN_FILE_NAME_CHARS)
    if (char) ERROR(`App ${app.id} data file ${data.name||data.wildcard} contains invalid character "${char[0]}"`)
    if ('storageFile' in data && typeof data.storageFile !== 'boolean')
      ERROR(`App ${app.id} data file ${data.name||data.wildcard} has non-boolean value for "storageFile"`);
    for (const key in data) {
      if (!DATA_KEYS.includes(key))
        ERROR(`App ${app.id} data file ${data.name||data.wildcard} has unknown property "${key}"`);
    }
  });
  // prefer "appid.json" over "appid.settings.json" (TODO: change to ERROR once all apps comply?)
 /* if (dataNames.includes(app.id+".settings.json") && !dataNames.includes(app.id+".json"))
    WARN(`App ${app.id} uses data file ${app.id+'.settings.json'} instead of ${app.id+'.json'}`)
  else if (dataNames.includes(app.id+".settings.json"))
    WARN(`App ${app.id} uses data file ${app.id+'.settings.json'}`)*/
  // settings files should be listed under data, not storage (TODO: change to ERROR once all apps comply?)
  if (fileNames.includes(app.id+".settings.json"))
    WARN(`App ${app.id} uses storage file ${app.id+'.settings.json'} instead of data file`)
  if (fileNames.includes(app.id+".json"))
    WARN(`App ${app.id} uses storage file ${app.id+'.json'} instead of data file`)
  // warn if storage file matches data file of same app
  dataNames.forEach(dataName=>{
    const glob = globToRegex(dataName)
    fileNames.forEach(fileName=>{
      if (glob.test(fileName)) {
        if (isGlob(dataName)) WARN(`App ${app.id} storage file ${fileName} matches data wildcard ${dataName}`)
        else WARN(`App ${app.id} storage file ${fileName} is also listed in data`)
      }
    })
  })
  //console.log(fileNames);
  if (isApp && !fileNames.includes(app.id+".app.js")) ERROR(`App ${app.id} has no entrypoint`);
  if (isApp && !fileNames.includes(app.id+".img")) ERROR(`App ${app.id} has no JS icon`);
  if (app.type=="widget" && !fileNames.includes(app.id+".wid.js")) ERROR(`Widget ${app.id} has no entrypoint`);
  for (const key in app) {
    if (!APP_KEYS.includes(key)) ERROR(`App ${app.id} has unknown key ${key}`);
  }
});
// Do not allow files from different apps to collide
let fileA
while(fileA=allFiles.pop()) {
  if (VALID_DUPLICATES.includes(fileA.file))
    return;
  const nameA = (fileA.file||fileA.data),
    globA = globToRegex(nameA),
    typeA = fileA.file?'storage':'data'
  allFiles.forEach(fileB => {
    const nameB = (fileB.file||fileB.data),
      globB = globToRegex(nameB),
      typeB = fileB.file?'storage':'data'
    if (globA.test(nameB)||globB.test(nameA)) {
      if (isGlob(nameA)||isGlob(nameB))
        ERROR(`App ${fileB.app} ${typeB} file ${nameB} matches app ${fileA.app} ${typeB} file ${nameA}`)
      else WARN(`App ${fileB.app} ${typeB} file ${nameB} is also listed as ${typeA} file for app ${fileA.app}`)
    }
  })
}
