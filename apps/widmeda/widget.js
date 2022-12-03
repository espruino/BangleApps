(() => {
  function getAlertText() {
    const medicalinfo = require("medicalinfo").load();
    const alertText = ((Array.isArray(medicalinfo.medicalAlert)) && (medicalinfo.medicalAlert[0])) ? medicalinfo.medicalAlert[0] : "";
    return (g.wrapString(alertText, g.getWidth()).length === 1) ? alertText : "MEDICAL ALERT";
  }

  // Top right star of life logo
  WIDGETS["widmedatr"] = {
    area: "tr",
    width: 24,
    draw: function () {
      g.reset();
      g.setColor("#f00");
      g.drawImage(atob("FhYBAAAAA/AAD8AAPwAc/OD/P8P8/x/z/n+/+P5/wP58A/nwP5/x/v/n/P+P8/w/z/Bz84APwAA/AAD8AAAAAA=="), this.x + 1, this.y + 1);
    }
  };

  // Bottom medical alert text
  WIDGETS["widmedabl"] = {
    area: "bl",
    width: Bangle.CLOCK ? Bangle.appRect.w : 0,
    draw: function () {
      // Only show the widget on clocks
      if (!Bangle.CLOCK) return;

      g.reset();
      g.setBgColor(g.theme.dark ? "#fff" : "#f00");
      g.setColor(g.theme.dark ? "#f00" : "#fff");
      g.setFont("Vector", 16);
      g.setFontAlign(0, 0);
      g.clearRect(this.x, this.y, this.x + this.width - 1, this.y + 23);

      const alertText = getAlertText();
      g.drawString(alertText, this.width / 2, this.y + (23 / 2));
    }
  };

  Bangle.on("touch", (_, c) => {
    const bl = WIDGETS.widmedabl;
    const tr = WIDGETS.widmedatr;
    if ((bl && c.x >= bl.x && c.x < bl.x + bl.width && c.y >= bl.y && c.y <= bl.y + 24)
      || (tr && c.x >= tr.x && c.x < tr.x + tr.width && c.y >= tr.y && c.y <= tr.y + 24)) {
      load("medicalinfo.app.js");
    }
  });
})();
