/* CARDS is a list of:
  {id:int,
    name,
    value,
    type,
    expiration,
    color,
    balance,
    note,
    ...
  }
*/

Bangle.loadWidgets();
Bangle.drawWidgets();

// get brightness
let brightness;

function loadBrightness() {
    const getBrightness = require('Storage').readJSON("setting.json", 1) || {};
    brightness = getBrightness.brightness || 0.1;
}

//may make it configurable in the future
const WHITE=-1
const BLACK=0

const Locale = require("locale");
const widget_utils = require('widget_utils');

//var fontSmall = "6x8";
var fontMedium = g.getFonts().includes("6x15")?"6x15":"6x8:2";
var fontBig = g.getFonts().includes("12x20")?"12x20":"6x8:2";
//var fontLarge = g.getFonts().includes("6x15")?"6x15:2":"6x8:4";

var CARDS = require("Storage").readJSON("android.cards.json",true)||[];
var settings = require("Storage").readJSON("cards.settings.json",true)||{};

function getDate(timestamp) {
  return new Date(timestamp*1000);
}
function formatDay(date) {
  let formattedDate = Locale.dow(date,1) + " " + Locale.date(date).replace(/\d\d\d\d/,"");
  if (!settings.useToday) {
    return formattedDate;
  }
  const today = new Date(Date.now());
  if (date.getDay() == today.getDay() && date.getMonth() == today.getMonth())
     return /*LANG*/"Today ";
  else {
    const tomorrow = new Date(Date.now() + 86400 * 1000);
    if (date.getDay() == tomorrow.getDay() && date.getMonth() == tomorrow.getMonth()) {
       return /*LANG*/"Tomorrow ";
    }
    return formattedDate;
  }
}

function getColor(intColor) {
  return "#"+(0x1000000+Number(intColor)).toString(16).padStart(6,"0");
}
function isLight(color) {
  var r = +("0x"+color.slice(1,3));
  var g = +("0x"+color.slice(3,5));
  var b = +("0x"+color.slice(5,7));
  var threshold = 0x88 * 3;
  return (r+g+b) > threshold;
}

function printSquareCode(binary, size) {
  var padding = 5;
  var ratio = (g.getWidth()-(2*padding))/size;
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      if (binary[x + y * size]) {
        g.setColor(BLACK).fillRect({x:x*ratio+padding, y:y*ratio+padding, w:ratio, h:ratio});
      } else {
        g.setColor(WHITE).fillRect({x:x*ratio+padding, y:y*ratio+padding, w:ratio, h:ratio});
      }
    }
  }
}
function printLinearCode(binary) {
  var padding = 5;
  var yFrom = 15;
  var yTo = 28;
  var width = (g.getWidth()-(2*padding))/binary.length;
  for(var b = 0; b < binary.length; b++){
    var x = b * width;
    if(binary[b] === "1"){
      g.setColor(BLACK).fillRect({x:x+padding, y:yFrom, w:width, h:g.getHeight() - (yTo+yFrom)});
    }
    else if(binary[b]){
      g.setColor(WHITE).fillRect({x:x+padding, y:yFrom, w:width, h:g.getHeight() - (yTo+yFrom)});
    }
  }
}

function showCode(card) {
  // set to full bright when the setting is true
  if(settings.fullBrightness) {
    Bangle.setLCDBrightness(1);
  }
  widget_utils.hide();
  E.showScroller();
  // keeping it on rising edge would come back twice..
  setWatch(()=>showCard(card), BTN, {edge:"falling"});
  // theme independent
  g.setColor(WHITE).fillRect(0, 0, g.getWidth(), g.getHeight());
  switch (card.type) {
    case "QR_CODE": {
      const getBinaryQR = require("cards.qrcode.js");
      let code = getBinaryQR(card.value);
      printSquareCode(code.data, code.size);
      break;
    }
    case "CODE_39": {
      g.setFont("Vector:20");
      g.setFontAlign(0,1).setColor(BLACK);
      g.drawString(card.value, g.getWidth()/2, g.getHeight());
      const CODE39 = require("cards.code39.js");
      let code = new CODE39(card.value, {});
      printLinearCode(code.encode().data);
      break;
    }
    case "CODABAR": {
      g.setFont("Vector:20");
      g.setFontAlign(0,1).setColor(BLACK);
      g.drawString(card.value, g.getWidth()/2, g.getHeight());
      const codabar = require("cards.codabar.js");
      let code = new codabar(card.value, {});
      printLinearCode(code.encode().data);
      break;
    }
    case "EAN_8": {
      g.setFont("Vector:20");
      g.setFontAlign(0,1).setColor(BLACK);
      g.drawString(card.value, g.getWidth()/2, g.getHeight());
      const EAN8 = require("cards.EAN8.js");
      let code = new EAN8(card.value, {});
      printLinearCode(code.encode().data);
      break;
    }
    case "EAN_13": {
      g.setFont("Vector:20");
      g.setFontAlign(0,1).setColor(BLACK);
      g.drawString(card.value, g.getWidth()/2, g.getHeight());
      const EAN13 = require("cards.EAN13.js");
      let code = new EAN13(card.value, {});
      printLinearCode(code.encode().data);
      break;
    }
    case "UPC_A": {
      g.setFont("Vector:20");
      g.setFontAlign(0,1).setColor(BLACK);
      g.drawString(card.value, g.getWidth()/2, g.getHeight());
      const UPC = require("cards.UPC.js");
      let code = new UPC.UPC(card.value, {});
      printLinearCode(code.encode().data);
      break;
    }
    case "UPC_E": {
      g.setFont("Vector:20");
      g.setFontAlign(0,1).setColor(BLACK);
      g.drawString(card.value, g.getWidth()/2, g.getHeight());
      const UPCE = require("cards.UPCE.js");
      let code = new UPCE(card.value, {});
      printLinearCode(code.encode().data);
      break;
    }
    default:
      g.clear(true);
      g.setFont("Vector:30");
      g.setFontAlign(0,0);
      g.drawString(card.value, g.getWidth()/2, g.getHeight()/2);
  }
}

function showCard(card) {
  // reset brightness to old value after maxing it out
  if(settings.fullBrightness) {
    Bangle.setLCDBrightness(brightness);
  }
  var lines = [];
  var bodyFont = fontBig;
  if(!card) return;
  g.setFont(bodyFont);
  //var lines = [];
  if (card.name) lines = g.wrapString(card.name, g.getWidth()-10);
  var titleCnt = lines.length;
  lines = lines.concat("", /*LANG*/"View code");
  var valueLine = lines.length - 1;
  if (card.expiration)
    lines = lines.concat("",/*LANG*/"Expires"+": ", g.wrapString(formatDay(getDate(card.expiration)), g.getWidth()-10));
  if(card.balance)
    lines = lines.concat("",/*LANG*/"Balance"+": ", g.wrapString(card.balance, g.getWidth()-10));
  if(card.note && card.note.trim())
    lines = lines.concat("",g.wrapString(card.note, g.getWidth()-10));
  lines = lines.concat("",/*LANG*/"< Back");
  var titleBgColor = card.color ? getColor(card.color) : g.theme.bg2;
  var titleColor = g.theme.fg2;
  if (card.color)
    titleColor = isLight(titleBgColor) ? BLACK : WHITE;
  widget_utils.show();
  E.showScroller({
    h : g.getFontHeight(), // height of each menu item in pixels
    c : lines.length, // number of menu items
    // a function to draw a menu item
    draw : function(idx, r) {
      // FIXME: in 2v13 onwards, clearRect(r) will work fine. There's a bug in 2v12
      g.setBgColor(idx<titleCnt ? titleBgColor : g.theme.bg).
        setColor(idx<titleCnt ? titleColor : g.theme.fg).
        clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
      g.setFont(bodyFont).drawString(lines[idx], r.x, r.y);
    }, select : function(idx) {
      if (idx>=lines.length-2)
        showList();
      else if (idx==valueLine)
        showCode(card);
    },
    back : () => showList()
  });
}

// https://github.com/metafloor/bwip-js
// https://github.com/lindell/JsBarcode

function showList() {
  if(CARDS.length == 0) {
    E.showMessage(/*LANG*/"No cards");
    return;
  }
  E.showScroller({
    h : 52,
    c : Math.max(CARDS.length,3), // workaround for 2v10.219 firmware (min 3 not needed for 2v11)
    draw : function(idx, r) {"ram"
      var card = CARDS[idx];
      g.setColor(g.theme.fg);
      g.clearRect(r.x,r.y,r.x+r.w, r.y+r.h);
      if (!card) return;
      var isPast = false;
      var x = r.x+2, name = card.name;
      var body = card.expiration ? formatDay(getDate(card.expiration)) : "";
      if (card.balance) body += "\n" + card.balance;
      if (name) g.setFontAlign(-1,-1).setFont(fontBig)
        .setColor(isPast ? "#888" : g.theme.fg).drawString(name, x+4,r.y+2);
      if (body) {
        g.setFontAlign(-1,-1).setFont(fontMedium).setColor(isPast ? "#888" : g.theme.fg);
        g.drawString(body, x+10,r.y+20);
      }
      g.setColor("#888").fillRect(r.x,r.y+r.h-1,r.x+r.w-1,r.y+r.h-1); // dividing line between items
      if(card.color) {
        g.setColor(getColor(card.color));
        g.fillRect(r.x,r.y+4,r.x+3, r.y+r.h-4);
      }
    },
    select : idx => showCard(CARDS[idx]),
    back : () => load()
  });
}
if(settings.fullBrightness) {
  loadBrightness();
}
showList();
