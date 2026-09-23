// Shared by the watch module and the App Loader configuration page.
var CoreTempMigration = (function () {
  function defaults() {
    return {
      enabled: true, alwaysOn: false, widget: true,
      customprofileonly: true, debugMode: false, antScanWindowSec: 5,
      settingsVersion: 1
    };
  }

  function normalize(settings, hrm) {
    var fresh = !settings;
    var next = Object.assign({}, defaults(), settings || {});
    var config = Object.assign({ selected: null, recent: [] }, hrm || {});
    config.recent = (Array.isArray(config.recent) ? config.recent : []).slice();
    if (!fresh && settings.widget === undefined) next.widget = false;
    if (!next.enabled) next.alwaysOn = false;
    if (!settings || !(settings.settingsVersion >= 1)) {
      var legacy = settings && settings.ANT_HRM;
      var packed = legacy && legacy.antId;
      if (typeof packed === "string" && /^\d+$/.test(packed)) packed = Number(packed);
      if (typeof packed === "number" && packed > 0 && packed <= 0xFFFFFF &&
          Math.floor(packed) === packed && (packed & 0xFFFF)) {
        var entry = { antId: packed & 0xFFFF, txType: (packed >> 16) & 255, transport: "ANT+" };
        // An explicit null in the new format is a deliberate cleared selection.
        if (!hrm || !Object.prototype.hasOwnProperty.call(hrm, "selected")) config.selected = entry;
        if (!config.recent.some(function (item) { return item && item.antId === entry.antId; })) {
          config.recent = config.recent.concat([entry]).slice(0, 5);
        }
      }
      next.settingsVersion = 1;
    }
    return { settings: next, hrm: config };
  }

  function run() {
    var storage = require("Storage");
    var settings = storage.readJSON("coretemp.json", 1);
    var hrm = storage.readJSON("coretemp.hrm.json", 1);
    var result = normalize(settings, hrm);
    function writeChanged(name, previous, next) {
      if (JSON.stringify(previous) === JSON.stringify(next)) return;
      if (storage.writeJSON(name, next) === false) throw new Error("Cannot migrate " + name);
    }
    // Commit the marker last so an interrupted migration can safely retry.
    writeChanged("coretemp.hrm.json", hrm, result.hrm);
    writeChanged("coretemp.json", settings, result.settings);
    return result.settings;
  }

  return { defaults: defaults, normalize: normalize, run: run };
})();

if (typeof exports !== "undefined") Object.assign(exports, CoreTempMigration);
