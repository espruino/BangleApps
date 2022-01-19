#!/usr/bin/nodejs
/* Merge all apps/metadata.json files into apps.local.json
*/

const fs = require("fs");

const BASEDIR = __dirname+"/../";
const APPSDIR = BASEDIR+"apps/";
const APPSFILE = "apps.local.json";
const APPSPATH = BASEDIR+ APPSFILE;

function ERROR(s) {
  console.error("ERROR: "+s);
  process.exit(1);
}
function INFO(s) {
  console.info(s);
}

const apps = [];
const dirs = fs.readdirSync(APPSDIR, {withFileTypes: true});
dirs.forEach(dir => {
  let appsFile;
  if (dir.name.startsWith("_example")) {
    return;
  }
  try {
    appsFile = fs.readFileSync(APPSDIR+dir.name+"/metadata.json").toString();
  } catch(e) {
    return;
  }
  try {
    apps.push(JSON.parse(appsFile));
  } catch(e) {
    console.log(e);
    const m = e.toString().match(/in JSON at position (\d+)/);
    if (m) {
      const char = parseInt(m[1]);
      console.log("===============================================");
      console.log("LINE "+appsFile.substr(0, char).split("\n").length);
      console.log("===============================================");
      console.log(appsFile.substr(char-10, 20));
      console.log("===============================================");
    }
    console.log(m);
    ERROR(dir.name+"/metadata.json not valid JSON");
  }
});
// order doesn't matter as the loader sorts apps, but sort by <sortorder,id> anyway
apps.sort((a, b) => ((0|a.sortorder)-(0|b.sortorder)) || a.id.localeCompare(b.id));
const json = JSON.stringify(apps, null, 2);
let update = false;
if (fs.existsSync(APPSPATH)) {
  const old = fs.readFileSync(APPSPATH).toString();
  if (old===json) {
    INFO(`${APPSFILE} is already up-to-date`);
    process.exit();
  }
  update = true;
}
fs.writeFileSync(APPSPATH, json);
INFO(`${update ? 'Updated' : 'Wrote'} ${APPSFILE}`);