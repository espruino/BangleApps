/*
Binary search keyboard for typing with
the touchscreen
*/

var storage = require('Storage');

const settings = storage.readJSON('setting.json',1) || { HID: false };
const KEY = {
  A           : 4 ,
  B           : 5 ,
  C           : 6 ,
  D           : 7 ,
  E           : 8 ,
  F           : 9 ,
  G           : 10,
  H           : 11,
  I           : 12,
  J           : 13,
  K           : 14,
  L           : 15,
  M           : 16,
  N           : 17,
  O           : 18,
  P           : 19,
  Q           : 20,
  R           : 21,
  S           : 22,
  T           : 23,
  U           : 24,
  V           : 25,
  W           : 26,
  X           : 27,
  Y           : 28,
  Z           : 29,
  1           : 30,
  2           : 31,
  3           : 32,
  4           : 33,
  5           : 34,
  6           : 35,
  7           : 36,
  8           : 37,
  9           : 38,
  0           : 39
};

var sendHID;

function showChars(x,chars) {
  var lines = Math.round(Math.sqrt(chars.length)*2);
  g.setFontAlign(0,0);
  var sy = Math.round(200/lines);
  var sx = sy;
  g.setFont("Vector", sy-2);
  var y = (240 - lines*sy);
  var last = 0;
  for (var i=0;i<lines;i++) {
    var n = Math.round(chars.length*(i+1)/lines);
    var xo = x + (120 - sx*(n-last-1))/2;
    for (var j=last;j<n;j++)
      g.drawString(chars[j], xo + (j-last)*sx, y + sy*i)
    last = n;
  }
}

function show(chars,callback) {
  g.clear();
  if (chars.length==1) {
    callback(chars);
    return;
  }
  var m = chars.length/2;
  let charl=chars.slice(0,m);
  let charr=chars.slice(m);
  showChars(0,charl);
  showChars(120,charr);
  setWatch(() => {
    clearWatch();
    show(charl,callback);
  }, BTN4);
  setWatch(() => {
    clearWatch();
    show(charr,callback);
  }, BTN5);
}

function getCharacter() {
  return new Promise(resolve => {
    show("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",resolve);
  });
}

function startKeyboardHID() {
  getCharacter().then(ch => {
    return sendHID(KEY[ch]);
  }).then(startKeyboardHID);
}

if (settings.HID=="kb" || settings.HID=="kbmedia") {
  if (settings.HID=="kbmedia") {
    sendHID = function(code) {
      return new Promise(resolve=>{
        NRF.sendHIDReport([2,0,0,code,0,0,0,0,0], () => {
          NRF.sendHIDReport([2,0,0,0,0,0,0,0,0], resolve);
        });
      });
    };
  } else {
    sendHID = function(code) {
      return new Promise(resolve=>{
        NRF.sendHIDReport([0,0,code,0,0,0,0,0], () => {
          NRF.sendHIDReport([0,0,0,0,0,0,0,0], resolve);
        });
      });
    };
  }
  startKeyboardHID();
  setWatch(() => {
    sendHID(44); // space
  }, BTN2, {repeat:true});
  setWatch(() => {
    sendHID(40); // enter
  }, BTN3, {repeat:true});
} else {
  E.showPrompt("Enable HID?",{title:"HID disabled"}).then(function(enable) {
    if (enable) {
      settings.HID = "kb";
      require("Storage").write('setting.json', settings);
      setTimeout(load, 1000, "hidbkbd.app.js");
    } else setTimeout(load, 1000);
  });
}
