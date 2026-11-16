/* Copyright (c) 2026 Bangle.js contributors. See the file LICENSE for copying permission. */

/* EncStore.md for documentation.

   PIN-gated encrypted Storage for Bangle.js apps.

   The firmware exposes SHA1/256/512 but no block cipher, so data is
   sealed with a hash-based keystream and authenticated with HMAC:

     key material = PBKDF1-style chain: k = SHA256(pin || salt), then
                    k = SHA256(k || salt), LOCK_ITERS times (~2-4 s total)
     encKey       = SHA256(k || "enc")
     macKey       = SHA256(k || "mac")
     ct = (data + PKCS7(32)) XOR keystream where
          keystream block i = SHA256(encKey || iv || be32(i))
     tag = HMAC-SHA256(macKey, iv || ct)   (encrypt-then-MAC)

   The store file is JSON: {v, iters, salt, iv, ct, tag} (b64 except v/iters).
   The file is app-agnostic: pass your own file name for each store.

   No hardware RNG is exposed on current firmware, so IVs/salt mix a
   monotonic boot counter with wall time, the temperature sensor and
   Math.random, all hashed through SHA256 (see randomBytes). */

var ENC = exports = {};

var crypto = require("crypto");

var DEFAULT_ITERS = 400; // ~2-4 s per unlock on a Bangle.js 2
var NONCE_FILE = "encstore.nctr";

function shaBytes(b) {
  return new Uint8Array(crypto.SHA256(b));
}
function strBytes(s) {
  var a = new Uint8Array(s.length);
  for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 0xFF;
  return a;
}
function b64fromBytes(b) {
  var s = "";
  for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}
function b64toBytes(s) {
  var t = atob(s), a = new Uint8Array(t.length);
  for (var i = 0; i < t.length; i++) a[i] = t.charCodeAt(i);
  return a;
}
function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  var d = 0;
  for (var i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

// xor data in place with keystream blocks SHA256(encKey || iv || be32(i))
function streamXor(encKey, iv, data) {
  var hdr = new Uint8Array(52); // encKey(32) || iv(16) || be32 index
  hdr.set(encKey, 0);
  hdr.set(iv, 32);
  for (var off = 0, bi = 0; off < data.length; off += 32, bi++) {
    hdr[48] = (bi >>> 24) & 0xFF;
    hdr[49] = (bi >>> 16) & 0xFF;
    hdr[50] = (bi >>> 8) & 0xFF;
    hdr[51] = bi & 0xFF;
    var ks = shaBytes(hdr);
    var n = Math.min(32, data.length - off);
    for (var j = 0; j < n; j++) data[off + j] ^= ks[j];
  }
  return data;
}

function pkcs7(bs) {
  var pad = 32 - (bs.length % 32);
  var out = new Uint8Array(bs.length + pad);
  out.set(bs, 0);
  out.fill(pad, bs.length);
  return out;
}

function nextCounter() {
  var n = (parseInt(require("Storage").read(NONCE_FILE) || "0", 10) || 0) + 1;
  require("Storage").write(NONCE_FILE, "" + n);
  return n;
}

// no HW RNG is exposed on current firmware - mix what we have
function randomBytes(n) {
  var s = "" + nextCounter() + "|" + Date.now() + "|" + Math.round(E.getTemperature() * 1000);
  for (var i = 0; i < 12; i++) s += "|" + Math.random();
  return shaBytes(s).subarray(0, n);
}

function deriveKeys(pin, salt, iters) {
  var i, material = new Uint8Array(salt.length + pin.length);
  material.set(salt, 0);
  for (i = 0; i < pin.length; i++) material[salt.length + i] = pin.charCodeAt(i) & 0xFF;
  var k = shaBytes(material);
  for (i = 0; i < iters; i++) {
    var m = new Uint8Array(32 + salt.length);
    m.set(k, 0);
    m.set(salt, 32);
    k = shaBytes(m);
  }
  var eb = new Uint8Array(35);
  eb.set(k, 0); eb[32] = 101; eb[33] = 110; eb[34] = 99;   // "enc"
  var mb = new Uint8Array(35);
  mb.set(k, 0); mb[32] = 109; mb[33] = 97; mb[34] = 99;    // "mac"
  return {encKey: shaBytes(eb), macKey: shaBytes(mb)};
}

function hmac(key, message, algo) {
  var a = {sha: crypto.SHA256, retsz: 32, blksz: 64};
  if (key.length > a.blksz) key = a.sha(key);
  var istr = new Uint8Array(a.blksz + message.length);
  var ostr = new Uint8Array(a.blksz + a.retsz);
  for (var i = 0; i < a.blksz; ++i) {
    var c = (i < key.length) ? key[i] : 0;
    istr[i] = c ^ 0x36;
    ostr[i] = c ^ 0x5C;
  }
  var j;
  for (j = 0; j < message.length; ++j) istr[a.blksz + j] = message[j];
  var iHash = a.sha(istr);
  for (j = 0; j < a.retsz; ++j) ostr[a.blksz + j] = iHash[j];
  return a.sha(ostr);
}

// Seal `data` (a JSON-serialisable object) into Storage file `file`
// under `pin`. Returns the parsed lock descriptor.
ENC.seal = function(file, pin, data, iters) {
  iters = iters || DEFAULT_ITERS;
  var salt = randomBytes(16);
  var keys = deriveKeys(pin, salt, iters);
  var iv = randomBytes(16);
  var pt = pkcs7(strBytes(JSON.stringify(data)));
  streamXor(keys.encKey, iv, pt);
  var tagIn = new Uint8Array(iv.length + pt.length);
  tagIn.set(iv, 0);
  tagIn.set(pt, iv.length);
  var tag = new Uint8Array(hmac(keys.macKey, tagIn, "SHA256"));
  var lock = {
    v: 1, iters: iters, salt: b64fromBytes(salt),
    iv: b64fromBytes(iv), ct: b64fromBytes(pt), tag: b64fromBytes(tag)
  };
  require("Storage").writeJSON(file, lock);
  return lock;
};

// Open a sealed store: returns the parsed object on success,
// null on wrong PIN, tampering, or a malformed file.
ENC.open = function(file, pin, tagCheck) {
  if (tagCheck) return ENC.verify(file, pin);
  var lock = require("Storage").readJSON(file, true);
  if (!lock || !lock.v) return null;
  try {
    var keys = deriveKeys(pin, b64toBytes(lock.salt), lock.iters);
    var iv = b64toBytes(lock.iv);
    var ct = b64toBytes(lock.ct);
    if (ct.length === 0 || ct.length % 32) return null;
    var tagIn = new Uint8Array(iv.length + ct.length);
    tagIn.set(iv, 0);
    tagIn.set(ct, iv.length);
    var tag = new Uint8Array(hmac(keys.macKey, tagIn, "SHA256"));
    if (!equalBytes(tag, b64toBytes(lock.tag))) return null;
    streamXor(keys.encKey, iv, ct);
    var s = "";
    for (var i = 0; i < ct.length; i++) s += String.fromCharCode(ct[i]);
    var pad = s.charCodeAt(s.length - 1);
    if (pad < 1 || pad > 32) return null;
    var parsed = JSON.parse(s.substr(0, s.length - pad));
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (e) {
    return null;
  }
};

// Verify only (no decrypt): true if `pin` opens the sealed store.
ENC.verify = function(file, pin) {
  var lock = require("Storage").readJSON(file, true);
  if (!lock || !lock.v) return false;
  try {
    var keys = deriveKeys(pin, b64toBytes(lock.salt), lock.iters);
    var iv = b64toBytes(lock.iv);
    var ct = b64toBytes(lock.ct);
    if (ct.length === 0 || ct.length % 32) return false;
    var tagIn = new Uint8Array(iv.length + ct.length);
    tagIn.set(iv, 0);
    tagIn.set(ct, iv.length);
    var tag = new Uint8Array(hmac(keys.macKey, tagIn, "SHA256"));
    return equalBytes(tag, b64toBytes(lock.tag));
  } catch (e) {
    return false;
  }
};

// Derive the encryption/MAC keys without touching Storage
// (for keeping a session in RAM across multiple saves).
ENC.derive = deriveKeys;

// Raw streaming helper (xors data in place with the given key+iv).
ENC.streamXor = streamXor;

ENC.hmac = hmac;
ENC.randomBytes = randomBytes;
ENC.strBytes = strBytes;
ENC.b64 = b64fromBytes;
ENC.unb64 = b64toBytes;

// Where the boot counter keeps IVs from ever repeating across reboots.
ENC.setNonceFile = function(f) {
  NONCE_FILE = f;
};
