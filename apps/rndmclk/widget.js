(() => {

  /**
   * Random value between zero (inclusive) and max (exclusive)
   * @param {int} max 
   */
  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function loadRandomClock() {
    // Find available clock apps (same way as in the bootloader)
    var clockApps = require("Storage").list(/\.info$/).map(app => require("Storage").readJSON(app, 1) || {}).filter(app => app.type == "clock").sort((a, b) => a.sortorder - b.sortorder);

    if (clockApps && clockApps.length > 0) {
      var clockIndex = getRandomInt(clockApps.length);

      load(clockApps[clockIndex].src);
    }
  }

  Bangle.on('lcdPower', (on) => {
    if (on) {
      // TODO: Only run if the current app is a clock as well
      loadRandomClock();
    }
  });

})();