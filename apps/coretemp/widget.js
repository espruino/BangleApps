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
        atob("DAyBAAHh0js3EuDMA8A8AWBnDj9A8A=="),
        this.x+(24-12)/2,this.y+1);

    g.setColor(g.theme.fg);
    g.drawString(parseInt(core)+"\n."+parseInt((core*100)%100), this.x + 24 / 2, this.y + 18);

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
