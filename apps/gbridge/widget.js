(() => {

  const gb = {
    musicState: {
      STOP: "stop",
      PLAY: "play",
      PAUSE: "pause"
    },

    muiscControl: {
      NEXT: "next",
      PREV: "previous"
    },

    callCommands: {
      UNDEFINED: "undefined",
      ACCEPT: "accept",
      INCOMING: "incoming",
      OUTGOING: "outgoing",
      REJECT: "reject",
      START: "start",
      END: "end"
    },

    send: (message) => {
      Bluetooth.println(JSON.stringify(message));
    },

    controlMusic: (operation) => {
      gb.send({ t: "music", n: operation });
    },

    reportBatteryLevel: () => {
      gb.send({ t: "status", bat: E.getBattery() });
    },
  };

  const state = {
    music: gb.musicState.STOP,

    musicInfo: {
      artist: "",
      album: "",
      track: ""
    },
    debug: false,
  };

  const notification = {

    backgroundColor: "#222222",
    frameColor: "#ffffff",
    titleColor: "#40d040",
    contentColor: "#ffffff",
    scrollPos: 0,

    show: (size, content) => {
      var oldMode = Bangle.getLCDMode();
      Bangle.setLCDMode("direct");

      g.setClipRect(0, 240, 239, 319);
      g.setColor(notification.backgroundColor);
      g.fillRect(1, 241, 238, 318);

      notification.drawContent(320 - size, content);

      g.setColor(notification.frameColor);
      g.fillRect(0, 240, 1, 319);
      g.fillRect(238, 240, 239, 319);
      g.fillRect(2, 318, 238, 319);

      Bangle.setLCDPower(1); // light up
      Bangle.setLCDMode(oldMode); // clears cliprect

      function anim() {
        notification.scrollPos -= 2;
        if (notification.scrollPos < -size) notification.scrollPos = -size;
        Bangle.setLCDOffset(notification.scrollPos);
        if (notification.scrollPos > -size) setTimeout(anim, 10);
      }
      anim();
    },

    drawContent: (y, content) => {

      if (content.icon !== undefined) {
        g.setColor(notification.contentColor);
        const icon = require("Storage").read(content.icon);
        g.drawImage(icon, 8, y + 8);
      }

      var x = 120;
      g.setFontAlign(0, 0);

      g.setFont("6x8", 1);
      g.setColor(notification.titleColor);
      g.drawString(content.title, x, y + 7);

      g.setColor(notification.contentColor);
      g.setFont("6x8", 2);
      g.drawString(content.header, x, y + 25);

      g.setFont("6x8", 1);
      g.setColor(notification.contentColor);
      g.setFontAlign(-1, -1);
      g.drawString(content.body, 10, y + 40);
    },

    hide: () => {
      function anim() {
        notification.scrollPos += 4;
        if (notification.scrollPos > 0) notification.scrollPos = 0;
        Bangle.setLCDOffset(notification.scrollPos);
        if (notification.scrollPos < 0) setTimeout(anim, 10);
      }
      anim();
    },

    isVisible: () => {
      return notification.scrollPos != 0;
    }
  };

  function showNotification(src, title, body) {

    // split text up at word boundaries
    var txt = body.split("\n");
    var MAXCHARS = 38;
    for (var i = 0; i < txt.length; i++) {
      txt[i] = txt[i].trim();
      var l = txt[i];
      if (l.length > MAXCHARS) {
        var p = MAXCHARS;
        while (p > MAXCHARS - 8 && !" \t-_".includes(l[p]))
          p--;
        if (p == MAXCHARS - 8) p = MAXCHARS;
        txt[i] = l.substr(0, p);
        txt.splice(i + 1, 0, l.substr(p));
      }
    }

    var content = {
      title: src,
      header: title,
      body: txt.join("\n")
    };

    notification.show(80, content);
    Bangle.buzz();
  }

  function updateMusicInfo() {
    if (state.music == gb.musicState.PLAY) {

      var content = {
        title: state.musicInfo.artist,
        icon: "gbridge-music-ico.img",
        header: state.musicInfo.track,
        body:""
      };

      notification.show(40, content);
    } else {
      notification.hide();
    }
  }

  function handleCall(cmd, name, number) {
    switch(cmd) {

      case gb.callCommands.ACCEPT:
        notification.show(80, {
          title: "Call incoming",
          icon: "gbridge-call-ico.img",
          header: name,
          body: number
        });
        Bangle.buzz();
      break;

      default:
        if (state.debug) {
          showNotification(cmd, name, number);
        }
    }
  }

  global.GB = (event) => {
    switch (event.t) {
      case "notify":
        showNotification(event.src, event.title, event.body);
        break;
      case "musicinfo":
        state.musicInfo = event;
        break;
      case "musicstate":
        state.music = event.state;
        updateMusicInfo();
        break;
      case "call":
        handleCall(event.cmd, event.name, event.number);
        break;
      default:
        if (state.debug) {
          showNotification("Gadgetbridge", event.t, JSON.stringify(event));
        }
    }
  };

  // Touch control
  Bangle.on("touch", () => {
    if (notification.isVisible()) {
      notification.hide();
    }
  });

  Bangle.on("swipe", (dir) => {
    if (state.music == gb.musicState.PLAY) {
      gb.controlMusic(dir > 0 ? gb.muiscControl.NEXT : gb.muiscControl.PREV);
    }
  });

  function drawIcon() {
    g.setColor(-1);

    let icon;
    if (NRF.getSecurityStatus().connected) {
      icon = require("Storage").read("gbridge-on-ico.img");
    } else {
      icon = require("Storage").read("gbridge-off-ico.img");
    }

    g.drawImage(icon, this.x + 1, this.y + 1);
  }

  function changedConnectionState() {
    WIDGETS["gbridgew"].draw();
    g.flip(); // turns screen on
  }

  NRF.on("connected", changedConnectionState);
  NRF.on("disconnected", changedConnectionState);

  WIDGETS["gbridgew"] = { area: "tl", width: 24, draw: drawIcon };

  gb.reportBatteryLevel();
})();
