(function(){
  const intervalLow = 60000; // update time when not charging
  const intervalHigh = 2000; // update time when charging

  let prevMin = 100;

  let COLORS = {};

  if (process.env.HWVERSION == 1) {
    COLORS = {
      'white':    -1,     // White
      'charging': 0x07E0, // Green
      'high':     0x05E0, // lightly darker green
      'ok':       0xFD20, // Orange
      'low':      0xF800, // Red
    };
  } else {
    // bangle 2 is only 7 bit colors
    COLORS = {
      'white':    "#fff", // White
      'charging': "#0f0", // Green
      'high':     "#0f0", // Green
      'ok':       "#ff0", // Orange
      'low':      "#f00", // Red
    };
  }
  const SETTINGS_FILE = 'widbatpc.json';

  let settings;
  function loadSettings() {
    settings = require('Storage').readJSON(SETTINGS_FILE, 1) || {};
    const DEFAULTS = {
      'color': 'By Level',
      'percentage': true,
      'charger': true,
      'hideifmorethan': 100,
      'alwaysoncharge': false,
      'removejitter': 0, // 0 == off, 1 == downwards only
      'buzzoncharge': true,
    };
    Object.keys(DEFAULTS).forEach(k=>{
      if (settings[k]===undefined) settings[k]=DEFAULTS[k];
    });
  }
  function setting(key) {
    if (!settings) { loadSettings(); }
    return settings[key];
  }

  const levelColor = (l) => {
  // "charging" is very bright -> percentage is hard to read, "high" is ok(ish)
    const green = setting('percentage') ? COLORS.high : COLORS.charging;
    switch (setting('color')) {
      case 'Monochrome': return COLORS.white; // no chance of reading the percentage here :-(
      case 'Green': return green;
      case 'By Level': // fall through
      default:
        if (setting('charger')) {
        // charger icon -> always make percentage readable
          if (Bangle.isCharging() || l >= 50) return green;
        } else {
        // no icon -> brightest green to indicate charging, even when showing percentage
          if (Bangle.isCharging()) return COLORS.charging;
          if (l >= 50) return COLORS.high;
        }
        if (l >= 15) return COLORS.ok;
        return COLORS.low;
    }
  };
  const chargerColor = () => {
    return (setting('color') === 'Monochrome') ? COLORS.white : COLORS.charging;
  };

  // sets width, returns true if it changed
  function setWidth() {
    var w = 40;
    if (Bangle.isCharging() && setting('charger'))
      w += 16;
    if (E.getBattery() > setting('hideifmorethan')) {
      w = 0;
      if( Bangle.isCharging() && setting('alwaysoncharge') === true)
        w = 56;
    }
    var changed = WIDGETS["batpc"].width != w;
    WIDGETS["batpc"].width = w;
    return changed;
  }

  function draw(fromInterval) {
  // if hidden, don't draw
    if (!WIDGETS["batpc"].width) return;
    // else...
    var s = 39;
    var x = this.x, y = this.y;
    let l = E.getBattery();
    if (setting('removejitter') === 1) {
      // if we have seen a battery percentage that was lower than current, use lower
      if (Bangle.isCharging()) {
        prevMin = l; // charging is the only way to increase percentage
      } else if (prevMin >= l) {
        prevMin = l;
      } else {
        l = prevMin;
      }
    }

    if (fromInterval === true && this.prevLevel === l && this.prevCharging === Bangle.isCharging()) {
      return; // unchanged, do nothing
    }

    this.prevLevel = l;
    this.prevCharging = Bangle.isCharging();

    const c = levelColor(l);

    if (Bangle.isCharging() && setting('charger')) {
      g.setColor(chargerColor()).drawImage(atob(
        "DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"),x,y);
      x+=16;
    }

    let xl = x+4+l*(s-12)/100;
    // show bar full in the level color, as you can't see the color if the bar is too small
    if (setting('fillbar'))
      xl = x+4+100*(s-12)/100;

    g.setColor(g.theme.fg);
    g.fillRect(x,y+2,x+s-4,y+21);
    g.clearRect(x+2,y+4,x+s-6,y+19);
    g.fillRect(x+s-3,y+10,x+s,y+14);
    g.setColor(c).fillRect(x+4,y+6,xl,y+17);
    g.setColor(g.theme.fg);
    if (!setting('percentage')) {
      return;
    }
    let gfx = g;
    if (setting('color') === 'Monochrome') {
    // draw text inverted on battery level
      gfx = Graphics.createCallback(g.getWidth(),g.getHeight(), 1,
        (x,y) => {g.setPixel(x,y,x<=xl?0:-1);});
    }
    gfx.setFontAlign(-1,-1);
    if (l >= 100) {
      gfx.setFont('4x6', 2);
      gfx.drawString(l, x + 6, y + 7);
    } else {
      if (l < 10) x+=6;
      gfx.setFont('6x8', 2);
      gfx.drawString(l, x + 6, y + 4);
    }
  }

  // reload widget, e.g. when settings have changed
  function reload() {
    loadSettings();
    // need to redraw all widgets, because changing the "charger" setting
    // can affect the width and mess with the whole widget layout
    setWidth();
    Bangle.drawWidgets();
  }

  // update widget - redraw just widget, or all widgets if size changed
  function update() {
    if (setWidth()) Bangle.drawWidgets();
    else WIDGETS["batpc"].draw();

    if (Bangle.isCharging()) changeInterval(id, intervalHigh);
      else                   changeInterval(id, intervalLow);
  }

  Bangle.on('charging',function(charging) {
    if (setting('buzzoncharge')) {
      if(charging) Bangle.buzz();
    }
    update();
    g.flip();
  });

  Bangle.on('lcdPower', function(on) {
    if (on) update();
  });

  var id = setInterval(()=>WIDGETS["batpc"].draw(WIDGETS["batpc"], true), intervalLow);

  WIDGETS["batpc"]={area:"tr",width:40,draw:draw,reload:reload};
  setWidth();
})();
