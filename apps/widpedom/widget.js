{
  // Last step count when Bangle.on('step' was called
  let stepCount = Bangle.getHealthStatus("day").steps;
  let settings;
  let stepDisabled = Bangle.getOptions().stepCounterDisabled; // 2v29+
  let loadSettings = function() {
    settings = Object.assign({
      'goal': 10000,
      'progress': false,
      'large': false,
      'hide': false
    }, (require('Storage').readJSON("wpedom.json", 1)||{}).settings || {});
  }
  loadSettings();
  let onStepCount = function() {
    var newStepCount = Bangle.getHealthStatus("day").steps;
    if (stepCount<settings.goal && newStepCount >= settings.goal
        && !(require('Storage').readJSON('setting.json',1)||{}).quiet) {
      let b = 3, buzz = () => {
        if (b--) Bangle.buzz().then(() => setTimeout(buzz, 100))
      }
      buzz()
    }
    stepCount = newStepCount;
    WIDGETS["wpedom"].redraw();
  }
  Bangle.on('step', onStepCount);
  WIDGETS["wpedom"]={area:"tl",width:0,
    getWidth() {
      let stps = stepCount.toString();
      let newWidth = 24;
      if (settings.hide)
        newWidth = 0;
      else {
        if (settings.large) {
          newWidth = 12 * stps.length + 3;
          if (settings.progress)
            newWidth += 24;
        }
      }
      return newWidth;
    },
    redraw() { // work out the width, and queue a full redraw if needed
      let newWidth = this.getWidth();
      if (newWidth!=this.width) {
        // width has changed, re-layout all widgets
        this.width = newWidth;
        Bangle.drawWidgets();
      } else {
        // width not changed - just redraw
        WIDGETS["wpedom"].draw();
      }
    },
    draw() {
      if (settings.hide) return;
      if (stepCount > 99999)
        stepCount = stepCount % 100000; // cap to five digits + comma = 6 characters
      let stps = stepCount.toString();
      g.reset().clearRect(this.x, this.y, this.x + this.width, this.y + 23); // erase background
      if (settings.progress) {
        const width = 23, half = 11;
        const goal = settings.goal, left = Math.max(goal-stps,0);
        // blue or dark green
        g.setColor(left ? "#08f" : "#080").fillCircle(this.x + half, this.y + half, half);
        if (left) {
          const TAU = Math.PI*2;
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
          g.setColor(g.theme.bg).fillPoly(g.transformVertices(p,{x:this.x,y:this.y}));
        }
        g.reset();
      }
      if (stepDisabled) g.setColor("#888"); // dim down step count
      if (settings.large) {
        g.setFont("6x8",2);
        g.setFontAlign(-1, 0);
        g.drawString(stps, this.x + (settings.progress?28:4), this.y + 12);
      } else {
        let w = 24;
        if (stps.length > 3){
          stps = stps.slice(0,-3) + "," + stps.slice(-3);
          g.setFont("4x6", 1); // if big, shrink text to fix
        } else {
          g.setFont("6x8", 1);
        }
        g.setFontAlign(0, 0); // align to x: center, y: center
        g.drawString(stps, this.x+w/2, this.y+19);
        g.drawImage(atob("CgoCLguH9f2/7+v6/79f56CtAAAD9fw/n8Hx9A=="),this.x+(w-10)/2,this.y+2);
      }
    },
    reload() {
      loadSettings();
      WIDGETS["wpedom"].redraw();
    },
    getSteps() { return stepCount; },
    remove() {
      Bangle.removeListener('step', onStepCount);
      Bangle.removeListener("touch", onTouch);
      delete WIDGETS["wpedom"];
    }
  };
  WIDGETS["wpedom"].width = WIDGETS["wpedom"].getWidth();
  let onTouch = function(_, e) { // allow disabling steps on tap
    if (!e || WIDGETS["back"]) return; // ignore taps if back widget shown - it's too close
    let w = WIDGETS["wpedom"];
    if (w._draw || e.y<w.y || e.y >= (w.y+24) || e.x<w.x || e.x>(w.x+w.width)) return; // ignore out of bounds or if hidden (w._draw set)
    if (stepDisabled===undefined) return; // 2v28 or before, disable steps not supported
    Bangle.buzz(50); // feedback
    stepDisabled = !stepDisabled;
    Bangle.setOptions({stepCounterDisabled:stepDisabled}); // 2v29
    w.draw();
  }
  if (!settings.hide) Bangle.on("touch", onTouch);
}
