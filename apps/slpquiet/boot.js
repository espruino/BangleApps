// first ensure that the sleeplog trigger object is available (sleeplog is enabled)
if (typeof (global.sleeplog || {}).trigger === "object") {
  // then add your parameters with the function to call as object into the trigger object

  global.sleeplog.trigger["quietMode"] = {
    onChange: true,   // false as default, if true call fn only on a status change
    from: 0,           // 0 as default, in ms, first time fn will be called
    //  to: 24*60*60*1000, // 24h as default, in ms, last time fn will be called
    to: 0,
    // reference time to from & to is rounded to full minutes
    fn: function (data, thisTriggerEntry) {
      let aSettings = require('Storage').readJSON('quietSwitch.json', 1) || {};
      const DEFAULTS = {
        'quietWhenSleep': false,
        'quietMode': 1
      };
      Object.keys(DEFAULTS).forEach(k => {
        if (aSettings[k] === undefined) aSettings[k] = DEFAULTS[k];
      });

      if (aSettings && aSettings['quietWhenSleep']) {
        console.log("the sleep status is: " + data.status);
        let quietMode = aSettings['quietMode'];
        delete aSettings;
        if ((data.status === 3 || data.status === 4)
          && (data.prevStatus !== 3 && data.prevStatus !== 4)) {
          let bSettings = require("Storage").readJSON('setting.json', true) || {};
          let current = 0 | bSettings.quiet;
          console.log("quiet mode is:" + current);
          if (current !== quietMode) {
            console.log("fallen asleep");
            bSettings.quiet = quietMode;
            require("Storage").writeJSON("setting.json", bSettings);
          }
          delete bSettings;
        }
        if ((data.status === 2 || data.status === 1)
          && (data.prevStatus !== 2 && data.prevStatus !== 1)) {
          let bSettings = require("Storage").readJSON('setting.json', true) || {};
          let current = 0 | bSettings.quiet;
          console.log("quiet mode is:" + current);
          if (current !== 0) {
            console.log("woken up");
            bSettings.quiet = 0;
            require("Storage").writeJSON("setting.json", bSettings);
          }
          delete bSettings;
        }
      }
    }
  };
}
