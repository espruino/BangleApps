(() => {
  if (global.gbmusic_active || !(require("Storage").readJSON("gbmusic.json", 1) || {}).autoStart) {
    return;
  }
  if (typeof __FILE__ === 'string') { // only exists since 2v09
    const info = require("Storage").readJSON(__FILE__.split(".")[0]+".info", 1) || false;
    if (info && info.type!=="clock") { // info can have no type (but then it isn't a clock)
      return;
    }
  }

  let state, info;
  function checkMusic() {
    if (state!=="play" || !info) {
      return;
    }
    // playing music: launch music app
    require("Storage").writeJSON("gbmusic.load.json", {
      state: state,
      info: info,
    });
    load("gbmusic.app.js");
  }

  const _GB = global.GB;
  global.GB = (event) => {
    // we eat music events!
    switch(event.t) {
      case "musicinfo":
        info = event;
        delete (info.t);
        checkMusic();
        break;
      case "musicstate":
        state = event.state;
        checkMusic();
        break;
      default:
        if (_GB) {
          setTimeout(_GB, 0, event);
        }
    }
  };
})();
