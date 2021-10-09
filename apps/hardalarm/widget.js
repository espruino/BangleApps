(() => {
  var alarms = require('Storage').readJSON('hardalarm.json',1)||[];
  alarms = alarms.filter(alarm=>alarm.on);
  if (!alarms.length) return; // no alarms, no widget!
  delete alarms;
  // add the widget
  WIDGETS["alarm"]={area:"tl",width:24,draw:function() {
    g.setColor(-1);
    g.drawImage(atob("GBgBAAAAAAAAABgADhhwDDwwGP8YGf+YMf+MM//MM//MA//AA//AA//AA//AA//AA//AB//gD//wD//wAAAAADwAABgAAAAAAAAA"),this.x,this.y);
  }};
})()
