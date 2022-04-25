(function() {
  function gbSend(message) {
    Bluetooth.println("");
    Bluetooth.println(JSON.stringify(message));
  }

  function getCurrentTime() {
    var time = new Date();
    return (
      time.getHours() * 3600000 +
      time.getMinutes() * 60000 +
      time.getSeconds() * 1000
    );
  }

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

  var settings = require("Storage").readJSON("android.settings.json",1)||{};
  //default alarm settings
  if (settings.rp == undefined) settings.rp = true;
  if (settings.as == undefined) settings.as = true;
  if (settings.vibrate == undefined) settings.vibrate = "..";
  require('Storage').writeJSON("android.settings.json", settings);
  var _GB = global.GB;
  global.GB = (event) => {
    // feed a copy to other handlers if there were any
    if (_GB) setTimeout(_GB,0,Object.assign({},event));

    /* TODO: Call handling, fitness */
    var HANDLERS = {
      // {t:"notify",id:int, src,title,subject,body,sender,tel:string} add
      "notify" : function() { Object.assign(event,{t:"add",positive:true, negative:true});require("messages").pushMessage(event); },
      // {t:"notify~",id:int, title:string} // modified
      "notify~" : function() { event.t="modify";require("messages").pushMessage(event); },
      // {t:"notify-",id:int} // remove
      "notify-" : function() { event.t="remove";require("messages").pushMessage(event); },
      // {t:"find", n:bool} // find my phone
      "find" : function() {
        if (Bangle.findDeviceInterval) {
          clearInterval(Bangle.findDeviceInterval);
          delete Bangle.findDeviceInterval;
        }
        if (event.n) // Ignore quiet mode: we always want to find our watch
          Bangle.findDeviceInterval = setInterval(_=>Bangle.buzz(),1000);
      },
      // {t:"musicstate", state:"play/pause",position,shuffle,repeat}
      "musicstate" : function() {
        require("messages").pushMessage({t:"modify",id:"music",title:"Music",state:event.state});
      },
      // {t:"musicinfo", artist,album,track,dur,c(track count),n(track num}
      "musicinfo" : function() {
        require("messages").pushMessage(Object.assign(event, {t:"modify",id:"music",title:"Music"}));
      },
      // {"t":"call","cmd":"incoming/end","name":"Bob","number":"12421312"})
      "call" : function() {
        Object.assign(event, {
          t:event.cmd=="incoming"?"add":"remove",
          id:"call", src:"Phone",
          positive:true, negative:true,
          title:event.name||"Call", body:"Incoming call\n"+event.number});
        require("messages").pushMessage(event);
      },
      "alarm" : function() {
        //wipe existing GB alarms
        var gbalarms = require("sched").getAlarms().filter(a=>a.appid=="gbalarms");
        for (i = 0; i < gbalarms.length; i++) {
          require("sched").setAlarm(gbalarms[i].id, undefined);
        }
        var alarms = require("sched").getAlarms();
        for (j = 0; j < event.d.length; j++) {
          //prevents all alarms from going off at once??
          var last = (event.d[j].h * 3600000 + event.d[j].m * 60000 < getCurrentTime()) ? (new Date()).getDate() : 0;
          var a = {
            id : "gb"+j,
            appid : "gbalarms",
            on : true,
            t : event.d[j].h * 3600000 + event.d[j].m * 60000,
            dow : convDow(event.d[j].rep),
            last : last,
            rp : settings.rp,
            as : settings.as,
            vibrate : settings.vibrate
          };
          alarms.push(a);
        }
        require("sched").setAlarms(alarms);
        require("sched").reload();
      },
    };
    var h = HANDLERS[event.t];
    if (h) h(); else console.log("GB Unknown",event);
  };

  // Battery monitor
  function sendBattery() { gbSend({ t: "status", bat: E.getBattery(), chg: Bangle.isCharging()?1:0 }); }
  NRF.on("connect", () => setTimeout(sendBattery, 2000));
  Bangle.on("charging", sendBattery);
  if (!settings.keep)
    NRF.on("disconnect", () => require("messages").clearAll()); // remove all messages on disconnect
  setInterval(sendBattery, 10*60*1000);
  // Health tracking
  Bangle.on('health', health=>{
    gbSend({ t: "act", stp: health.steps, hrm: health.bpm });
  });
  // Music control
  Bangle.musicControl = cmd => {
    // play/pause/next/previous/volumeup/volumedown
    gbSend({ t: "music", n:cmd });
  };
  // Message response
  Bangle.messageResponse = (msg,response) => {
    if (msg.id=="call") return gbSend({ t: "call", n:response?"ACCEPT":"REJECT" });
    if (isFinite(msg.id)) return gbSend({ t: "notify", n:response?"OPEN":"DISMISS", id: msg.id });
    // error/warn here?
  };
  // remove settings object so it's not taking up RAM
  delete settings;
})();
