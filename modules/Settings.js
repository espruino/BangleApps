/*

Usage:

```
// open settings for an app
var appSettings = require('Settings').app(appname);
// read a single setting
value = appSettings.get(key, default);
// omit key to read all app settings
value = appSettings.get();
// write a single app setting
appSettings.set(key, value)
// omit key and pass an object as values to overwrite all settings for an app
appSettings.set(values)

// open Bangle settings
var globalSettings = require('Settings').Bangle();
value = globalSettings.get(key, default);
// read all global settings
values = globalSettings.get();
// write a global setting
globalSettings.set(key, value)
// overwrite all global settings
globalSettings.set(values)
```

For example:
```
var settings = require('Settings').app('test');
settings.set('foo', 123);  // writes to 'test.settings.json'
settings.set('bar', 456);  // updates 'test.settings.json'
// 'test.settings.json' now contains  {baz:123,bam:456}
baz = settings.get('foo');       // baz = 123
def = settings.get('jkl', 789);  // def = 789
all = settings.get();            // all = {foo: 123, bar: 456}
baz = settings.get('baz');       // baz = undefined

vibrate = require('Settings').Bangle().get('vibrate', true);
```

*/

/**
 *
 * @param{string} file Settings file
 * @param key Setting to get, omit to get all settings as object
 * @param def Default value
 * @return {*} Setting
 */
function get(file, key, def) {
  var s = require("Storage").readJSON(file);
  if (def===undefined && ["object", "undefined"].includes(typeof key)) {
    // get(file) or get(file, def): get all settings
    return (s!==undefined) ? s : key;
  }
  if (typeof s!=="object" || !(key in s)) {
    return def;
  }
  return s[key];
}

/**
 * @param {string} file Settings file
 * @param key Setting to change, omit to replace all settings
 * @param value Value to store
 */
function set(file, key, value) {
  if (value===undefined && typeof key==="object") {
    // set(file, value): overwrite settings completely
    require("Storage").writeJSON(file, key);
    return;
  }
  var s = require("Storage").readJSON(file,1);
  if (typeof s!=="object") {
    s = {};
  }
  s[key] = value;
  require("Storage").write(file, s);
}

/**
 * Open settings file
 *
 * @param {string} file Settings file
 * @return {object} Settings setter and getter
 */
function open(file) {
  return {
    set: (key, val) => set(file, key, val),
    get: (key, def) => get(file, key, def),
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
