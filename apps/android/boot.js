/* global GB */
{
  // settings var is deleted after this executes to save memory
  let settings = Object.assign({rp:true,as:true,vibrate:".."},
    require("Storage").readJSON("android.settings.json",1)||{}
  );
  let _GB = global.GB;
  global.GB = e => {
    // feed a copy to other handlers if there were any
    if (_GB) setTimeout(_GB,0,Object.assign({},e));
    Bangle.emit("GB",e);
    require("android").gbHandler(e);
  };
  // HTTP request handling - see the readme
  Bangle.http = (url,options)=>require("android").httpHandler(url,options);
  // Battery monitor
  let sendBattery = function() { require("android").gbSend({ t: "status", bat: E.getBattery(), chg: Bangle.isCharging()?1:0 }); }
  Bangle.on("charging", sendBattery);
  NRF.on("connect", () => setTimeout(function() {
    sendBattery();
    require("android").gbSend({t: "ver", fw: process.env.VERSION, hw: process.env.HWVERSION});
    GB({t:"force_calendar_sync_start"}); // send a list of our calendar entries to start off the sync process
  }, 2000));
  NRF.on("disconnect", () => {
    // disable HRM/activity monitoring ('act' message)
    GB({t:"act",stp:0,hrm:0,int:0}); // just call the handler to save duplication
    // remove all messages on disconnect (if enabled)
    var settings = require("Storage").readJSON("android.settings.json",1)||{};
    if (!settings.keep)
      require("messages").clearAll();
  });
  setInterval(sendBattery, 10*60*1000);
  // Health tracking - if 'realtime' data is sent with 'rt:1', but let's still send our activity log every 10 mins
  Bangle.on('health', h=>{
    require("android").gbSend({ t: "act", stp: h.steps, hrm: h.bpm, mov: h.movement, act: h.activity }); // h.activity added in 2v26
  });
  // Music control
  Bangle.musicControl = cmd => {
    // play/pause/next/previous/volumeup/volumedown
    require("android").gbSend({ t: "music", n:cmd });
  };
  // Message response
  Bangle.messageResponse = (msg,response) => {
    if (msg.id=="call") return require("android").gbSend({ t: "call", n:response?"ACCEPT":"REJECT" });
    if (isFinite(msg.id)) return require("android").gbSend({ t: "notify", n:response?"OPEN":"DISMISS", id: msg.id });
    // error/warn here?
  };
  Bangle.messageIgnore = msg => {
    if (isFinite(msg.id)) return require("android").gbSend({ t: "notify", n:"MUTE", id: msg.id });
  };
  // GPS overwrite logic
  if (settings.overwriteGps) require("android").overwriteGPS();
  // remove settings object so it's not taking up RAM
  delete settings;
}
