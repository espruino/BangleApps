(() => {
  const PEDOMFILE = "wpedom.json"
  const DEFAULTS = {
    'goal': 10000,
    'progress': false,
  }
  const COLORS = {
    'white': -1,
    'progress': 0x001F, // Blue
    'done': 0x03E0, // DarkGreen
  }
  const TAU = Math.PI*2;
  let lastUpdate = new Date();
  let stp_today = 0;
  let settings;

  function loadSettings() {
    const d = require('Storage').readJSON(PEDOMFILE, 1) || {};
    settings = d.settings || {};
  }

  function setting(key) {
    if (!settings) { loadSettings() }
    return (key in settings) ? settings[key] : DEFAULTS[key];
  }

  function drawProgress(stps) {
    const width = 24, half = width/2;
    const goal = setting('goal'), left = Math.max(goal-stps,0);
    const c = left ? COLORS.progress : COLORS.done;
    g.setColor(c).fillCircle(this.x + half, this.y + half, half);
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
      g.setColor(0).fillPoly(p);
    }
  }

  // draw your widget
  function draw() {
    var width = 24;
    if (stp_today > 99999){
      stp_today = stp_today % 100000; // cap to five digits + comma = 6 characters
    }
    let stps = stp_today.toString();
    g.reset();
    g.clearRect(this.x, this.y, this.x + width, this.y + 23); // erase background
    if (setting('progress')){ drawProgress.call(this, stps); }
    g.setColor(COLORS.white);
    if (stps.length > 3){
      stps = stps.slice(0,-3) + "," + stps.slice(-3);
      g.setFont("4x6", 1); // if big, shrink text to fix
    } else {
      g.setFont("6x8", 1);
    }
    g.setFontAlign(0, 0); // align to x: center, y: center
    g.drawString(stps, this.x+width/2, this.y+19);
    g.drawImage(atob("CgoCLguH9f2/7+v6/79f56CtAAAD9fw/n8Hx9A=="),this.x+(width-10)/2,this.y+2);
  }

  function reload() {
    loadSettings()
    draw()
  }

  Bangle.on('step', (up) => {
    let date = new Date();
    if (lastUpdate.getDate() == date.getDate()){
      stp_today ++;
    } else {
      // TODO: could save this to PEDOMFILE for lastUpdate's day?
      stp_today = 1;
    }
    if (stp_today === setting('goal')) {
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
  }
})()
