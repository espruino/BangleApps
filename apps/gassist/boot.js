// load settings
var settings = Object.assign({
  enableTap: true
}, require("Storage").readJSON("gassist.json", true) || {});

if (settings.enableTap) {
  Bangle.on("tap", function(e) {
    if (e.dir=="front" && e.double) {
      Bluetooth.println("");
      Bluetooth.println(JSON.stringify({
        t:"intent", 
        target:"activity", 
        action:"android.intent.action.VOICE_COMMAND", 
        flags:["FLAG_ACTIVITY_NEW_TASK"]
      }));
    }
  });
}

// clear variable
settings = undefined;