{ // must be inside our own scope here so that when we are unloaded everything disappears
  let s = require("Storage");
  // handle customised launcher
  let settings = Object.assign({
    showClocks: true,
    fullscreen: false,
    height: 52
  }, s.readJSON("launch.json", true) || {});
  let font = settings.font;
  if (!font || font=="Vector"/*compat with old settings*/) {
    let fonts = g.getFonts();
    font = fonts.includes("12x20") ? "12x20" : "6x8:2";
    if (fonts.includes("22")) font="22"; // 2v26+
  }
  let height = 0|Math.max(settings.height,12), pad = 2;
  let imgsize = height-pad*2, imgscale = imgsize/48;

  // Load widgets if we need to
  if (!settings.fullscreen) {
    Bangle.loadWidgets();
  } else if (global.WIDGETS) {
    require("widget_utils").hide();
  }
  { // Draw 'placeholder'
    let R = Bangle.appRect, mid = height/2, th = g.setFont(font).stringMetrics("X").height/2;
    g.reset().clearRect(R).setColor("#888");
    for (var y=R.y;y<R.y2;y+=height) {
      g.drawRect(pad*2,y+pad*2,imgsize-pad,y+imgsize-pad) // image
      .drawRect(imgsize+pad*2,y+mid-th,R.y2-R.w/3, y+mid+th); // text
    }
    g.flip();
  }

  let launchCache = require("launch_utils").cache(settings);
  let apps = launchCache.apps; // get a list of apps to show

  // Does this string contain characters outside ISO8859-1? It may either be
  // a UTF-8 string or a byte string containing UTF-8 data from Storage.
  function hasWideChars(s) {
    for (var i=0;i<s.length;i++) {
      var c = s.charCodeAt(i);
      if (c>0xFF) return true;
      if (c>=0xC2 && c<=0xF4) { // possible UTF-8 lead byte
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

  const drawMenu = () => {
    E.showScroller({
      h : height, c : apps.length,
      draw : (i, r, sel) => {
        var app = apps[i];
        if (!app) return;
        var nameFont = font, nameText = app.name;
        // use the Intl font if the app name has characters the chosen font can't display
        if (hasWideChars(nameText)) {
          var nameInfo = g.findFont(nameText, {w:r.w-(imgsize+pad*2)-pad, h:r.h-pad, trim:1});
          nameFont = nameInfo.font;
          nameText = nameInfo.text;
        }
        g.setBgColor(sel?g.theme.bgH:g.theme.bg).clearRect(r).setFont(nameFont).setFontAlign(-1,0).drawString(nameText,imgsize+pad*2,r.y+2+r.h/2);
        if (app.icon) {
          if (!app.img) app.img = s.read(app.icon); // load icon if it wasn't loaded
          try {g.drawImage(app.img, pad, r.y+pad, {scale: imgscale});} catch(e){}
        }
      },
      select : i => {
        var app = apps[i];
        if (!app) return;
        if (Bangle.haptic) Bangle.haptic("touch");
        if (!app.src || require("Storage").read(app.src)===undefined) {
          E.showScroller();
          E.showMessage(/*LANG*/"App Source\nNot found");
          setTimeout(drawMenu, 2000);
        } else {
          require("launch_utils").loadApp(app);
        }
      },
      back : Bangle.showClock, // button press or tap in top left shows clock now
      remove : () => {
        // cleanup the timeout to not leave anything behind after being removed from ram
        if (lockTimeout) clearTimeout(lockTimeout);
        Bangle.removeListener("lock", lockHandler);
        // Restore widgets if they were hidden by fullscreen setting
        if (global.WIDGETS) require("widget_utils").show();
      }
    });
    g.flip(); // force a render before widgets have finished drawing

    // 10s of inactivity goes back to clock
    Bangle.setLocked(false); // unlock initially
    let lockTimeout;
    let lockHandler = function(locked) {
      if (lockTimeout) clearTimeout(lockTimeout);
      lockTimeout = undefined;
      if (locked)
        lockTimeout = setTimeout(Bangle.showClock, 10000);
    };
    Bangle.on("lock", lockHandler);
  };
  // Now apps list is loaded - render
  drawMenu();
  // finally draw widgets
  if (!settings.fullscreen)
    Bangle.drawWidgets();
}
