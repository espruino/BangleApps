(() => {
  const PEDOMFILE = "wpedom.json"
  // Last time Bangle.on('step' was called
  let lastUpdate = new Date();
  // Last step count when Bangle.on('step' was called
  var lastStepCount;
  let stp_today = 0;
  let settings;

  function loadSettings() {
    const d = require('Storage').readJSON(PEDOMFILE, 1) || {};
    settings = d.settings || {};
  }

  function setting(key) {
    if (!settings) { loadSettings() }
    const DEFAULTS = {
      'goal': 10000,
      'progress': false,
      'large': false,
      'hide': false
    }
    return (key in settings) ? settings[key] : DEFAULTS[key];
  }

  function drawProgress(stps) {
    if (setting('hide')) return;
    const width = 24, half = width/2;
    const goal = setting('goal'), left = Math.max(goal-stps,0);
    const c = left ? "#00f" : "#090"; // blue or dark green
    g.setColor(c).fillCircle(this.x + half, this.y + half, half);
    const TAU = Math.PI*2;
    if (left) {
      const f = left/goal; // fraction to blank out
      let p = [];
      p.push(half,half);
      p.push(half,0);
      if(f>1/8) p.push(0,0);
      if(f>2/8) p.push(0,half);
      if(f>3/8) p.push(0,width);
      if(f>4/8) p.push(half,width);
      if(f>5/8) p.push(width,width);
      if(f>6/8) p.push(width,half);
      if(f>7/8) p.push(width,0);
      p.push(half - Math.sin(f * TAU) * half);
      p.push(half - Math.cos(f * TAU) * half);
      for (let i = p.length; i; i -= 2) {
        p[i - 2] += this.x;
        p[i - 1] += this.y;
      }
      g.setColor(g.theme.bg).fillPoly(p);
    }
  }

  // show the step count in the widget area in a readable sized font
  function draw_large(st) {
    var width = 12 * st.length;
    g.reset();
    g.clearRect(this.x, this.y, this.x + width, this.y + 16); // erase background
    g.setColor(g.theme.fg);
    g.setFont("6x8",2);
    g.setFontAlign(-1, -1);
    g.drawString(st, this.x + 4, this.y + 2);
  }

  // draw your widget
  function draw() {
    if (setting('hide')) return;
    var width = 24;
    if (stp_today > 99999){
      stp_today = stp_today % 100000; // cap to five digits + comma = 6 characters
    }
    let stps = stp_today.toString();
    if (setting('large')) {
      draw_large.call(this, stps);
      return;
    }
    g.reset().clearRect(this.x, this.y, this.x + width, this.y + 23); // erase background
    if (setting('progress')){ drawProgress.call(this, stps); }
    g.setColor(g.theme.fg);
    if (stps.length > 3){
      stps = stps.slice(0,-3) + "," + stps.slice(-3);
      g.setFont("4x6", 1); // if big, shrink text to fix
    } else {
      g.setFont("6x8", 1);
    }
    g.setFontAlign(0, 0); // align to x: center, y: center
    g.drawString(stps, this.x+width/2, this.y+19);
    // on low bpp screens, draw 1 bit. Currently there is no getBPP so we just do it based on resolution
    g.drawImage(atob("CgoCLguH9f2/7+v6/79f56CtAAAD9fw/n8Hx9A=="),this.x+(width-10)/2,this.y+2);
  }

  function reload() {
    loadSettings()
    draw()
  }

  Bangle.on('step', stepCount => {
    var steps = stepCount-lastStepCount;
    if (lastStepCount===undefined || steps<0) steps=1;
    lastStepCount = stepCount;
    let date = new Date();
    if (lastUpdate.getDate() == date.getDate()){
      stp_today += steps;
    } else {
      // TODO: could save this to PEDOMFILE for lastUpdate's day?
      stp_today = steps;
    }
    if (stp_today === setting('goal')
        && !(require('Storage').readJSON('setting.json',1)||{}).quiet) {
      let b = 3, buzz = () => {
        if (b--) Bangle.buzz().then(() => setTimeout(buzz, 100))
      }
      buzz()
    }
    lastUpdate = date
    //console.log("up: " + up + " stp: " + stp_today + " " + date.toString());
    if (Bangle.isLCDOn()) WIDGETS["wpedom"].draw();
  });
  // redraw when the LCD turns on
  Bangle.on('lcdPower', function(on) {
    if (on) WIDGETS["wpedom"].draw();
  });
  // When unloading, save state
  E.on('kill', () => {
    if (!settings) { loadSettings() }
    let d = {
      lastUpdate : lastUpdate.toISOString(),
      stepsToday : stp_today,
      settings   : settings,
    };
    require("Storage").write(PEDOMFILE,d);
  });

  // add your widget
  WIDGETS["wpedom"]={area:"tl",width:26,
         draw:draw,
         reload:reload,
         getSteps:()=>stp_today
        };
  // Load data at startup
  let pedomData = require("Storage").readJSON(PEDOMFILE,1);
  if (pedomData) {
    if (pedomData.lastUpdate)
      lastUpdate = new Date(pedomData.lastUpdate);
    stp_today = pedomData.stepsToday|0;
    delete pedomData;
  }
})()
