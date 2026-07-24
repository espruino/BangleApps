const assert = require("assert");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");
const fakeControlPoint = require("../helpers/fake_controlpoint");
const protocolLoader = loader.create();
const protocol = protocolLoader.require("coretemp.protocol");

async function scanWithSettings(settings) {
  const cp = fakeControlPoint.create();
  let scanWindowMs;
  cp.enqueueResponse(protocol.OPCODES.HRM_SCAN_ANT_START, []);
  cp.enqueueResponse(protocol.OPCODES.HRM_SCAN_ANT_COUNT, [0]);
  const storage = fakeStorage.create({
    "coretemp.json": settings || {}
  });
  const loaded = loader.create({
    storage,
    overrides: {
      "coretemp.controlpoint": cp,
      "coretemp.store": {
        get() { return storage.readJSON("coretemp.json", 1) || {}; },
        log() {},
        init() {},
        flush() {}
      }
    },
    globals: {
      setTimeout(fn, ms) {
        scanWindowMs = ms;
        fn();
        return 1;
      },
      clearTimeout() {}
    }
  });
  const hrm = loaded.require("coretemp.hrm");
  hrm.init();
  await hrm.scanANT();
  return scanWindowMs;
}

module.exports = [
  {
    name: "scan start ACK is separate from local scan window",
    async fn() {
      const cp = fakeControlPoint.create();
      let scanWindowMs;
      cp.enqueueResponse(protocol.OPCODES.HRM_SCAN_ANT_START, []);
      cp.enqueueResponse(protocol.OPCODES.HRM_SCAN_ANT_COUNT, [2]);
      cp.enqueueResponse(protocol.OPCODES.HRM_SCAN_ANT_ENTRY, [0x34, 0x12, 0x56]);
      cp.enqueueResponse(protocol.OPCODES.HRM_SCAN_ANT_ENTRY, [0x78, 0x56, 0x9A]);
      const loaded = loader.create({
        storage: fakeStorage.create(),
        overrides: {
          "coretemp.controlpoint": cp,
          "coretemp.store": { get() { return {}; }, log() {}, init() {}, flush() {} }
        },
        globals: {
          setTimeout(fn, ms) {
            scanWindowMs = ms;
            fn();
            return 1;
          },
          clearTimeout() {}
        }
      });
      const hrm = loaded.require("coretemp.hrm");
      hrm.init();
      const found = await hrm.scanANT();
      assert.strictEqual(scanWindowMs, 5000);
      assert.deepStrictEqual(cp.calls.map(call => call.opcode), [0x0A, 0x0B, 0x0C, 0x0C]);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(cp.calls[0].params)), [0xFF]);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(found.map(entry => entry.antId))), [0x1234, 0x5678]);
      assert.strictEqual(hrm.getState().lastScan.length, 2);
    }
  },
  {
    name: "scan window is configurable in seconds",
    async fn() {
      assert.strictEqual(await scanWithSettings({ antScanWindowSec: 10 }), 10000);
    }
  },
  {
    name: "invalid scan window falls back to default",
    async fn() {
      assert.strictEqual(await scanWithSettings({ antScanWindowSec: 1 }), 5000);
      assert.strictEqual(await scanWithSettings({ antScanWindowSec: "bad" }), 5000);
    }
  }
];
