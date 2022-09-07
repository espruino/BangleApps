(() => {
  // Top right star of life logo
  WIDGETS["widmedatr"]={
    area: "tr",
    width: 24,
    draw: function() {
      g.reset();
      g.setColor("#f00");
      g.drawImage(atob("FhYBAAAAA/AAD8AAPwAc/OD/P8P8/x/z/n+/+P5/wP58A/nwP5/x/v/n/P+P8/w/z/Bz84APwAA/AAD8AAAAAA=="), this.x + 1, this.y + 1);
    }
  };

  // Bottom medical alert message
  WIDGETS["widmedabl"]={
    area: "bl",
    width: Bangle.CLOCK?Bangle.appRect.w:0,
    draw: function() {
      // Only show the widget on clocks
      if (!Bangle.CLOCK) return;

      g.reset();
      g.setBgColor(g.theme.dark ? "#fff" : "#f00");
      g.setColor(g.theme.dark ? "#f00" : "#fff");
      g.setFont("Vector",18);
      g.setFontAlign(0,0);
      g.clearRect(this.x, this.y, this.x + this.width - 1, this.y + 23);
      g.drawString("MEDICAL ALERT", this.width / 2, this.y + ( 23 / 2 ));
    }
  };
})();
