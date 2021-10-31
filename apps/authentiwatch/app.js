const tokenentryheight = 46;
// Hash functions
const crypto = require("crypto");
const sha1   = crypto.SHA1;
const sha224 = crypto.SHA224;
const sha256 = crypto.SHA256;
const sha384 = crypto.SHA384;
const sha512 = crypto.SHA512;

var tokens = require("Storage").readJSON("authentiwatch.json", true) || [
  {algorithm:"SHA512",digits:8,period:60,secret:"aaaa aaaa aaaa aaaa",label:"AgAgAg"},
  {algorithm:"SHA1",digits:6,period:30,secret:"bbbb bbbb bbbb bbbb",label:"BgBgBg"},
  {algorithm:"SHA1",digits:6,period:30,secret:"cccc cccc cccc cccc",label:"CgCgCg"},
  {algorithm:"SHA1",digits:6,period:60,secret:"yyyy yyyy yyyy yyyy",label:"YgYgYg"},
  {algorithm:"SHA1",digits:8,period:30,secret:"zzzz zzzz zzzz zzzz",label:"ZgZgZg"},
];

Graphics.prototype.setFontInconsolata = function(scale) {
  // Actual height 21 (25 - 5)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAADgAAADgAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAHwAAAfgAAB+AAAH4AAA/gAAD+AAAPwAAA/AAAB8AAABwAAAAAAAAAAAAAAAAAAAA/gAAH/8AAf//AA+A/gA4BzgAwHhgAwPBgAwcBgA54DgA/wPgAf//AAH/8AAA/gAAAAAAAAAAAAAAAAAIAAAAMAAAAYAAAAYAAAA4AAAA///gA///gA///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAOABgAeADgA4AHgAwAPgAwAdgAwA5gAwDxgAwHhgA8fBgAf+BgAP4BgADgBgAAAAAAAAAAAAAAAAAADAAYAHAA4EDgAwMBgAwMBgAwMBgAwOBgA4+BgA///gAfz/AAHB+AAAAAAAAAAAAAAAAAAAwAAABwAAAHwAAAPwAAA+wAAB4wAAHwwAAPAwAA///gA///gA///gAAAwAAAAwAAAAQAAAAAAAAAAAAP8GAA/8HAA/8DgAwYBgAwYBgAwYBgAwYBgAwYBgAwcHgAwP/AAwH+AAAD4AAAAAAAAAAAAAHAAAD/8AAP/+AAfufAA8cDgA4YBgAwYBgAwYBgAwYBgAwcHgA4P/AAYH+AAAB4AAAAAAAAAAAAAAAAAwAAAAwAAAAwAAAAwAHgAwA/gAwH/gAwf4AAz/AAA/4AAA/AAAA8AAAAgAAAAAAAAAAAAAAAAcAAHB+AAfj/AA/3DgA4+BgAwcBgAwcBgAwcBgAw+BgA/3DgAfz/AAPB+AAAA8AAAAAAAAAAAABAAAAP4BAAf8DgA8eDgAwGBgAwGBgAwGBgAwGBgA4GDgA+OfAAf/+AAP/4AAB/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBgAAcDgAAcDgAAYBgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="), 46, 15, 30+(scale<<8)+(1<<16));
};

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
  var i, buf = 0, bitcount = 0, retstr = "";
  for (i in seedstr) {
    var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(seedstr.charAt(i).toUpperCase(), 0);
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
  if (bitcount > 0) {
    retstr += String.fromCharCode(buf << (8 - bitcount));
  }
  var retbuf = new Uint8Array(retstr.length);
  for (i in retstr) {
    retbuf[i] = retstr.charCodeAt(i);
  }
  return retbuf;
}
function do_hmac(key, message, algo) {
  var sha, retsz, blksz;
  if (algo == "SHA512") {
    sha = sha512;
    retsz = 64;
    blksz = 128;
  } else if (algo == "SHA384") {
    sha = sha384;
    retsz = 48;
    blksz = 128;
  } else if (algo == "SHA256") {
    sha = sha256;
    retsz = 32;
    blksz = 64;
  } else if (algo == "SHA224") {
    sha = sha224;
    retsz = 28;
    blksz = 64;
  } else {
    sha = sha1;
    retsz = 20;
    blksz = 64;
  }
  // RFC2104
  if (key.length > blksz) {
    key = sha(key);
  }
  var istr = new Uint8Array(blksz + message.length);
  var ostr = new Uint8Array(blksz + retsz);
  for (var i = 0; i < blksz; ++i) {
    var c = (i < key.length) ? key[i] : 0;
    istr[i] = c ^ 0x36;
    ostr[i] = c ^ 0x5C;
  }
  istr.set(message, blksz);
  ostr.set(sha(istr), blksz);
  var ret = sha(ostr);
  // RFC4226 dynamic truncation
  var v = new DataView(ret, ret[ret.length - 1] & 0x0F, 4);
  return v.getUint32(0) & 0x7FFFFFFF;
}
function hotp_timed(seed, digits, period, algo) {
  // RFC6238
  var d = new Date();
  var seconds = Math.floor(d.getTime() / 1000);
  var tick = Math.floor(seconds / period);
  var msg = new Uint8Array(8);
  var v = new DataView(msg.buffer);
  v.setUint32(0, tick >> 16 >> 16);
  v.setUint32(4, tick & 0xFFFFFFFF);
  var hash = do_hmac(b32decode(seed), msg, algo.toUpperCase());
  var ret = "" + hash % Math.pow(10, digits);
  while (ret.length < digits) {
    ret = "0" + ret;
  }
  return {hotp:ret, next:(tick + 1) * period * 1000};
}

var state = {
  listy: 0,
  curtoken:-1,
  nextTime:0,
  otp:"",
  rem:0
};

function drawToken(id, r) {
  var x1 = r.x;
  var y1 = r.y;
  var x2 = r.x + r.w - 1;
  var y2 = r.y + r.h - 1;
  var ylabel;
  g.setClipRect(Math.max(x1, Bangle.appRect.x ), Math.max(y1, Bangle.appRect.y ),
                Math.min(x2, Bangle.appRect.x2), Math.min(y2, Bangle.appRect.y2));
  if (id == state.curtoken) {
    // current token
    g.setColor(g.theme.fgH);
    g.setBgColor(g.theme.bgH);
    g.setFont6x15(1);
    // center just below top line
    g.setFontAlign(0, -1, 0);
    ylabel = y1 + 2;
  } else {
    g.setColor(g.theme.fg);
    g.setBgColor(g.theme.bg);
    g.setFont6x15(2);
    // center in box
    g.setFontAlign(0, 0, 0);
    ylabel = (y1 + y2) / 2;
  }
  g.clearRect(x1, y1, x2, y2);
  g.drawString(tokens[id].label, x2 / 2, ylabel, false);
  if (id == state.curtoken) {
    // digits just below label
    g.setFontInconsolata(1);
    g.drawString(state.otp, x2 / 2, y1 + 12, false);
    // draw progress bar
    let xr = Math.floor(g.getWidth() * state.rem / tokens[id].period);
    g.fillRect(x1, y2 - 4, xr, y2 - 1);
  }
  // shaded lines top and bottom
  if (g.theme.dark) {
    g.setColor(0.25, 0.25, 0.25);
  } else {
    g.setColor(0.75, 0.75, 0.75);
  }
  g.drawLine(x1, y1, x2, y1);
  g.drawLine(x1, y2, x2, y2);
  g.setClipRect(0, 0, g.getWidth(), g.getHeight());
}

function draw() {
  if (state.curtoken != -1) {
    var t = tokens[state.curtoken];
    var d = new Date();
    if (d.getTime() > state.nextTime) {
      try {
        var r = hotp_timed(t.secret, t.digits, t.period, t.algorithm);
        state.nextTime = r.next;
        state.otp = r.hotp;
      } catch (err) {
        state.nextTime = 0;
        state.otp = "Not supported";
      }
    }
    state.rem = Math.max(0, Math.floor((state.nextTime - d.getTime()) / 1000));
  }
  if (tokens.length > 0) {
    var drewcur = false;
    var id = Math.floor(state.listy / tokenentryheight);
    var y = id * tokenentryheight + Bangle.appRect.y - state.listy;
    while (id < tokens.length && y < g.getHeight()) {
      drawToken(id, {x:Bangle.appRect.x, y:y, w:Bangle.appRect.w, h:tokenentryheight});
      if (id == state.curtoken && state.nextTime != 0) {
        drewcur = true;
      }
      id += 1;
      y += tokenentryheight;
    }
    if (drewcur) {
      if (state.drawtimer) {
        clearTimeout(state.drawtimer);
      }
      state.drawtimer = setTimeout(draw, 1000);
    }
  } else {
    g.setFont6x15(2);
    g.setFontAlign(0, 0, 0);
    g.drawString("No tokens", g.getWidth() / 2, g.getHeight() / 2, false);
  }
}

function onTouch(zone, e) {
  var id = Math.floor((state.listy + (e.y - Bangle.appRect.y)) / tokenentryheight);
  if (id == state.curtoken) {
    id = -1;
  }
  if (state.curtoken != id) {
    if (id != -1) {
      var y = id * tokenentryheight - state.listy;
      if (y < 0) {
        state.listy += y;
        y = 0;
      }
      y += tokenentryheight;
      if (y > Bangle.appRect.h) {
        state.listy += (y - Bangle.appRect.h);
      }
    }
    state.nextTime = 0;
    state.curtoken = id;
    draw();
  }
}

function onDrag(e) {
  if (e.x > g.getWidth() || e.y > g.getHeight()) return;
  if (e.dx == 0 && e.dy == 0) return;
  var maxy = tokens.length * tokenentryheight - Bangle.appRect.h;
  var newy = state.listy - e.dy;
  if (newy > maxy) {
    newy = maxy;
  }
  if (newy < 0) {
    newy = 0;
  }
  if (newy != state.listy) {
    state.listy = newy;
    draw();
  }
}

function onSwipe(e) {
  if (e == 1) {
    Bangle.showLauncher();
  }
}

Bangle.on('touch', onTouch);
Bangle.on('drag' , onDrag );
Bangle.on('swipe', onSwipe);
Bangle.loadWidgets();

// Clear the screen once, at startup
g.clear();
draw();
Bangle.drawWidgets();
