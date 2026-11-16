if (!global.WIDGETS) {
  WIDGETS = {};
  Bangle.loadWidgets();
  global.isTest = true;
}

(function(){
  var warnTime = 24*60*60000; //warn missing data
  var nextTime = 12*60*60000; //time between requests
  var retryTime = 10*60000; //time between retries

  const JSON_FILE = "agpsdata.json";
  var isRequesting = false;
  var lastAGPS = 0;
  var nextGet = null;

  const WIDGET_ID = "widagps";
  WIDGETS[WIDGET_ID]={
    area:"tl",
    width:0,
    draw:function() {
      var w = 0;
      var x = this.x, y = this.y;
      g.reset();
      if (isRequesting) {
        g.setColor("#00f");
        w = 24;
      }
      else {
        if (Date.now() - lastAGPS > warnTime) {
          g.setColor("#f00");
          w = 24;
        }
      }
      if (WIDGETS[WIDGET_ID].width != w) {
        WIDGETS[WIDGET_ID].width = w;
        setTimeout(() => Bangle.drawWidgets(), 0);
        return;
      }
      if (w && x !== undefined) {
g.drawImage(atob("FBQBAAAABgAAYAAPAACwABOAATgAI8ACPABD4AQ+AEPgD8EAg/AQP4AD+CD/wjD8WAHmAAY="), x + 1, y + 1);
      }
    }
  };

  if (!Bangle.http) {
    var _GB = global.GB;

    global.GB = function(msg) {
      //console.log(msg);
      if (msg.t == "http" && msg.id == WIDGET_ID) {
        applyAGPS(msg.resp);
      }
      if (_GB) {
        _GB(msg);
      }
    };
  }

  function nextAGPS(when) {
    if (nextGet) {
      clearTimeout(nextGet);
      nextGet = null;
    }
    console.log("Next AGPS request:", new Date(Date.now() + when));
    nextGet = setTimeout(() => {
      getAGPS();
    }, when);
  }

  function applyAGPS(data) {
    if (!data) {
      isRequesting = false;
      console.log("Failed to apply AGPS data");
      nextAGPS(retryTime);
      Bangle.drawWidgets();
      return;
    }
    setAGPS(data, function(success) {
      isRequesting = false;
      if (success) {
        lastAGPS = Date.now();
        nextAGPS(nextTime);
        require("Storage").writeJSON(JSON_FILE, {lastAGPS: lastAGPS});
      }
      else {
        console.log("Failed to apply AGPS data");
        nextAGPS(retryTime);
      }
      Bangle.drawWidgets();
    });
  }

  function setAGPS(data, cb) {
    var chunkSize = 128;
    var gnss_select = "1";
    var offset = 0;
    var bin;
    Bangle.setGPSPower(true, "agpsdata");
    try {
      bin = atob(data);
      Serial1.println(CASIC_CHECKSUM("$PCAS04,"+gnss_select)); // set GNSS mode
    }
    catch(e) {
      console.log("Error:", e);
      Bangle.setGPSPower(false, "agpsdata");
      return cb(false);
    }
    function writeChunk() {
      if (offset >= bin.length) {
        Bangle.setGPSPower(false, "agpsdata");
        return cb(true);
      }
      Serial1.write(bin.substr(offset, chunkSize));
      offset += chunkSize;
      setTimeout(writeChunk, 20);
    }
    writeChunk();
  }

  function CASIC_CHECKSUM(cmd) {
    var cs = 0;
    for (var i=1;i<cmd.length;i++)
      cs = cs ^ cmd.charCodeAt(i);
    return cmd+"*"+cs.toString(16).toUpperCase().padStart(2, '0');
  }

  function getAGPS() {
    if (isRequesting) return;
    isRequesting = true;
    var url = "https://www.espruino.com/agps/casic.base64";
    if (Bangle.http) {
      Bangle.http(url, {id: WIDGET_ID, timeout: 10000}).then(data => {
        applyAGPS(data.resp);
      }, () => {
        applyAGPS();
      });
    }
    else if (Bluetooth.println) {
      console.log("On device");
      Bluetooth.println("");
      Bluetooth.println(JSON.stringify({t:"http", id:WIDGET_ID, url:url}));
      //check for request timeout
      setTimeout(() => {
        if (isRequesting) {
          applyAGPS();
        }
      }, 10000);
    }
    else {
      applyAGPS();
    }
    Bangle.drawWidgets();
  }

  var data = require("Storage").readJSON(JSON_FILE);
  if (data && data.lastAGPS) {
    lastAGPS = data.lastAGPS;
  }

  nextAGPS(Math.max(0, nextTime - (Date.now() - lastAGPS)));
  NRF.on('connect', () => {
    if (Date.now() - lastAGPS > warnTime) {
      nextAGPS(0);
    }
  });
})()
if (global.isTest) {
  Bangle.drawWidgets();
}

