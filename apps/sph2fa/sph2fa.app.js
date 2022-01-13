const tokenextraheight = 16;
var tokendigitsheight = 30;
// Hash functions
const crypto = require("crypto");
const algos = {
  SHA512: { sha: crypto.SHA512, retsz: 64, blksz: 128 },
  SHA256: { sha: crypto.SHA256, retsz: 32, blksz: 64 },
  SHA1: { sha: crypto.SHA1, retsz: 20, blksz: 64 },
};
const calculating = "Calculating";
const notokens = "No tokens";
const notsupported = "Not supported";

// sample settings:
// {tokens:[{"algorithm":"SHA1","digits":6,"period":30,"issuer":"","account":"","secret":"Bbb","label":"Aaa"}],misc:{}}
var settings = require("Storage").readJSON("authentiwatch.json", true) || {
  tokens: [],
  misc: {},
};
if (settings.tokens) tokens = settings.tokens; /* v0.03+ settings */

// QR Code Text
//
// Example:
//
// otpauth://totp/${url}:AA_${algorithm}_${digits}dig_${period}s@${url}?algorithm=${algorithm}&digits=${digits}&issuer=${url}&period=${period}&secret=${secret}
//
// ${algorithm} : one of SHA1 / SHA256 / SHA512
// ${digits} : one of 6 / 8
// ${period} : one of 30 / 60
// ${url} : a domain name "example.com"
// ${secret} : the seed code

function b32decode(seedstr) {
  // RFC4648
  var i,
    buf = 0,
    bitcount = 0,
    retstr = "";
  for (i in seedstr) {
    var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(
      seedstr.charAt(i).toUpperCase(),
      0
    );
    if (c != -1) {
      buf <<= 5;
      buf |= c;
      bitcount += 5;
      if (bitcount >= 8) {
        retstr += String.fromCharCode(buf >> (bitcount - 8));
        buf &= 0xff >> (16 - bitcount);
        bitcount -= 8;
      }
    }
  }
  var retbuf = new Uint8Array(retstr.length);
  for (i in retstr) {
    retbuf[i] = retstr.charCodeAt(i);
  }
  return retbuf;
}
function do_hmac(key, message, algo) {
  var a = algos[algo];
  // RFC2104
  if (key.length > a.blksz) {
    key = a.sha(key);
  }
  var istr = new Uint8Array(a.blksz + message.length);
  var ostr = new Uint8Array(a.blksz + a.retsz);
  for (var i = 0; i < a.blksz; ++i) {
    var c = i < key.length ? key[i] : 0;
    istr[i] = c ^ 0x36;
    ostr[i] = c ^ 0x5c;
  }
  istr.set(message, a.blksz);
  ostr.set(a.sha(istr), a.blksz);
  var ret = a.sha(ostr);
  // RFC4226 dynamic truncation
  var v = new DataView(ret, ret[ret.length - 1] & 0x0f, 4);
  return v.getUint32(0) & 0x7fffffff;
}
function hotp(d, token, dohmac) {
  var tick;
  if (token.period > 0) {
    // RFC6238 - timed
    var seconds = Math.floor(d.getTime() / 1000);
    tick = Math.floor(seconds / token.period);
  } else {
    // RFC4226 - counter
    tick = -token.period;
  }
  var msg = new Uint8Array(8);
  var v = new DataView(msg.buffer);
  v.setUint32(0, (tick >> 16) >> 16);
  v.setUint32(4, tick & 0xffffffff);
  var ret = calculating;
  if (dohmac) {
    try {
      var hash = do_hmac(
        b32decode(token.secret),
        msg,
        token.algorithm.toUpperCase()
      );
      ret = "" + (hash % Math.pow(10, token.digits));
      while (ret.length < token.digits) {
        ret = "0" + ret;
      }
    } catch (err) {
      ret = notsupported;
    }
  }
  return {
    hotp: ret,
    next:
      token.period > 0 ? (tick + 1) * token.period * 1000 : d.getTime() + 30000,
  };
}

g.clear();

var mainmenu = {
  "": { title: "2FA Auth" },
  "< Exit": function () {
    load();
  }, // remove the menu
};
tokens.forEach((token) => {
  mainmenu[token.label] = () => updateMenuForToken(token);
});

function updateMenuForToken(token) {
  mainmenu[token.label] = {
    value: "...",
  };
  E.showMenu(mainmenu);
  otp = hotp(new Date(), token, true).hotp;
  mainmenu[token.label] = {
    value: otp,
    step: 0,
    onchange: () => updateMenuForToken(token),
  };
  E.showMenu(mainmenu);
}

E.showMenu(mainmenu);
