<<<<<<< HEAD
var buf = Graphics.createArrayBuffer(240,120,1,{msb:true});
var lastFix = {fix:0,satellites:0};
function onGPS(fix) {
  lastFix = fix;
  buf.clear();
  buf.setFontAlign(0,0);
  buf.setFont("6x8");
  buf.drawString(fix.satellites+" satellites",120,6);
  if (fix.fix) {
    var speed = require("locale").speed(fix.speed);
    var m = speed.match(/([0-9,\.]+)(.*)/); // regex splits numbers from units
    var txt = (fix.speed<20) ? fix.speed.toFixed(1) : Math.round(fix.speed);
    var value = m[1], units = m[2];
    var s = 80;
    buf.setFontVector(s);
    buf.drawString(value,120,10+s/2);
    buf.setFont("6x8",2);
    buf.drawString(units,120,s+26);
  } else {
    buf.setFont("6x8",2);
    buf.drawString("Waiting for GPS",120,56);
  }
  g.reset();
  g.drawImage({width:buf.getWidth(),height:buf.getHeight(),bpp:1,buffer:buf.buffer},0,70);
  g.flip();
}
g.clear();
onGPS(lastFix);
Bangle.loadWidgets();
Bangle.drawWidgets();

Bangle.on('GPS', onGPS);
Bangle.setGPSPower(1);
=======
var Layout = require("Layout");
var layout;

var lastFix = {fix:-1,satellites:0};

function speedoImage() {
  return require("heatshrink").decompress(atob("kkdxH+ABteAAwWOECImZDQ2CAQglUD4us2fX68ymQDB1omFESWtDgIACEYYACrolPBwddmWIEZWsmVWJYgiLwXX2YcB1gdDq+BAodWGIWsEhQiDRAWBmQdEAAhGBroFC1ojMC4etERIlDAggkHNIgAWSYYjFVwNWGwgAP5KkBEYoFC1ihBagwAL5W72vKJAxpExCiDABnQ4W12vD6AHBEYxnT4YhB3ghCSIhqDe4SIP3giBM4LfFEYpiMDoQhC3fDCA7+DfBwiCAARmFAAmtEYlYagMywISHEQhEId4UyEYleqwABEZBHERQwABroZBq5rR6BGLNZKzMAAPKRZKzJr2tfaAAKxD7CfgRsD1g1GAAwME2YGDwQjFNgOzwMyCwuCwIAEBg0yHoKODEYmCcYNWCwutAAuzBgg4BCwJGEEgj7JV5r7BIwgjEWrDVCEQYkCWgYAWNYIjF/z8awQfD"));
}

function onGPS(fix) {
  if (lastFix.fix != fix.fix) {
    // if fix is different, change the layout
    if (fix.fix) {
      layout = new Layout( {
        type:"v", c: [
         {type:"txt", font:"6x8:2", label:"Speed" },
         {type:"h", c: [
           {type:"img", src:speedoImage, pad:4 },
           {type:"txt", font:"35%", label:"--", fillx:true, id:"speed" },
         ]},
         {type:"txt", font:"6x8", label:"--", id:"units" },
         {type:"h", c: [
            {type:"txt", font:"10%", label:fix.satellites, pad:2, id:"sat" },
            {type:"txt", font:"6x8", pad:3, label:"Satellites" }
          ]},
        ]},{lazy:true});
    } else {
      layout = new Layout( {
        type:"v", c: [
         {type:"txt", font:"6x8:2", label:"Speed" },
          {type:"img", src:speedoImage, pad:4 },
          {type:"txt", font:"6x8", label:"Waiting for GPS" },
          {type:"h", c: [
            {type:"txt", font:"10%", label:fix.satellites, pad:2, id:"sat" },
            {type:"txt", font:"6x8", pad:3, label:"Satellites" }
          ]},
        ]},{lazy:true});
    }
    g.clearRect(0,24,g.getWidth(),g.getHeight());
    layout.render();
  }
  lastFix = fix;

  if (fix.fix && isFinite(fix.speed)) {
    var speed = require("locale").speed(fix.speed);
    var m = speed.match(/([0-9,\.]+)(.*)/); // regex splits numbers from units
    var txt = (fix.speed<20) ? fix.speed.toFixed(1) : Math.round(fix.speed);
    layout.speed.label = m[1];
    layout.units.label = m[2];
  }
  layout.sat.label = fix.satellites;
  layout.render();
}
g.clear();
onGPS({fix:0,satellites:0});
// onGPS({fix:1,satellites:3,speed:200}); // testing
Bangle.loadWidgets();
Bangle.drawWidgets();

Bangle.on('GPS', onGPS);
Bangle.setGPSPower(1, "app");
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
