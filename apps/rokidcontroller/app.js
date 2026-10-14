/*
 * Rokid Controller for Bangle.js 2
 *
 * Flat YodaOS-inspired interface for the 176x176 round display.
 *
 * Controls
 * - Tap: Select / Enter
 * - Double tap: Back (HID consumer "AC Back"; a keyboard report cannot send KEYCODE_BACK)
 * - Swipe: all four directions, decided by the actual swipe axis
 *   (horizontal -> Left/Right, vertical -> Up/Down)
 * - Hold BTN1: Confirm / Enter and send UART command "2TAP"
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

var lastError = "";

function safeCall(fn, label) {
  try {
    fn();
  } catch (e) {
    reportError(label, e);
  }
}

function reportError(label, e) {
  lastError = label + (e && e.message ? ": " + e.message : "");
  log("ERROR " + lastError);
  if (screen === "main") drawError();
}

function clearError() {
  if (!lastError) return;
  lastError = "";
  if (screen === "main") drawMainFrame();
}

function log(msg) {
  if (DEBUG) console.log("[ROKID] " + msg);
}

var HAS_HID = typeof NRF !== "undefined" && typeof NRF.sendHIDReport === "function";
var HAS_UART = typeof Bluetooth !== "undefined" && typeof Bluetooth.println === "function";
var HAS_SEC = typeof NRF !== "undefined" && typeof NRF.getSecurityStatus === "function";
var SIM_MODE = !HAS_HID;

// Composite HID descriptor: report 1 is a keyboard, report 2 is consumer control
// carrying "AC Back" and "AC Home". Bangle.js 2 exposes a single input report with
// a maximum length of 8 bytes, and the report id counts towards that length, so the
// keyboard collection carries five keys instead of six (the same trade ble_hid_combo
// makes). AC Back is the only way to reach KEYCODE_BACK.
var HID_ID_KEYBOARD = 1;
var HID_ID_CONSUMER = 2;

var HID_REPORT = new Uint8Array([
  0x05, 0x01,        // Usage Page (Generic Desktop)
  0x09, 0x06,        // Usage (Keyboard)
  0xa1, 0x01,        // Collection (Application)
  0x85, 0x01,        //   Report ID (1)
  0x05, 0x07,        //   Usage Page (Key Codes)
  0x19, 0xe0,        //   Usage Minimum (224)
  0x29, 0xe7,        //   Usage Maximum (231)
  0x15, 0x00,        //   Logical Minimum (0)
  0x25, 0x01,        //   Logical Maximum (1)
  0x75, 0x01,        //   Report Size (1)
  0x95, 0x08,        //   Report Count (8)
  0x81, 0x02,        //   Input (Data, Var, Abs)          modifiers
  0x75, 0x08,        //   Report Size (8)
  0x95, 0x01,        //   Report Count (1)
  0x81, 0x01,        //   Input (Const, Ary, Abs)         reserved
  0x19, 0x00,        //   Usage Minimum (0)
  0x29, 0x73,        //   Usage Maximum (115)
  0x15, 0x00,        //   Logical Minimum (0)
  0x25, 0x73,        //   Logical Maximum (115)
  0x95, 0x05,        //   Report Count (5)
  0x75, 0x08,        //   Report Size (8)
  0x81, 0x00,        //   Input (Data, Ary, Abs)          five keys
  0xc0,              // End Collection
  0x05, 0x0c,        // Usage Page (Consumer Devices)
  0x09, 0x01,        // Usage (Consumer Control)
  0xa1, 0x01,        // Collection (Application)
  0x85, 0x02,        //   Report ID (2)
  0x15, 0x00,        //   Logical Minimum (0)
  0x25, 0x01,        //   Logical Maximum (1)
  0x75, 0x01,        //   Report Size (1)
  0x95, 0x02,        //   Report Count (2)
  0x09, 0x24, 0x02,  //   Usage (AC Back)                 -> KEYCODE_BACK
  0x09, 0x23, 0x02,  //   Usage (AC Home)                 -> KEYCODE_HOME
  0x81, 0x06,        //   Input (Data, Var, Rel)
  0x95, 0x06,        //   Report Count (6)
  0x81, 0x01,        //   Input (Const, Ary, Abs)         pad to one byte
  0xc0               // End Collection
]);

var KEY = {
  ENTER: 0x28,
  ESC: 0x29,
  DOWN: 0x51,
  UP: 0x52,
  LEFT: 0x50,
  RIGHT: 0x4f
};

var CONSUMER = {
  BACK: 0x01,
  HOME: 0x02
};

var hidReady = false;

if (HAS_HID) {
  safeCall(function () {
    NRF.setServices(undefined, {
      hid: HID_REPORT,
      uart: true
    });
    hidReady = true;
    log("HID service registered (report 1 keyboard, report 2 consumer)");
  }, "NRF.setServices");

  // A host decides what a BLE peripheral is from its advertising data, not
  // from the GATT server alone. Without the HID service UUID and an Appearance
  // here, Android binds no HID profile to the watch ("No profiles"), so it
  // never attaches an input device and every report below goes nowhere.
  safeCall(function () {
    NRF.setAdvertising([{}, [ // second packet: HID service + Keyboard appearance
      2, 1, 6,                // flags
      3, 3, 0x12, 0x18,       // HID Service (0x1812)
      3, 0x19, 0xc1, 0x03     // Appearance: Keyboard (0x03C1)
    ]]);
    log("HID advertising set");
  }, "NRF.setAdvertising");
} else {
  log("HID unavailable; emulator mode active");
}

var screen = "main";
var state = {
  action: "",
  status: "",
  blink: true
};

var lastTapTime = 0;
var dragStart = null;
var dragPos = null;
var btnDownTime = 0;

var DOUBLE_TAP_MS = 350;
var SWIPE_THRESHOLD = 30;
var HOLD_MS = 400;

var R = {
  title: { y1: 18, y2: 42 },
  status: { y1: 50, y2: 62 },
  action: { y1: 72, y2: 106 },
  footer: { y1: 142, y2: 153 }
};

function divider(y, color) {
  line(color, 38, y, 138, y);
}

function statusText() {
  if (SIM_MODE) return "EMULATOR";
  if (!hidReady) return "HID OFF";

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

function drawError() {
  fill(THEME.bg, 8, 138, 168, 158);
  g.setFont("6x8", 1);
  setC([1, 0.35, 0.35]);

  var msg = "ERR " + lastError;
  if (g.stringWidth(msg) > 158) msg = msg.substr(0, 21) + "..";
  centered(msg, 142);

  setC(THEME.mid);
  centered("HID SEND FAILED", 152);
  g.flip(8, 138, 168, 158);
}

function drawMainFrame() {
  g.clear();
  drawHeader("ROKID REMOTE", "HID CONTROL");
  drawStatus(true);

  g.setFont("6x8", 1);
  setC(THEME.cyan);
  centered("LAST ACTION", 72);
  divider(84, THEME.dim);

  divider(135, THEME.dim);

  if (lastError) {
    drawError();
  } else {
    setC(THEME.mid);
    centered("TAP SELECT  ·  x2 BACK", R.footer.y1);
    centered("HOLD BTN CONFIRM", R.footer.y1 + 10);
  }

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

// Reports go out one at a time: NRF.sendHIDReport throws "BLE HID already sending"
// when it is called while a report is in flight, so each report waits for the
// previous one's callback.
function sendReports(reports, label) {
  if (!HAS_HID) return;

  var index = 0;

  function next() {
    if (index >= reports.length) {
      clearError();
      return;
    }

    var report = reports[index];
    index += 1;
    safeCall(function () {
      NRF.sendHIDReport(report, next);
    }, label);
  }

  next();
}

function buzz() {
  if (typeof Bangle !== "undefined" && Bangle.buzz) {
    safeCall(function () {
      Bangle.buzz(30);
    }, "Bangle.buzz");
  }
}

function tapKey(code, action) {
  log("input " + action + " -> keyboard " + code + (SIM_MODE ? " [SIM]" : ""));

  sendReports([
    [HID_ID_KEYBOARD, 0, 0, code, 0, 0, 0, 0],
    [HID_ID_KEYBOARD, 0, 0, 0, 0, 0, 0, 0]
  ], "keyboard report");

  buzz();
  drawAction(action);
}

function sendConsumer(bit, action) {
  log("input " + action + " -> consumer " + bit + (SIM_MODE ? " [SIM]" : ""));

  sendReports([
    [HID_ID_CONSUMER, bit],
    [HID_ID_CONSUMER, 0]
  ], "consumer report");

  buzz();
  drawAction(action);
}

function sendUartCmd(command) {
  if (!HAS_UART) return;
  safeCall(function () {
    Bluetooth.println(command);
  }, "Bluetooth.println");
}

Bangle.on("touch", function (zone, e) {
  var now = Date.now();
  if (now - lastTapTime < DOUBLE_TAP_MS) {
    sendConsumer(CONSUMER.BACK, "BACK");
    lastTapTime = 0;
  } else {
    tapKey(KEY.ENTER, "SELECT");
    lastTapTime = now;
  }
});

// Swipe recognition uses the real swipe axis: the dominant component of the
// gesture decides whether it maps to Left/Right or Up/Down, so all four
// directions work with no mode setting. The release event can carry no usable
// x/y, so the last in-drag position is tracked and used instead.
Bangle.on("drag", function (e) {
  if (screen !== "main") return;

  if (e.b) {
    if (dragStart === null) {
      dragStart = { x: e.x, y: e.y };
      dragPos = { x: e.x, y: e.y };
    } else if (typeof e.x === "number" && typeof e.y === "number") {
      dragPos = { x: e.x, y: e.y };
    }
    return;
  }

  if (dragStart === null) return;

  var dx = dragPos.x - dragStart.x;
  var dy = dragPos.y - dragStart.y;
  dragStart = null;
  dragPos = null;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) <= SWIPE_THRESHOLD) return;
    tapKey(dx > 0 ? KEY.RIGHT : KEY.LEFT, dx > 0 ? "RIGHT" : "LEFT");
  } else {
    if (Math.abs(dy) <= SWIPE_THRESHOLD) return;
    tapKey(dy > 0 ? KEY.DOWN : KEY.UP, dy > 0 ? "DOWN" : "UP");
  }
});

var btnWatch = setWatch(function (e) {
  if (e.state) {
    btnDownTime = Date.now();
    return;
  }

  if (Date.now() - btnDownTime >= HOLD_MS) {
    tapKey(KEY.ENTER, "CONFIRM");
    sendUartCmd("2TAP");
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
