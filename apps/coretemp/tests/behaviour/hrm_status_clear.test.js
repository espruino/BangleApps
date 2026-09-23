const assert = require("assert");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");
const fakeControlPoint = require("../helpers/fake_controlpoint");
const protocol = loader.create().require("coretemp.protocol");

function loadHRM(cp, storage) {
  return loader.create({
    storage,
    overrides: {
      "coretemp.controlpoint": cp,
      "coretemp.store": { log() {}, init() {}, flush() {} }
    }
  }).require("coretemp.hrm");
}

module.exports = [
  {
    name: "status queries paired count and entries",
    async fn() {
      const cp = fakeControlPoint.create();
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [0x34, 0x12, 0x56]);
      const hrm = loadHRM(cp, fakeStorage.create());
      hrm.init();
      const status = await hrm.getStatus();
      assert.strictEqual(status.pairedCount, 1);
      assert.strictEqual(status.currentSource.antId, 0x1234);
      assert.deepStrictEqual(cp.calls.map(call => call.opcode), [0x04, 0x05]);
    }
  },
  {
    name: "clear verifies zero paired entries",
    async fn() {
      const storage = fakeStorage.create({
        "coretemp.hrm.json": {
          selected: { antId: 0x1234, txType: 0 },
          recent: [{ antId: 0x1234, txType: 0 }]
        }
      });
      const cp = fakeControlPoint.create();
      cp.enqueueResponse(protocol.OPCODES.HRM_CLEAR_ANT, []);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [0]);
      const hrm = loadHRM(cp, storage);
      hrm.init();
      const status = await hrm.clearANT();
      assert.strictEqual(status.pairedCount, 0);
      assert.strictEqual(storage.files["coretemp.hrm.json"].selected, null);
    }
  },
  {
    name: "clear rejects failed verification",
    async fn() {
      const cp = fakeControlPoint.create();
      cp.enqueueResponse(protocol.OPCODES.HRM_CLEAR_ANT, []);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [1, 0, 0]);
      const hrm = loadHRM(cp, fakeStorage.create());
      hrm.init();
      await assert.rejects(hrm.clearANT(), /verification/);
      assert.match(hrm.getState().lastError, /verification/);
    }
  }
];
