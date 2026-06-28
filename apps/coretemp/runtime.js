var store = require("coretemp.store");
var ble = require("coretemp.ble");
var hrm = require("coretemp.hrm");

var enabled;
var killHandler;

function getStatus() {
  var status = ble.getStatus();
  status.hrm = hrm.getState();
  return status;
}

exports.enable = function () {
  if (!enabled) {
    enabled = true;
    store.init();
    ble.init();
    hrm.init();

    killHandler = function () {
      ble.shutdown();
      store.shutdown();
    };
    E.on("kill", killHandler);
  }

  Bangle.enableCORESensorLog = function () {
    store.setDebug(true);
  };

  Bangle.disableCORESensorLog = function () {
    store.setDebug(false);
  };

  Bangle.CORESensorSetDebugLog = function (isEnabled) {
    store.setDebug(!!isEnabled);
  };

  Bangle.CORESensorSetLogMode = function (mode) {
    store.setDebug(mode === "full" || mode === "partial", mode === "partial");
  };

  Bangle.isCORESensorOn = ble.isOn;
  Bangle.isCORESensorConnected = ble.isConnected;
  Bangle.CORESensorConnect = ble.connect;
  Bangle.CORESensorDisconnect = ble.disconnect;
  Bangle.CORESensorPair = ble.pairDevice;
  Bangle.CORESensorUnpair = ble.unpairDevice;
  Bangle.CORESensorRebuildCache = ble.rebuildCache;
  Bangle.CORESensorWriteControlPoint = ble.writeControlPoint;
  Bangle.CORESensorGetStatus = getStatus;
  Bangle.CORESensorPause = ble.pause;
  Bangle.CORESensorResume = ble.resume;
  Bangle.CORESensorIsPaused = ble.isPaused;
  Bangle.CORESensorHRMGetState = hrm.getState;
  Bangle.CORESensorHRMGetManagerState = hrm.getState;
  Bangle.CORESensorHRMGetStatus = hrm.getStatus;
  Bangle.CORESensorHRMScanANT = hrm.scanANT;
  Bangle.CORESensorHRMPairANT = hrm.pairANT;
  Bangle.CORESensorHRMClearANT = hrm.clearANT;
  Bangle.CORESensorHRMClear = hrm.clearANT;
  Bangle.setCORESensorPower = ble.setPower;

  if (store.get().enabled === true && Bangle.setCORESensorPower) {
    Bangle.setCORESensorPower(1, "coretemp.enabled");
  }
};
