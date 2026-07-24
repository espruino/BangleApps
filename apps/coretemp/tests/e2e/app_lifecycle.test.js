const assert = require("assert");
const loader = require("../helpers/module_loader");
const fakeStorage = require("../helpers/fake_storage");

function createGraphics() {
  return {
    theme: { bg: "#fff", dark: false },
    clears: [],
    bgColor: undefined,
    getWidth() { return 176; },
    getHeight() { return 176; },
    clear() { this.clears.push({ type: "clear", bgColor: this.bgColor }); return this; },
    reset() { return this; },
    setBgColor(color) { this.bgColor = color; return this; },
    setFont() { return this; },
    setFontAlign() { return this; },
    clearRect() { this.clears.push({ type: "clearRect", bgColor: this.bgColor }); return this; },
    setColor() { return this; },
    drawString() { return this; },
    drawImage() { return this; }
  };
}

module.exports = [
  {
    name: "boot loads runtime only when background is enabled",
    fn() {
      let enableCount = 0;
      let powerCalls = [];
      const loaded = loader.create({
        storage: fakeStorage.create({
          "coretemp.json": { enabled: true }
        }),
        globals: {
          Bangle: {
            setCORESensorPower(on, owner) {
              powerCalls.push([on, owner]);
            }
          }
        },
        overrides: {
          CORESensor: {
            enable() {
              enableCount++;
            }
          }
        }
      });

      loaded.require("coretemp.boot");

      assert.strictEqual(enableCount, 1);
      assert.deepStrictEqual(powerCalls, []);
    }
  },
  {
    name: "foreground app uses temporary COREAPP owner without enabling background",
    fn() {
      let enableCount = 0;
      let killHandler;
      const powerCalls = [];
      const listeners = {};
      const storage = fakeStorage.create({
        "coretemp.json": { enabled: false, btid: "core-1" }
      });
      const Bangle = {
        loadWidgets() {},
        drawWidgets() {},
        on(name, handler) {
          listeners[name] = handler;
        },
        removeListener(name, handler) {
          if (listeners[name] === handler) delete listeners[name];
        },
        setCORESensorPower(on, owner) {
          powerCalls.push([on, owner]);
        }
      };
      const graphics = createGraphics();
      const loaded = loader.create({
        storage,
        globals: {
          Bangle,
          E: {
            on(name, handler) {
              if (name === "kill") killHandler = handler;
            }
          },
          g: graphics,
          atob() {
            return "";
          },
          process: { env: { HWVERSION: 2 } }
        },
        overrides: {
          heatshrink: {
            decompress() {
              return "";
            }
          },
          CORESensor: {
            enable() {
              enableCount++;
            }
          }
        }
      });

      loaded.require("coretemp.app");

      assert.strictEqual(enableCount, 1);
      assert.strictEqual(typeof listeners.CORESensor, "function");
      assert.deepStrictEqual(powerCalls, [[1, "COREAPP"]]);
      assert.strictEqual(storage.readJSON("coretemp.json", 1).enabled, false);
      assert.strictEqual(graphics.clears[0].bgColor, "#fff");

      graphics.setBgColor("#0f0");
      listeners.CORESensor({ core: 37.1, skin: 35.2, unit: "C", hsiValid: false, battery: 80 });

      assert.strictEqual(graphics.clears[graphics.clears.length - 1].bgColor, "#fff");

      killHandler();

      assert.strictEqual(listeners.CORESensor, undefined);
      assert.deepStrictEqual(powerCalls, [[1, "COREAPP"], [0, "COREAPP"]]);
      assert.strictEqual(storage.readJSON("coretemp.json", 1).enabled, false);
    }
  }
];
