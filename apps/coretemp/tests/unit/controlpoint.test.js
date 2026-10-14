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
      await assert.rejects(cp.request(0x0B, [], 50), /not connected/);
      cp.setAdapter({ write() { return Promise.resolve(); } });
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

module.exports.push(
  {
    name: "close rejects active and queued requests without teardown writes",
    async fn() {
      const { cp, writes } = makeControlPoint();
      const results = Promise.allSettled([cp.request(1), cp.request(2), cp.request(3)]);
      await tick();
      cp.close("teardown");
      assert.ok((await results).every(item => item.status === "rejected" && /teardown/.test(item.reason)));
      await tick();
      assert.deepStrictEqual(plain(writes), [[1]]);
      await assert.rejects(cp.request(4), /not connected/);
    }
  },
  {
    name: "sync and async write failures close the whole request session",
    async fn() {
      for (const synchronous of [true, false]) {
        const { cp } = makeControlPoint();
        let writes = 0;
        cp.setAdapter({ write() {
          writes++;
          if (synchronous) throw new Error("write failed");
          return Promise.reject(new Error("write failed"));
        } });
        const results = await Promise.allSettled([cp.request(1), cp.request(2)]);
        assert.strictEqual(writes, 1);
        assert.ok(results.every(item => item.status === "rejected" && item.reason.coreTransportFailure));
        await assert.rejects(cp.request(3), /not connected/);
      }
    }
  },
  {
    name: "timeout cancels queued commands and late write rejection cannot close a new adapter",
    async fn() {
      const { cp } = makeControlPoint();
      let rejectOldWrite;
      const writes = [];
      cp.setAdapter({ write(bytes) {
        writes.push(bytes);
        return new Promise((resolve, reject) => { rejectOldWrite = reject; });
      } });
      const results = await Promise.allSettled([cp.request(1, [], 5), cp.request(2)]);
      assert.ok(results.every(item => item.status === "rejected" && /timeout/.test(item.reason)));
      assert.strictEqual(writes.length, 1);
      cp.setAdapter({ write(bytes) { writes.push(bytes); } });
      const next = cp.request(3, [], 50);
      rejectOldWrite(new Error("late old failure"));
      await tick();
      cp.onNotification(dv.fromBytes(packets.response(3, [])));
      await next;
      assert.strictEqual(writes.length, 2);
    }
  },
  {
    name: "protocol errors reject one command and allow the next queued command",
    async fn() {
      const { cp, writes } = makeControlPoint();
      const first = assert.rejects(cp.request(1), /error code 5/);
      const second = cp.request(2);
      await tick();
      cp.onNotification(dv.fromBytes(packets.response(1, [], 5)));
      await first;
      await tick();
      cp.onNotification(dv.fromBytes(packets.response(2, [])));
      await second;
      assert.deepStrictEqual(plain(writes), [[1], [2]]);
    }
  }
);
