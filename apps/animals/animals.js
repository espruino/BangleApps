var current="";
var images="snake,duck,swan,fox,camel,pig,sheep,mouse".split(",");
var lastPress = 0;

function next(e) {
  Bangle.setLCDPower(1);
  if (e.time<(lastPress+0.5)) return;
  lastPress = e.time;
  var last = current;
  do {
    var n = 0|(Math.random()*images.length);
    current = images[n];
  } while (current && current==last);
  g.clear();
  var n = 1 + (0|(Math.random()*3.9));
  var img = require("Storage").read("animals-"+current+".img");
  if (n==1)
    g.drawImage(img,120,120,{scale:4,rotate:Math.random()-0.5});
  else
    for (var i=0;i<n;i++) {
      var a = Math.PI*2*i/n;
      g.drawImage(img,120+60*Math.cos(a),120+60*Math.sin(a),{scale:1.5,rotate:Math.random()-0.5});
    }
  g.flip();
}

setWatch(next,BTN4,{repeat:true});
setWatch(next,BTN5,{repeat:true});
next({time:getTime()});
