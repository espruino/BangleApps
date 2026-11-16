/* Keyring - encrypted PIN-gated secrets on the wrist, backed by EncStore.
   Entries are provisioned off-watch (see modules/EncStore.md); this app
   views and deletes them, and can be re-PINed. */

const LOCK = "keyring.lock";
const ITERS = 400;

var ENC = require("encstore");
var entries = []; // filled after unlock

const TOKEN_DIGITS_HEIGHT = 26;
const KEYPAD_TOP = 54;

// ---------- rendering ----------
var half = n => Math.floor(n / 2);

function fullRedraw(fn) {
  g.setBgColor(g.theme.bg).setColor(g.theme.fg);
  g.clearRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
  Bangle.drawWidgets();
  fn();
  Bangle.setLCDPower(1);
}

function drawKeypad(title, msg, dots) {
  g.reset();
  g.setBgColor(g.theme.bg).setColor(g.theme.fg);
  g.setFont("Vector", 14).setFontAlign(0, 0, 0);
  g.drawString(title, half(g.getWidth()), Bangle.appRect.y + 12);
  if (msg) {
    g.setFont("Vector", 10);
    g.drawString(msg, half(g.getWidth()), Bangle.appRect.y + 26);
  }
  let top = Bangle.appRect.y + 30;
  let kw = (Bangle.appRect.w + 1) / 3, kh = Math.floor((Bangle.appRect.y2 - top) / 4);
  let labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"];
  for (let i = 0; i < 12; i++) {
    let cx = Bangle.appRect.x + (i % 3) * kw, cy = top + Math.floor(i / 3) * kh;
    g.setBgColor(g.theme.bg2).setColor(g.theme.bg2);
    g.fillRect(cx + 1, cy + 1, cx + kw - 2, cy + kh - 2);
    g.setColor(g.theme.fg).setBgColor(g.theme.bg2);
    g.setFont("Vector", 16).setFontAlign(0, 0, 0);
    g.drawString(labels[i], cx + kw / 2, cy + kh / 2);
  }
  if (dots) {
    g.setColor(g.theme.fg).setFont("Vector", 10).setFontAlign(0, 0, 0);
    let s = "";
    for (let i = 0; i < pinBuf.length; i++) s += ".";
    g.drawString(s, half(g.getWidth()), top - 4);
  }
}

function drawList() {
  fullRedraw(function () {
    if (entries.length === 0) {
      g.setFont("Vector", TOKEN_DIGITS_HEIGHT).setFontAlign(0, 0, 0);
      g.drawString("Empty", half(g.getWidth()), Bangle.appRect.y + half(Bangle.appRect.h));
      return;
    }
    let h = Math.min(TOKEN_DIGITS_HEIGHT + 14, Math.floor(Bangle.appRect.h / Math.max(1, entries.length)));
    for (let i = 0; i < Math.min(entries.length, 6); i++) {
      let y = Bangle.appRect.y + i * h;
      g.setFont("Vector", Math.min(16, h - 6)).setFontAlign(0, 0, 0);
      g.drawString(entries[i].label, half(g.getWidth()), y + half(h));
    }
    g.setFont("Vector", 10).setFontAlign(0, 1, 0);
    g.drawString("tap to view", half(g.getWidth()), Bangle.appRect.y2);
  });
}

function drawSecret(i) {
  fullRedraw(function () {
    g.setFont("Vector", 10).setFontAlign(0, 0, 0);
    g.drawString(entries[i].label, half(g.getWidth()), Bangle.appRect.y + 10);
    let txt = entries[i].secret;
    g.setFont("Vector", 22).setFontAlign(0, 0, 0);
    let ln = half(Bangle.appRect.h);
    g.drawString(txt, half(g.getWidth()), Bangle.appRect.y + ln);
    g.setFont("Vector", 10);
    if (entries[i].comment) g.drawString(entries[i].comment, half(g.getWidth()), Bangle.appRect.y + ln + 24);
  });
}

// ---------- keypad gate ----------
var pinBuf = "", pinStage = 0, pinFirst = null, pinMsg = "", pinBusy = false;
var viewIdx = -1;

function onPinTouch(zone, e) {
  if (pinBusy || !e) return;
  let top = KEYPAD_TOP;
  let kw = (Bangle.appRect.w + 1) / 3, kh = Math.floor((Bangle.appRect.y2 - top) / 4);
  let cx = Math.floor((e.x - Bangle.appRect.x) / kw), cy = Math.floor((e.y - top) / kh);
  if (cx < 0 || cx > 2 || cy < 0 || cy > 3) return;
  let labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"];
  let k = labels[cy * 3 + cx];
  Bangle.buzz(30);
  if (k === "C") {
    pinBuf = "";
  } else if (k === "OK") {
    if (pinBuf.length < 4 || pinBuf.length > 8) {
      pinMsg = "PIN needs 4-8 digits";
      drawKeypad(gateModeTitle(), pinMsg, false);
      return;
    }
    pinApply();
    return;
  } else if (pinBuf.length < 8) {
    pinBuf += k;
  }
  drawKeypad(gateModeTitle(), pinMsg, true);
}
function gateModeTitle() {
  return pinStage === 0 ? "Enter PIN" : "Confirm PIN";
}
function pinApply() {
  pinBusy = true;
  setTimeout(function () {
    let pt = ENC.open(LOCK, pinBuf);
    if (pinStage === 0) {
      if (!pt && require("Storage").readJSON(LOCK, true)) {
        pinBuf = "";
        Bangle.buzz(300);
        setTimeout(function () { Bangle.buzz(300); }, 350);
        Bangle.setLCDPower(1);
        pinMsg = "WRONG PIN";
        drawKeypad("WRONG PIN", "retry", false);
        pinBusy = false;
        setTimeout(function () { pinMsg = ""; drawKeypad(gateModeTitle(), "", false); }, 1200);
        return;
      }
      if (pt) unlockWith(pt);
      else { pinStage = 1; pinFirst = pinBuf; pinBuf = ""; pinMsg = "new store"; drawKeypad(gateModeTitle(), pinMsg, false); pinBusy = false; }
    } else {
      if (pinBuf === pinFirst) setupWithPin(pinBuf);
      else { pinStage = 0; pinBuf = ""; pinMsg = "PINs differ"; drawKeypad(gateModeTitle(), pinMsg, false); pinBusy = false; }
    }
  }, 30);
}
function setupWithPin(pin) {
  ENC.seal(LOCK, pin, {entries: entries, misc: {}}, ITERS);
  startApp();
}
function unlockWith(pt) {
  entries = pt.entries || pt.tokens || [];
  startApp();
}
function startApp() {
  Bangle.removeListener("touch", onPinTouch);
  Bangle.on("touch", onListTouch);
  drawList();
}
function relock() {
  entries = [];
  Bangle.removeListener("touch", onListTouch);
  showGate();
}

// ---------- list / view touch ----------
function onListTouch(zone, e) {
  if (!e || viewIdx >= 0) { // any tap while viewing = back
    viewIdx = -1;
    drawList();
    return;
  }
  if (entries.length === 0) return;
  let h = Math.min(TOKEN_DIGITS_HEIGHT + 14, Math.floor(Bangle.appRect.h / Math.max(1, entries.length)));
  let i = Math.floor((e.y - Bangle.appRect.y) / h);
  if (i < 0 || i >= entries.length) return;
  viewIdx = i;
  drawSecret(i);
}

// ---------- PIN gate boot ----------
function showGate(msg) {
  pinStage = 0;
  pinBuf = "";
  pinMsg = msg || "";
  Bangle.removeListener("touch", onListTouch);
  Bangle.on("touch", onPinTouch);
  fullRedraw(function () {
    drawKeypad(pinStage === 0 ? (require("Storage").readJSON(LOCK, true) ? "Enter PIN" : "Choose PIN") : "Enter PIN", pinMsg, false);
  });
}

if (typeof BTN1 == 'number') {
  setWatch(function () { relock(); }, BTN1, {edge: "falling", debounce: 50, repeat: true});
}
Bangle.loadWidgets();
showGate("");
Bangle.drawWidgets();
