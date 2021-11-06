(function() {
  function gbSend(message) {
    Bluetooth.println("");
    Bluetooth.println(JSON.stringify(message));
  }

  var _GB = global.GB;
  global.GB = (event) => {
    // feed a copy to other handlers if there were any
    if (_GB) setTimeout(_GB,0,Object.assign({},event));

    /* TODO: Call handling, fitness */
    var HANDLERS = {
      // {t:"notify",id:int, src,title,subject,body,sender,tel:string} add
      "notify" : function() { event.t="add";require("messages").pushMessage(event); },
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
      }
    };
    var h = HANDLERS[event.t];
    if (h) h(); else console.log("GB Unknown",event);
  };

  // Battery monitor
  function sendBattery() { gbSend({ t: "status", bat: E.getBattery() }); }
  NRF.on("connect", () => setTimeout(sendBattery, 2000));
  setInterval(sendBattery, 10*60*1000);
  // Health tracking
  Bangle.on('health', health=>{
    gbSend({ t: "act", stp: health.steps, hrm: health.bpm });
  });
  // Music control
  Bangle.musicControl = cmd => {
    // play/pause/next/previous/volumeup/volumedown
    gbSend({ t: "music", m:cmd });
  }
})();
