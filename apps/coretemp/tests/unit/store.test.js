const assert = require("assert");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");

function createStore(seed) {
  const storage = fakeStorage.create(seed);
  const loaded = loader.create({
    storage,
    globals: {
      setInterval() { return 1; },
      clearInterval() {},
      print() {}
    }
  });
  return {
    store: loaded.require("coretemp.store"),
    storage
  };
}

module.exports = [
  {
    name: "partial debug log excludes measurement data lines",
    fn() {
      const { store, storage } = createStore({
        "coretemp.json": {
          debugpartiallog: true
        }
      });
      store.init();
      store.log("data", { core: 37.5 });
      store.log("CORE state -> connected");
      store.flush();

      assert.strictEqual(storage.files["coretemp.log"].indexOf("data:"), -1);
      assert.notStrictEqual(storage.files["coretemp.log"].indexOf("CORE state -> connected"), -1);
    }
  },
  {
    name: "full debug log includes measurement data lines",
    fn() {
      const { store, storage } = createStore({
        "coretemp.json": {
          debuglog: true
        }
      });
      store.init();
      store.log("data", { core: 37.5 });
      store.flush();

      assert.notStrictEqual(storage.files["coretemp.log"].indexOf("data:"), -1);
    }
  }
];
