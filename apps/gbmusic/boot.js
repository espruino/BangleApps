setTimeout( // make other boot code run first, so we override e.g. android.boot.js GB
  () => {
    const APP = global.__FILE__==="gbmusic.app.js",
      a = !!(require("Storage").readJSON("gbmusic.json", 1) || {}).autoStart;

    let s, i; // state, info
    /**
     * Save current song and check if we want to load the gbmusic app
     *
     * Only runs while other apps are loaded
     */
    function check() {
      if (s!=="play" || !i || !a || !Bangle.CLOCK) return; // only launch app if we know which song we are playing, and autoLoad is enabled
      delete (i.t);
      // store info and launch music app
      require("Storage").writeJSON("gbmusic.load.json", {
        state: s,
        info: i,
      });
      load("gbmusic.app.js");
    }

    global.GB = (_GB => e => {
      // we eat music events!
      switch(e.t) {
        case "musicinfo":
          i = e;
          return APP ? info(e) : check();
        case "musicstate":
          s = e.state;
          return APP ? state(e) : check();
        default:
          // pass on other events
          if (_GB) setTimeout(_GB, 0, e);
      }
    })(global.GB);
  }, 1);
