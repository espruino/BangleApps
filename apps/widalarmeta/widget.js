(() => {
  const alarms = require("Storage").readJSON("sched.json",1) || [];

  function draw() {
    const times = alarms.map(alarm => require("sched").getTimeToAlarm(alarm)).filter(a => a !== undefined);
    const next = Math.min.apply(null, times);
    if (next > 0 && next < 86400000) {
      const hours = Math.floor((next % 86400000) / 3600000).toString();
      const minutes = Math.floor(((next % 86400000) % 3600000) / 60000).toString();

      g.reset(); // reset the graphics context to defaults (color/font/etc)
      g.setFontAlign(0,0); // center fonts
      g.clearRect(this.x, this.y, this.x+this.width-1, this.y+23);

      var text = hours.padStart(2, '0') + ":" + minutes.padStart(2, '0');
      g.setFont("6x8:1x2");
      g.drawString(text, this.x+this.width/2, this.y+12);
      if (this.width === 0) {
          this.width = 6*5+2;
          Bangle.drawWidgets(); // width changed, re-layout
      }
    }
  }

  setInterval(function() {
    WIDGETS["widalarmeta"].draw(WIDGETS["widalarmeta"]);
  }, 30000); // update every half minute

  // add your widget
  WIDGETS["widalarmeta"]={
    area:"tl",
    width: 0, // hide by default = assume no timer
    draw:draw
  };
})();
