(function() {
  const warnTime = 24 * 60 * 60000;
  const nextTime = 12 * 60 * 60000;
  const retryTime = 10 * 60000;

  const JSON_FILE = "agpsdata.json";
  const WIDGET_ID = "widagps";
  const AGPS_URL = "https://www.espruino.com/agps/casic.base64";
  const HTTP_REQ_ID = "widagps";

  let isRequesting = false;
  let lastAGPS = 0;
  let nextGet = null;
  let reqTimeout = null;

  function redrawWidget() {
    if (global.WIDGETS && WIDGETS[WIDGET_ID]) {
      Bangle.drawWidgets();
    }
  }

  WIDGETS[WIDGET_ID] = {
    area: "tl",
    width: 0,
    draw: function() {
      let w = 0;
      if (isRequesting || Date.now() - lastAGPS > warnTime) {
        w = 24;
      }
      if (this.width !== w) {
        this.width = w;
        setTimeout(() => Bangle.drawWidgets(), 0);
        return;
      }
      if (!w || this.x === undefined) return;
      g.reset();
      g.setColor(isRequesting ? "#00f" : "#f00");
      g.drawImage(
        atob("FBQBAAAABgAAYAAPAACwABOAATgAI8ACPABD4AQ+AEPgD8EAg/AQP4AD+CD/wjD8WAHmAAY="),
        this.x + 1,
        this.y + 1
      );
    }
  };

  if (!Bangle.http) {
    const _GB = global.GB;
    global.GB = function(msg) {
      if (msg && msg.t === "http" && msg.id === HTTP_REQ_ID) {
        applyAGPS(msg.resp);
      }
      if (_GB) _GB(msg);
    };
  }

  function casicChecksum(cmd) {
    let cs = 0;
    for (let i = 1; i < cmd.length; i++) {
      cs = cs ^ cmd.charCodeAt(i);
    }
    return cmd + "*" + cs.toString(16).toUpperCase().padStart(2, "0");
  }

  function writeAGPS(b64, cb) {
    let bin;
    try {
      bin = atob(b64);
    } catch (e) {
      cb(false);
      return;
    }
    if (!bin || !bin.length) {
      cb(false);
      return;
    }
    Bangle.setGPSPower(true, WIDGET_ID);
    try {
      Serial1.println(casicChecksum("$PCAS04,1"));
    } catch (e) {
      Bangle.setGPSPower(false, WIDGET_ID);
      cb(false);
      return;
    }
    const chunkSize = 128;
    let offset = 0;
    function sendNext() {
      if (offset < bin.length) {
        try {
          Serial1.write(bin.substr(offset, chunkSize));
        } catch (e) {
          Bangle.setGPSPower(false, WIDGET_ID);
          cb(false);
          return;
        }
        offset += chunkSize;
        setTimeout(sendNext, 200);
      } else {
        setTimeout(() => {
          Bangle.setGPSPower(false, WIDGET_ID);
          cb(true);
        }, 1000);
      }
    }
    setTimeout(sendNext, 200);
  }

  function nextAGPS(when) {
    if (nextGet) {
      clearTimeout(nextGet);
      nextGet = null;
    }
    nextGet = setTimeout(getAGPS, when);
  }

  function finishAGPS(ok) {
    isRequesting = false;
    if (reqTimeout) {
      clearTimeout(reqTimeout);
      reqTimeout = null;
    }
    if (ok) {
      lastAGPS = Math.round(Date.now());
      const existing = require("Storage").readJSON(JSON_FILE, 1) || {};
      existing.lastAGPS = lastAGPS;
      existing.lastUpdate = lastAGPS;
      require("Storage").writeJSON(JSON_FILE, existing);
      nextAGPS(nextTime);
    } else {
      nextAGPS(retryTime);
    }
    redrawWidget();
  }

  function applyAGPS(data) {
    if (!data) {
      finishAGPS(false);
      return;
    }
    writeAGPS(data, finishAGPS);
  }

  function getAGPS() {
    if (isRequesting) return;
    if (!NRF.getSecurityStatus().connected) {
      nextAGPS(retryTime);
      return;
    }
    isRequesting = true;
    redrawWidget();
    if (Bangle.http) {
      Bangle.http(AGPS_URL, { timeout: 10000 })
        .then(event => applyAGPS(event && event.resp))
        .catch(() => finishAGPS(false));
      return;
    }
    if (Bluetooth.println) {
      Bluetooth.println("");
      Bluetooth.println(JSON.stringify({ t: "http", id: HTTP_REQ_ID, url: AGPS_URL }));
    }
    reqTimeout = setTimeout(() => {
      if (isRequesting) finishAGPS(false);
    }, 10000);
  }

  const saved = require("Storage").readJSON(JSON_FILE, 1);
  if (saved) {
    lastAGPS = saved.lastAGPS || saved.lastUpdate || 0;
  }

  nextAGPS(Math.max(0, nextTime - (Date.now() - lastAGPS)));
  NRF.on("connect", () => {
    if (!isRequesting && Date.now() - lastAGPS > warnTime) {
      nextAGPS(0);
    }
  });
})();
