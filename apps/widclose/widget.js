WIDGETS.close = {
  area: "tr", width: Bangle.CLOCK?0:24, sortorder: 10, // we want the right-most spot please
  draw: function() {
    if (!Bangle.CLOCK == !this.width) { // if we're the wrong size for if we have a clock or not...
      this.width = Bangle.CLOCK?0:24;
      return setTimeout(Bangle.drawWidgets,1); // widget changed size - redraw
    }
    if (this.width) g.reset().setColor("#f00").drawImage(atob( // red to match setUI back button
      // b/w version of preview.png, 24x24
      "GBgBABgAAf+AB//gD//wH//4P//8P//8fn5+fjx+fxj+f4H+/8P//8P/f4H+fxj+fjx+fn5+P//8P//8H//4D//wB//gAf+AABgA"
    ), this.x, this.y);
  }, touch: function(_, c) { // if touched
    const w = WIDGETS.close; // if in range, go back to the clock
    if (w && c.x>=w.x && c.x<w.x+w.width && c.y>=w.y && c.y<=w.y+24) load();
  }
};
Bangle.on("touch", WIDGETS.close.touch);
