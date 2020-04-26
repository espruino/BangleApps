#!/usr/bin/nodejs
/* Minify app javascript files using terser: https://github.com/terser/terser
 *
 * Arguments: appIds to minify, defaults to all apps
 *            --clean to delete minified files
 *            --warn to show compressor warnings
 *            --verbose for verbose warnings
 * All storage files with a "*.js" url are minified into "-min.js", except when
 *   - evaluate=true
 *   - filename already ends in "-min.js"
 *   - storage already lists a corresponding  "-min.js" file
 *
 * Output: minified files per app, with percentage of original size
*/

const fs = require("fs"),
  Terser = require("terser");
const BASEDIR = __dirname+"/../";
const APPSDIR = BASEDIR+"apps/";
let options = {
  compress: {
    expression: true, // keep e.g. *.settings.js, which will be read into eval()
  },
};

function ERROR(s) {
  console.error("ERROR: "+s);
  process.exit(1);
}

function WARN(s) {
  console.warn("Warning: "+s);
}

let appsFile, apps;
try {
  appsFile = fs.readFileSync(BASEDIR+"apps.json");
} catch(e) {
  ERROR("apps.json not found");
}
try {
  apps = JSON.parse(appsFile);
} catch(e) {
  ERROR("apps.json not valid JSON");
}

// argv[0,1] = [<node>,<minify.js>]
let args = process.argv.slice(2);
const checkFlag = (flag) => {
  if (args.includes(flag)) {
    args.splice(args.indexOf(flag), 1);
    return true;
  }
  return false;
};
let clean = checkFlag("--clean");
options.warnings = checkFlag("--warn");
if (checkFlag("--verbose")) options.warnings = "verbose";
// other args are appIDs
if (args.length) {
  if (args.some(arg => !apps.some(app => app.id===arg))) {
    ERROR("Unknown app id: "+args.filter(arg => !apps.some(app => app.id===arg)).join(" "));
  }
  apps = apps.filter(app => args.includes(app.id));
}
// process apps alphabetically
apps = apps.sort((a, b) => a.id.localeCompare(b.id));

apps.forEach(app => {
  let first = true;
  app.storage.forEach((file) => {
    const appDir = APPSDIR+app.id+"/";
    if (file.evaluate) return;
    if (!file.url) return;
    const url = file.url,
      minUrl = url.replace(/\.js$/, "-min.js");
    if (!url.endsWith(".js")) return;
    if (url.endsWith("-min.js")) return; // why are you in "storage"?
    if (app.storage.includes(f => f.url===minUrl)) return; // don't overwrite files listed in "storage"
    const inputPath = appDir+url;
    const outputPath = appDir+minUrl;
    if (!fs.existsSync(inputPath)) ERROR(`"${inputPath}" not found`);
    if (clean && !fs.existsSync(outputPath)) return;
    if (first) {
      console.group(app.id);
      first = false;
    }
    if (clean) {
      console.info("delete", minUrl);
      fs.unlinkSync(outputPath);
      return;
    }

    const input = fs.readFileSync(inputPath, "utf8");
    const result = Terser.minify(input, options);
    if (result.error) {
      ERROR(`Failed to minify ${inputPath}: ${result.error}`);
    }
    const output = result.code;
    fs.writeFileSync(outputPath, output);

    const percent = Math.round(output.length/input.length*100);
    console.group(`${percent}%  ${url}`);
    if (result.warnings) {
      result.warnings.forEach(WARN);
    }
    console.groupEnd();
  });
  console.groupEnd();
});
