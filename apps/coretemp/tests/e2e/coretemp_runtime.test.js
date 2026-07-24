const assert = require("assert");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");

module.exports = [
  {
    name: "runtime exposes HRM APIs on Bangle",
    fn() {
      const Bangle = {
        _PWR: {},
        on() {}
      };
      const hrm = {
        init() { this.initialized = true; },
        getState() { return { busy: false, pairedSensors: [] }; },
        getStatus() {},
        scanANT() {},
        pairANT() {},
        clearANT() {}
      };
      const loaded = loader.create({
        storage: fakeStorage.create(),
        globals: { Bangle, E: { on() {} } },
        overrides: {
          "coretemp.hrm": hrm,
          "coretemp.ble": {
            init() {},
            shutdown() {},
            getStatus() { return { state: "connected" }; },
            isOn() {},
            isConnected() {},
            connect() {},
            disconnect() {},
            pairDevice() {},
            unpairDevice() {},
            rebuildCache() {},
            writeControlPoint() {},
            setPower() {},
            pause() {},
            resume() {},
            isPaused() {}
          },
          "coretemp.store": {
            init() {},
            shutdown() {},
            get() { return {}; },
            setDebug() {},
            flush() {},
            log() {}
          }
        }
      });
      loaded.require("coretemp.runtime").enable();
      assert.strictEqual(typeof Bangle.CORESensorHRMGetStatus, "function");
      assert.strictEqual(typeof Bangle.CORESensorHRMScanANT, "function");
      assert.strictEqual(typeof Bangle.CORESensorHRMPairANT, "function");
      assert.strictEqual(typeof Bangle.CORESensorHRMClearANT, "function");
      assert.strictEqual(typeof Bangle.CORESensorSetLogMode, "function");
      assert.strictEqual(typeof Bangle.CORESensorPause, "function");
      assert.strictEqual(typeof Bangle.CORESensorResume, "function");
      assert.strictEqual(typeof Bangle.CORESensorIsPaused, "function");
      assert.strictEqual(Bangle.CORESensorGetStatus().hrm.busy, false);
    }
  }
];
