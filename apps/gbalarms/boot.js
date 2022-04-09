(function() {

//convert GB DOW format to sched DOW format
function convDow(x) {
  //if no DOW selected, set alarm to all DOW
  if (x == 0) x = 127;
  x = x.toString(2);
  for (var i = 0; x.length < 7; i++) {
    x = "0"+x;
  }
  x = x.slice(1, 7) + x.slice(0, 1);
  return "0b"+x;
}

global.GB = (event) => {
  if (event.t==="alarm") {
    var settings = require("Storage").readJSON("gbalarms.json", 1) || {};
    if (settings.rp == undefined) settings.rp = true;
    if (settings.as == undefined) settings.as = true;
    if (settings.vibrate == undefined) settings.vibrate = "..";
    require('Storage').writeJSON("gbalarms.json", settings);

    //wipe existing GB alarms
    var gbalarms = require("sched").getAlarms().filter(a=>a.appid=="gbalarms");
    for (i = 0; i < gbalarms.length; i++) {
      require("sched").setAlarm(gbalarms[i].id, undefined);
    }
    for (j = 0; j < event.d.length; j++) {
      var a = {
        id : "gb"+j,
        appid : "gbalarms",
        on : true,
        t : event.d[j].h * 3600000 + event.d[j].m * 60000,
        dow : convDow(event.d[j].rep),
        last : 0,
        rp : settings.rp,
        as : settings.as,
        vibrate : settings.vibrate
      };
      require("sched").setAlarm(a.id, a);
    }
  }
  require("sched").reload();
};

})();
