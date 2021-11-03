/*

Usage:

```
// open settings for an app
var appSettings = require('Settings').app(appname);
// read a single setting
value = appSettings.get(path, default);
// omit path to read all app settings
value = appSettings.get();
// write a single app setting
appSettings.set(path, value)
// omit path and pass an object as values to overwrite all settings for an app
appSettings.set(values)

// open Bangle settings
var globalSettings = require('Settings').Bangle();
value = globalSettings.get(path, default);
// read all global settings
values = globalSettings.get();
// write a global setting
globalSettings.set(path, value)
// overwrite all global settings
globalSettings.set(values)
```

For example:
```
var settings = require('Settings').app('test');
settings.set('foo.bar.baz', 123);  // writes to 'test.settings.json'
settings.set('foo.bar.bam', 456);  // updates 'test.settings.json'
// 'test.settings.json' now contains  {foo:{bar:{baz:123,bam:456}}}
baz = settings.get('foo.bar.baz');   // baz = 123
bar = settings.get('foo.bar');       // bar = {baz: 123, bam:456}
def = settings.get('asdf.jkl', 123); // def = 123
all = settings.get();                // all = {foo: { bar: {baz: 123, bam:456} } }

settings.set({fuz: 789});  // overwrites 'test.settings.json'
// 'test.settings.json' now contains  {fuz:789}
fuz = settings.get('fuz');          // fuz = 789
baz = settings.get('foo.bar.baz');  // baz = undefined

wakeOnTouch = require('Settings').Bangle().get('options.wakeOnTouch', false);
```

*/

/**
 *
 * @param{string} file Settings file
 * @param path Path to setting, omit to get complete settings object
 * @param def Default value
 * @return {*} Setting
 */
function get(file, path, def) {
  let setting = require("Storage").readJSON(file);
  if (def===undefined && ["object", "undefined"].includes(typeof path)) {
    // get(app) or get(app, def): get all settings
    def = path;
    path = [];
  } else {
    path = path.split(".");
  }
  if (path.includes("")) {
    throw "Settings: path cannot contain empty elements";
  }
  while(path.length) {
    const key = path.shift();
    if (typeof setting!=="object" || !(key in setting)) {
      return def;
    }
    setting = setting[key];
  }
  return setting;
}

/**
 * @param {string} file Settings file
 * @param path Path to setting, omit to replace all settings
 * @param value Value to store
 */
function set(file, path, value) {
  if (value===undefined && typeof path==="object") {
    // set(file, value): overwrite settings completely
    require("Storage").writeJSON(file, path);
    return;
  }
  path = path.split("."); // empty string is not OK (becomes [""])
  if (path.includes("")) {
    throw "Settings: path cannot contain empty elements";
  }
  let setting;
  try {setting = get(file);} catch(e) {} // if reading old settings failed we write a fresh object
  if (typeof setting!=="object") {
    setting = {};
  }
  let root = setting; // keep a reference to root object
  const leaf = path.pop();
  while(path.length) {
    const key = path.shift();
    if (!(key in setting) || typeof (setting[key])!=="object") {
      setting[key] = {};
    }
    setting = setting[key];
  }
  setting[leaf] = value;
  require("Storage").write(file, root);
}

/**
 * Open settings file
 *
 * @param {string} file Settings file
 * @return {object} Settings setter and getter
 */
function open(file) {
  return {
    set: (path, val) => set(file, path, val),
    get: (path, def) => get(file, path, def),
  };
}

/**
 * Open settings file directly
 * Please use require('Settings').app() or require('Settings').Bangle() instead
 *
 * @param {string} file Settings file to open
 * @return Settings object
 */
exports.open = open;

/**
 * Open app settings file
 *
 * @param {string} app App name for which to open settings
 * @return Settings object
 */
exports.app = (app) => open(app+".settings.json");
/**
 * Open global settings file
 *
 * @return Settings object
 */
exports.Bangle = () => open("setting.json");
