/* eslint-env node */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");
const root = path.resolve(__dirname, "../..");

function customPage(seed, options = {}) {
  const elements = {};
  let uploaded;
  const storage = fakeStorage.create(seed);
  const context = vm.createContext({
    document: {
      getElementById(id) {
        if (!elements[id]) elements[id] = { value: "", checked: false, handlers: {},
          addEventListener(event, handler) { this.handlers[event] = handler; } };
        return elements[id];
      }
    },
    window: {},
    setTimeout: options.setTimeout || setTimeout,
    clearTimeout: options.clearTimeout || clearTimeout,
    Util: { readStorageJSON: options.readStorageJSON || function (name, callback) { callback(storage.readJSON(name)); } },
    sendCustomizedApp(options) { uploaded = JSON.parse(JSON.stringify(options)); }
  });
  vm.runInContext(fs.readFileSync(path.join(root, "migration.js"), "utf8"), context);
  const html = fs.readFileSync(path.join(root, "custom.html"), "utf8");
  context.document.getElementById("upload").disabled = /<button[^>]*id="upload"[^>]*\bdisabled\b/.test(html);
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  context.window.onload();
  return { context, elements, storage, upload() {
    elements.upload.handlers.click();
    return uploaded;
  } };
}

async function install(storage, customized) {
  const app = JSON.parse(fs.readFileSync(path.join(root, "metadata.json"), "utf8"));
  if (customized) {
    // The parent App Loader merges custom entries by filename, appending replacements.
    customized.storage.forEach(file => {
      app.storage = app.storage.filter(old => old.name !== file.name);
      app.storage.push(file);
    });
  }
  const context = vm.createContext({
    Espruino: { Core: { Utils: { btoa(value) { return Buffer.from(value, "binary").toString("base64"); } } } },
    Const: { UPLOAD_CHUNKSIZE: 1024 }, console
  });
  const appInfo = path.resolve(root, "../../core/js/appinfo.js");
  vm.runInContext(fs.readFileSync(appInfo, "utf8"), context);
  // Exercise the actual packaging/ordering code without minification or device I/O.
  vm.runInContext("parseJS = file => Promise.resolve(file);", context);
  const files = await vm.runInContext("AppInfo", context).getFiles(app, {
    device: { id: "BANGLEJS2" }, settings: {},
    fileGetter(url) { return Promise.resolve(fs.readFileSync(path.resolve(root, "../..", url), "utf8")); }
  });
  const loaded = loader.create({ storage });
  for (const file of files) {
    if (file.name === "RAM") vm.runInNewContext(file.content, { require: loaded.require });
    else if (file.name === "coretemp.json" || file.name === "coretemp.hrm.json") {
      if (!file.noOverwrite || storage.read(file.name) === undefined) {
        storage.writeJSON(file.name, JSON.parse(file.content));
      }
    }
  }
  return files;
}

module.exports = [
  {
    name: "custom initialization serializes delayed reads and enables upload only after both finish",
    async fn() {
      const pending = [];
      const page = customPage(undefined, {
        readStorageJSON(name, callback) { pending.push({ name, callback }); }
      });
      const ready = page.context.onInit();
      assert.deepStrictEqual(pending.map(read => read.name), ["coretemp.json"]);
      assert.strictEqual(page.elements.upload.disabled, true);
      assert.strictEqual(page.upload(), undefined);
      pending[0].callback({ enabled: false, warnDisconnect: true });
      await Promise.resolve();
      assert.deepStrictEqual(pending.map(read => read.name), ["coretemp.json", "coretemp.hrm.json"]);
      assert.strictEqual(page.elements.upload.disabled, true);
      assert.strictEqual(page.upload(), undefined);
      pending[1].callback({ selected: { antId: 19457, txType: 86 }, recent: [] });
      await ready;
      assert.strictEqual(page.elements.upload.disabled, false);
      assert.strictEqual(page.elements.status.textContent, "");
      assert.strictEqual(page.elements.antId.value, 19457);
      const uploaded = page.upload();
      const settings = JSON.parse(uploaded.storage.find(file => file.name === "coretemp.json").content);
      assert.strictEqual(settings.enabled, false);
      assert.strictEqual(settings.warnDisconnect, true);
      const hrm = JSON.parse(uploaded.storage.find(file => file.name === "coretemp.hrm.json").content);
      assert.strictEqual(hrm.selected.txType, 86);
    }
  },
  {
    name: "custom read timeout keeps upload blocked even after a late callback",
    async fn() {
      let expire, respond;
      const page = customPage(undefined, {
        readStorageJSON(name, callback) { respond = callback; },
        setTimeout(callback) { expire = callback; return 1; },
        clearTimeout() {}
      });
      assert.strictEqual(page.elements.upload.disabled, true);
      const ready = page.context.onInit();
      expire();
      await ready;
      assert.match(page.elements.status.textContent, /Timed out reading coretemp.json/);
      assert.match(page.elements.status.textContent, /Reconnect/);
      respond({ enabled: true });
      await Promise.resolve();
      assert.strictEqual(page.elements.upload.disabled, true);
      assert.strictEqual(page.upload(), undefined);
    }
  },
  {
    name: "standard installation migrates before no-overwrite data defaults",
    async fn() {
      for (const seed of [undefined, { "coretemp.json": { enabled: false, ANT_HRM: { antId: 0x561234 } } }]) {
        const storage = fakeStorage.create(seed);
        const files = await install(storage);
        assert.ok(files.findIndex(f => f.name === "coretemp.migrate") < files.findIndex(f => f.name === "RAM"));
        assert.strictEqual(storage.readJSON("coretemp.json").enabled, !seed);
        assert.strictEqual(storage.readJSON("coretemp.json").alwaysOn, false);
        assert.strictEqual(storage.readJSON("coretemp.json").widget, !seed);
        if (seed) assert.strictEqual(storage.readJSON("coretemp.hrm.json").selected.txType, 86);
        await install(storage);
        if (seed) assert.strictEqual(storage.readJSON("coretemp.hrm.json").recent.length, 1);
      }
    }
  },
  {
    name: "custom upload waits for reads and preserves legacy HRM transmission type",
    async fn() {
      const page = customPage({ "coretemp.json": {
        ANT_HRM: { antId: 0x561234 }, enabled: false, widget: false, warnDisconnect: true
      } });
      assert.strictEqual(page.upload(), undefined);
      await page.context.onInit();
      assert.strictEqual(page.elements.antId.value, 4660);
      assert.strictEqual(page.elements.enabled.checked, false);
      const customized = page.upload();
      assert.strictEqual(customized.storage[customized.storage.length - 1].name, "RAM");
      assert.ok(customized.storage.findIndex(f => f.name === "coretemp.hrm.json") <
        customized.storage.findIndex(f => f.name === "coretemp.json"));
      await install(page.storage, customized);
      assert.strictEqual(page.storage.readJSON("coretemp.hrm.json").selected.txType, 86);
      assert.strictEqual(page.storage.readJSON("coretemp.json").warnDisconnect, true);
      assert.strictEqual(page.storage.readJSON("coretemp.json").enabled, false);
    }
  },
  {
    name: "custom clearing survives final migration and power toggles preserve false",
    async fn() {
      const page = customPage({ "coretemp.json": { ANT_HRM: { antId: 0x561234 } } });
      await page.context.onInit();
      page.elements.antId.value = "";
      page.elements.alwaysOn.checked = true;
      page.elements.enabled.checked = false;
      page.elements.enabled.handlers.change();
      assert.strictEqual(page.elements.alwaysOn.checked, false);
      assert.strictEqual(page.elements.alwaysOn.disabled, true);
      await install(page.storage, page.upload());
      await install(page.storage);
      assert.strictEqual(page.storage.readJSON("coretemp.hrm.json").selected, null);
      assert.strictEqual(page.storage.readJSON("coretemp.json").enabled, false);
      assert.strictEqual(page.storage.readJSON("coretemp.json").alwaysOn, false);
    }
  }
];
