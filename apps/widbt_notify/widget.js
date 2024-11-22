{
  // load settings
  let settings = Object.assign({
    showWidget: true,
    buzzOnConnect: true,
    buzzOnLoss: true,
    hideConnected: true,
    showMessage: true,
    nextBuzz: 30000
  }, require("Storage").readJSON("widbt_notify.json", true) || {});

  // setup widget with to hide if connected and option set
  let widWidth = settings.hideConnected && NRF.getSecurityStatus().connected ? 0 : 15;

  // write widget with loaded settings
  WIDGETS.bluetooth_notify = Object.assign(settings, {

    // set area and width
    area: "tr",
    width: widWidth,

    // setup warning status
    warningEnabled: 1,

    draw: function() {
      if (this.showWidget) {
        g.reset();
        if (NRF.getSecurityStatus().connected) {
          if (!this.hideConnected) {
            g.setColor((g.getBPP() > 8) ? "#07f" : (g.theme.dark ? "#0ff" : "#00f"));
            g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 2 + this.x, 2 + this.y);
          }
        } else {
          // g.setColor(g.theme.dark ? "#666" : "#999");
          g.setColor("#f00"); // red is easier to distinguish from blue
          g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 2 + this.x, 2 + this.y);
        }
      }
    },

    onNRF: function(connect) {
      // setup widget with and reload widgets to show/hide if hideConnected is enabled
      if (this.hideConnected) {
        this.width = connect ? 0 : 15; // ensures correct redraw
        Bangle.drawWidgets();
      } else {
        // redraw widget
        this.draw();
      }

      if (this.warningEnabled) {
        if (this.showMessage) {
          require("notify").show({id:"widbtnotify", title:"Bluetooth", body:/*LANG*/ 'Connection\n' + (connect ? /*LANG*/ 'restored.' : /*LANG*/ 'lost.')});
          setTimeout(() => {
            require("notify").hide({id:"widbtnotify"});
          }, 3000);
        }

        this.warningEnabled = 0;
        setTimeout('WIDGETS.bluetooth_notify.warningEnabled = 1;', this.nextBuzz); // don't buzz for the next X seconds.

        var quiet = (require('Storage').readJSON('setting.json', 1) || {}).quiet;
        if (!quiet && (connect ? this.buzzOnConnect : this.buzzOnLoss)) {
          Bangle.buzz(700, 1); // buzz on connection resume or loss
        }
      }
    }

  });

  // clear variables
  settings = undefined;
  widWidth = undefined;

  // setup bluetooth connection events
  NRF.on('connect', (addr) => WIDGETS.bluetooth_notify.onNRF(addr));
  NRF.on('disconnect', () => WIDGETS.bluetooth_notify.onNRF());

}