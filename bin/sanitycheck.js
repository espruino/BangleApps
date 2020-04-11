#!/usr/bin/nodejs
/* Checks for any obvious problems in apps.json
*/

var fs = require("fs");
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
  appsFile = fs.readFileSync(BASEDIR+"apps.json");
} catch (e) {
  ERROR("apps.json not found");
}
try{
  apps = JSON.parse(appsFile);
} catch (e) {
  ERROR("apps.json not valid JSON");
}

const APP_KEYS = [
  'id', 'name', 'shortName', 'version', 'icon', 'description', 'tags', 'type',
  'sortorder', 'readme', 'custom', 'interface', 'storage', 'allow_emulator',
];
const STORAGE_KEYS = ['name', 'url', 'content', 'evaluate'];

apps.forEach((app,appIdx) => {
  if (!app.id) ERROR(`App ${appIdx} has no id`);
  //console.log(`Checking ${app.id}...`);
  var appDir = APPSDIR+app.id+"/";
  if (!fs.existsSync(APPSDIR+app.id)) ERROR(`App ${app.id} has no directory`);
  if (!app.name) ERROR(`App ${app.id} has no name`);
  var isApp = !app.type || app.type=="app";
  if (app.name.length>20 && !app.shortName && isApp) ERROR(`App ${app.id} has a long name, but no shortName`);
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
  if (app.readme && !fs.existsSync(appDir+app.readme)) ERROR(`App ${app.id} README file doesn't exist`);
  if (app.custom && !fs.existsSync(appDir+app.custom)) ERROR(`App ${app.id} custom HTML doesn't exist`);
  if (app.interface && !fs.existsSync(appDir+app.interface)) ERROR(`App ${app.id} interface HTML doesn't exist`);
  var fileNames = [];
  app.storage.forEach((file) => {
    if (!file.name) ERROR(`App ${app.id} has a file with no name`);
    if (file.name.includes('?') || file.name.includes('*'))
      ERROR(`App ${app.id} storage file ${file.name} contains wildcards`);
    if (fileNames.includes(file.name))
      ERROR(`App ${app.id} file ${file.name} is a duplicate`);
    fileNames.push(file.name);
    if (file.url) if (!fs.existsSync(appDir+file.url)) ERROR(`App ${app.id} file ${file.url} doesn't exist`);
    if (!file.url && !file.content && !app.custom) ERROR(`App ${app.id} file ${file.name} has no contents`);
    var fileContents = "";
    if (file.content) fileContents = file.content;
    if (file.url) fileContents = fs.readFileSync(appDir+file.url).toString();
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
      if (!STORAGE_KEYS.includes(key)) ERROR(`App ${app.id}'s ${file.name} has unknown key ${key}`);
    }
  });
  let dataNames = [];
  (app.data||[]).forEach((data)=>{
    if (!data.name && !data.wildcard) ERROR(`App ${app.id} has a data file with no name`);
    if (dataNames.includes(data.name||data.wildcard))
      ERROR(`App ${app.id} data file ${data.name||data.wildcard} is a duplicate`);
    dataNames.push(data.name||data.wildcard)
    if ('name' in data && 'wildcard' in data)
      ERROR(`App ${app.id} data file ${data.name} has both name and wildcard`);
    if (data.name) {
      if (data.name.includes('?') || data.name.includes('*'))
        ERROR(`App ${app.id} data file name ${data.name} contains wildcards`);
    }
    if (data.wildcard) {
      if (!data.wildcard.includes('?') && !data.wildcard.includes('*'))
        ERROR(`App ${app.id} data file wildcard ${data.wildcard} does not actually contains wildcard`);
      if (data.wildcard.replace(/\?|\*/g,'') === '')
        ERROR(`App ${app.id} data file wildcard ${data.wildcard} does not contain regular characters`);
      else if (data.wildcard.replace(/\?|\*/g,'').length < 3)
        WARN(`App ${app.id} data file wildcard ${data.wildcard} is very broad`);
      else if (!data.wildcard.includes(app.id))
        WARN(`App ${app.id} data file wildcard ${data.wildcard} does not include app ID`);
    }
    if ('storageFile' in data && typeof data.storageFile !== 'boolean')
      ERROR(`App ${app.id} data file ${data.name||data.wildcard} has non-boolean value for "storageFile"`);
    for (const key in data) {
      if (!['name','wildcard','storageFile'].includes(key))
        ERROR(`App ${app.id} data file ${data.name||data.wildcard} has unknown property "${key}"`);
    }
  });
  if (fileNames.includes(app.id+".settings.js") && dataNames.length===1 && dataNames[0] === app.id+'.settings.json')
    WARN(`App ${app.id} has settings, so does not need to declare data file ${app.id+'.settings.json'}`)
  //console.log(fileNames);
  if (isApp && !fileNames.includes(app.id+".app.js")) ERROR(`App ${app.id} has no entrypoint`);
  if (isApp && !fileNames.includes(app.id+".img")) ERROR(`App ${app.id} has no JS icon`);
  if (app.type=="widget" && !fileNames.includes(app.id+".wid.js")) ERROR(`Widget ${app.id} has no entrypoint`);
  for (const key in app) {
    if (!APP_KEYS.includes(key)) ERROR(`App ${app.id} has unknown key ${key}`);
  }
});
