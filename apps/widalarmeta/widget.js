(() => {
  require("Font5x9Numeric7Seg").add(Graphics);
  const config = Object.assign({
    maxhours: 24,
    drawBell: false,
    showSeconds: 0, // 0=never, 1=only when display is unlocked, 2=for less than a minute
  }, require("Storage").readJSON("widalarmeta.json",1) || {});

  function getNextAlarm(date) {
    const alarms = (require("Storage").readJSON("sched.json",1) || []).filter(alarm => alarm.on && alarm.hidden !== true);
    WIDGETS["widalarmeta"].numActiveAlarms = alarms.length;
    if (alarms.length > 0) {
      const times = alarms.map(alarm => require("sched").getTimeToAlarm(alarm, date) || Number.POSITIVE_INFINITY);
      const eta = Math.min.apply(null, times);
      if (eta !== Number.POSITIVE_INFINITY) {
        const idx = times.indexOf(eta);
        const alarm = alarms[idx];
        delete alarm.msg; delete alarm.id; delete alarm.data; // free some memory
        return alarm;
      }
    }
  } // getNextAlarm

  function draw(fromInterval) {
    if (this.nextAlarm === undefined) {
      let alarm = getNextAlarm();
      if (alarm === undefined) {
        // try again with next hour
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours()+1);
        alarm = getNextAlarm(nextHour);
      }
      if (alarm !== undefined) {
        this.nextAlarm = alarm;
      }
    }
    const next = this.nextAlarm !== undefined ? require("sched").getTimeToAlarm(this.nextAlarm) : 0;

    let calcWidth = 0;
    let drawSeconds = false;

    if (next > 0 && next <= config.maxhours*60*60*1000) {
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
      this.bellVisible = false;
    } else if (config.drawBell && this.numActiveAlarms > 0) {
      calcWidth = 24;
      // next alarm too far in future, draw only widalarm bell
      if (this.bellVisible !== true || fromInterval !== true) {
        g.reset().drawImage(atob("GBgBAAAAAAAAABgADhhwDDwwGP8YGf+YMf+MM//MM//MA//AA//AA//AA//AA//AA//AB//gD//wD//wAAAAADwAABgAAAAAAAAA"),this.x,this.y);
        this.bellVisible = true;
      }
    }

    if (this.width !== calcWidth) {
      // width changed, re-layout
      this.width = calcWidth;
      Bangle.drawWidgets();
    }

    // redraw next hour when no alarm else full minute or second
    const period = next === 0 ? 3600000 : (drawSeconds ? 1000 : 60000);
    let timeout = next > 0 ? next % period : period - (Date.now() % period);
    if (timeout === 0) {
      timeout += period;
    }

    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(()=>{
      WIDGETS["widalarmeta"].timeoutId = undefined;
      WIDGETS["widalarmeta"].draw(true);
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
