/* eslint-env node */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

module.exports = [
  {
    name: "manifest includes deployable HRM modules but excludes tests",
    fn() {
      const root = path.resolve(__dirname, "../..");
      const metadata = JSON.parse(fs.readFileSync(path.join(root, "metadata.json"), "utf8"));
      const urls = metadata.storage.concat(metadata.data || []).map(entry => entry.url);
      assert.strictEqual(metadata.custom, "custom.html");
      assert.strictEqual(metadata.customConnect, true);
      assert.ok(urls.includes("protocol.js"));
      assert.ok(urls.includes("controlpoint.js"));
      assert.ok(urls.includes("hrm.js"));
      assert.ok(urls.includes("hrm.json"));
      assert.strictEqual(urls.some(url => /(^|\/)tests\//.test(url)), false);
    }
  },
  {
    name: "packaged defaults leave background runtime disabled",
    fn() {
      const root = path.resolve(__dirname, "../..");
      const settings = JSON.parse(fs.readFileSync(path.join(root, "app-settings.json"), "utf8"));
      assert.strictEqual(settings.enabled, false);
      assert.strictEqual(settings.widget, true);
      assert.strictEqual(settings.customprofileonly, false);
      assert.strictEqual(settings.debugMode, false);
      assert.strictEqual(settings.antScanWindowSec, 5);
      assert.strictEqual(Object.prototype.hasOwnProperty.call(settings, "warn" + "Disconnect"), false);
    }
  }
];
