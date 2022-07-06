(() => {

function getMessages() {
  if ("undefined"!=typeof MESSAGES) return MESSAGES;
  return require("Storage").readJSON("messages.json",1)||[];
}

function filterMessages(msgs) {
  return msgs.filter(msg => msg.new && msg.id != "music")
    .filter((msg, i, arr) => arr.findIndex(nmsg => msg.src == nmsg.src) == i);
}

WIDGETS["messages"]={area:"tl", width:0, iconwidth:24,
draw:function(recall) {
  // If we had a setTimeout queued from the last time we were called, remove it
  if (WIDGETS["messages"].i) {
    clearTimeout(WIDGETS["messages"].i);
    delete WIDGETS["messages"].i;
  }
  Bangle.removeListener('touch', this.touch);
  if (!this.width) return;
  var c = (Date.now()-this.t)/1000;
  let settings = require('Storage').readJSON("messages.settings.json", true) || {};
  if (settings.flash===undefined) settings.flash = true;
  if (recall !== true || settings.flash) {
    var msgsShown = E.clip(this.msgs.length, 0, settings.maxMessages);
    g.reset().clearRect(this.x, this.y, this.x+this.width, this.y+23);
    for(let i = 0;i < msgsShown;i++) {
      const msg = this.msgs[i];
      const colors = [g.theme.bg, g.setColor(require("messages").getMessageImageCol(msg)).getColor()];
      if (settings.flash && (c&1)) {
        if (colors[1] == g.theme.fg) {
          colors.reverse();
        } else {
          colors[1] = g.theme.fg;
        }
      }
      g.setColor(colors[1]).setBgColor(colors[0]);
      g.drawImage(i == (settings.maxMessages - 1) && msgs.length > settings.maxMessages ? atob("GBgBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4H4H4H4H4H4H4H4H4H4H4H4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA") : require("messages").getMessageImage(msg), this.x + i * this.iconwidth, this.y - 1);
    }
  }
  if (settings.repeat===undefined) settings.repeat = 4;
  if (c<120 && (Date.now()-this.l)>settings.repeat*1000) {
    this.l = Date.now();
    WIDGETS["messages"].buzz(); // buzz every 4 seconds
  }
  WIDGETS["messages"].i=setTimeout(()=>WIDGETS["messages"].draw(true), 1000);
  if (process.env.HWVERSION>1) Bangle.on('touch', this.touch);
},update:function(rawMsgs, quiet) {
  const settings = require('Storage').readJSON("messages.settings.json", true) || {};
  msgs = filterMessages(rawMsgs);
  if (msgs.length === 0) {
    delete WIDGETS["messages"].t;
    delete WIDGETS["messages"].l;
  } else {
    WIDGETS["messages"].t=Date.now(); // first time
    WIDGETS["messages"].l=Date.now()-10000; // last buzz
    if (quiet) WIDGETS["messages"].t -= 500000; // if quiet, set last time in the past so there is no buzzing
  }
  WIDGETS["messages"].width=this.iconwidth * E.clip(msgs.length, 0, settings.maxMessages);
  WIDGETS["messages"].msgs = msgs;
  Bangle.drawWidgets();
},buzz:function(msgSrc) { 
  if ((require('Storage').readJSON('setting.json',1)||{}).quiet) return; // never buzz during Quiet Mode
  var pattern;
  if (msgSrc != undefined && msgSrc.toLowerCase() == "phone") {
    // special vibration pattern for incoming calls
    pattern = (require('Storage').readJSON("messages.settings.json", true) || {}).vibrateCalls;
  } else {
    pattern = (require('Storage').readJSON("messages.settings.json", true) || {}).vibrate;
  }
  if (pattern === undefined) { pattern = ":"; } // pattern may be "", so we can't use || ":" here
  require("buzz").pattern(pattern);
},touch:function(b,c) {
  var w=WIDGETS["messages"];
  if (!w||!w.width||c.x<w.x||c.x>w.x+w.width||c.y<w.y||c.y>w.y+w.iconwidth) return;
  load("messages.app.js");
}};

/* We might have returned here if we were in the Messages app for a
message but then the watch was never viewed. In that case we don't
want to buzz but should still show that there are unread messages. */
if (global.MESSAGES===undefined)
  WIDGETS["messages"].update(getMessages(), true);

})();
