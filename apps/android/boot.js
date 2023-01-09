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
          title:event.name||/*LANG*/"Call", body:/*LANG*/"Incoming call\n"+event.number});
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
        if (!cal || !Array.isArray(cal)) cal = [];
        cal = cal.filter(e=>e.id!=event.id);
        require("Storage").writeJSON("android.calendar.json", cal);
      },
      //triggered by GB, send all ids
      "force_calendar_sync_start" : function() {
          var cal = require("Storage").readJSON("android.calendar.json",true);
          if (!cal || !Array.isArray(cal)) cal = [];
          gbSend({t:"force_calendar_sync", ids: cal.map(e=>e.id)});
      },
      "http":function() {
        //get the promise and call the promise resolve
        if (Bangle.httpRequest === undefined) return;
        var request=Bangle.httpRequest[event.id];
        if (request === undefined) return; //already timedout or wrong id
        delete Bangle.httpRequest[event.id];
        clearTimeout(request.t); //t = timeout variable
        if(event.err!==undefined) //if is error
          request.j(event.err); //r = reJect function
        else
          request.r(event); //r = resolve function
      },
      "gps": function() {
        const settings = require("Storage").readJSON("android.settings.json",1)||{};
        if (!settings.overwriteGps) return;
        delete event.t;
        event.satellites = NaN;
        event.course = NaN;
        event.fix = 1;
        if (event.long!==undefined) {
          event.lon = event.long;
          delete event.long;
        }
        Bangle.emit('GPS', event);
      },
      "is_gps_active": function() {
        gbSend({ t: "gps_power", status: Bangle._PWR && Bangle._PWR.GPS && Bangle._PWR.GPS.length>0 });
      }
    };
    var h = HANDLERS[event.t];
    if (h) h(); else console.log("GB Unknown",event);
  };
  // HTTP request handling - see the readme
  // options = {id,timeout,xpath}
  Bangle.http = (url,options)=>{
    options = options||{};
    if (!NRF.getSecurityStatus().connected)
      return Promise.reject(/*LANG*/"Not connected to Bluetooth");
    if (Bangle.httpRequest === undefined)
      Bangle.httpRequest={};
    if (options.id === undefined) {
      // try and create a unique ID
      do {
        options.id = Math.random().toString().substr(2);
      } while( Bangle.httpRequest[options.id]!==undefined);
    }
    //send the request
    var req = {t: "http", url:url, id:options.id};
    if (options.xpath) req.xpath = options.xpath;
    if (options.method) req.method = options.method;
    if (options.body) req.body = options.body;
    if (options.headers) req.headers = options.headers;
    gbSend(req);
    //create the promise
    var promise = new Promise(function(resolve,reject) {
      //save the resolve function in the dictionary and create a timeout (30 seconds default)
      Bangle.httpRequest[options.id]={r:resolve,j:reject,t:setTimeout(()=>{
        //if after "timeoutMillisec" it still hasn't answered -> reject
        delete Bangle.httpRequest[options.id];
        reject("Timeout");
      },options.timeout||30000)};
    });
    return promise;
  }

  // Battery monitor
  function sendBattery() { gbSend({ t: "status", bat: E.getBattery(), chg: Bangle.isCharging()?1:0 }); }
  NRF.on("connect", () => setTimeout(function() {
    sendBattery();
    GB({t:"force_calendar_sync_start"}); // send a list of our calendar entries to start off the sync process
  }, 2000));
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
  // GPS overwrite logic
  if (settings.overwriteGps) { // if the overwrite option is set../
    // Save current logic
    const originalSetGpsPower = Bangle.setGPSPower;
    // Replace set GPS power logic to suppress activation of gps (and instead request it from the phone)
    Bangle.setGPSPower = (isOn, appID) => {
      // if not connected, use old logic
      if (!NRF.getSecurityStatus().connected) return originalSetGpsPower(isOn, appID);
      // Emulate old GPS power logic
      if (!Bangle._PWR) Bangle._PWR={};
      if (!Bangle._PWR.GPS) Bangle._PWR.GPS=[];
      if (!appID) appID="?";
      if (isOn && !Bangle._PWR.GPS.includes(appID)) Bangle._PWR.GPS.push(appID);
      if (!isOn && Bangle._PWR.GPS.includes(appID)) Bangle._PWR.GPS.splice(Bangle._PWR.GPS.indexOf(appID),1);
      let pwr = Bangle._PWR.GPS.length>0;
      gbSend({ t: "gps_power", status: pwr });
      return pwr;
    }
    // Replace check if the GPS is on to check the _PWR variable
    Bangle.isGPSOn = () => {
      return Bangle._PWR && Bangle._PWR.GPS && Bangle._PWR.GPS.length>0;
    }
  }

  // remove settings object so it's not taking up RAM
  delete settings;
})();
