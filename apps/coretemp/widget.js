// TODO Change to a generic multiple sensor widget?

(() => {
  var settings = {};
  var count = 0;
  var core = 0;

  // draw your widget
  function draw() {
    if (!settings.enabled)
      return;
    g.reset();
    g.setFont("6x8", 1).setFontAlign(0, 0);
    g.setFontAlign(0, 0);
    g.clearRect(this.x, this.y, this.x + 23, this.y + 23);

    if (count & 1) {
      g.setColor("#0f0"); // green
    } else {
      g.setColor(g.theme.dark ? "#333" : "#CCC"); // off = grey
    }

    g.drawImage(
        atob(
            "GBgBAAHwAHP4A+f8B+4cH+4MH84cPwYcfAf4eAP4+AHi+AAO8AAe8AAe8AAe+AAG+AA4eAA8fAB8PgD4P8b4H/7wB/9gA/8AAP4A"),
        this.x, this.y);

    g.setColor(g.theme.fg);
    g.drawString(core, this.x + 24 / 2, this.y + 19);

    g.setColor(-1);
  }

  // Set a listener to 'blink'
  function onTemp(temp) {
    count = count + 1;
    core = temp.core;
    WIDGETS["coretemp"].draw();
  }

  // Called by sensor app to update status
  function reload() {
    settings = require("Storage").readJSON("coretemp.json", 1) || {};

    Bangle.removeListener('CoreTemp', onTemp);

    if (settings.enabled) {
      WIDGETS["coretemp"].width = 24;
      Bangle.on('CoreTemp', onTemp);
    } else {
      WIDGETS["coretemp"].width = 0;
      count = 0;
    }
  }
  // add the widget
  WIDGETS["coretemp"] = {
    area : "tl",
    width : 24,
    draw : draw,
    reload : function() {
      reload();
      Bangle.drawWidgets(); // relayout all widgets
    }
  };
  // load settings, set correct widget width
  reload();
})()
