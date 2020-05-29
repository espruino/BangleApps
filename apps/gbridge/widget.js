(() => {
  const state = {
    music: "stop",

    musicInfo: {
      artist: "",
      album: "",
      track: ""
    },

    scrollPos: 0
  };

  function settings() {
    let settings = require('Storage').readJSON("gbridge.json", true) || {};
    if (!("showIcon" in settings)) {
      settings.showIcon = true;
    }
    return settings
  }

  function gbSend(message) {
    Bluetooth.println("");
    Bluetooth.println(JSON.stringify(message));
  }

  function showNotification(size, render, turnOn) {
    if (turnOn === undefined) turnOn = true
    var oldMode = Bangle.getLCDMode();

    Bangle.setLCDMode("direct");
    g.setClipRect(0, 240, 239, 319);
    g.setColor("#222222");
    g.fillRect(1, 241, 238, 318);

    render(320 - size);

    g.setColor("#ffffff");
    g.fillRect(0, 240, 1, 319);
    g.fillRect(238, 240, 239, 319);
    g.fillRect(2, 318, 238, 319);

    if (turnOn) Bangle.setLCDPower(1); // light up
    Bangle.setLCDMode(oldMode); // clears cliprect

    function anim() {
      state.scrollPos -= 2;
      if (state.scrollPos < -size) {
        state.scrollPos = -size;
      }
      Bangle.setLCDOffset(state.scrollPos);
      if (state.scrollPos > -size) setTimeout(anim, 15);
    }
    anim();
  }

  function hideNotification() {
    function anim() {
      state.scrollPos += 4;
      if (state.scrollPos > 0) state.scrollPos = 0;
      Bangle.setLCDOffset(state.scrollPos);
      if (state.scrollPos < 0) setTimeout(anim, 10);
    }
    anim();
  }

  function handleNotificationEvent(event) {

    // split text up at word boundaries
    var txt = event.body.split("\n");
    var MAXCHARS = 38;
    for (var i = 0; i < txt.length; i++) {
      txt[i] = txt[i].trim();
      var l = txt[i];
      if (l.length > MAXCHARS) {
        var p = MAXCHARS;
        while (p > MAXCHARS - 8 && !" \t-_".includes(l[p]))
          p--;
        if (p === MAXCHARS - 8) p = MAXCHARS;
        txt[i] = l.substr(0, p);
        txt.splice(i + 1, 0, l.substr(p));
      }
    }

    showNotification(80, (y) => {

      // TODO: icon based on src?
      var x = 120;
      g.setFontAlign(0, 0);
      g.setFont("6x8", 1);
      g.setColor("#40d040");
      g.drawString(event.src, x, y + 7);

      g.setColor("#ffffff");
      g.setFont("6x8", 2);
      if (event.title)
        g.drawString(event.title.slice(0,17), x, y + 25);

      g.setFont("6x8", 1);
      g.setColor("#ffffff");
      g.setFontAlign(-1, -1);
      g.drawString(txt.join("\n"), 10, y + 40);
    });

    Bangle.buzz();
  }

  function handleMusicStateUpdate(event) {
    const changed = state.music === event.state
    state.music = event.state

    if (state.music === "play") {
      showNotification(40, (y) => {
        g.setColor("#ffffff");
        g.drawImage(require("heatshrink").decompress(atob("jEYwILI/EAv/8gP/ARcMgOAASN8h+A/kfwP8n4CD/E/gHgjg/HA=")), 8, y + 8);

        g.setFontAlign(-1, -1);
        var x = 40;
        g.setFont("4x6", 2);
        g.setColor("#ffffff");
        g.drawString(state.musicInfo.artist, x, y + 8);

        g.setFont("6x8", 1);
        g.setColor("#ffffff");
        g.drawString(state.musicInfo.track, x, y + 22);
      }, changed);
    }

    if (state.music === "pause") {
      hideNotification();
    }
  }

  function handleCallEvent(event) {

    if (event.cmd === "accept") {
      showNotification(40, (y) => {
        g.setColor("#ffffff");
        g.drawImage(require("heatshrink").decompress(atob("jEYwIMJj4CCwACJh4CCCIMOAQMGAQMHAQMDAQMBCIMB4PwgHz/EAn4CBj4CBg4CBgACCAAw=")), 8, y + 8);

        g.setFontAlign(-1, -1);
        var x = 40;
        g.setFont("4x6", 2);
        g.setColor("#ffffff");
        g.drawString(event.name, x, y + 8);

        g.setFont("6x8", 1);
        g.setColor("#ffffff");
        g.drawString(event.number, x, y + 22);
      });

      Bangle.buzz();
    }
  }

  var _GB = global.GB;
  global.GB = (event) => {
    switch (event.t) {
      case "notify":
        handleNotificationEvent(event);
        break;
      case "musicinfo":
        state.musicInfo = event;
        break;
      case "musicstate":
        handleMusicStateUpdate(event);
        break;
      case "call":
        handleCallEvent(event);
        break;
    }
    if(_GB)setTimeout(_GB,0,event);
  };

  // Touch control
  Bangle.on("touch", () => {
    if (state.scrollPos) {
      hideNotification();
    }
  });

  Bangle.on("swipe", (dir) => {
    if (state.music === "play") {
      const command = dir > 0 ? "next" : "previous"
      gbSend({ t: "music", n: command });
    }
  });

  function draw() {
    g.setColor(-1);
    if (NRF.getSecurityStatus().connected)
      g.drawImage(require("heatshrink").decompress(atob("i0WwgHExAABCIwJCBYwJEBYkIBQ2ACgvzCwoECx/z/AKDD4WD+YLBEIYKCx//+cvnAKCBwU/mc4/8/HYv//Ev+Y4EEAePn43DBQkzn4rCEIoABBIwKHO4cjmczK42I6mqlqEEBQeIBQaDED4IgDUhi6KaBbmIA==")), this.x + 1, this.y + 1);
    else
      g.drawImage(require("heatshrink").decompress(atob("i0WwQFC1WgAgYFDAgIFClQFCwEK1W/AoIPB1f+CAMq1f7/WqwQPB/fq1Gq1/+/4dC/2/CAIaB/YbBAAO///qAoX/B4QbBDQQ7BDQQrBAAWoIIIACIIIVC0ECB4cACAZiBAoRtCAoIDBA")), this.x + 1, this.y + 1);
  }

  function changedConnectionState() {
    WIDGETS["gbridgew"].draw();
    g.flip(); // turns screen on
  }

  function reload() {
    NRF.removeListener("connect", changedConnectionState);
    NRF.removeListener("disconnect", changedConnectionState);
    if (settings().showIcon) {
      WIDGETS["gbridgew"].width = 24;
      WIDGETS["gbridgew"].draw = draw;
      NRF.on("connect", changedConnectionState);
      NRF.on("disconnect", changedConnectionState);
    } else {
      WIDGETS["gbridgew"].width = 0;
      WIDGETS["gbridgew"].draw = ()=>{};
    }
  }

  WIDGETS["gbridgew"] = {area: "tl", width: 24, draw: draw, reload: reload};
  reload();

  function sendBattery() {
    gbSend({ t: "status", bat: E.getBattery() });
  }

  NRF.on("connect", () => setTimeout(sendBattery, 2000));
  setInterval(sendBattery, 10*60*1000);
  sendBattery();
})();
