Bluetooth.println("");
Bluetooth.println(JSON.stringify({
  t:"intent", 
  target:"activity", 
  action:"android.intent.action.VOICE_COMMAND", 
  flags:["FLAG_ACTIVITY_NEW_TASK"]
}));

setTimeout(function() {
  Bangle.showClock();
}, 0);
