const tokenextraheight = 16;
var tokendigitsheight = 30;
// Hash functions
const crypto = require("crypto");
const algos = {
  "SHA512":{sha:crypto.SHA512,retsz:64,blksz:128},
  "SHA256":{sha:crypto.SHA256,retsz:32,blksz:64 },
  "SHA1"  :{sha:crypto.SHA1  ,retsz:20,blksz:64 },
};
const calculating = "Calculating";
const notokens = "No tokens";
const notsupported = "Not supported";

// sample settings:
// {tokens:[{"algorithm":"SHA1","digits":6,"period":30,"issuer":"","account":"","secret":"Bbb","label":"Aaa"}],misc:{}}
var settings = require("Storage").readJSON("authentiwatch.json", true) || {tokens:[],misc:{}};
if (settings.data  ) tokens = settings.data  ; /* v0.02 settings */
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
    var c = (i < key.length) ? key[i] : 0;
    istr[i] = c ^ 0x36;
    ostr[i] = c ^ 0x5C;
  }
  istr.set(message, a.blksz);
  ostr.set(a.sha(istr), a.blksz);
  var ret = a.sha(ostr);
  // RFC4226 dynamic truncation
  var v = new DataView(ret, ret[ret.length - 1] & 0x0F, 4);
  return v.getUint32(0) & 0x7FFFFFFF;
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
  v.setUint32(0, tick >> 16 >> 16);
  v.setUint32(4, tick & 0xFFFFFFFF);
  var ret = calculating;
  if (dohmac) {
    try {
      var hash = do_hmac(b32decode(token.secret), msg, token.algorithm.toUpperCase());
      ret = "" + hash % Math.pow(10, token.digits);
      while (ret.length < token.digits) {
        ret = "0" + ret;
      }
    } catch(err) {
      ret = notsupported;
    }
  }
  return {hotp:ret, next:((token.period > 0) ? ((tick + 1) * token.period * 1000) : d.getTime() + 30000)};
}

var state = {
  listy: 0,
  prevcur:0,
  curtoken:-1,
  nextTime:0,
  otp:"",
  rem:0,
  hide:0
};

function drawToken(id, r) {
  var x1 = r.x;
  var y1 = r.y;
  var x2 = r.x + r.w - 1;
  var y2 = r.y + r.h - 1;
  var adj, lbl, sz;
  g.setClipRect(Math.max(x1, Bangle.appRect.x ), Math.max(y1, Bangle.appRect.y ),
                Math.min(x2, Bangle.appRect.x2), Math.min(y2, Bangle.appRect.y2));
  lbl = tokens[id].label.substr(0, 10);
  if (id == state.curtoken) {
    // current token
    g.setColor(g.theme.fgH);
    g.setBgColor(g.theme.bgH);
    g.setFont("Vector", tokenextraheight);
    // center just below top line
    g.setFontAlign(0, -1, 0);
    adj = y1;
  } else {
    g.setColor(g.theme.fg);
    g.setBgColor(g.theme.bg);
    sz = tokendigitsheight;
    do {
      g.setFont("Vector", sz--);
    } while (g.stringWidth(lbl) > r.w);
    // center in box
    g.setFontAlign(0, 0, 0);
    adj = (y1 + y2) / 2;
  }
  g.clearRect(x1, y1, x2, y2);
  g.drawString(lbl, (x1 + x2) / 2, adj, false);
  if (id == state.curtoken) {
    if (tokens[id].period > 0) {
      // timed - draw progress bar
      let xr = Math.floor(Bangle.appRect.w * state.rem / tokens[id].period);
      g.fillRect(x1, y2 - 4, xr, y2 - 1);
      adj = 0;
    } else {
      // counter - draw triangle as swipe hint
      let yc = (y1 + y2) / 2;
      g.fillPoly([0, yc, 10, yc - 10, 10, yc + 10, 0, yc]);
      adj = 12;
    }
    // digits just below label
    sz = tokendigitsheight;
    do {
      g.setFont("Vector", sz--);
    } while (g.stringWidth(state.otp) > (r.w - adj));
    g.drawString(state.otp, (x1 + adj + x2) / 2, y1 + tokenextraheight, false);
  }
  // shaded lines top and bottom
  g.setColor(0.5, 0.5, 0.5);
  g.drawLine(x1, y1, x2, y1);
  g.drawLine(x1, y2, x2, y2);
  g.setClipRect(0, 0, g.getWidth(), g.getHeight());
}

function draw() {
  var timerfn = exitApp;
  var timerdly = 10000;
  var d = new Date();
  if (state.curtoken != -1) {
    var t = tokens[state.curtoken];
    if (state.otp == calculating) {
      state.otp = hotp(d, t, true).hotp;
    }
    if (d.getTime() > state.nextTime) {
      if (state.hide == 0) {
        // auto-hide the current token
        if (state.curtoken != -1) {
          state.prevcur = state.curtoken;
          state.curtoken = -1;
        }
        state.nextTime = 0;
      } else {
        // time to generate a new token
        var r = hotp(d, t, state.otp != "");
        state.nextTime = r.next;
        state.otp = r.hotp;
        if (t.period <= 0) {
          state.hide = 1;
        }
        state.hide--;
      }
    }
    state.rem = Math.max(0, Math.floor((state.nextTime - d.getTime()) / 1000));
  }
  if (tokens.length > 0) {
    var drewcur = false;
    var id = Math.floor(state.listy / (tokendigitsheight + tokenextraheight));
    var y = id * (tokendigitsheight + tokenextraheight) + Bangle.appRect.y - state.listy;
    while (id < tokens.length && y < Bangle.appRect.y2) {
      drawToken(id, {x:Bangle.appRect.x, y:y, w:Bangle.appRect.w, h:(tokendigitsheight + tokenextraheight)});
      if (id == state.curtoken && (tokens[id].period <= 0 || state.nextTime != 0)) {
        drewcur = true;
      }
      id += 1;
      y += (tokendigitsheight + tokenextraheight);
    }
    if (drewcur) {
      // the current token has been drawn - schedule a redraw
      if (tokens[state.curtoken].period > 0) {
        timerdly = (state.otp == calculating) ? 1 : 1000; // timed
      } else {
        timerdly = state.nexttime - d.getTime(); // counter
      }
      timerfn = draw;
      if (tokens[state.curtoken].period <= 0) {
        state.hide = 0;
      }
    } else {
      // de-select the current token if it is scrolled out of view
      if (state.curtoken != -1) {
        state.prevcur = state.curtoken;
        state.curtoken = -1;
      }
      state.nexttime = 0;
    }
  } else {
    g.setFont("Vector", tokendigitsheight);
    g.setFontAlign(0, 0, 0);
    g.drawString(notokens, Bangle.appRect.x + Bangle.appRect.w / 2, Bangle.appRect.y + Bangle.appRect.h / 2, false);
  }
  if (state.drawtimer) {
    clearTimeout(state.drawtimer);
  }
  state.drawtimer = setTimeout(timerfn, timerdly);
}

function onTouch(zone, e) {
  if (e) {
    var id = Math.floor((state.listy + (e.y - Bangle.appRect.y)) / (tokendigitsheight + tokenextraheight));
    if (id == state.curtoken || tokens.length == 0 || id >= tokens.length) {
      id = -1;
    }
    if (state.curtoken != id) {
      if (id != -1) {
        var y = id * (tokendigitsheight + tokenextraheight) - state.listy;
        if (y < 0) {
          state.listy += y;
          y = 0;
        }
        y += (tokendigitsheight + tokenextraheight);
        if (y > Bangle.appRect.h) {
          state.listy += (y - Bangle.appRect.h);
        }
        state.otp = "";
      }
      state.nextTime = 0;
      state.curtoken = id;
      state.hide = 2;
    }
  }
  draw();
}

function onDrag(e) {
  if (e.x > g.getWidth() || e.y > g.getHeight()) return;
  if (e.dx == 0 && e.dy == 0) return;
  var newy = Math.min(state.listy - e.dy, tokens.length * (tokendigitsheight + tokenextraheight) - Bangle.appRect.h);
  state.listy = Math.max(0, newy);
  draw();
}

function onSwipe(e) {
  if (e == 1) {
    exitApp();
  }
  if (e == -1 && state.curtoken != -1 && tokens[state.curtoken].period <= 0) {
    tokens[state.curtoken].period--;
    let newsettings={tokens:tokens,misc:settings.misc};
    require("Storage").writeJSON("authentiwatch.json", newsettings);
    state.nextTime = 0;
    state.otp = "";
    state.hide = 2;
  }
  draw();
}

function bangle1Btn(e) {
  if (tokens.length > 0) {
    if (state.curtoken == -1) {
      state.curtoken = state.prevcur;
    } else {
      switch (e) {
        case -1: state.curtoken--; break;
        case  1: state.curtoken++; break;
      }
    }
    state.curtoken = Math.max(state.curtoken, 0);
    state.curtoken = Math.min(state.curtoken, tokens.length - 1);
    var fakee = {};
    fakee.y = state.curtoken * (tokendigitsheight + tokenextraheight) - state.listy + Bangle.appRect.y;
    state.curtoken = -1;
    state.nextTime = 0;
    onTouch(0, fakee);
  } else {
    draw(); // resets idle timer
  }
}

function exitApp() {
  Bangle.showLauncher();
}

Bangle.on('touch', onTouch);
Bangle.on('drag' , onDrag );
Bangle.on('swipe', onSwipe);
if (typeof BTN2 == 'number') {
  setWatch(function(){bangle1Btn(-1);}, BTN1, {edge:"rising", debounce:50, repeat:true});
  setWatch(function(){exitApp();     }, BTN2, {edge:"rising", debounce:50, repeat:true});
  setWatch(function(){bangle1Btn( 1);}, BTN3, {edge:"rising", debounce:50, repeat:true});
}
Bangle.loadWidgets();

// Clear the screen once, at startup
g.clear();
draw();
Bangle.drawWidgets();
