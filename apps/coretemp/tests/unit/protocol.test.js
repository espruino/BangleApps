const assert = require("assert");
const loader = require("../helpers/module_loader");
const dv = require("../helpers/dataview");
const packets = require("../fixtures/packets");

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = [
  {
    name: "parses normalized control point response payload",
    fn() {
      const protocol = loader.create().require("coretemp.protocol");
      const res = protocol.parseResponse(dv.fromBytes(packets.response(protocol.OPCODES.HRM_SCAN_ANT_COUNT, [2])));
      assert.deepStrictEqual(plain(res.bytes), [0x80, 0x0B, 0x01, 2]);
      assert.strictEqual(res.opCode, 0x80);
      assert.strictEqual(res.requestOpCode, 0x0B);
      assert.strictEqual(res.resultCode, 0x01);
      assert.deepStrictEqual(plain(res.payload), [2]);
      assert.strictEqual(protocol.parseCount(res), 2);
    }
  },
  {
    name: "parses ANT entry and pair params",
    fn() {
      const protocol = loader.create().require("coretemp.protocol");
      const res = protocol.parseResponse(dv.fromBytes(packets.response(0x0C, packets.antEntryPayload(0x1234, 0x56))));
      assert.deepStrictEqual(plain(protocol.parseAntEntry(res, 3)), {
        index: 3,
        antId: 0x1234,
        txType: 0x56
      });
      assert.deepStrictEqual(plain(protocol.makeAntPairParams(0x563412)), [0x12, 0x34, 0x56]);
      assert.deepStrictEqual(plain(protocol.makeAntPairParams(0x563412, 0x22)), [0x12, 0x34, 0x22]);
    }
  },
  {
    name: "parses standard health thermometer temperature measurement",
    fn() {
      const protocol = loader.create().require("coretemp.protocol");
      const data = protocol.parseTemperatureMeasurement(dv.fromBytes([0x00, 0x77, 0x01, 0x00, 0xFF]), 88);
      assert.strictEqual(data.core, 37.5);
      assert.strictEqual(data.unit, "C");
      assert.strictEqual(data.battery, 88);
      assert.strictEqual(data.profile, "health_thermometer");
    }
  }
];
