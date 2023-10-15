(() => {
  const WIDTH = 14; // Width of the text, widget is +2 px wide
  const CONTINOUS = false; // Go back & forward or stop after first scroll
  require("FontTeletext5x9Ascii").add(Graphics);

  function getDateText() {
    const date = new Date();
    const dateStr = require("locale").date(date, 1);
    const timeStr = require("locale").time(date, 1);
    return ` ${timeStr} ${dateStr} `;
  }

  WIDGETS["widclkscrl"]={
    area: "tl",
    width: 0, // default hide
    pos: 10,
    dir: -1,
    eventHandlerSet: false,
    draw: function() {
      if (!this.eventHandlerSet) {
        Bangle.on('lock', (on) => {
          this.run(!on);
        });
        this.eventHandlerSet = true;
      }
      if (this.text) {
        const buf = Graphics.createArrayBuffer(WIDTH,24,1,{msb:true}).setFont("Teletext5x9Ascii:1x2").setFontAlign(-1, 0);
        buf.drawString(this.text, this.pos, 12);

        if (this.dir === 1 && this.pos === 0 || this.dir === -1 && Math.abs(this.pos) === buf.stringWidth(this.text) - WIDTH) {
          if (CONTINOUS) {
            this.dir*=-1;
            this.text = getDateText();
          } else {
            this.pos = 0;
            this.run(false);
            return;
          }
        }
        this.pos+=this.dir;

        g.reset().drawImage({
          width:buf.getWidth(), height:buf.getHeight(),
          bpp:buf.getBPP(),
          buffer:buf.buffer
        }, this.x+1, this.y);
      }
    },
    run: function (on) {
      if (!Bangle.CLOCK && on && !this.interval) {
        this.text = getDateText();
        this.interval = setInterval(() => {
          this.draw();
        }, 100);
        this.width = WIDTH+2; Bangle.drawWidgets();
      } else if (!on && this.interval) {
        clearInterval(this.interval);
        delete this.interval;
        delete this.text;
        this.width = 0; Bangle.drawWidgets();
      }
    },
  };
})();
