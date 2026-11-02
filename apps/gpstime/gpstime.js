if (require("Storage").read("czech.pbf")) {
  Graphics.prototype.setFontCzech = function() {
    return this.setFontPBF(require("Storage").read("czech.pbf"));
  };
}


// Use the bundled Czech font for this app, even if another Intl font is installed
var oldSetFontIntl = Graphics.prototype.setFontIntl;
if (Graphics.prototype.setFontCzech)
  Graphics.prototype.setFontIntl = Graphics.prototype.setFontCzech;
function restoreFont() {
  if (!Graphics.prototype.setFontCzech) return;
  if (oldSetFontIntl) Graphics.prototype.setFontIntl = oldSetFontIntl;
  else delete Graphics.prototype.setFontIntl;
}

// Detect characters outside ISO8859-1, including UTF-8 bytes stored as a
// byte string (as happens for text read back from Storage/minified code).
function hasWideChars(s) {
  for (var i=0;i<s.length;i++) {
    var c = s.charCodeAt(i);
    if (c>0xFF) return true;
    if (c>=0xC2 && c<=0xF4) {
      var len = c<0xE0?2 : c<0xF0?3 : 4;
      if (i+len<=s.length) {
        var cp = c & (len==2?0x1F:len==3?0x0F:0x07), ok = true;
        for (var j=1;j<len;j++) {
          var cc = s.charCodeAt(i+j);
          if ((cc&0xC0)!=0x80) { ok=false; break; }
          cp = (cp<<6)|(cc&0x3F);
        }
        if (ok && cp>0xFF) return true;
      }
    }
  }
  return false;
}

function toUnicode(s) {
  // Already a UTF-8 string?
  for (var i=0;i<s.length;i++) if (s.charCodeAt(i)>0xFF) return s;
  if (!hasWideChars(s)) return s;
  // It is a byte string containing UTF-8. Decode it and build a UTF-8
  // JavaScript string literal so Espruino tags the result as UTF-8.
  var out = "", j = 0;
  while (j < s.length) {
    var c = s.charCodeAt(j++), cp = c;
    if (c >= 0xC2 && c <= 0xDF) {
      cp = ((c & 0x1F)<<6) | (s.charCodeAt(j++) & 0x3F);
    } else if (c >= 0xE0 && c <= 0xEF) {
      cp = ((c & 0x0F)<<12) | ((s.charCodeAt(j++) & 0x3F)<<6) | (s.charCodeAt(j++) & 0x3F);
    } else if (c >= 0xF0 && c <= 0xF4) {
      cp = ((c & 0x07)<<18) | ((s.charCodeAt(j++) & 0x3F)<<12) |
           ((s.charCodeAt(j++) & 0x3F)<<6) | (s.charCodeAt(j++) & 0x3F);
    }
    if (cp < 0x80) {
      if (cp == 34) out += '\\"';
      else if (cp == 92) out += '\\\\';
      else if (cp == 10) out += '\\n';
      else if (cp == 13) out += '\\r';
      else if (cp == 9) out += '\\t';
      else if (cp < 32) out += '\\x' + ("0"+cp.toString(16)).slice(-2);
      else out += String.fromCharCode(cp);
    } else if (cp <= 0xFFFF) {
      out += "\\u" + ("0000"+cp.toString(16)).slice(-4);
    } else {
      cp -= 0x10000;
      out += "\\u" + ("0000"+(0xD800+(cp>>10)).toString(16)).slice(-4) +
             "\\u" + ("0000"+(0xDC00+(cp&0x3FF)).toString(16)).slice(-4);
    }
  }
  return eval('"' + out + '"');
}

function satelliteImage() {
  return require("heatshrink").decompress(atob("mEwxH+AH4A/AH4A/AH4AGnE4F1wvsF34wgFldcLdyMYsoACF1WJF4YxPFzOtF4wxNFzAvKSiIvU1ovIGAkJAAQucF5QxCFwYwbF4QwLrwvjYIVfrwABrtdq9Wqwvkq4oCAAtXmYvi1teE4NXrphCrxoCGAbvdSIoAHNQNeFzQvGeRQvCsowrYYNfF8YwHZQQFCF8QwGF4owjeYovBroHEMERhEF8IwNrtWryYFF8YwCq4vhGBeJF5AwaxIwKwVXFwwvandfMJeJF8M6nZiLGQIvdstfGAVlGBZkCxJeZJQIwCGIRjMFzYACGIc6r/+FsIvGGIYABEzYvPGQYvusovkAH4A/AH4A/ACo="));
}

var fix;

Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
var Layout = require("Layout");
Bangle.setGPSPower(1, "app");
Bangle.loadWidgets();
Bangle.drawWidgets();
E.showMessage(toUnicode(/*LANG*/"Loading...")); // avoid showing rubbish on screen

var WAITING = toUnicode(/*LANG*/"Waiting\nfor GPS");
var ACQUIRED = toUnicode(/*LANG*/"GPS\nAcquired");

function fontForText(text, fallback) {
  if (Graphics.prototype.setFontCzech && hasWideChars(text))
    return "Czech";
  return fallback;
}

function setGPSTime() {
  if (fix.time!==undefined) {
    setTime(fix.time.getTime()/1000);
    E.showMessage(toUnicode(/*LANG*/"System time set"), {img:require("heatshrink").decompress(atob("lEo4UBvvv///vEFBYNVAAWq1QFDBAgKGrQJD0oJDtQJD1IICqwGBFoIDByocDwAJBgQeDtWoJwcqDwWq0EAgfAgEKHoQcCBIQeBGAQaBBIQzBytaEwQJDlWlrQmBBIkK0tqBI+ptRNCBIcCBKhECBIh6CAgUL8AJHl/4BI8+3gJRl/8GJH/BI8Ah6MDLIZQB+BjGAAIoBBI84BIaVCAAaVBVIYJEWYLkEXobRDAAbRBcoYACcoT5DEwYJCtQoElWpBINaDwYcB0oJBGQIzCAYIwBDwQGBAAIcCDwYACDgQACBIYIEBQYFDA="))});
  } else {
    E.showMessage(toUnicode(/*LANG*/"No GPS time to set"));
  }

  Bangle.removeListener('GPS',onGPS);
  setTimeout(function() {
    fix = undefined;
    layout.forgetLazyState(); // redraw all next time
    Bangle.on('GPS',onGPS);
  }, 2000);
}

var layout = new Layout( {
  type:"v", c: [
    {type:"h", c:[
      {type:"img", src:satelliteImage },
      { type:"v", fillx:1, c: [
       {type:"txt", font:fontForText(WAITING, "6x8:2"), label:WAITING, id:"status" },
       {type:"txt", font:"6x8", label:"---", id:"sat" },
     ]},
    ]},
    {type:"txt", fillx:1, filly:1, font:"6x8:2", label:"---", id:"gpstime" }
  ]},{lazy:true, remove:restoreFont, btns: [
    { label : "Set", cb : setGPSTime},
    { label : /*LANG*/"Back", cb : ()=>{ restoreFont(); load(); } }
  ]});

// Use the Intl font for button labels that need Czech characters
layout.options.btns.forEach(function(b) {
  b.label = toUnicode(b.label);
  b.font = fontForText(b.label, b.font || "6x8:2");
});


function onGPS(f) {
  if (fix===undefined) {
    g.clear();
    Bangle.drawWidgets();
  }
  fix = f;
  var status = fix.fix ? ACQUIRED : WAITING;
  layout.status.label = status;
  layout.status.font = fontForText(status, "6x8:2");
  layout.sat.label = fix.satellites+" "+toUnicode(/*LANG*/"satellites");
  layout.sat.font = fontForText(layout.sat.label, "6x8");
  layout.updateNeeded = true;

  var t = ["","---",""];
  if (fix.time!==undefined) {
    t = fix.time.toString().split(" ");
    var tz = (new Date()).getTimezoneOffset()/-60;
    if (tz==0) tz="UTC";
    else if (tz>0) tz="UTC+"+tz;
    else tz="UTC"+tz;

    t = [t[1]+" "+t[2],t[3],t[4],t[5],tz];
  }

  layout.gpstime.label = t.join("\n");
  layout.render();
}

Bangle.on('GPS',onGPS);
