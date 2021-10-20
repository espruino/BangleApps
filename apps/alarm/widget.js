<<<<<<< HEAD
(() => {
  var alarms = require('Storage').readJSON('alarm.json',1)||[];
  alarms = alarms.filter(alarm=>alarm.on);
  if (!alarms.length) return; // no alarms, no widget!
  delete alarms;
  // add the widget
  WIDGETS["alarm"]={area:"tl",width:24,draw:function() {
    g.setColor(-1);
    g.drawImage(atob("GBgBAAAAAAAAABgADhhwDDwwGP8YGf+YMf+MM//MM//MA//AA//AA//AA//AA//AA//AB//gD//wD//wAAAAADwAABgAAAAAAAAA"),this.x,this.y);
  }};
})()
=======
WIDGETS["alarm"]={area:"tl",width:0,draw:function() {
    if (this.width) g.reset().drawImage(atob("GBgBAAAAAAAAABgADhhwDDwwGP8YGf+YMf+MM//MM//MA//AA//AA//AA//AA//AA//AB//gD//wD//wAAAAADwAABgAAAAAAAAA"),this.x,this.y);
  },reload:function() {
    WIDGETS["alarm"].width = (require('Storage').readJSON('alarm.json',1)||[]).some(alarm=>alarm.on) ? 24 : 0;
  }
};
WIDGETS["alarm"].reload();
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
