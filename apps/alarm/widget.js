(() => {
  var alarms = require('Storage').readJSON('alarm.json',1)||[];
  alarms = alarms.filter(alarm=>alarm.on);
  if (!alarms.length) return; // no alarms, no widget!
  delete alarms;
  // add the widget
  WIDGETS["alarm"]={area:"tl",width:24,draw:function() {
    g.setColor(g.theme.fg);
    g.drawImage(atob("GBgBAAAAAAAAABgADhhwDDwwGP8YGf+YMf+MM//MM//MA//AA//AA//AA//AA//AA//AB//gD//wD//wAAAAADwAABgAAAAAAAAA"),this.x,this.y);
  }};
})()
