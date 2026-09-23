/* eslint-env node */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");
const fakeBLE = require("../helpers/fake_ble");

function harness(settings) {
  const handlers = {};
  const calls = [];
  const texts = [];
  const colors = [];
  let initialized = 0;
  const Bangle = {
    loadWidgets() {}, drawWidgets() {},
    on(name, fn) { handlers[name] = fn; },
    removeListener(name) { delete handlers[name]; },
    setCORESensorPower(on, owner) { calls.push([on, owner]); },
    CORESensorPair() {},
    CORESensorGetStatus() { return { enabled: true, alwaysOn: false, connected: true }; }
  };
  const g = {
    theme: { bg: "#fff", dark: false },
    getWidth() { return 176; }, getHeight() { return 176; },
    drawString(text) { texts.push(text); return this; },
    setColor(color) { colors.push(color); return this; }
  };
  ["reset", "setBgColor", "clear", "clearRect", "setFontAlign", "setFont", "drawImage"].forEach(name => {
    g[name] = () => g;
  });
  const storage = fakeStorage.create({ "coretemp.json": settings });
  const globals = {
    Bangle, g, WIDGETS: {}, E: { on() {} }, atob: value => value,
    process: { env: { HWVERSION: 2 } }, setInterval() { return 1; }
  };
  const loaded = loader.create({ storage, globals, overrides: {
    heatshrink: { decompress(value) { return value; } },
    CORESensor: { enable() { initialized++; } }
  } });
  return { loaded, storage, globals, handlers, calls, texts, colors,
    initialized() { return initialized; } };
}

module.exports = [
  {
    name: "real enabled boot initializes all APIs without BLE activity; disabled boot does not initialize",
    fn() {
      for (const enabled of [true, false]) {
        const protocol = loader.create().require("coretemp.protocol");
        const env = fakeBLE.create(protocol);
        const Bangle = { emit() {} };
        const loaded = loader.create({
          storage: fakeStorage.create({ "coretemp.json": { enabled, btid: "core-1" } }),
          globals: { Bangle, NRF: env.NRF, E: { on() {} } }
        });
        loaded.require("coretemp.boot");
        assert.strictEqual(typeof Bangle.setCORESensorPower, enabled ? "function" : "undefined");
        assert.strictEqual(env.NRF.requests.length, 0);
        if (enabled) assert.strictEqual(Bangle.isCORESensorOn(), false);
      }
    }
  },
  {
    name: "foreground app respects Enable and accepts name-only pairing",
    fn() {
      for (const enabled of [false, true]) {
        const h = harness({ enabled, btname: "CORE" });
        h.loaded.require("coretemp.app");
        assert.strictEqual(h.initialized(), enabled ? 1 : 0);
        assert.deepStrictEqual(h.calls, enabled ? [[1, "COREAPP"]] : []);
        if (!enabled) assert.ok(h.texts.some(text => /Enable in Settings/.test(text)));
      }
    }
  },
  {
    name: "Recorder initializes and owns enabled sessions while preserving CSV fields",
    fn() {
      for (const enabled of [false, true]) {
        const h = harness({ enabled, btid: "core-1" });
        const source = fs.readFileSync(path.resolve(__dirname, "../../recorder.js"), "utf8");
        const register = vm.runInNewContext(source, Object.assign({ require: h.loaded.require }, h.globals));
        const recorders = {};
        register(recorders);
        const recorder = recorders.coretemp();
        recorder.start();
        assert.strictEqual(h.initialized(), enabled ? 1 : 0);
        assert.deepStrictEqual(h.calls, enabled ? [[1, "coretemp.recorder"]] : []);
        assert.deepStrictEqual(Array.from(recorder.fields), ["Core", "Skin", "Unit", "HeartRate", "HeatFlux", "HeatStrainIndex", "Battery", "Quality"]);
        if (enabled) {
          h.handlers.CORESensor({ core: 37, skin: 34, unit: "C", hr: 80, heatflux: 1, hsi: 2, hsiValid: true, battery: 90, dataQuality: 3 });
          assert.deepStrictEqual(Array.from(recorder.getValues()), [37, 34, "C", 80, 1, 2, 90, 3]);
        }
        recorder.stop();
        assert.strictEqual(h.handlers.CORESensor, undefined);
        assert.deepStrictEqual(h.calls[h.calls.length - 1], [0, "coretemp.recorder"]);
      }
    }
  },
  {
    name: "widget distinguishes fallback, on-demand, Always On and disconnected states",
    fn() {
      const h = harness({ enabled: true, alwaysOn: false, widget: true });
      h.loaded.require("coretemp.widget");
      assert.ok(h.colors.includes("#0f0"));
      assert.ok(!h.colors.includes("#00f"));
      h.colors.length = 0;
      h.handlers.CORESensorStatus({ enabled: true, alwaysOn: true, connected: true });
      assert.ok(h.colors.includes("#00f"));
      for (const alwaysOn of [false, true]) {
        h.colors.length = 0;
        h.handlers.CORESensorStatus({ connected: true, alwaysOn, profile: "health_thermometer" });
        assert.ok(h.colors.includes("#f80"));
        h.colors.length = 0;
        h.handlers.CORESensorStatus({ connected: true, alwaysOn, profile: "custom_core" });
        assert.ok(h.colors.includes(alwaysOn ? "#00f" : "#0f0"));
      }
      h.colors.length = 0;
      h.handlers.CORESensorStatus({ connected: false, alwaysOn: true, profile: "health_thermometer" });
      assert.ok(h.colors.includes("#CCC"));
      const hidden = harness({ enabled: true, widget: false });
      hidden.loaded.require("coretemp.widget");
      assert.strictEqual(hidden.globals.WIDGETS.coretemp, undefined);
    }
  },
  {
    name: "watch settings preserve explicit off values and expose Always On only when enabled",
    fn() {
      const h = harness({ enabled: true, alwaysOn: false, widget: true });
      let menu;
      h.globals.E.showMenu = next => { menu = next; };
      h.loaded.require("coretemp.settingsui").open(() => {});
      assert.ok(menu.Enable);
      assert.ok(menu["Always On"]);
      menu.Widget.onchange(false);
      assert.strictEqual(h.storage.readJSON("coretemp.json").widget, false);
      menu.Enable.onchange(false);
      assert.strictEqual(h.storage.readJSON("coretemp.json").enabled, false);
      assert.strictEqual(h.storage.readJSON("coretemp.json").alwaysOn, false);
      assert.strictEqual(menu["Always On"], undefined);
      menu.Enable.onchange(true);
      assert.ok(menu["Always On"]);
      assert.strictEqual(h.storage.readJSON("coretemp.json").alwaysOn, false);
    }
  }
];
