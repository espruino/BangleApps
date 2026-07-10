/* eslint-env node */
const path = require("path");

const files = [
  "unit/protocol.test.js",
  "unit/store.test.js",
  "unit/controlpoint.test.js",
  "behaviour/hrm_scan.test.js",
  "behaviour/hrm_pair.test.js",
  "behaviour/hrm_status_clear.test.js",
  "e2e/app_lifecycle.test.js",
  "e2e/ble_controlpoint.test.js",
  "e2e/coretemp_runtime.test.js",
  "e2e/settings_hrm_flow.test.js",
  "e2e/manifest_packaging.test.js"
];

async function run() {
  let failures = 0;
  for (const file of files) {
    const fullPath = path.join(__dirname, file);
    const tests = require(fullPath);
    for (const testCase of tests) {
      try {
        await testCase.fn();
        console.log("ok - " + file + " - " + testCase.name);
      } catch (err) {
        failures++;
        console.error("not ok - " + file + " - " + testCase.name);
        console.error(err && err.stack ? err.stack : err);
      }
    }
  }
  if (failures) process.exitCode = 1;
}

run();
