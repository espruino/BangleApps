/* Node.js library with utilities to handle using the app loader from node.js */

var DEVICEID = "BANGLEJS2";
var MINIFY = true; // minify JSON?
var BASE_DIR = __dirname + "/../..";
var APPSDIR = BASE_DIR+"/apps/";

//eval(require("fs").readFileSync(__dirname+"../core/js/utils.js"));
var Espruino = require(__dirname + "/../../core/lib/espruinotools.js");
//eval(require("fs").readFileSync(__dirname + "/../../core/lib/espruinotools.js").toString());
//eval(require("fs").readFileSync(__dirname + "/../../core/js/utils.js").toString());
var AppInfo = require(__dirname+"/../../core/js/appinfo.js");

var SETTINGS = {
  pretokenise : true
};
global.Const = {
  /* Are we only putting a single app on a device? If so
  apps should all be saved as .bootcde and we write info
  about the current app into app.info */
  SINGLE_APP_ONLY : false,
};

var apps = [];
var device = { id : DEVICEID, appsInstalled : [] };

// call with {DEVICEID:"BANGLEJS/BANGLEJS2"}
exports.init = function(options) {
  if (options.DEVICEID)
    DEVICEID = options.DEVICEID;
  // Load app metadata
  var dirs = require("fs").readdirSync(APPSDIR, {withFileTypes: true});
  dirs.forEach(dir => {
    var appsFile;
    if (dir.name.startsWith("_example") || !dir.isDirectory())
      return;
    try {
      appsFile = require("fs").readFileSync(APPSDIR+dir.name+"/metadata.json").toString();
    } catch (e) {
      ERROR(dir.name+"/metadata.json does not exist");
      return;
    }
    apps.push(JSON.parse(appsFile));
  });
};

exports.AppInfo = AppInfo;
exports.apps = apps;

// used by getAppFiles
function fileGetter(url) {
  url = BASE_DIR+"/"+url;
  console.log("Loading "+url)
  var data;
  if (MINIFY && url.endsWith(".json")) {
    var f = url.slice(0,-5);
    console.log("MINIFYING JSON "+f);
    var j = eval("("+require("fs").readFileSync(url).toString("binary")+")");
    data = JSON.stringify(j);
  } else {
    var blob = require("fs").readFileSync(url);
    if (url.endsWith(".js") || url.endsWith(".json"))
      data = blob.toString(); // allow JS/etc to be written in UTF-8
    else
      data = blob.toString("binary")
  }
  return Promise.resolve(data);
}

exports.getAppFiles = function(app) {
  var allFiles = [];
  var uploadOptions = {
    apps : apps,
    needsApp : app => {
      if (app.provides_modules) {
        if (!app.files) app.files="";
        app.files = app.files.split(",").concat(app.provides_modules).join(",");
      }
      return AppInfo.getFiles(app, {
        fileGetter:fileGetter,
        settings : SETTINGS,
        device : { id : DEVICEID }
      }).then(files => { allFiles = allFiles.concat(files); return app; });
    }
  };
  return AppInfo.checkDependencies(app, device, uploadOptions).then(() => AppInfo.getFiles(app, {
    fileGetter:fileGetter,
    settings : SETTINGS,
    device : device
  })).then(files => {
    allFiles = allFiles.concat(files);
    return allFiles;
  });
};

// Get all the files for this app as a string of Storage.write commands
exports.getAppFilesString = function(app) {
  return exports.getAppFiles(app).then(files => {
    return files.map(f=>f.cmd).join("\n")+"\n"
  })
};
