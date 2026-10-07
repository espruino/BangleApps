/* eslint-env node */
const assert = require("assert");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");

function create(seed) {
  const storage = fakeStorage.create(seed);
  const migrate = loader.create({ storage }).require("coretemp.migrate");
  return { storage, migrate };
}

module.exports = [
  {
    name: "fresh defaults enable APIs without background power and migration is idempotent",
    fn() {
      const { storage, migrate } = create();
      const first = migrate.run();
      assert.strictEqual(first.enabled, true);
      assert.strictEqual(first.alwaysOn, false);
      assert.strictEqual(first.widget, true);
      assert.strictEqual(first.settingsVersion, 2);
      storage.writeJSON = () => { throw new Error("unnecessary write"); };
      migrate.run();
    }
  },
  {
    name: "legacy upgrades preserve explicit settings and do not infer Always On",
    fn() {
      for (const enabled of [undefined, true, false]) {
        const seed = { btid: "core-1", btname: "CORE", debuglog: true,
          warnDisconnect: false, extra: { private: 42 }, cache: { characteristics: {} } };
        if (enabled !== undefined) seed.enabled = enabled;
        const { storage, migrate } = create({ "coretemp.json": seed });
        migrate.run();
        const result = storage.readJSON("coretemp.json");
        assert.strictEqual(result.enabled, enabled !== false);
        assert.strictEqual(result.alwaysOn, false);
        assert.strictEqual(result.widget, false);
        for (const key of Object.keys(seed).filter(key => key !== "cache")) assert.deepStrictEqual(result[key], seed[key]);
        assert.strictEqual(result.cache, undefined);
      }
      const { migrate } = create({ "coretemp.json": { enabled: false, widget: false, alwaysOn: true } });
      assert.strictEqual(migrate.run().alwaysOn, false);
    }
  },
  {
    name: "legacy packed ANT selection is split and never resurrected after clearing",
    fn() {
      const { storage, migrate } = create({ "coretemp.json": { ANT_HRM: { antId: 0x561234 } } });
      migrate.run();
      assert.deepStrictEqual(storage.readJSON("coretemp.hrm.json"), {
        selected: { antId: 4660, txType: 86, transport: "ANT+" },
        recent: [{ antId: 4660, txType: 86, transport: "ANT+" }]
      });
      storage.writeJSON("coretemp.hrm.json", { selected: null, recent: [] });
      migrate.run();
      assert.deepStrictEqual(storage.readJSON("coretemp.hrm.json"), { selected: null, recent: [] });
    }
  },
  {
    name: "new HRM selections and unknown fields survive legacy migration",
    fn() {
      for (const selected of [null, { antId: 10, txType: 20, transport: "ANT+" }]) {
        const recent = [{ antId: 30, txType: 40, transport: "ANT+" }];
        const { storage, migrate } = create({
          "coretemp.json": { ANT_HRM: { antId: 0x561234 } },
          "coretemp.hrm.json": { selected, recent, custom: "keep" }
        });
        migrate.run();
        const result = storage.readJSON("coretemp.hrm.json");
        assert.deepStrictEqual(result.selected, selected);
        assert.deepStrictEqual(result.recent[0], recent[0]);
        assert.strictEqual(result.custom, "keep");
      }
    }
  },
  {
    name: "malformed legacy ANT data is retained without being selected",
    fn() {
      for (const antId of [0, -1, 1.5, 0x1000000, 0x560000, "invalid"]) {
        const { storage, migrate } = create({ "coretemp.json": { ANT_HRM: { antId } } });
        migrate.run();
        assert.strictEqual(storage.readJSON("coretemp.hrm.json").selected, null);
        assert.strictEqual(storage.readJSON("coretemp.json").ANT_HRM.antId, antId);
      }
    }
  },
  {
    name: "failed writes leave migration retryable and do not duplicate recent entries",
    fn() {
      for (const failingFile of ["coretemp.hrm.json", "coretemp.json"]) {
        const { storage, migrate } = create({ "coretemp.json": { ANT_HRM: { antId: 0x561234 } } });
        const write = storage.writeJSON;
        storage.writeJSON = (name, value) => name === failingFile ? false : write(name, value);
        assert.throws(() => migrate.run(), /Cannot migrate/);
        assert.strictEqual(storage.readJSON("coretemp.json").settingsVersion, undefined);
        storage.writeJSON = write;
        migrate.run();
        assert.strictEqual(storage.readJSON("coretemp.json").settingsVersion, 2);
        assert.strictEqual(storage.readJSON("coretemp.hrm.json").recent.length, 1);
      }
    }
  }
];

module.exports.push({
  name: "version 1 upgrade removes obsolete profile and cache once, preserving identity and HRM choices",
  fn() {
    const hrm = { selected: null, recent: [{ antId: 48065, txType: 12 }], custom: true };
    const { storage, migrate } = create({
      "coretemp.json": { settingsVersion: 1, enabled: true, alwaysOn: true,
        btid: "core-1", btname: "CORE", customprofileonly: false, cache: { characteristics: { "0x2a1c": {} } },
        extra: 42, ANT_HRM: { antId: 123 } },
      "coretemp.hrm.json": hrm
    });
    const next = migrate.run();
    assert.strictEqual(next.settingsVersion, 2);
    assert.strictEqual(next.customprofileonly, undefined);
    assert.strictEqual(next.cache, undefined);
    assert.strictEqual(next.btid, "core-1");
    assert.strictEqual(next.btname, "CORE");
    assert.strictEqual(next.alwaysOn, true);
    assert.strictEqual(next.extra, 42);
    assert.deepStrictEqual(storage.readJSON("coretemp.hrm.json"), hrm);
    next.cache = { characteristics: { custom: { handle: 1 } } };
    storage.writeJSON("coretemp.json", next);
    storage.writeJSON = () => { throw new Error("unnecessary migration write"); };
    assert.deepStrictEqual(migrate.run().cache, next.cache);
  }
});
