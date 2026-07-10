/* eslint-env node */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const fakeStorage = require("./fake_storage");

const root = path.resolve(__dirname, "../..");

const sources = {
  "coretemp.protocol": path.join(root, "protocol.js"),
  "coretemp.controlpoint": path.join(root, "controlpoint.js"),
  "coretemp.hrm": path.join(root, "hrm.js"),
  "coretemp.store": path.join(root, "store.js"),
  "coretemp.ble": path.join(root, "ble.js"),
  "coretemp.runtime": path.join(root, "runtime.js"),
  "coretemp.boot": path.join(root, "boot.js"),
  "coretemp.app": path.join(root, "coretemp.js"),
  "coretemp.settingsui": path.join(root, "settingsui.js"),
  CORESensor: path.join(root, "lib.js")
};

exports.create = function createLoader(options) {
  const cache = {};
  const overrides = (options && options.overrides) || {};
  const storage = (options && options.storage) || fakeStorage.create();
  const globals = Object.assign({
    console,
    print() {},
    setTimeout,
    clearTimeout,
    Promise,
    Uint8Array,
    DataView,
    Error,
    Date,
    JSON,
    String,
    Number,
    parseInt,
    isNaN
  }, (options && options.globals) || {});

  function localRequire(name) {
    if (name === "Storage") return storage;
    if (overrides[name]) return overrides[name];
    if (!sources[name]) return require(name);
    if (cache[name]) return cache[name].exports;

    const module = { exports: {} };
    cache[name] = module;
    const code = fs.readFileSync(sources[name], "utf8");
    const wrapped = `(function (exports, require, module) {\n${code}\n})`;
    const context = Object.assign({}, globals, { require: localRequire });
    vm.runInNewContext(wrapped, context, { filename: sources[name] })(module.exports, localRequire, module);
    return module.exports;
  }

  return {
    require: localRequire,
    storage,
    cache
  };
};
