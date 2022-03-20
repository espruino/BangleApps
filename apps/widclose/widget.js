if (!Bangle.CLOCK) WIDGETS.close = {
  area: "tr", width: 24, sortorder: 10, // we want the right-most spot please
  draw: function() {
    Bangle.removeListener("touch", this.touch);
    Bangle.on("touch", this.touch);
    g.reset().setColor("#f00").drawImage(atob( // hardcoded red to match setUI back button
      // b/w version of preview.png, 24x24
      "GBgBABgAAf+AB//gD//wH//4P//8P//8fn5+fjx+fxj+f4H+/8P//8P/f4H+fxj+fjx+fn5+P//8P//8H//4D//wB//gAf+AABgA"
    ), this.x, this.y);
  }, touch: function(_, c) {
    const w = WIDGETS.close;
    if (w && c.x>=w.x && c.x<=w.x+24 && c.y>=w.y && c.y<=w.y+24) load();
  }
};