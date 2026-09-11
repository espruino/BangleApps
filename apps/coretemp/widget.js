(() => {
  var settings = {};
  var CORESensorStatus = "off";

  function getCORESensorStatus(status) {
    if (status) return status;
    try {
      if (Bangle.CORESensorGetStatus) return Bangle.CORESensorGetStatus();
      if (Bangle.isCORESensorConnected) {
        return {
          connected: Bangle.isCORESensorConnected(),
          enabled: !!settings.enabled
        };
      }
    } catch (e) {
    }
    return { connected: false, enabled: false };
  }

  function getWidgetStatus(status) {
    status = getCORESensorStatus(status);
    if (status.connected) return status.enabled ? "background" : "connected";
    return "off";
  }

  function updateStatus(status) {
    var nextStatus = getWidgetStatus(status);
    if (nextStatus === CORESensorStatus) return;
    CORESensorStatus = nextStatus;
    if (WIDGETS["coretemp"] && WIDGETS["coretemp"].draw) WIDGETS["coretemp"].draw();
  }

  // draw your widget
  function draw() {
    if (!settings.widget)
      return;
    g.reset();
    g.setFont("6x8", 1).setFontAlign(0, 0);
    g.setFontAlign(0, 0);
    g.clearRect(this.x, this.y, this.x + 23, this.y + 23);

    if (CORESensorStatus === "background") {
      g.setColor("#00f"); // background connected = blue
    } else if (CORESensorStatus === "connected") {
      g.setColor("#0f0"); // green
    } else {
      g.setColor(g.theme.dark ? "#333" : "#CCC"); // off = grey
    }

    g.drawImage(
      atob("FBSCAAAAADwAAAPw/8AAP/PD8AP/wwDwD//PAPAP/APA8D/AA//wP8AA/8A/AAAAPP8AAAD8/wAAAPz/AAAA/D8AAAAAP8AAA/A/8AAP8A/8AD/wD///z8AD///PAAA///AAAAP/wAA="),
      this.x + (24 - 12) / 2, this.y + 1);
    g.setColor(-1);
  }
  // Called by sensor app to update status
  function reload() {
    settings = require("Storage").readJSON("coretemp.json", 1) || {};
    if (!settings.widget) {
      delete WIDGETS["coretemp"];
      return;
    }
    WIDGETS["coretemp"].width = 24;
    updateStatus();
  }

  Bangle.on("CORESensorStatus", updateStatus);
  setInterval(updateStatus, 10000); // fallback for missed events and late runtime loading
  // add the widget
  WIDGETS["coretemp"] = {
    area: "tl",
    width: 24,
    draw: draw,
    reload: function () {
      reload();
      Bangle.drawWidgets(); // relayout all widgets
    }
  };
  // load settings, set correct widget width
  reload();
})()
