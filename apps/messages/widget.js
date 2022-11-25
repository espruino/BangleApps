(() => {
if ((require('Storage').readJSON("messages.settings.json", true) || {}).maxMessages===0) return;

function filterMessages(msgs) {
  return msgs.filter(msg => msg.new && msg.id != "music")
    .map(m => m.src) // we only need this for icon/color
    .filter((msg, i, arr) => arr.findIndex(nmsg => msg.src == nmsg.src) == i);
}

WIDGETS["messages"]={area:"tl", width:0, draw:function(recall) {
  // If we had a setTimeout queued from the last time we were called, remove it
  if (WIDGETS["messages"].i) {
    clearTimeout(WIDGETS["messages"].i);
    delete WIDGETS["messages"].i;
  }
  Bangle.removeListener('touch', this.touch);
  if (!this.width) return;
    let settings = Object.assign({flash:true, maxMessages:3},require('Storage').readJSON("messages.settings.json", true) || {});
  if (recall !== true || settings.flash) {
    var msgsShown = E.clip(this.msgs.length, 0, settings.maxMessages);
    g.reset().clearRect(this.x, this.y, this.x+this.width, this.y+23);
    for(let i = 0;i < msgsShown;i++) {
      const msg = this.msgs[i];
      const colors = [g.theme.bg,
                      require("messageicons").getColor(msg, {settings:settings})];
      if (settings.flash && ((Date.now()/1000)&1)) {
        if (colors[1] == g.theme.fg) {
          colors.reverse();
        } else {
          colors[1] = g.theme.fg;
        }
      }
      g.setColor(colors[1]).setBgColor(colors[0]);
      // draw the icon, or '...' if too many messages
      g.drawImage(i == (settings.maxMessages - 1) && this.msgs.length > settings.maxMessages ? atob("EASBAGGG88/zz2GG") : require("messageicons").getImage(msg),
                  this.x + 12 + i * 24, this.y + 12, {rotate:0/*force centering*/});
    }
  }
  WIDGETS["messages"].i=setTimeout(()=>WIDGETS["messages"].draw(true), 1000);
  if (process.env.HWVERSION>1) Bangle.on('touch', this.touch);
},update:function(rawMsgs) {
  const settings =  Object.assign({maxMessages:3},require('Storage').readJSON("messages.settings.json", true) || {});
  this.msgs = filterMessages(rawMsgs);
  this.width = 24 * E.clip(this.msgs.length, 0, settings.maxMessages);
  Bangle.drawWidgets();
},touch:function(b,c) {
  var w=WIDGETS["messages"];
  if (!w||!w.width||c.x<w.x||c.x>w.x+w.width||c.y<w.y||c.y>w.y+24) return;
  load("messages.app.js");
}};

/* We might have returned here if we were in the Messages app for a
message but then the watch was never viewed. */
if (global.MESSAGES===undefined)
  WIDGETS["messages"].update(require("messages").getMessages());
})();
