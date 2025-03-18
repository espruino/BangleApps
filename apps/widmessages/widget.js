if ((require("Storage").readJSON("messages.settings.json", true) || {}).maxMessages!==0) {
  // NOTE when adding a custom "messages" widget:
  // the name still needs to be "messages": the library calls WIDGETS["messages'].hide()/show()
  // see e.g. widmsggrid
  WIDGETS["messages"] = {
    area: "tl", width: 0, srcs: [], draw: function(_w, recall) {
      // If we had a setTimeout queued from the last time we were called, remove it
      if (WIDGETS["messages"].i) {
        clearTimeout(WIDGETS["messages"].i);
        delete WIDGETS["messages"].i;
      }
      Bangle.removeListener("touch", this.touch);
      if (!this.width) return;
      let settings = Object.assign({flash: true, maxMessages: 3}, require("Storage").readJSON("messages.settings.json", true) || {});
      if (recall!==true || settings.flash) {
        const msgsShown = E.clip(this.srcs.length, 0, settings.maxMessages);
        g.reset().clearRect(this.x, this.y, this.x+this.width, this.y+23);
        for(let i = 0; i<msgsShown; i++) {
          const src = this.srcs[i];
          const colors = [
            g.theme.bg,
            require("messageicons").getColor(src, {settings: settings})
          ];
          if (settings.flash && ((Date.now()/1000)&1)) {
            if (colors[1]==g.theme.fg) {
              colors.reverse();
            } else {
              colors[1] = g.theme.fg;
            }
          }
          g.setColor(colors[1]).setBgColor(colors[0]);
          // draw the icon, or '...' if too many messages
          g.drawImage(i==(settings.maxMessages-1) && this.srcs.length>settings.maxMessages ? atob("EASBAGGG88/zz2GG") : require("messageicons").getImage(src),
            this.x+12+i*24, this.y+12, {rotate: 0/*force centering*/});
        }
      }
      WIDGETS["messages"].i = setTimeout(() => WIDGETS["messages"].draw(WIDGETS["messages"], true), 1000);
      if (process.env.HWVERSION>1) Bangle.on("touch", this.touch);
    }, onMsg: function(type, msg) {
      if (this.hidden) return;
      if (type==="music") return;
      if (msg.id && !msg.new && msg.t!=="remove") return;
      let filterMessages = msgs => msgs.filter(msg => msg.new && msg.id != "music")
        .filter((msg, i, arr) => arr.findIndex(nmsg => msg.src == nmsg.src) == i) // only include one of each type
        .map(m => m.src); // we only need this for icon/color;
      this.srcs = filterMessages(require("messages").getMessages(msg));
      const settings =  Object.assign({maxMessages:3},require('Storage').readJSON("messages.settings.json", true) || {});
      this.width = 24 * E.clip(this.srcs.length, 0, settings.maxMessages);
      if (type!=="init") Bangle.drawWidgets(); // "init" is not a real message type: see below
    }, touch: function(b, c) {
      var w = WIDGETS["messages"];
      if (!w || !w.width || c.x<w.x || c.x>w.x+w.width || c.y<w.y || c.y>w.y+24) return;
      require("messages").openGUI();
    },
    // hide() and show() are required by the "message" library!
    hide() {
      this.hidden=true;
      if (this.width) {
        // hide widget
        this.width = 0;
        Bangle.drawWidgets();
      }
    }, show() {
      delete this.hidden;
      this.onMsg("show", {}); // reload messages+redraw
    }
  };
  Bangle.on("message", WIDGETS["messages"].onMsg.bind(WIDGETS["messages"]));
  if (require("Storage").read("messages.json")!==undefined) // only call init if we've got messages - otherwise we can avoid loading messages lib (saves 30ms)
    WIDGETS["messages"].onMsg("init", {}); // abuse type="init" to prevent Bangle.drawWidgets();
}