/*
 * Rokid Controller for Bangle.js 2
 *
 * Flat YodaOS-inspired interface for the 176x176 round display.
 *
 * Controls
 * - Tap: Select / Enter
 * - Double tap: Back / Escape
 * - Swipe: Previous / Next (configured axis and direction)
 * - Hold BTN1: Confirm / Enter and send UART command "2TAP"
 * - Double press BTN1: Open settings; press again to save and return
 */

var CX = 88;
var DEBUG = true;

var THEME = {
  bg: [0, 0, 0],
  neon: [0, 1, 0.25],
  cyan: [0, 0.72, 0.72],
  mid: [0, 0.48, 0.14],
  dim: [0, 0.20, 0.07]
};

function setC(c) {
  g.setColor(c[0], c[1], c[2]);
}

function fill(c, x1, y1, x2, y2) {
  setC(c);
  g.fillRect(x1, y1, x2, y2);
}

function line(c, x1, y1, x2, y2) {
  setC(c);
  g.drawLine(x1, y1, x2, y2);
}

function centered(text, y) {
  g.drawString(text, CX - g.stringWidth(text) / 2, y);
}

function safeCall(fn, label) {
  try {
    fn();
  } catch (e) {
    log("ERROR " + label + ": " + e.message);
  }
}

function log(msg) {
  if (DEBUG) console.log("[ROKID] " + msg);
}

var HAS_HID = typeof NRF !== "undefined" && typeof NRF.sendHIDReport === "function";
var HAS_UART = typeof Bluetooth !== "undefined" && typeof Bluetooth.println === "function";
var HAS_SEC = typeof NRF !== "undefined" && typeof NRF.getSecurityStatus === "function";
var SIM_MODE = !HAS_HID;

var kb = null;
try {
  kb = require("ble_hid_keyboard");
} catch (e) {
  log("ble_hid_keyboard unavailable");
}

if (HAS_HID && kb) {
  safeCall(function () {
    NRF.setServices(undefined, {
      hid: kb.report,
      uart: true
    });
    log("BLE HID service registered");
  }, "NRF.setServices");
} else {
  log("HID unavailable; emulator mode active");
}

var Storage = require("Storage");
var CFG_FILE = "rokidremote.json";
var cfg = Object.assign(
  { axis: "vertical", invert: false },
  Storage.readJSON(CFG_FILE, 1) || {}
);

function saveCfg() {
  safeCall(function () {
    Storage.writeJSON(CFG_FILE, cfg);
  }, "Storage.writeJSON");
}

var screen = "main";
var state = {
  action: "",
  status: "",
  blink: true
};

var lastTapTime = 0;
var dragStart = null;
var btnDownTime = 0;
var btnPressTimes = [];

var DOUBLE_TAP_MS = 350;
var SWIPE_THRESHOLD = 30;
var HOLD_MS = 400;
var BTN_DBL_WINDOW_MS = 450;

var R = {
  title: { y1: 18, y2: 42 },
  status: { y1: 50, y2: 62 },
  action: { y1: 72, y2: 106 },
  mode: { y1: 113, y2: 124 },
  footer: { y1: 142, y2: 153 }
};

var SETTINGS_ROWS = [
  {
    key: "axis",
    y1: 59,
    y2: 81,
    label: "SWIPE AXIS",
    value: function () { return cfg.axis.toUpperCase(); }
  },
  {
    key: "invert",
    y1: 87,
    y2: 109,
    label: "DIRECTION",
    value: function () { return cfg.invert ? "INVERTED" : "NORMAL"; }
  },
  {
    key: "back",
    y1: 115,
    y2: 137,
    label: "SAVE + RETURN",
    value: function () { return "<"; }
  }
];

function divider(y, color) {
  line(color, 38, y, 138, y);
}

function statusText() {
  if (SIM_MODE) return "EMULATOR";

  var connected = false;
  if (HAS_SEC) {
    try {
      connected = !!NRF.getSecurityStatus().connected;
    } catch (e) {}
  }

  return connected ? "BLE CONNECTED" : "BLE ADVERTISING";
}

function drawHeader(title, subtitle) {
  g.setFont("6x8", 1);
  setC(THEME.neon);
  centered(title, 18);

  setC(THEME.cyan);
  centered(subtitle, 29);

  divider(42, THEME.mid);
}

function drawStatus(force) {
  var text = statusText();
  if (!force && text === state.status && !SIM_MODE) return;

  state.status = text;
  fill(THEME.bg, 30, R.status.y1, 146, R.status.y2);

  var active = text === "BLE CONNECTED" || (SIM_MODE && state.blink);
  fill(active ? THEME.neon : THEME.dim, 39, 54, 43, 58);

  g.setFont("6x8", 1);
  setC(active ? THEME.neon : THEME.mid);
  centered(text, 51);
}

function drawMainFrame() {
  g.clear();
  drawHeader("ROKID REMOTE", "HID CONTROL");
  drawStatus(true);

  g.setFont("6x8", 1);
  setC(THEME.cyan);
  centered("LAST ACTION", 72);
  divider(84, THEME.dim);

  setC(THEME.dim);
  centered("SWIPE: " + cfg.axis.toUpperCase(), R.mode.y1);
  centered("MODE: " + (cfg.invert ? "INVERTED" : "NORMAL"), R.mode.y1 + 10);

  divider(135, THEME.dim);

  setC(THEME.mid);
  centered("TAP SELECT  ·  x2 CONFIG", R.footer.y1);
  centered("HOLD BTN CONFIRM", R.footer.y1 + 10);

  g.flip();
}

function drawAction(label, force) {
  if (!force && label === state.action) return;
  state.action = label;

  fill(THEME.bg, 30, 87, 146, 106);
  g.setFont("6x8", 2);
  setC(THEME.neon);
  centered(label, 88);
  g.flip(30, 87, 146, 106);
}

function drawSettingRow(row) {
  line(THEME.mid, 30, row.y1, 146, row.y1);
  line(THEME.dim, 30, row.y2, 146, row.y2);

  g.setFont("6x8", 1);
  setC(THEME.cyan);
  g.drawString(row.label, 31, row.y1 + 7);

  var value = row.value();
  setC(THEME.neon);
  g.drawString(value, 145 - g.stringWidth(value), row.y1 + 7);
}

function drawSettings() {
  g.clear();
  drawHeader("ROKID CONFIG", "INPUT PROFILE");

  SETTINGS_ROWS.forEach(drawSettingRow);

  g.setFont("6x8", 1);
  setC(THEME.dim);
  centered("TAP A ROW TO CHANGE", 149);
  centered("BTN x2 SAVES AND EXITS", 159);

  g.flip();
}

function openSettings() {
  screen = "settings";
  drawSettings();
  log("settings opened");
}

function closeSettings() {
  screen = "main";
  saveCfg();
  state.action = "";
  state.status = "";
  drawMainFrame();
  drawAction("READY", true);
  log("settings saved");
}

function keyCode(name, fallback) {
  return kb && kb.KEY ? kb.KEY[name] : fallback;
}

function sendKey(code, action) {
  log("input " + action + " -> " + code + (SIM_MODE ? " [SIM]" : ""));

  if (HAS_HID && kb) {
    safeCall(function () {
      kb.tap(code, 0, function () {});
    }, "kb.tap");
  }

  if (typeof Bangle !== "undefined" && Bangle.buzz) {
    safeCall(function () {
      Bangle.buzz(30);
    }, "Bangle.buzz");
  }

  drawAction(action);
}

function sendUartCmd(command) {
  if (!HAS_UART) return;
  safeCall(function () {
    Bluetooth.println(command);
  }, "Bluetooth.println");
}

Bangle.on("touch", function (zone, e) {
  var y = e && e.y;

  if (screen === "settings") {
    if (typeof y !== "number") return;

    var hit = SETTINGS_ROWS.filter(function (row) {
      return y >= row.y1 && y <= row.y2;
    })[0];

    if (!hit) return;

    if (hit.key === "axis") {
      cfg.axis = cfg.axis === "vertical" ? "horizontal" : "vertical";
      drawSettings();
    } else if (hit.key === "invert") {
      cfg.invert = !cfg.invert;
      drawSettings();
    } else {
      closeSettings();
    }
    return;
  }

  var now = Date.now();
  if (now - lastTapTime < DOUBLE_TAP_MS) {
    sendKey(keyCode("ESC", 0x29), "BACK");
    lastTapTime = 0;
  } else {
    sendKey(keyCode("ENTER", 0x28), "SELECT");
    lastTapTime = now;
  }
});

Bangle.on("drag", function (e) {
  if (screen !== "main") return;

  var primary = cfg.axis === "horizontal" ? e.x : e.y;
  if (typeof primary !== "number") return;

  if (e.b && dragStart === null) {
    dragStart = primary;
    return;
  }

  if (!e.b && dragStart !== null) {
    var delta = primary - dragStart;
    dragStart = null;

    if (Math.abs(delta) <= SWIPE_THRESHOLD) return;

    var forward = delta > 0;
    if (cfg.invert) forward = !forward;

    sendKey(
      forward ? keyCode("DOWN", 0x51) : keyCode("UP", 0x52),
      forward ? "NEXT" : "PREVIOUS"
    );
  }
});

var btnWatch = setWatch(function (e) {
  if (e.state) {
    btnDownTime = Date.now();
    return;
  }

  if (Date.now() - btnDownTime >= HOLD_MS) {
    sendKey(keyCode("ENTER", 0x28), "CONFIRM");
    sendUartCmd("2TAP");
    return;
  }

  var now = Date.now();
  btnPressTimes.push(now);
  btnPressTimes = btnPressTimes.filter(function (t) {
    return now - t < BTN_DBL_WINDOW_MS;
  });

  if (btnPressTimes.length >= 2) {
    btnPressTimes = [];
    if (screen === "main") openSettings();
    else closeSettings();
  }
}, BTN1, {
  repeat: true,
  edge: "both",
  debounce: 30
});

safeCall(function () {
  Bangle.setUI({ mode: "custom" });
}, "Bangle.setUI");

drawMainFrame();
drawAction("READY", true);

var statusTimer = setInterval(function () {
  if (SIM_MODE) state.blink = !state.blink;

  if (screen === "main") {
    drawStatus(SIM_MODE);
    g.flip(30, R.status.y1, 146, R.status.y2);
  }
}, 3000);

E.on("kill", function () {
  clearWatch(btnWatch);
  clearInterval(statusTimer);
});

log("Rokid Controller started; SIM_MODE=" + SIM_MODE);
