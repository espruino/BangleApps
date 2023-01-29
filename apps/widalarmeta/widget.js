(() => {
  require("Font5x9Numeric7Seg").add(Graphics);
  const alarms = require("Storage").readJSON("sched.json",1) || [];
  const config = Object.assign({
    maxhours: 24,
    drawBell: false,
    showSeconds: 0, // 0=never, 1=only when display is unlocked, 2=for less than a minute
  }, require("Storage").readJSON("widalarmeta.json",1) || {});

  function draw() {
    const times = alarms.map(alarm => require("sched").getTimeToAlarm(alarm)).filter(a => a !== undefined);
    const next = Math.min.apply(null, times);
    let calcWidth = 0;
    let drawSeconds = false;

    if (next > 0 && next < config.maxhours*60*60*1000) {
      const hours = Math.floor((next-1) / 3600000).toString();
      const minutes = Math.floor(((next-1) % 3600000) / 60000).toString();
      const seconds = Math.floor(((next-1) % 60000) / 1000).toString();
      drawSeconds = (config.showSeconds & 0b01 && !Bangle.isLocked()) || (config.showSeconds & 0b10 && next <= 1000*60);

      g.reset(); // reset the graphics context to defaults (color/font/etc)
      g.setFontAlign(0,0); // center fonts
      g.clearRect(this.x, this.y, this.x+this.width-1, this.y+23);

      var text = hours.padStart(2, '0') + ":" + minutes.padStart(2, '0');
      if (drawSeconds) {
        text += ":" + seconds.padStart(2, '0');
      }
      g.setFont("5x9Numeric7Seg:1x2");
      g.drawString(text, this.x+this.width/2, this.y+12);

      calcWidth = 5*5+2;
      if (drawSeconds) {
        calcWidth += 3*5;
      }
    } else if (times.length > 0 && config.drawBell) {
      // next alarm too far in future, draw only widalarm bell
      g.reset().drawImage(atob("GBgBAAAAAAAAABgADhhwDDwwGP8YGf+YMf+MM//MM//MA//AA//AA//AA//AA//AA//AB//gD//wD//wAAAAADwAABgAAAAAAAAA"),this.x,this.y);
      calcWidth = 24;
    }

    if (this.width !== calcWidth) {
      // width changed, re-layout
      this.width = calcWidth;
      Bangle.drawWidgets();
    }

    // redraw next full minute or second
    const period = drawSeconds ? 1000 : 60000;
    let timeout = next > 0 ? next % period : period - (Date.now() % period);
    if (timeout === 0) {
      timeout += period;
    }
    setTimeout(()=>{
      WIDGETS["widalarmeta"].draw(WIDGETS["widalarmeta"]);
    }, timeout);
  } /* draw */

  if (config.maxhours > 0) {
    // add your widget
    WIDGETS["widalarmeta"]={
      area:"tl",
      width: 0, // hide by default = assume no timer
      draw:draw
    };
  }
})();
