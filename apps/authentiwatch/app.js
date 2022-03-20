const COUNTER_TRIANGLE_SIZE = 10;
const TOKEN_EXTRA_HEIGHT = 16;
var TOKEN_DIGITS_HEIGHT = 30;
var TOKEN_HEIGHT = TOKEN_DIGITS_HEIGHT + TOKEN_EXTRA_HEIGHT;
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

// sample settings:
// {tokens:[{"algorithm":"SHA1","digits":6,"period":30,"issuer":"","account":"","secret":"Bbb","label":"Aaa"}],misc:{}}
var settings = require("Storage").readJSON("authentiwatch.json", true) || {tokens:[],misc:{}};
if (settings.data  ) tokens = settings.data  ; /* v0.02 settings */
if (settings.tokens) tokens = settings.tokens; /* v0.03+ settings */

function b32decode(seedstr) {
  // RFC4648
  var buf = 0, bitcount = 0, retstr = "";
  for (var c of seedstr.toUpperCase()) {
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
  var retbuf = new Uint8Array(retstr.length);
  for (var i in retstr) {
    retbuf[i] = retstr.charCodeAt(i);
  }
  return retbuf;
}

function hmac(key, message, algo) {
  var a = algos[algo.toUpperCase()];
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

function formatOtp(otp, digits) {
  // add 0 padding
  var ret = "" + otp % Math.pow(10, digits);
  while (ret.length < digits) {
    ret = "0" + ret;
  }
  // add a space after every 3rd or 4th digit
  var re = (digits % 3 == 0 || (digits % 3 >= digits % 4 && digits % 4 != 0)) ? "" : ".";
  return ret.replace(new RegExp("(..." + re + ")", "g"), "$1 ").trim();
}

function hotp(token) {
  var d = Date.now();
  var tick, next;
  if (token.period > 0) {
    // RFC6238 - timed
    var seconds = Math.floor(d / 1000);
    tick = Math.floor(seconds / token.period);
    next = (tick + 1) * token.period * 1000;
  } else {
    // RFC4226 - counter
    tick = -token.period;
    next = d + 30000;
  }
  var msg = new Uint8Array(8);
  var v = new DataView(msg.buffer);
  v.setUint32(0, tick >> 16 >> 16);
  v.setUint32(4, tick & 0xFFFFFFFF);
  var ret;
  try {
    ret = hmac(b32decode(token.secret), msg, token.algorithm);
    ret = formatOtp(ret, token.digits);
  } catch(err) {
    ret = NOT_SUPPORTED;
  }
  return {hotp:ret, next:next};
}

// Tokens are displayed in three states:
// 1. Unselected (state.id==-1)
// 2. Selected, inactive (no code) (state.id!=-1,state.hotp.hotp=="")
// 3. Selected, active (code showing) (state.id!=-1,state.hotp.hotp!="")
var fontszCache = {};
var state = {
  listy:0, // list scroll position
  id:-1, // current token ID
  hotp:{hotp:"",next:0}
};

function sizeFont(id, txt, w) {
  var sz = fontszCache[id];
  if (sz) {
    g.setFont("Vector", sz);
  } else {
    sz = TOKEN_DIGITS_HEIGHT;
    do {
      g.setFont("Vector", sz--);
    } while (g.stringWidth(txt) > w);
    fontszCache[id] = sz + 1;
  }
}

tokenY = id => id * TOKEN_HEIGHT + AR.y - state.listy;
half = n => Math.floor(n / 2);

function timerCalc() {
  let timerfn = exitApp;
  let timerdly = 10000;
  let id = state.id;
  if (id != -1) {
    if (state.hotp.hotp != "") {
      if (tokens[id].period > 0) {
        // timed HOTP
        if (state.hotp.next < Date.now()) {
          if (state.cnt > 0) {
            --state.cnt;
            state.hotp = hotp(tokens[id]);
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
          --state.cnt;
          timerdly = 30000;
        } else {
          state.hotp.hotp = "";
          timerdly = 1;
        }
        timerfn = updateCurrentToken;
      }
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
  if (id != -1) {
    if (tokens[id].period > 0) {
      let rem = Math.floor((state.hotp.next - Date.now()) / 1000);
      if (rem >= 0) {
        let y1 = tokenY(id);
        let y2 = y1 + TOKEN_HEIGHT - 1;
        if (y2 >= AR.y && y1 <= AR.y2) {
          // token visible
          if ((y2 - 3) <= AR.y2)
          {
            // progress bar visible
            y2 = Math.min(y2, AR.y2);
            rem = Math.min(rem, tokens[id].period);
            let xr = Math.floor(AR.w * rem / tokens[id].period) + AR.x;
            g.setColor(g.theme.fgH)
             .setBgColor(g.theme.bgH)
             .fillRect(AR.x, y2 - 3, xr, y2)
             .clearRect(xr + 1, y2 - 3, AR.x2, y2);
          }
        } else {
          // token not visible
          state.id = -1;
        }
      }
    }
  }
}

// id = token ID number (0...)
function drawToken(id) {
  var x1 = AR.x;
  var y1 = tokenY(id);
  var x2 = AR.x2;
  var y2 = y1 + TOKEN_HEIGHT - 1;
  var adj, lbl;
  g.setClipRect(x1, Math.max(y1, AR.y), x2, Math.min(y2, AR.y2));
  lbl = tokens[id].label.substr(0, 10);
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
  g.setClipRect(0, 0, g.getWidth(), g.getHeight());
}

function startupDraw() {
  if (tokens.length > 0) {
    let id = 0;
    let y = tokenY(id);
    while (id < tokens.length && y < AR.y2) {
      if ((y + TOKEN_HEIGHT) > AR.y) {
        drawToken(id);
      }
      id++;
      y += TOKEN_HEIGHT;
    }
  } else {
    let x = AR.x + half(AR.w);
    let y = AR.y + half(AR.h);
    g.setFont("Vector", TOKEN_DIGITS_HEIGHT)
     .setFontAlign(0, 0, 0)
     .drawString(NO_TOKENS, x, y, false);
  }
  timerCalc();
}

function onDrag(e) {
  state.cnt = 1;
  if (e.b != 0 && e.dy != 0) {
    var y = E.clip(state.listy - e.dy, 0, tokens.length * TOKEN_HEIGHT - AR.h);
    if (state.listy != y) {
      var id, dy = state.listy - y;
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

function changeId(id) {
  if (id != state.id) {
    state.hotp.hotp = CALCULATING;
    let pid = state.id;
    state.id = id;
    if (pid != -1) {
      drawToken(pid);
    }
    if (id != -1) {
      drawToken( id);
    }
    timerCalc();
  }
}

function onTouch(zone, e) {
  state.cnt = 1;
  if (e) {
    var id = Math.floor((state.listy + e.y - AR.y) / TOKEN_HEIGHT);
    if (id == state.id || tokens.length == 0 || id >= tokens.length) {
      id = -1;
    }
    if (state.id != id) {
      if (id != -1) {
        // scroll token into view if necessary
        var fakee = {b:1,x:0,y:0,dx:0,dy:0};
        var y = id * TOKEN_HEIGHT - state.listy;
        if (y < 0) {
          fakee.dy -= y;
          y = 0;
        }
        y += TOKEN_HEIGHT;
        if (y > AR.h) {
          fakee.dy -= (y - AR.h);
        }
        onDrag(fakee);
      }
      changeId(id);
    }
  }
}

function onSwipe(e) {
  state.cnt = 1;
  let id = state.id;
  if (e == 1) {
    exitApp();
  }
  if (e == -1 && id != -1 && tokens[id].period <= 0) {
    tokens[id].period--;
    let newsettings={tokens:tokens,misc:settings.misc};
    require("Storage").writeJSON("authentiwatch.json", newsettings);
    state.hotp.hotp = CALCULATING;
    drawToken(id);
  }
}

function bangle1Btn(e) {
  state.cnt = 1;
  if (tokens.length > 0) {
    var id = state.id;
    switch (e) {
      case -1: id--; break;
      case  1: id++; break;
    }
    id = E.clip(id, 0, tokens.length - 1);
    var fakee = {b:1,x:0,y:0,dx:0};
    fakee.dy = state.listy - E.clip(id * TOKEN_HEIGHT - half(AR.h - TOKEN_HEIGHT), 0, tokens.length * TOKEN_HEIGHT - AR.h);
    onDrag(fakee);
    changeId(id);
  } else {
    timerCalc();
  }
}

function exitApp() {
  Bangle.showLauncher();
}

Bangle.on('touch', onTouch);
Bangle.on('drag' , onDrag );
Bangle.on('swipe', onSwipe);
if (typeof BTN2 == 'number') {
  setWatch(function(){bangle1Btn(-1);}, BTN1, {edge:"rising" , debounce:50, repeat:true});
  setWatch(function(){exitApp();     }, BTN2, {edge:"falling", debounce:50});
  setWatch(function(){bangle1Btn( 1);}, BTN3, {edge:"rising" , debounce:50, repeat:true});
} else {
  setWatch(function(){exitApp();     }, BTN1, {edge:"falling", debounce:50});
}
Bangle.loadWidgets();
const AR = Bangle.appRect;
g.clear(); // Clear the screen once, at startup
startupDraw();
Bangle.drawWidgets();
