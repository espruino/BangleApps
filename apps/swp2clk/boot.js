{
  const DEBUG = false;
  const FILE = "swp2clk.data.json";

  let    log = (message) => {
    if (DEBUG) {
      console.log(JSON.stringify(message));
    }
  };

  let readSettings = () => {
    log("reading settings");
    let settings = require("Storage").readJSON(FILE, 1) || {
      mode: 0,
      whiteList: [],
      blackList: []
    };
    log(settings);
    return settings;
  };

  let settings = readSettings();
  //inhibit is needed to filter swipes that had another handler load anything earlier than this handler was called
  let inhibit = false;
  Bangle.load = ( o => (f) => {
    o(f);
    log("inhibit caused by change to:" + f);
    inhibit = true;
  })(Bangle.load);

  let swipeHandler = (dir) => {
    log("swipe:" + dir + " on app: " + __FILE__);

    if (!inhibit && dir === 1 && !Bangle.CLOCK && __FILE__ != ".bootcde") {
      log("on a not clock app " + __FILE__);
      if ((settings.mode === 1 && settings.whiteList.includes(__FILE__)) || // "White List"
      (settings.mode === 2 && !settings.blackList.includes(__FILE__)) || // "Black List"
      settings.mode === 3) { // "Always"
        log("load clock");
        Bangle.showClock();
      }
    }
    inhibit = false;
  };

  Bangle.on("swipe", swipeHandler);
}
