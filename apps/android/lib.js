exports.gbSend = function(message) {
  Bluetooth.println("");
  Bluetooth.println(JSON.stringify(message));
}
let lastMsg, // for music messages - may not be needed now...
    gpsState = {}, // keep information on GPS via Gadgetbridge
    settings = Object.assign({rp:true,as:true,vibrate:".."},
      require("Storage").readJSON("android.settings.json",1)||{}
    );

exports.gbHandler = (event) => {
  var HANDLERS = {
    // {t:"notify",id:int, src,title,subject,body,sender,tel:string} add
    "notify" : function() {
      print("notify",event);
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
    // {t:"audio", v:(percentage of max volume for android STREAM_MUSIC)}
    "audio" : function() {
      Bangle.emit("musicVolume", event.v);
    },
    // {"t":"call","cmd":"incoming/end/start/outgoing","name":"Bob","number":"12421312"})
    "call" : function() {
      Object.assign(event, {
        t:event.cmd=="incoming"?"add":"remove",
        id:"call", src:"Phone",
        positive:true, negative:true,
        title:event.name||/*LANG*/"Call", body:/*LANG*/"Incoming call\n"+event.number});
      require("messages").pushMessage(event);
    },
    "canned_responses_sync" : function() {
      require("Storage").writeJSON("replies.json", event.d);
    },
    // {"t":"alarm", "d":[{h:int,m:int,rep:int},... }
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
        var rp = false;
        if (!dow) {
          dow = 127; //if no DOW selected, set alarm to all DOW
        } else {
          rp = true;
        }
        var last = (event.d[j].h * 3600000 + event.d[j].m * 60000 < currentTime) ? (new Date()).getDate() : 0;
        var a = require("sched").newDefaultAlarm();
        a.id = "gb"+j;
        a.appid = "gbalarms";
        a.on = event.d[j].on !== undefined ? event.d[j].on : true;
        a.t = event.d[j].h * 3600000 + event.d[j].m * 60000;
        a.dow = ((dow&63)<<1) | (dow>>6); // Gadgetbridge sends DOW in a different format
        a.rp = rp;
        a.last = last;
        alarms.push(a);
      }
      sched.setAlarms(alarms);
      sched.reload();
    },
    //TODO perhaps move those in a library (like messages), used also for viewing events?
    //add and remove events based on activity on phone (pebble-like)
    // {t:"calendar", id:int, type:int, timestamp:seconds, durationInSeconds, title:string, description:string,location:string,calName:string.color:int,allDay:bool
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
    // {t:"calendar-", id:int}
    "calendar-" : function() {
      var cal = require("Storage").readJSON("android.calendar.json",true);
      //if any of those happen we are out of sync!
      if (!cal || !Array.isArray(cal)) cal = [];
      if (Array.isArray(event.id))
        cal = cal.filter(e=>!event.id.includes(e.id));
      else
        cal = cal.filter(e=>e.id!=event.id);
      require("Storage").writeJSON("android.calendar.json", cal);
    },
    //triggered by GB, send all ids
    // { t:"force_calendar_sync_start" }
    "force_calendar_sync_start" : function() {
        var cal = require("Storage").readJSON("android.calendar.json",true);
        if (!cal || !Array.isArray(cal)) cal = [];
        exports.gbSend({t:"force_calendar_sync", ids: cal.map(e=>e.id)});
    },
    // {t:"http",resp:"......",[id:"..."]}
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
    // {t:"gps", lat, lon, alt, speed, course, time, satellites, hdop, externalSource:true }
    "gps": function() {
      if (!settings.overwriteGps) return;
      // modify event for using it as Bangle GPS event
      delete event.t;
      if (!isFinite(event.satellites)) event.satellites = NaN;
      if (!isFinite(event.course)) event.course = NaN;
      event.fix = 1;
      if (event.long!==undefined) { // for earlier Gadgetbridge implementations
        event.lon = event.long;
        delete event.long;
      }
      if (event.time){
        event.time = new Date(event.time);
      }

      if (!gpsState.lastGPSEvent) {
        // this is the first event, save time of arrival and deactivate internal GPS
        Bangle.moveGPSPower(0);
      } else {
        // this is the second event, store the intervall for expecting the next GPS event
        gpsState.interval = Date.now() - gpsState.lastGPSEvent;
      }
      gpsState.lastGPSEvent = Date.now();
      // in any case, cleanup the GPS state in case no new events arrive
      if (gpsState.timeoutGPS) clearTimeout(gpsState.timeoutGPS);
      gpsState.timeoutGPS = setTimeout(()=>{
        // reset state
        gpsState.lastGPSEvent = undefined;
        gpsState.timeoutGPS = undefined;
        gpsState.interval = undefined;
        // did not get an expected GPS event but have GPS clients, switch back to internal GPS
        if (Bangle.isGPSOn()) Bangle.moveGPSPower(1);
      }, (gpsState.interval || 10000) + 1000);
      Bangle.emit('GPS', event);
    },
    // {t:"is_gps_active"}
    "is_gps_active": function() {
      exports.gbSend({ t: "gps_power", status: Bangle.isGPSOn() });
    },
    // {t:"act", hrm:bool, stp:bool, int:int}
    "act": function() {
      if (exports.actInterval) clearInterval(exports.actInterval);
      exports.actInterval = undefined;
      if (exports.actHRMHandler)
        exports.actHRMHandler = undefined;
      Bangle.setHRMPower(event.hrm,"androidact");
      if (!(event.hrm || event.stp)) return;
      if (!isFinite(event.int)) event.int=1;
      var lastSteps = Bangle.getStepCount();
      var lastBPM = 0;
      exports.actHRMHandler = function(e) {
        lastBPM = e.bpm;
      };
      Bangle.on('HRM',exports.actHRMHandler);
      exports.actInterval = setInterval(function() {
        var steps = Bangle.getStepCount();
        exports.gbSend({ t: "act", stp: steps-lastSteps, hrm: lastBPM, rt:1 });
        lastSteps = steps;
      }, event.int*1000);
    },
    // {t:"actfetch", ts:long}
    "actfetch": function() {
      exports.gbSend({t: "actfetch", state: "start"});
      var actCount = 0;
      var actCb = function(r) {
        // The health lib saves the samples at the start of the 10-minute block
        // However, GB expects them at the end of the block, so let's offset them
        // here to keep a consistent API in the health lib
        var sampleTs = r.date.getTime() + 600000;
        if (sampleTs >= event.ts) {
          exports.gbSend({
            t: "act",
            ts: sampleTs,
            stp: r.steps,
            hrm: r.bpm,
            mov: r.movement,
            act: r.activity
          });
          actCount++;
        }
      }
      if (event.ts != 0) {
        require("health").readAllRecordsSince(new Date(event.ts - 600000), actCb);
      } else {
        require("health").readFullDatabase(actCb);
      }
      exports.gbSend({t: "actfetch", state: "end", count: actCount});
    },
    //{t:"listRecs", id:"20230616a"}
    "listRecs": function() {
      let recs = require("Storage").list(/^recorder\.log.*\.csv$/,{sf:true}).map(s => s.slice(12, 21)).filter(s => s.length>7 /*ignore 'old' tracks without date*/);
      if (event.id && event.id.length > 2) { // Handle if there was no id supplied. Then we send a list all available recorder logs back.
        let firstNonsyncedIdx = recs.findIndex((logId) => logId > event.id);
        if (-1 == firstNonsyncedIdx) {
          recs = []
        } else {
          recs = recs.slice(firstNonsyncedIdx);
        }
      }
      exports.gbSend({t:"actTrksList", list: recs}); // TODO: split up in multiple transmissions?
    },
    //{t:"fetchRec", id:"20230616a"}
    "fetchRec": function() {
      // TODO: Decide on what names keys should have.
      if (exports.fetchRecInterval) {
        clearInterval(exports.fetchRecInterval);
        exports.fetchRecInterval = undefined;
      }
      if (event.id=="stop") {
        return;
      } else {
        let log = require("Storage").open("recorder.log"+event.id+".csv","r");
        let lines = "init";// = log.readLine();
        let pkgcnt = 0;
        exports.gbSend({t:"actTrk", log:event.id, lines:"erase", cnt:pkgcnt}); // "erase" will prompt Gadgetbridge to erase the contents of a already fetched log so we can rewrite it without keeping lines from the previous (probably failed) fetch.
        let sendlines = ()=>{
          lines = log.readLine();
          for (var i = 0; i < 3; i++) {
            let line = log.readLine();
            if (line) lines += line;
          }
          pkgcnt++;
          exports.gbSend({t:"actTrk", log:event.id, lines:lines, cnt:pkgcnt});
          if (!lines && exports.fetchRecInterval) {
            clearInterval(exports.fetchRecInterval);
            exports.fetchRecInterval = undefined;
          }
        };
        exports.fetchRecInterval = setInterval(sendlines, 50);
      }
    },
    "nav": function() {
      event.id="nav";
      if (event.instr) {
        event.t="add";
        event.src="maps"; // for the icon
        event.title="Navigation";
        if (require("messages").getMessages().find(m=>m.id=="nav"))
          event.t = "modify";
      } else {
        event.t="remove";
      }
      require("messages").pushMessage(event);
    },
    "cards" : function() {
      // we receive all, just override what we have
      if (Array.isArray(event.d))
        require("Storage").writeJSON("android.cards.json", event.d);
    },
    "accelsender": function () {
      require("Storage").writeJSON("accelsender.json", {enabled: event.enable, interval: event.interval});
      load();
    }
  };
  var h = HANDLERS[event.t];
  if (h) h(); else console.log("GB Unknown",event);
};

// HTTP request handling - see the readme
// options = {id,timeout,xpath}
exports.httpHandler = (url,options) => {
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
  if (options.return) req.return = options.return; // for xpath
  if (options.method) req.method = options.method;
  if (options.body) req.body = options.body;
  if (options.headers) req.headers = options.headers;
  req.timeout = options.timeout || 30000;
  exports.gbSend(req);
  //create the promise
  var promise = new Promise(function(resolve,reject) {
    //save the resolve function in the dictionary and create a timeout (30 seconds default)
    Bangle.httpRequest[options.id]={r:resolve,j:reject,t:setTimeout(()=>{
      //if after "timeoutMillisec" it still hasn't answered -> reject
      delete Bangle.httpRequest[options.id];
      reject("Timeout");
    },req.timeout+500)};
  });
  return promise;
};

exports.overwriteGPS = () => { // if the overwrite option is set, call this on init..
  const origSetGPSPower = Bangle.setGPSPower;
  Bangle.moveGPSPower = (state) => {
    if (Bangle.isGPSOn()){
      let orig = Bangle._PWR.GPS;
      delete Bangle._PWR.GPS;
      origSetGPSPower(state);
      Bangle._PWR.GPS = orig;
    }
  };

  // work around Serial1 for GPS not working when connected to something
  let serialTimeout;
  let wrap = function(f){
    return (s)=>{
      if (serialTimeout) clearTimeout(serialTimeout);
      origSetGPSPower(1, "androidgpsserial");
      f(s);
      serialTimeout = setTimeout(()=>{
        serialTimeout = undefined;
        origSetGPSPower(0, "androidgpsserial");
      }, 10000);
    };
  };
  Serial1.println = wrap(Serial1.println);
  Serial1.write = wrap(Serial1.write);

  // replace set GPS power logic to suppress activation of gps (and instead request it from the phone)
  Bangle.setGPSPower = ((isOn, appID) => {
    let pwr;
    if (!this.lastGPSEvent){
      // use internal GPS power function if no gps event has arrived from GadgetBridge
      pwr = origSetGPSPower(isOn, appID);
    } else {
      // we are currently expecting the next GPS event from GadgetBridge, keep track of GPS state per app
      if (!Bangle._PWR) Bangle._PWR={};
      if (!Bangle._PWR.GPS) Bangle._PWR.GPS=[];
      if (!appID) appID="?";
      if (isOn && !Bangle._PWR.GPS.includes(appID)) Bangle._PWR.GPS.push(appID);
      if (!isOn && Bangle._PWR.GPS.includes(appID)) Bangle._PWR.GPS.splice(Bangle._PWR.GPS.indexOf(appID),1);
      pwr = Bangle._PWR.GPS.length>0;
      // stop internal GPS, no clients left
      if (!pwr) origSetGPSPower(0);
    }
    // always update Gadgetbridge on current power state
    require("android").gbSend({ t: "gps_power", status: pwr });
    return pwr;
  }).bind(gpsState);
  // allow checking for GPS via GadgetBridge
  Bangle.isGPSOn = () => {
    return !!(Bangle._PWR && Bangle._PWR.GPS && Bangle._PWR.GPS.length>0);
  };
  // stop GPS on boot if not activated
  setTimeout(()=>{
    if (!Bangle.isGPSOn()) require("android").gbSend({ t: "gps_power", status: false });
  },3000);
};
