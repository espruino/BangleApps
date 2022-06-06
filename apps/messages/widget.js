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
    g.reset().clearRect(this.x, this.y, this.x+this.width, this.y+23);
    g.drawImage(settings.flash && (c&1) ? atob("GBiBAAAAAAAAAAAAAAAAAAAAAB//+DAADDAADDAADDwAPD8A/DOBzDDn/DA//DAHvDAPvjAPvjAPvjAPvh///gf/vAAD+AAB8AAAAA==") : atob("GBiBAAAAAAAAAAAAAAAAAAAAAB//+D///D///A//8CP/xDj/HD48DD+B8D/D+D/3vD/vvj/vvj/vvj/vvh/v/gfnvAAD+AAB8AAAAA=="), this.x, this.y-1);
  }
  if (settings.repeat===undefined) settings.repeat = 4;
  if (c<120 && (Date.now()-this.l)>settings.repeat*1000) {
    this.l = Date.now();
    WIDGETS["messages"].buzz(); // buzz every 4 seconds
  }
  WIDGETS["messages"].i=setTimeout(()=>WIDGETS["messages"].draw(true), 1000);
  if (process.env.HWVERSION>1) Bangle.on('touch', this.touch);
},show:function(quiet) {
  WIDGETS["messages"].t=Date.now(); // first time
  WIDGETS["messages"].l=Date.now()-10000; // last buzz
  if (quiet) WIDGETS["messages"].t -= 500000; // if quiet, set last time in the past so there is no buzzing
  WIDGETS["messages"].width=this.iconwidth;
  Bangle.drawWidgets();
},hide:function() {
  delete WIDGETS["messages"].t;
  delete WIDGETS["messages"].l;
  WIDGETS["messages"].width=0;
  Bangle.drawWidgets();
},buzz:function() {
  if ((require('Storage').readJSON('setting.json',1)||{}).quiet) return; // never buzz during Quiet Mode
  require("buzz").pattern((require('Storage').readJSON("messages.settings.json", true) || {}).vibrate || ".");
},touch:function(b,c) {
  var w=WIDGETS["messages"];
  if (!w||!w.width||c.x<w.x||c.x>w.x+w.width||c.y<w.y||c.y>w.y+w.iconwidth) return;
  load("messages.app.js");
}};
/* We might have returned here if we were in the Messages app for a
message but then the watch was never viewed. In that case we don't
want to buzz but should still show that there are unread messages. */
if (global.MESSAGES===undefined) (function() {
  var messages = require("Storage").readJSON("messages.json",1)||[];
  if (messages.some(m=>m.new&&m.id!="music")) WIDGETS["messages"].show(true);
})();
