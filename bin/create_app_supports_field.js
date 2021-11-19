#!/usr/bin/nodejs
/* Quick hack to add proper 'supports' field to apps.json
*/

var fs = require("fs");

var BASEDIR = __dirname+"/../";

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

apps = apps.map((app,appIdx) => {
  if (app.supports) return app; // already sorted
  var tags = [];
  if (app.tags) tags = app.tags.split(",").map(t=>t.trim());
  var supportsB1 = true;
  var supportsB2 = false;
  if (tags.includes("b2")) {
    tags = tags.filter(x=>x!="b2");
    supportsB2 = true;
  }
  if (tags.includes("bno2")) {
    tags = tags.filter(x=>x!="bno2");
    supportsB2 = false;
  }
  if (tags.includes("bno1")) {
    tags = tags.filter(x=>x!="bno1");
    supportsB1 = false;
  }
  app.tags = tags.join(",");
  app.supports = [];
  if (supportsB1) app.supports.push("BANGLEJS");
  if (supportsB2) app.supports.push("BANGLEJS2");
  return app;
});

// search for screenshots
apps = apps.map((app,appIdx) => {
  if (app.screenshots) return app; // already sorted

  var files = require("fs").readdirSync(__dirname+"/../apps/"+app.id);
  var screenshots = files.filter(fn=>fn.startsWith("screenshot") && fn.endsWith(".png"));
  if (screenshots.length)
    app.screenshots = screenshots.map(fn => ({url:fn}));
  return app;
});

var KEY_ORDER = [
  "id","name","shortName","version","description","icon","screenshots","type","tags","supports",
  "dependencies", "readme", "custom", "customConnect", "interface",
  "allow_emulator", "storage", "data", "sortorder"
];

var JS = JSON.stringify;
var json = "[\n  "+apps.map(app=>{
  var keys = KEY_ORDER.filter(k=>k in app);
  Object.keys(app).forEach(k=>{
    if (!KEY_ORDER.includes(k))
      throw new Error(`Key named ${k} not known!`);
  });
  //var keys = Object.keys(app); // don't re-order

  return "{\n    "+keys.map(k=>{
    var js = JS(app[k]);
    if (k=="storage") {
      if (app.storage.length)
        js = "[\n      "+app.storage.map(s=>JS(s)).join(",\n      ")+"\n    ]";
      else
        js = "[]";
    }
    return JS(k)+": "+js;
  }).join(",\n    ")+"\n  }";
}).join(",\n  ")+"\n]\n";

//console.log(json);

console.log("new apps.json written");
fs.writeFileSync(BASEDIR+"apps.json", json);
