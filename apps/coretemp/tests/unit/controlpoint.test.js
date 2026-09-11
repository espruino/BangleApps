const assert = require("assert");
const loader = require("../helpers/module_loader");
const dv = require("../helpers/dataview");
const packets = require("../fixtures/packets");

function makeControlPoint() {
  const writes = [];
  const logs = [];
  const cp = loader.create().require("coretemp.controlpoint");
  cp.setAdapter({
    write(bytes) {
      writes.push(bytes.slice());
      return Promise.resolve();
    },
    log(text, value) {
      logs.push({ text, value });
    }
  });
  return { cp, writes, logs };
}

function tick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = [
  {
    name: "resolves only matching success response",
    async fn() {
      const { cp, writes } = makeControlPoint();
      const promise = cp.request(0x0B, [], 50);
      await tick();
      cp.onNotification(dv.fromBytes(packets.response(0x04, [1])));
      assert.strictEqual(cp.isBusy(), true);
      cp.onNotification(dv.fromBytes(packets.response(0x0B, [2])));
      const res = await promise;
      assert.deepStrictEqual(plain(writes), [[0x0B]]);
      assert.deepStrictEqual(plain(res.payload), [2]);
      assert.strictEqual(cp.isBusy(), false);
    }
  },
  {
    name: "rejects matching error response once",
    async fn() {
      const { cp } = makeControlPoint();
      const promise = cp.request(0x02, [1, 2, 3], 50);
      await tick();
      cp.onNotification(dv.fromBytes(packets.response(0x02, [], 0x05)));
      await assert.rejects(promise, /Control point error code 5/);
      assert.strictEqual(cp.isBusy(), false);
    }
  },
  {
    name: "timeout is request identity bound",
    async fn() {
      const { cp } = makeControlPoint();
      const first = cp.request(0x0A, [0xFF], 5);
      await assert.rejects(first, /timeout/);
      const second = cp.request(0x0B, [], 50);
      await tick();
      cp.onNotification(dv.fromBytes(packets.response(0x0B, [1])));
      assert.strictEqual((await second).payload[0], 1);
    }
  },
  {
    name: "queued requests settle independently without leaking previous response",
    async fn() {
      const { cp, writes } = makeControlPoint();
      const first = cp.request(0x0A, [0xFF], 50);
      const second = cp.request(0x0B, [], 50);
      await tick();
      assert.deepStrictEqual(plain(writes), [[0x0A, 0xFF]]);
      cp.onNotification(dv.fromBytes(packets.response(0x0A, [])));
      assert.strictEqual((await first).requestOpCode, 0x0A);
      await tick();
      assert.deepStrictEqual(plain(writes), [[0x0A, 0xFF], [0x0B]]);
      cp.onNotification(dv.fromBytes(packets.response(0x0B, [4])));
      const res = await second;
      assert.strictEqual(res.requestOpCode, 0x0B);
      assert.deepStrictEqual(plain(res.payload), [4]);
    }
  },
  {
    name: "cancel rejects active request",
    async fn() {
      const { cp } = makeControlPoint();
      const promise = cp.request(0x01, [], 50);
      await tick();
      cp.cancelActive("manual cancel");
      await assert.rejects(promise, /manual cancel/);
      assert.strictEqual(cp.isBusy(), false);
    }
  },
  {
    name: "write failure clears active request",
    async fn() {
      const cp = loader.create().require("coretemp.controlpoint");
      cp.setAdapter({
        write() {
          return Promise.reject(new Error("GATT failure"));
        }
      });
      await assert.rejects(cp.request(0x01, [], 50), /GATT failure/);
      assert.strictEqual(cp.isBusy(), false);
    }
  }
];
