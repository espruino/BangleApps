(() => {
  let currentClock = "";

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

      // Only update the file if the clock really changed to be nice to the FLASH mem
      if (clockApps[clockIndex].src != currentClock) {
        currentClock = clockApps[clockIndex].src;
        const settings = require("Storage").readJSON('setting.json', 1);
        settings.clock = clockApps[clockIndex].src;
        require("Storage").write('setting.json', settings);
        
        console.log("RandomClockWidget set the clock to '" + clockApps[clockIndex].name + "'");
      }
    }
  }

  loadRandomClock();

})();