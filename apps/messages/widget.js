WIDGETS["messages"]={area:"tl",width:0,draw:function() {
  Bangle.removeListener('touch', this.touch);
  if (!this.width) return;
  var c = (Date.now()-this.t)/1000;
  g.reset().clearRect(this.x,this.y,this.x+this.width,this.y+23);
  g.drawImage((c&1) ? atob("GBiBAAAAAAAAAAAAAAAAAAAAAB//+DAADDAADDAADDwAPD8A/DOBzDDn/DA//DAHvDAPvjAPvjAPvjAPvh///gf/vAAD+AAB8AAAAA==") : atob("GBiBAAAAAAAAAAAAAAAAAAAAAB//+D///D///A//8CP/xDj/HD48DD+B8D/D+D/3vD/vvj/vvj/vvj/vvh/v/gfnvAAD+AAB8AAAAA=="), this.x, this.y);
  //if (c<60) Bangle.setLCDPower(1); // keep LCD on for 1 minute
  let settings = require('Storage').readJSON("messages.settings.json", true) || {};
  if (settings.repeat===undefined) settings.repeat = 4;
  if (c<120 && (Date.now()-this.l)>settings.repeat*1000) {
    this.l = Date.now();
    WIDGETS["messages"].buzz(); // buzz every 4 seconds
  }
  setTimeout(()=>WIDGETS["messages"].draw(), 1000);
  if (process.env.HWVERSION>1) Bangle.on('touch', this.touch);
},show:function(quiet) {
  WIDGETS["messages"].t=Date.now(); // first time
  WIDGETS["messages"].l=Date.now()-10000; // last buzz
  if (quiet) WIDGETS["messages"].t -= 500000; // if quiet, set last time in the past so there is no buzzing
  WIDGETS["messages"].width=64;
  Bangle.drawWidgets();
  Bangle.setLCDPower(1);// turns screen on
},hide:function() {
  delete WIDGETS["messages"].t;
  delete WIDGETS["messages"].l;
  WIDGETS["messages"].width=0;
  Bangle.drawWidgets();
},buzz:function() {
  let v = (require('Storage').readJSON("messages.settings.json", true) || {}).vibrate || ".";
  function b() {
    var c = v[0];
    v = v.substr(1);
    if (c==".") Bangle.buzz().then(()=>setTimeout(b,100));
    if (c=="-") Bangle.buzz(500).then(()=>setTimeout(b,100));
  }
  b();
},touch:function(b,c) {
  var w=WIDGETS["messages"];
  if (!w||!w.width||c.x<w.x||c.x>w.x+w.width||c.y<w.y||c.y>w.y+23) return;
  load("messages.app.js");
}};
/* We might have returned here if we were in the Messages app for a
message but then the watch was never viewed. In that case we don't
want to buzz but should still show that there are unread messages. */
if (global.MESSAGES===undefined) (function() {
  var messages = require("Storage").readJSON("messages.json",1)||[];
  if (messages.some(m=>m.new)) WIDGETS["messages"].show(true);
})();
