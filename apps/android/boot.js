(function() {
  function gbSend(message) {
    Bluetooth.println("");
    Bluetooth.println(JSON.stringify(message));
  }
  var lastMsg;

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
      "notify" : function() {
        Object.assign(event,{t:"add",positive:true, negative:true});
        // Detect a weird GadgetBridge bug and fix it
        // For some reason SMS messages send two GB notifications, with different sets of info
        if (lastMsg && event.body == lastMsg.body && lastMsg.src == undefined && event.src == "Messages") {
          // Mutate the other message
          event.id = lastMsg.id;
        }
        lastMsg = event;
        require("messages").pushMessage(event);
      },
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
        var sched;
        try { sched = require("sched"); } catch (e) {}
        if (!sched) return; // alarms may not be installed
        var gbalarms = sched.getAlarms().filter(a=>a.appid=="gbalarms");
        for (var i = 0; i < gbalarms.length; i++)
          sched.setAlarm(gbalarms[i].id, undefined);
        var alarms = sched.getAlarms();
        var time = new Date();
        var currentTime = time.getHours() * 3600000 +
                          time.getMinutes() * 60000 +
                          time.getSeconds() * 1000;
        for (var j = 0; j < event.d.length; j++) {
          // prevents all alarms from going off at once??
          var dow = event.d[j].rep;
          if (!dow) dow = 127; //if no DOW selected, set alarm to all DOW
          var last = (event.d[j].h * 3600000 + event.d[j].m * 60000 < currentTime) ? (new Date()).getDate() : 0;
          var a = require("sched").newDefaultAlarm();
          a.id = "gb"+j;
          a.appid = "gbalarms";
          a.on = true;
          a.t = event.d[j].h * 3600000 + event.d[j].m * 60000;
          a.dow = ((dow&63)<<1) | (dow>>6); // Gadgetbridge sends DOW in a different format
          a.last = last;
          alarms.push(a);
        }
        sched.setAlarms(alarms);
        sched.reload();
      },
      //TODO perhaps move those in a library (like messages), used also for viewing events?
      //simple package with events all together
      "calendarevents" : function() {
        require("Storage").writeJSON("android.calendar.json", event.events);
      },
      //add and remove events based on activity on phone (pebble-like)
      "calendar" : function() {
        var cal = require("Storage").readJSON("android.calendar.json",true);
        if (!cal || !Array.isArray(cal)) cal = [];
        var i = cal.findIndex(e=>e.id==event.id);
        if(i<0)
          cal.push(event);
        else
          cal[i] = event;
        require("Storage").writeJSON("android.calendar.json", cal);
      },
      "calendar-" : function() {
        var cal = require("Storage").readJSON("android.calendar.json",true);
        //if any of those happen we are out of sync!
        if (!cal || !Array.isArray(cal)) return;
        cal = cal.filter(e=>e.id!=event.id);
        require("Storage").writeJSON("android.calendar.json", cal);
      },
      //triggered by GB, send all ids
      "force_calendar_sync_start" : function() {
          var cal = require("Storage").readJSON("android.calendar.json",true);
          if (!cal || !Array.isArray(cal)) cal = [];
          gbSend({t:"force_calendar_sync", ids: cal.map(e=>e.id)});
      }
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
