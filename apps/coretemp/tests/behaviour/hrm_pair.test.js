const assert = require("assert");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");
const fakeControlPoint = require("../helpers/fake_controlpoint");
const protocol = loader.create().require("coretemp.protocol");

function loadHRM(cp, storage, globals) {
  return loader.create({
    storage,
    globals,
    overrides: {
      "coretemp.controlpoint": cp,
      "coretemp.store": { log() {}, init() {}, flush() {} }
    }
  }).require("coretemp.hrm");
}

function immediateTimers(onTimeout) {
  return {
    setTimeout(fn, ms) {
      if (onTimeout) onTimeout(ms);
      fn();
      return 1;
    },
    clearTimeout() {}
  };
}

module.exports = [
  {
    name: "pair verifies and persists selected plus recent",
    async fn() {
      const storage = fakeStorage.create();
      const cp = fakeControlPoint.create();
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [0]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIR_ANT, []);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [0x34, 0x12, 0x56]);
      const hrm = loadHRM(cp, storage);
      hrm.init();
      const status = await hrm.pairANT({ antId: 0x1234, txType: 0x56 });
      assert.strictEqual(status.selected.antId, 0x1234);
      assert.strictEqual(storage.files["coretemp.hrm.json"].selected.antId, 0x1234);
      assert.strictEqual(storage.files["coretemp.hrm.json"].selected.txType, 0x56);
      assert.strictEqual(storage.files["coretemp.hrm.json"].recent[0].txType, 0x56);
      assert.deepStrictEqual(cp.calls.map(call => call.opcode), [0x04, 0x02, 0x04, 0x05]);
    }
  },
  {
    name: "persisted txType is reused for exact pairing",
    async fn() {
      const storage = fakeStorage.create({
        "coretemp.hrm.json": {
          selected: { antId: 0x1234, txType: 0x56 },
          recent: [{ antId: 0x1234, txType: 0x56 }]
        }
      });
      const cp = fakeControlPoint.create();
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [0]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIR_ANT, []);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [0x34, 0x12, 0x56]);
      const hrm = loadHRM(cp, storage);
      hrm.init();
      const status = await hrm.pairANT(hrm.getState().selected);
      assert.strictEqual(status.selected.antId, 0x1234);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(cp.calls[1].params)), [0x34, 0x12, 0x56]);
    }
  },
  {
    name: "manual ANT id pairs without persisted txType",
    async fn() {
      const storage = fakeStorage.create({
        "coretemp.hrm.json": {
          selected: { antId: 0x1234 },
          recent: [{ antId: 0x1234 }]
        }
      });
      const cp = fakeControlPoint.create();
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [0]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIR_ANT, []);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [0x34, 0x12, 0]);
      const hrm = loadHRM(cp, storage);
      hrm.init();
      const status = await hrm.pairANT({ antId: 0x1234 });
      assert.strictEqual(status.selected.antId, 0x1234);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(cp.calls[1].params)), [0x34, 0x12, 0]);
      assert.deepStrictEqual(storage.files["coretemp.hrm.json"], {
        selected: { antId: 0x1234, transport: "ANT+" },
        recent: [{ antId: 0x1234, transport: "ANT+" }]
      });
    }
  },
  {
    name: "same HRM is idempotent without replace flag",
    async fn() {
      const storage = fakeStorage.create();
      const cp = fakeControlPoint.create();
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [0x34, 0x12, 0x56]);
      const hrm = loadHRM(cp, storage);
      hrm.init();
      const status = await hrm.pairANT({ antId: 0x1234, txType: 0x56 });
      assert.strictEqual(status.selected.antId, 0x1234);
      assert.deepStrictEqual(cp.calls.map(call => call.opcode), [0x04, 0x05]);
    }
  },
  {
    name: "different paired HRM requires replace flag",
    async fn() {
      const cp = fakeControlPoint.create();
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [0x11, 0x11, 0]);
      const hrm = loadHRM(cp, fakeStorage.create());
      hrm.init();
      await assert.rejects(hrm.pairANT({ antId: 0x1234 }), /different HRM/);
    }
  },
  {
    name: "replace clears before pairing",
    async fn() {
      const cp = fakeControlPoint.create();
      let settleMs;
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [0x11, 0x11, 0]);
      cp.enqueueResponse(protocol.OPCODES.HRM_CLEAR_ANT, []);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIR_ANT, []);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [0x34, 0x12, 0]);
      const hrm = loadHRM(cp, fakeStorage.create(), immediateTimers(ms => { settleMs = ms; }));
      hrm.init();
      const status = await hrm.pairANT({ antId: 0x1234 }, true);
      assert.strictEqual(status.selected.antId, 0x1234);
      assert.strictEqual(settleMs, 2000);
      assert.deepStrictEqual(cp.calls.map(call => call.opcode), [0x04, 0x05, 0x01, 0x02, 0x04, 0x05]);
    }
  },
  {
    name: "replace clears before pairing the same HRM",
    async fn() {
      const cp = fakeControlPoint.create();
      let settleMs;
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [0x34, 0x12, 0]);
      cp.enqueueResponse(protocol.OPCODES.HRM_CLEAR_ANT, []);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIR_ANT, []);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [1]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [0x34, 0x12, 0]);
      const hrm = loadHRM(cp, fakeStorage.create(), immediateTimers(ms => { settleMs = ms; }));
      hrm.init();
      const status = await hrm.pairANT({ antId: 0x1234 }, true);
      assert.strictEqual(status.selected.antId, 0x1234);
      assert.strictEqual(settleMs, 2000);
      assert.deepStrictEqual(cp.calls.map(call => call.opcode), [0x04, 0x05, 0x01, 0x02, 0x04, 0x05]);
    }
  },
  {
    name: "multiple paired HRMs block pairing",
    async fn() {
      const cp = fakeControlPoint.create();
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_COUNT, [2]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [1, 0, 0]);
      cp.enqueueResponse(protocol.OPCODES.HRM_PAIRED_ANT_ENTRY, [2, 0, 0]);
      const hrm = loadHRM(cp, fakeStorage.create());
      hrm.init();
      await assert.rejects(hrm.pairANT({ antId: 0x1234 }, true), /Multiple HRMs/);
    }
  }
];
