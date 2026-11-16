const COUNTER_TRIANGLE_SIZE = 10;
const TOKEN_EXTRA_HEIGHT = 16;
var TOKEN_DIGITS_HEIGHT = 30;
var TOKEN_HEIGHT = TOKEN_DIGITS_HEIGHT + TOKEN_EXTRA_HEIGHT;
const PROGRESSBAR_HEIGHT = 3;
const IDLE_REPEATS = 1; // when idle, the number of extra timed periods to show before hiding
const SETTINGS = "authentiwatch.json"; // legacy plaintext store, read for migration/import only
const LOCK = "authentiwatch.lock";     // encrypted store (survives app updates)
const NONCE_FILE = "authentiwatch.nctr"; // boot counter, keeps IVs fresh across reboots
// Hash functions
const crypto = require("crypto");
const algos = {
  "SHA512":{sha:crypto.SHA512,retsz:64,blksz:128},
  "SHA256":{sha:crypto.SHA256,retsz:32,blksz:64 },
  "SHA1"  :{sha:crypto.SHA1  ,retsz:20,blksz:64 },
};
const CALCULATING = /*LANG*/"Calculating";
const NO_TOKENS = /*LANG*/"No tokens";
const NOT_SUPPORTED = /*LANG*/"Not supported";

// ===================== encrypted store =====================
// authentiwatch.lock = {v, iters, salt, iv, ct, tag} (b64 strings except v/iters)
// ct decrypts to JSON {tokens:[...], misc:{...}}
// key = PBKDF1-style SHA256 chain over (salt || pin), LOCK_ITERS rounds.
// encKey/macKey split off the chain; enc = SHA256 keystream, mac = HMAC-SHA256 (EtM).
// No hardware RNG is exposed to JS on 2v29: salt/IV mix a boot counter, Date.now,
// E.getTemperature and Math.random, hashed through SHA256. The boot counter makes
// IV reuse across reboots impossible; a fresh salt per setup makes it moot.

var tokens = [];           // filled after unlock
var settings = {misc:{}};  // misc rides inside the encrypted blob
const KEEP_DEFAULT = 5;      // 0 = exit after one window like v0.07

// -- b64 --
// b64 helpers on top of the firmware's atob/btoa
function b64fromBytes(b) {
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}
function b64toBytes(s) {
  let t = atob(s), a = new Uint8Array(t.length);
  for (let i = 0; i < t.length; i++) a[i] = t.charCodeAt(i);
  return a;
}
function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

// -- stream cipher (see header) --
function shaBytes(b) {
  return new Uint8Array(crypto.SHA256(b));
}
// xor data with keystream blocks SHA256(encKey || iv || uint32be(i)), in place
function streamXor(encKey, iv, data) {
  let hdr = new Uint8Array(32 + 16 + 4); // encKey(32) || iv(16) || be32 index
  hdr.set(encKey, 0);
  hdr.set(iv, 32);
  for (let off = 0, bi = 0; off < data.length; off += 32, bi++) {
    hdr[48] = (bi >>> 24) & 0xFF;
    hdr[49] = (bi >>> 16) & 0xFF;
    hdr[50] = (bi >>> 8) & 0xFF;
    hdr[51] = bi & 0xFF;
    let ks = shaBytes(hdr);
    let n = Math.min(32, data.length - off);
    for (let j = 0; j < n; j++) data[off + j] ^= ks[j];
  }
  return data;
}

// -- KDF / nonce / padding --
function strBytes(s) {
  let a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 0xFF;
  return a;
}
function deriveKeys(pin, salt, iters) { // PBKDF1-style SHA256 chain over (salt || pin)
  let material = new Uint8Array(salt.length + pin.length);
  material.set(salt, 0);
  for (let i = 0; i < pin.length; i++) material[salt.length + i] = pin.charCodeAt(i) & 0xFF;
  let k = shaBytes(material);
  for (let i = 0; i < iters; i++) {
    let m = new Uint8Array(32 + salt.length);
    m.set(k, 0);
    m.set(salt, 32);
    k = shaBytes(m);
  }
  let eb = new Uint8Array(35);
  eb.set(k, 0); eb[32] = 101; eb[33] = 110; eb[34] = 99;   // "enc"
  let mb = new Uint8Array(35);
  mb.set(k, 0); mb[32] = 109; mb[33] = 97; mb[34] = 99;    // "mac"
  return {encKey: shaBytes(eb), macKey: shaBytes(mb)};
}
function nextCounter() {
  let n = (parseInt(require("Storage").read(NONCE_FILE) || "0", 10) || 0) + 1;
  require("Storage").write(NONCE_FILE, "" + n);
  return n;
}
function randomBytes(n) { // no HW RNG exposed on 2v29 -- see header comment
  let s = "" + nextCounter() + "|" + Date.now() + "|" + Math.round(E.getTemperature() * 1000);
  for (let i = 0; i < 12; i++) s += "|" + Math.random();
  return shaBytes(s).subarray(0, n);
}
function pkcs7(bs) {
  let pad = 32 - (bs.length % 32);
  let out = new Uint8Array(bs.length + pad);
  out.set(bs, 0);
  out.fill(pad, bs.length);
  return out;
}
var sess = {encKey:null, macKey:null, salt:null, until:0};
const LOCK_ITERS = 400; // ~1.7 s per unlock on 2v29; raises offline guess cost 400x

function saveEnc() {
  if (!sess.encKey) return;
  let iv = randomBytes(16);
  let pt = pkcs7(strBytes(JSON.stringify({tokens: tokens, misc: settings.misc})));
  streamXor(sess.encKey, iv, pt);
  let tagIn = new Uint8Array(16 + pt.length);
  tagIn.set(iv, 0);
  tagIn.set(pt, 16);
  let tag = new Uint8Array(hmac(sess.macKey, tagIn, "SHA256"));
  require("Storage").writeJSON(LOCK, {
    v: 1, iters: LOCK_ITERS, salt: b64fromBytes(sess.salt),
    iv: b64fromBytes(iv), ct: b64fromBytes(pt), tag: b64fromBytes(tag)
  });
}
function storeDecrypt(lock, pin) {
  // returns {tokens, misc} or null on wrong PIN / tamper / parse error
  try {
    if (!lock || !lock.v) return null;
    let keys = deriveKeys(pin, b64toBytes(lock.salt), lock.iters);
    let iv = b64toBytes(lock.iv);
    let ct = b64toBytes(lock.ct);
    if (ct.length === 0 || ct.length % 32) return null;
    let tagIn = new Uint8Array(iv.length + ct.length);
    tagIn.set(iv, 0);
    tagIn.set(ct, iv.length);
    let tag = new Uint8Array(hmac(keys.macKey, tagIn, "SHA256"));
    if (!equalBytes(tag, b64toBytes(lock.tag))) return null;
    streamXor(keys.encKey, iv, ct);
    let s = "";
    for (let i = 0; i < ct.length; i++) s += String.fromCharCode(ct[i]);
    let pad = s.charCodeAt(s.length - 1);
    if (pad < 1 || pad > 32) return null;
    let parsed = JSON.parse(s.substr(0, s.length - pad));
    if (!parsed || !parsed.tokens) return null;
    sess.encKey = keys.encKey;
    sess.macKey = keys.macKey;
    sess.salt = b64toBytes(lock.salt);
    return parsed;
  } catch (e) {
    return null;
  }
}

// -- sample settings:
// {tokens:[{"algorithm":"SHA1","digits":6,"period":30,"issuer":"","account":"","secret":"Bbb","label":"Aaa"}],misc:{}}

function b32decode(seedstr) {
  // RFC4648 Base16/32/64 Data Encodings
  let buf = 0, bitcount = 0, retstr = "";
  for (let c of seedstr.toUpperCase()) {
    if (c == '0') c = 'O';
    if (c == '1') c = 'I';
    if (c == '8') c = 'B';
    c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c);
    if (c != -1) {
      buf <<= 5;
      buf |= c;
      bitcount += 5;
      if (bitcount >= 8) {
        retstr += String.fromCharCode(buf >> (bitcount - 8));
        buf &= (0xFF >> (16 - bitcount));
        bitcount -= 8;
      }
    }
  }
  let retbuf = new Uint8Array(retstr.length);
  for (let i in retstr) {
    retbuf[i] = retstr.charCodeAt(i);
  }
  return retbuf;
}

function hmac(key, message, algo) {
  let a = algos[algo.toUpperCase()];
  // RFC2104 HMAC
  if (key.length > a.blksz) {
    key = a.sha(key);
  }
  let istr = new Uint8Array(a.blksz + message.length);
  let ostr = new Uint8Array(a.blksz + a.retsz);
  for (let i = 0; i < a.blksz; ++i) {
    let c = (i < key.length) ? key[i] : 0;
    istr[i] = c ^ 0x36;
    ostr[i] = c ^ 0x5C;
  }
  for (let i = 0; i < message.length; ++i) {
    istr[a.blksz + i] = message[i];
  }
  let iHash = a.sha(istr);
  let iBytes = new Uint8Array(a.retsz);
  for (let i = 0; i < a.retsz; ++i) {
    iBytes[i] = iHash[i];
  }
  for (let i = 0; i < a.retsz; ++i) {
    ostr[a.blksz + i] = iBytes[i];
  }
  return a.sha(ostr);
}

function formatOtp(otp, digits) {
  // add 0 padding
  let ret = "" + otp % Math.pow(10, digits);
  while (ret.length < digits) {
    ret = "0" + ret;
  }
  // add a space after every 3rd or 4th digit
  let re = (digits % 3 == 0 || (digits % 3 >= digits % 4 && digits % 4 != 0)) ? "" : ".";
  return ret.replace(new RegExp("(..." + re + ")", "g"), "$1 ").trim();
}

function hotp(token) {
  let d = Date.now();
  let tick, next;
  if (token.period > 0) {
    // RFC6238 - timed
    tick = Math.floor(Math.floor(d / 1000) / token.period);
    next = (tick + 1) * token.period * 1000;
  } else {
    // RFC4226 - counter
    tick = -token.period;
    next = d + 30000;
  }
  let msg = new Uint8Array(8);
  let v = new DataView(msg.buffer);
  v.setUint32(0, tick >> 16 >> 16);
  v.setUint32(4, tick & 0xFFFFFFFF);
  let ret;
  try {
    let mac = hmac(b32decode(token.secret), msg, token.algorithm);
    ret = formatOtp(new DataView(mac, mac[mac.length - 1] & 0x0F, 4).getUint32(0) & 0x7FFFFFFF, token.digits);
  } catch(err) {
    ret = NOT_SUPPORTED;
  }
  return {hotp:ret, next:next};
}

// Tokens are displayed in three states:
// 1. Unselected (state.id<0)
// 2. Selected, inactive (no code) (state.id>=0,state.hotp.hotp=="")
// 3. Selected, active (code showing) (state.id>=0,state.hotp.hotp!="")
var fontszCache = {};
var state = {
  listy:0, // list scroll position
  id:-1, // current token ID
  hotp:{hotp:"",next:0}
};

function sizeFont(id, txt, w) {
  let sz = fontszCache[id];
  if (!sz) {
    sz = TOKEN_DIGITS_HEIGHT;
    do {
      g.setFont("Vector", sz--);
    } while (g.stringWidth(txt) > w);
    fontszCache[id] = ++sz;
  }
  g.setFont("Vector", sz);
}

var half = n => Math.floor(n / 2);

function keepMinutes() {
  return (settings.misc && settings.misc.keepMin !== undefined) ? settings.misc.keepMin : KEEP_DEFAULT;
}
function refreshUntil() {
  let km = keepMinutes();
  sess.until = (km > 0) ? (Date.now() + km * 60000) : 0;
}

function timerCalc() {
  let timerfn = exitAppOrKeep;
  let timerdly = 10000;
  if (state.id >= 0 && state.hotp.hotp != "") {
    if (tokens[state.id].period > 0) {
      // timed HOTP
      if (state.hotp.next < Date.now()) {
        if (state.cnt > 0) {
          state.cnt--;
          state.hotp = hotp(tokens[state.id]);
        } else {
          state.hotp.hotp = "";
        }
        timerdly = 1;
        timerfn = updateCurrentToken;
      } else {
        timerdly = 1000;
        timerfn = updateProgressBar;
      }
    } else {
      // counter HOTP
      if (state.cnt > 0) {
        state.cnt--;
        timerdly = 30000;
      } else {
        state.hotp.hotp = "";
        timerdly = 1;
      }
      timerfn = updateCurrentToken;
    }
  }
  if (state.drawtimer) {
    clearTimeout(state.drawtimer);
  }
  state.drawtimer = setTimeout(timerfn, timerdly);
}

function updateCurrentToken() {
  drawToken(state.id);
  timerCalc();
}

function updateProgressBar() {
  drawProgressBar();
  timerCalc();
}

function drawProgressBar() {
  let id = state.id;
  if (id >= 0 && tokens[id].period > 0) {
    let rem = Math.min(tokens[id].period, Math.floor((state.hotp.next - Date.now()) / 1000));
    if (rem >= 0) {
      let y1 = tokenY(id);
      let y2 = y1 + TOKEN_HEIGHT - 1;
      if (y2 >= AR.y && y1 <= AR.y2) {
        // token visible
        y1 = y2 - PROGRESSBAR_HEIGHT;
        if (y1 <= AR.y2)
        {
          // progress bar visible
          y2 = Math.min(y2, AR.y2);
          let xr = Math.floor(AR.w * rem / tokens[id].period) + AR.x;
          g.setColor(g.theme.fgH)
           .setBgColor(g.theme.bgH)
           .fillRect(AR.x, y1, xr, y2)
           .clearRect(xr + 1, y1, AR.x2, y2);
        }
      } else {
        // token not visible
        state.id = -1;
      }
    }
  }
}

// id = token ID number (0...)
function drawToken(id) {
  let x1 = AR.x;
  let y1 = tokenY(id);
  let x2 = AR.x2;
  let y2 = y1 + TOKEN_HEIGHT - 1;
  let lbl = (id >= 0 && id < tokens.length) ? tokens[id].label.substr(0, 10) : "";
  let adj;
  g.setClipRect(x1, Math.max(y1, AR.y), x2, Math.min(y2, AR.y2));
  if (id === state.id) {
    g.setColor(g.theme.fgH)
     .setBgColor(g.theme.bgH);
  } else {
    g.setColor(g.theme.fg)
     .setBgColor(g.theme.bg);
  }
  if (id == state.id && state.hotp.hotp != "") {
    // small label centered just below top line
    g.setFont("Vector", TOKEN_EXTRA_HEIGHT)
     .setFontAlign(0, -1, 0);
    adj = y1;
  } else {
    // large label centered in box
    sizeFont("l" + id, lbl, AR.w);
    g.setFontAlign(0, 0, 0);
    adj = half(y1 + y2);
  }
  g.clearRect(x1, y1, x2, y2)
   .drawString(lbl, half(x1 + x2), adj, false);
  if (id == state.id && state.hotp.hotp != "") {
    adj = 0;
    if (tokens[id].period <= 0) {
      // counter - draw triangle as swipe hint
      let yc = half(y1 + y2);
      adj = COUNTER_TRIANGLE_SIZE;
      g.fillPoly([AR.x, yc, AR.x + adj, yc - adj, AR.x + adj, yc + adj]);
      adj += 2;
    }
    // digits just below label
    x1 = half(x1 + adj + x2);
    y1 += TOKEN_EXTRA_HEIGHT;
    if (state.hotp.hotp == CALCULATING) {
      sizeFont("c", CALCULATING, AR.w - adj);
      g.drawString(CALCULATING, x1, y1, false)
       .flip();
      state.hotp = hotp(tokens[id]);
      g.clearRect(AR.x + adj, y1, AR.x2, y2);
    }
    sizeFont("d" + id, state.hotp.hotp, AR.w - adj);
    g.drawString(state.hotp.hotp, x1, y1, false);
    if (tokens[id].period > 0) {
      drawProgressBar();
    }
  }
  g.setClipRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
}
var tokenY = id => id * TOKEN_HEIGHT + AR.y - state.listy;

function changeId(id) {
  if (id != state.id) {
    state.hotp.hotp = CALCULATING;
    let pid = state.id;
    state.id = id;
    if (pid >= 0) {
      drawToken(pid);
    }
    if (id >= 0) {
      drawToken( id);
    }
  }
}

function onDrag(e) {
  refreshUntil();
  state.cnt = IDLE_REPEATS;
  if (e.b != 0 && e.dy != 0) {
    let y = E.clip(state.listy - E.clip(e.dy, -AR.h, AR.h), 0, Math.max(0, tokens.length * TOKEN_HEIGHT - AR.h));
    if (state.listy != y) {
      let id, dy = state.listy - y;
      state.listy = y;
      g.setClipRect(AR.x, AR.y, AR.x2, AR.y2)
       .scroll(0, dy);
      if (dy > 0) {
        id = Math.floor((state.listy + dy) / TOKEN_HEIGHT);
        y = tokenY(id + 1);
        do {
          drawToken(id);
          id--;
          y -= TOKEN_HEIGHT;
        } while (y > AR.y);
      }
      if (dy < 0) {
        id = Math.floor((state.listy + dy + AR.h) / TOKEN_HEIGHT);
        y = tokenY(id);
        while (y < AR.y2) {
          drawToken(id);
          id++;
          y += TOKEN_HEIGHT;
        }
      }
    }
  }
  if (e.b == 0) {
    timerCalc();
  }
}

function onTouch(zone, e) {
  refreshUntil();
  state.cnt = IDLE_REPEATS;
  if (e) {
    let id = Math.floor((state.listy + e.y - AR.y) / TOKEN_HEIGHT);
    if (id == state.id || tokens.length == 0 || id >= tokens.length) {
      id = -1;
    }
    if (state.id != id) {
      if (id >= 0) {
        // scroll token into view if necessary
        let dy = 0;
        let y = id * TOKEN_HEIGHT - state.listy;
        if (y < 0) {
          dy -= y;
          y = 0;
        }
        y += TOKEN_HEIGHT;
        if (y > AR.h) {
          dy -= (y - AR.h);
        }
        onDrag({b:1, dy:dy});
      }
      changeId(id);
    }
  }
  timerCalc();
}

function onSwipe(e) {
  refreshUntil();
  state.cnt = IDLE_REPEATS;
  switch (e) {
  case  1:
    exitApp();
    break;
  case -1:
    if (state.id >= 0 && tokens[state.id].period <= 0) {
      tokens[state.id].period--;
      saveEnc();
      state.hotp.hotp = CALCULATING;
      drawToken(state.id);
    }
    break;
  }
  timerCalc();
}

function bangleBtn(e) {
  refreshUntil();
  state.cnt = IDLE_REPEATS;
  if (tokens.length > 0) {
    let id = E.clip(state.id + e, 0, tokens.length - 1);
    onDrag({b:1, dy:state.listy - E.clip(id * TOKEN_HEIGHT - half(AR.h - TOKEN_HEIGHT), 0, Math.max(0, tokens.length * TOKEN_HEIGHT - AR.h))});
    changeId(id);
    drawProgressBar();
  }
  timerCalc();
}

function exitApp() {
  if (state.drawtimer) {
    clearTimeout(state.drawtimer);
  }
  // wipe the decrypted session from RAM; the next launch asks for the PIN again
  tokens = [];
  settings = {misc:{}};
  sess.encKey = null;
  sess.macKey = null;
  sess.salt = null;
  sess.until = 0;
  state.id = -1;
  state.hotp.hotp = "";
  Bangle.showLauncher();
}
function exitAppOrKeep() {
  if (sess.encKey && sess.until && Date.now() < sess.until) {
    return; // trusted session still open, keep the app on screen
  }
  exitApp();
}

// ===================== PIN gate =====================
var gateMode = null;    // null | "unlock" | "choose" | "confirm" | "import"
var pinBuf = "";
var pinFirst = null;
var pinMsg = "";
var gateBusy = false;
var gateWrong = 0;
var changing = false;   // choose/confirm run inside an open session (PIN change)
var appAttached = false;

function attachApp() {
  if (appAttached) return;
  Bangle.removeListener("touch", gateTouch);
  Bangle.on('touch', onTouch);
  Bangle.on('drag', onDrag);
  Bangle.on('swipe', onSwipe);
  appAttached = true;
}
function showGate(mode, msg) {
  // detach app handlers so stray touches can't hit the token UI mid-gate
  if (appAttached) {
    Bangle.removeListener('touch', onTouch);
    Bangle.removeListener('drag', onDrag);
    Bangle.removeListener('swipe', onSwipe);
    appAttached = false;
  }
  Bangle.removeListener("touch", gateTouch);
  gateActive = true;
  gateMode = mode;
  pinBuf = "";
  pinMsg = msg;
  if (!pinMsg) {
    pinMsg = {unlock: "hold BTN for options", choose: "pick 4-8 digits then OK",
              confirm: "re-enter the PIN", import: "enter PIN, then OK"}[mode] || "";
  }
  if (mode !== "confirm") pinFirst = null;
  gateRender();
  Bangle.on("touch", gateTouch);
}
function gateTitles(mode) {
  let t = "Enter PIN";
  if (mode === "choose") t = changing ? "New PIN" : "Choose PIN";
  if (mode === "confirm") t = "Confirm PIN";
  return t;
}
function gateRender() {
  g.setBgColor(g.theme.bg).setColor(g.theme.fg);
  g.clearRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
  Bangle.drawWidgets();
  g.reset();
  g.setBgColor(g.theme.bg).setColor(g.theme.fg);
  g.setFont("Vector", 14).setFontAlign(0, 0, 0);
  g.drawString(gateTitles(gateMode), AR.x + half(AR.w), AR.y + 12);
  g.setFont("Vector", 10);
  g.drawString(pinMsg, AR.x + half(AR.w), AR.y + 26);
  drawKeypad();
}
function drawKeypad() {
  let top = AR.y + 30;
  let kw = (AR.w + 1) / 3, kh = Math.floor((AR.y2 - top) / 4);
  let labels = ["1","2","3","4","5","6","7","8","9","C","0","OK"];
  let okable = pinBuf.length >= 4;
  for (let i = 0; i < 12; i++) {
    let cx = AR.x + (i % 3) * kw, cy = top + Math.floor(i / 3) * kh;
    g.setBgColor(g.theme.bg2).setColor(g.theme.bg2);
    g.fillRect(cx + 1, cy + 1, cx + kw - 2, cy + kh - 2);
    g.setColor(i === 11 && okable ? g.theme.fg : g.theme.fg2)
     .setBgColor(g.theme.bg2)
     .setFont("Vector", 16).setFontAlign(0, 0, 0);
    g.drawString(labels[i], cx + kw / 2, cy + kh / 2);
  }
  g.setColor(g.theme.fg);
  let dots = "";
  for (let i = 0; i < pinBuf.length; i++) dots += ".";
  if (dots) {
    g.setFont("Vector", 10).setFontAlign(0, 0, 0);
    g.drawString(dots, AR.x + half(AR.w), AR.y + 26);
  }
}
function gateTouch(zone, e) {
  if (gateBusy || !e) return;
  let top = AR.y + 30;
  let kw = (AR.w + 1) / 3, kh = Math.floor((AR.y2 - top) / 4);
  let cx = Math.floor((e.x - AR.x) / kw), cy = Math.floor((e.y - top) / kh);
  if (cx < 0 || cx > 2 || cy < 0 || cy > 3) return;
  let labels = ["1","2","3","4","5","6","7","8","9","C","0","OK"];
  let k = labels[cy * 3 + cx];
  Bangle.buzz(30);
  if (k === "C") {
    pinBuf = "";
  } else if (k === "OK") {
    if (pinBuf.length < 4 || pinBuf.length > 8) {
      pinMsg = pinBuf.length ? "PIN needs 4-8 digits" : "Enter PIN first";
      gateRender();
      return;
    }
    gateApply();
    return;
  } else if (pinBuf.length < 8) {
    pinBuf += k;
  }
  gateRender();
}
function gateWrongShow(sec) {
  // loud wrong-PIN state: inverted banner, big text, buzz pattern
  Bangle.buzz(250);
  setTimeout(function() { Bangle.buzz(250); }, 350);
  Bangle.setLCDPower(1);
  g.setBgColor(g.theme.bg).setColor(g.theme.fg);
  g.clearRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
  Bangle.drawWidgets();
  g.setBgColor(g.theme.fg).setColor(g.theme.bg).clearRect(AR.x + 1, AR.y, AR.x2 - 1, AR.y + 21);
  g.setFont("Vector", 16).setFontAlign(0, 0, 0);
  g.drawString("WRONG PIN", AR.x + half(AR.w), AR.y + 11);
  g.reset();
  g.setBgColor(g.theme.bg).setColor(g.theme.fg);
  g.setFont("Vector", 11).setFontAlign(0, 0, 0);
  g.drawString("retry in " + sec + "s", AR.x + half(AR.w), AR.y + 28);
  drawKeypad();
}
function gateApply() {
  if (gateMode === "unlock" || gateMode === "import") {
    gateBusy = true;
    gateRender();
    setTimeout(function() {
      let pt = storeDecrypt(lockObj, pinBuf);
      if (!pt) {
        gateWrong++;
        pinBuf = ""; // clear immediately - the next attempt starts fresh
        gateBusy = false;
        gateWrongShow(Math.min(gateWrong, 5));
        gateBusy = true;
        setTimeout(function() {
          gateBusy = false;
          showGate(gateMode, "");
        }, Math.min(gateWrong, 5) * 1000 + 800);
        return;
      }
      gateBusy = false;
      gateWrong = 0;
      if (gateMode === "import") importMerge(pt);
      else unlockWith(pt);
    }, 50);
    return;
  }
  if (gateMode === "choose") {
    pinFirst = pinBuf;
    showGate("confirm", "");
    return;
  }
  if (gateMode === "confirm") {
    if (pinBuf === pinFirst) {
      gateBusy = true;
      setupWithPin(pinBuf);
    } else {
      showGate("choose", "PINs differ - try again");
    }
  }
}
function setupWithPin(pin) {
  let firstSetup = !changing;
  if (firstSetup) {
    let legacy = require("Storage").readJSON(SETTINGS, true);
    tokens = (legacy && legacy.tokens) ? legacy.tokens : [];
  }
  if (!settings.misc) settings.misc = {};
  if (settings.misc.keepMin === undefined) settings.misc.keepMin = KEEP_DEFAULT;
  sess.salt = randomBytes(16);
  let keys = deriveKeys(pin, sess.salt, LOCK_ITERS);
  sess.encKey = keys.encKey;
  sess.macKey = keys.macKey;
  saveEnc();
  if (firstSetup) {
    require("Storage").erase(SETTINGS); // plaintext copy gone
  }
  changing = false;
  gateBusy = false;
  attachApp();
  refreshUntil();
  startApp();
}
function importMerge(pt) {
  for (let t of tokensBackup) {
    let dup = false;
    for (let x of pt.tokens) {
      if (x.label === t.label && x.secret === t.secret) { dup = true; break; }
    }
    if (!dup) {
      pt.tokens.push(t);
    }
  }
  tokens = pt.tokens;
  settings.misc = pt.misc || {};
  refreshUntil();
  saveEnc();
  require("Storage").erase(SETTINGS);
  startApp();
}
function unlockWith(pt) {
  tokens = pt.tokens;
  settings.misc = pt.misc || {};
  refreshUntil();
  startApp();
}
var tokensBackup = [];
function startApp() {
  gateActive = false;
  attachApp();
  drawAppRoot();
}
function drawAppRoot() {
  state.id = -1;
  state.hotp.hotp = "";
  g.reset();
  g.setBgColor(g.theme.bg).setColor(g.theme.fg);
  g.clearRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
  Bangle.drawWidgets();
  if (tokens.length > 0) {
    state.listy = AR.h;
    onDrag({b:1, dy:AR.h});
  } else {
    g.setFont("Vector", TOKEN_DIGITS_HEIGHT)
     .setFontAlign(0, 0, 0)
     .drawString(NO_TOKENS, AR.x + half(AR.w), AR.y + half(AR.h), false);
  }
  timerCalc();
}
// -- menus (BTN1 held). All touch input is detached while a menu is open so the
// token list / keypad don't fight the menu, then re-attached on close.
function closeAppMenu() {
  menuShown = false;
  attachApp();
  drawAppRoot();
}
function gateMenu() { // BTN1 held at the gate
  if (!gateActive || gateBusy) return;
  Bangle.removeListener("touch", gateTouch);
  menuShown = true;
  E.showMenu({
    "": {title: "2FA setup", back: closeGateMenu},
    "Import plaintext": function() {
      menuShown = false;
      if (lockObj && tokensBackup.length) showGate("import", tokensBackup.length + " entries to add");
      else bootGate();
    },
    "Wipe store": function() {
      menuShown = false;
      E.showPrompt("Delete encrypted store?", {title: "Wipe"}).then(function(ok) {
        if (ok) {
          require("Storage").erase(LOCK);
          require("Storage").erase(SETTINGS);
          load("authentiwatch.app.js");
        } else {
          bootGate();
        }
      });
    },
    "Back": closeGateMenu
  });
}
function closeGateMenu() { // closes the gate menu back into the gate (no app handlers yet)
  menuShown = false;
  bootGate();
}
function setKeep(v) {
  if (!settings.misc) settings.misc = {};
  settings.misc.keepMin = v;
  refreshUntil();
  saveEnc();
  closeAppMenu();
}
function appMenu() { // BTN1 held in the unlocked app
  let km = keepMinutes();
  if (appAttached) {
    Bangle.removeListener('touch', onTouch);
    Bangle.removeListener('drag', onDrag);
    Bangle.removeListener('swipe', onSwipe);
    appAttached = false;
  }
  Bangle.removeListener("touch", gateTouch);
  menuShown = true;
  E.showMenu({
    "": {title: "2FA session " + km + "m", back: closeAppMenu},
    "Change PIN": function() {
      menuShown = false;
      changing = true;
      showGate("choose", "session open");
    },
    "Session 2 min": function() { setKeep(2); },
    "Session 5 min": function() { setKeep(5); },
    "Session 15 min": function() { setKeep(15); },
    "Exit session": function() {
      menuShown = false;
      exitApp();
    }
  });
}
var lockObj = null;
function bootGate() {
  Bangle.loadWidgets();
  // appRect is full-screen until widgets load -- recapture here
  let a = Bangle.appRect;
  AR.x = a.x; AR.y = a.y; AR.w = a.w; AR.h = a.h; AR.x2 = a.x2; AR.y2 = a.y2;
  lockObj = require("Storage").readJSON(LOCK, true);
  let legacy = require("Storage").readJSON(SETTINGS, true);
  tokensBackup = (legacy && legacy.tokens) ? legacy.tokens : [];
  if (lockObj) {
    showGate("unlock", "");
  } else {
    if (tokensBackup.length) {
      showGate("choose", "encrypting " + tokensBackup.length + " found tokens");
    } else {
      showGate("choose", "no tokens yet - add via app loader");
    }
  }
}

// BTN1: short press = leave; hold 1.5s = options menu (a physical button can't be faked remotely)
var btnHold = null, btnFired = false, menuShown = false;
function btn1Long() {
  btnFired = true;
  if (menuShown) return;
  if (gateActive) {
    menuShown = true;
    gateMenu();
  } else {
    menuShown = true;
    appMenu();
  }
}
if (typeof BTN1 == 'number') {
  if (typeof BTN2 == 'number' && typeof BTN3 == 'number') {
    setWatch(()=>bangleBtn(-1), BTN1, {edge:"rising" , debounce:50, repeat:true});
    setWatch(()=>exitApp()    , BTN2, {edge:"falling", debounce:50});
    setWatch(()=>bangleBtn( 1), BTN3, {edge:"rising" , debounce:50, repeat:true});
  } else {
    // Bangle.js 2: BTN1 is active-low (falling = press)
    setWatch(function() {
      if (menuShown) return; // E.showMenu has its own BTN1 handling
      btnFired = false;
      if (btnHold) clearTimeout(btnHold);
      btnHold = setTimeout(btn1Long, 1500);
    }, BTN1, {edge:"falling", debounce:50, repeat:true});
    setWatch(function() {
      if (btnHold) {
        clearTimeout(btnHold);
        btnHold = null;
      }
      if (!btnFired && !menuShown) Bangle.showLauncher();
      btnFired = false;
    }, BTN1, {edge:"rising", debounce:50, repeat:true});
  }
}
const AR = Bangle.appRect; // replaced by bootGate() after widgets load
var gateActive = false;
bootGate();
