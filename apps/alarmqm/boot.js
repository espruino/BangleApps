(function () {
  function dismissAlarm(alarm) {
    // Run only for alarms, not timers
    if (!alarm.timer) {
      if ("qmsched" in WIDGETS) {
        require("qmsched").setMode(0);
      } else {
        // Code from qmsched.js, so we can work without it
        require("Storage").writeJSON(
          "setting.json",
          Object.assign(require("Storage").readJSON("setting.json", 1) || {}, {
            quiet: 0,
          })
          );
        }
      }
    }

    Bangle.on("alarmDismiss", dismissAlarm);
  })();