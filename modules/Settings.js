/*

Usage:

```
// read a single app setting
value = require('Settings').get(appname, key, default);
// omit key to read all app settings
value = require('Settings').get();
// write a single app setting
require('Settings').set(appname, key, value)
// omit key and pass an object as values to overwrite all settings
require('Settings').set(appname, values)

// read Bangle settings by passing the Bangle object instead of an app name
value = require('Settings').get(Bangle, key, default);
// read all global settings
values = require('Settings').get(Bangle);
// write a global setting
require('Settings').set(Bangle, key, value)
```

For example:
```
require('Settings').set('test', 'foo', 123);  // writes to 'test.settings.json'
require('Settings').set('test', 'bar', 456);  // updates 'test.settings.json'
// 'test.settings.json' now contains  {baz:123,bam:456}
baz = require('Settings').get('test', 'foo');       // baz = 123
def = require('Settings').get('test', 'jkl', 789);  // def = 789
all = require('Settings').get('test');              // all = {foo: 123, bar: 456}
baz = require('Settings').get('test', 'baz');       // baz = undefined

// read global setting
vibrate = require('Settings').get(Bangle, 'vibrate', true);

// Hint: if your app reads multiple settings, you can create a helper function:
function s(key, def){return require('Settings').get('myapp', key, def);}
var foo = s('foo setting', 'default value'), bar = s('bar setting');
```

*/

/**
 * Read setting value from file
 *
 * @param {string} file Settings file
 * @param {string} key  Setting to get, omit to get all settings as object
 * @param {*}      def  Default value
 * @return {*} Setting value (or default if not found)
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
 * Write setting value to file
 *
 * @param {string} file  Settings file
 * @param {string} key   Setting to change, omit to replace all settings
 * @param {*}      value Value to store
 */
function set(file, key, value) {
  if (value===undefined && typeof key==="object") {
    // set(file, value): overwrite settings completely
    require("Storage").writeJSON(file, key);
    return;
  }
  var s = require("Storage").readJSON(file, 1);
  if (typeof s!=="object") {
    s = {};
  }
  s[key] = value;
  require("Storage").write(file, s);
}

/**
 * Read setting value
 *
 * @param {string|object} app App name or Bangle
 * @param {string}        key Setting to get, omit to get all settings as object
 * @param {*}             def Default value
 * @return {*} Setting value (or default if not found)
 */
exports.get = function(app, key, def) {
  return get((app===Bangle) ? setting.json : app+".settings.json", key, def);
};

/**
 * Write setting value
 *
 * @param {string|object} app App name or Bangle
 * @param {string}        key Setting to change, omit to replace all settings
 * @param {*}             val Value to store
 */
exports.set = function(app, key, val) {
  set((app===Bangle) ? setting.json : app+".settings.json", key, val);
};
