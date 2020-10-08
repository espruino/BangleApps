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

  function prettifyNotificationEvent(event) {
    switch (event.src) {
      case "ALARMCLOCKRECEIVER":
        return {
          id: event.id,
          title: event.title || "Alarm: "+require('locale').time(new Date(), true),
          body: event.body,
          // same icon as apps/alarm/app-icon.js
          icon: require("heatshrink").decompress(atob("mEwwkGswAhiMRCCAREAo4eHBIQLEAgwYHsIJDiwHB5gACBpIhHCoYZEGA4gFCw4ABGA4HEjgXJ4IXGAwcUB4VEmf//8zogICoJIFAodMBoNDCoIADmgJB4gXIFwXDCwoABngwFC4guB4k/CQXwh4EC+YMCC44iBp4qDC4n/+gNBC41sEIJCEC4v/GAPGC4dhXYRdFC4xhCCYIXCdQRdDC5HzegQXCsxGHC45IDCwQXCUgwXHJAIXGRogXJSIIXcOw4XIPAYXcBwv/mEDBAwXOgtQC65QGC5vzoEAJAx3Nmk/mEABIiPN+dDAQIwFC4zXGFwKRCGAjvMFwQECGAgXI4YuGGAUvAgU8C4/EFwwGCAgdMC4p4EFwobFOwoXDJAIoEAApGBC4xIEABJGHGAapEAAqNBFwwXD4heI+YuBC5BIBVQhdHIw4wD5inFS4IKCCxFmigNCokzCoMzogICoIWIsMRjgPCAA3BiMWC48RBQIXJEgMRFxAJCCw4lEC44IECooOIBAaBJKwhgIAH4ACA==")),
        };
      default:
        return event;
    }
  }
  function handleNotificationEvent(event) {
    if (event.t === "notify") {
      require("notify").show(prettifyNotificationEvent(event));
      Bangle.buzz();
    } else { // notify-
      require("notify").hide(event);
    }
  }

  function updateMusic(options){
    if (state.music === "play") {
      require("notify").show(Object.assign({
        size:40, id:"music",
        render:a => {
          if (a.h>200) {
            // large:
            //    [icon]
            //    [    ]
            //   <artist>
            // ------------- middle of screen
            // <title>
            const iconSize = 24*3; // 24x24px, scale 3
            let x = a.x,
              y = a.y+a.h/2, // we use coords relative to vertical middle
              w=a.w,h=a.h;
            // try to fit musicInfo property into width
            const fitFont = (prop,max) => {
              if (!(prop in state.musicInfo)) return max;
              let size = Math.floor(w/(state.musicInfo[prop].length*6));
              if (size<1) {size=1}
              if (size>max) {size=max}
              return size;
            }
            let aSize = fitFont('artist',3);
            // TODO: split long title over multiple lines instead
            let tSize = fitFont('track',2);
            let bSize = fitFont('album',2);
            g.setColor(-1);
            // TODO: use a nicer large icon?
            g.drawImage(
              require("heatshrink").decompress(atob("jEYwILI/EAv/8gP/ARcMgOAASN8h+A/kfwP8n4CD/E/gHgjg/HA=")),
              x+(w-iconSize)/2, y-(iconSize+aSize*8)-12, {scale: 3});
            // artist: centered above middle
            g.setFontAlign(0, 1).setFont("6x8", aSize).drawString(state.musicInfo.artist, x+w/2, y-4);
            // title: left-aligned below middle
            g.setFontAlign(-1, -1).setFont("6x8", tSize).drawString(state.musicInfo.track, x, y+4);
            // album: centered at bottom
            if (state.musicInfo.album) {
              // note: using a.y rather than y
              g.setFontAlign(0, 1).setFont("6x8", bSize).drawString(state.musicInfo.album, x+w/2, a.y+h);
            }
          } else {
            // regular size:
            // [icon] <artist>
            // [    ] <title>
            const size=40, iconSize = 24;
            let x = a.x,
              y = a.y+(a.h-size)/2; // center vertically in available area
            g.setColor(-1);
            g.drawImage(
              require("heatshrink").decompress(atob("jEYwILI/EAv/8gP/ARcMgOAASN8h+A/kfwP8n4CD/E/gHgjg/HA=")),
              x+8, y+8);
            g.setFontAlign(-1, -1);
            x += iconSize+16;
            g.setFont("4x6", 2).drawString(state.musicInfo.artist, x, y+8);
            g.setFont("6x8", 1).drawString(state.musicInfo.track, x, y+22);
          }
        }}, options));
    }

    if (state.music === "pause") {
      require("notify").hide("music");
    }
  }
  function handleMusicStateUpdate(event) {
    if (state.music !== event.state) {
      state.music = event.state
      updateMusic({on: true});
    }
  }
  function handleMusicInfoUpdate(event) {
    state.musicInfo = event;
    updateMusic({on: false});
  }

  function handleCallEvent(event) {
    if (event.cmd === "accept") {
      require("notify").show({
        size: 55, title: event.name, id: "call",
        body: event.number, icon:require("heatshrink").decompress(atob("jEYwIMJj4CCwACJh4CCCIMOAQMGAQMHAQMDAQMBCIMB4PwgHz/EAn4CBj4CBg4CBgACCAAw="))});
      Bangle.buzz();
    }
  }

  function handleFindEvent(event) {
    if (state.find) {
      clearInterval(state.find);
      delete state.find;
    }
    if (event.n)
      state.find = setInterval(_=>{
        Bangle.buzz();
        setTimeout(_=>Bangle.beep(), 1000);
      },2000);
  }

  var _GB = global.GB;
  global.GB = (event) => {
    switch (event.t) {
      case "notify":
      case "notify-":
        handleNotificationEvent(event);
        break;
      case "musicinfo":
        handleMusicInfoUpdate(event);
        break;
      case "musicstate":
        handleMusicStateUpdate(event);
        break;
      case "call":
        handleCallEvent(event);
        break;
      case "find":
        handleFindEvent(event);
        break;
    }
    if(_GB)setTimeout(_GB,0,event);
  };

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
