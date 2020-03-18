var s = require("Storage");
var cfg = s.readJSON("notify.json", 1);
var selectedIndex = 0;
var clearNotificationTimeout = null;

function draw() {
  var n = cfg.notifications[selectedIndex];

  g.clear();

  if (n) {
    if (cfg.isNotify) {
      Bangle.buzz(cfg.vibrate, 1);
      Bangle.beep(cfg.beep);
      cfg.isNotify = false;
      s.writeJSON("notify.json", cfg);
      clearNotificationTimeout = setTimeout(load, cfg.duration)
    }
    g.setFontAlign(0,0);
    g.setFontVector(14);
    g.setColor("#40d040");
    g.drawString(n.src, g.getWidth()/2, 40);

    g.setColor("#ffffff");
    g.setFontVector(22);
    g.drawString(n.title,g.getWidth()/2,65);

    g.setFont("6x8",2);
    var txt = n.body.split("\n");
    var MAXCHARS = 19;
    for (var i=0;i<txt.length;i++) {
      txt[i] = txt[i].trim();
      var l = txt[i];
      if (l.length>MAXCHARS) {
        var p = MAXCHARS;
        while (p>MAXCHARS-8 && !" \t-_".includes(l[p]))
          p--;
        if (p==MAXCHARS-8) p=MAXCHARS;
        txt[i] = l.substr(0,p);
        txt.splice(i+1,0,l.substr(p));
      }
    }
    g.setFontAlign(0,0);
    g.drawString(txt.join("\n"),g.getWidth()/2,100);

    g.flip();
  } else {
    g.setFontAlign(0,0);
    g.setColor("#ffffff");
    g.setFontVector(24);
    g.drawString("No Notifications",g.getWidth()/2,85);
    g.flip();
  }
}

draw();

setWatch(function() {
  clearTimeout(clearNotificationTimeout);
  if (selectedIndex>0) {
    selectedIndex--;
    draw();
  }
}, BTN1, {repeat:true});

setWatch(function() {
  clearTimeout(clearNotificationTimeout);
  if (selectedIndex+1<cfg.notifications.length) {
    selectedIndex++;
    draw();
  }
}, BTN3, {repeat:true});

// Close notifications
setWatch(function() {
  load();
}, BTN2, {repeat:true,edge:"falling"});

// Remove notification with a swipe
Bangle.on('swipe',function(dir) {
  clearTimeout(clearNotificationTimeout);
  Bangle.buzz(500)
  cfg.notifications.splice(selectedIndex, 1);
  s.writeJSON("notify.json", cfg);
  if (selectedIndex > 0) {
    selectedIndex--;
  }
  draw();
});
