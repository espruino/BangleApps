(() => {
  var alarms = require('Storage').readJSON('alarm.json',1)||[];
  alarms = alarms.filter(alarm=>alarm.on);
  if (!alarms.length) return;
  delete alarms;
  // add the width
  var xpos = WIDGETPOS.tl;
  WIDGETPOS.tl += 24;/* the widget width plus some extra pixel to keep distance to others */;

  // draw your widget at xpos

  // add the widget
  WIDGETS["alarm"]={draw:function() {
    g.setColor(-1);
    g.drawImage(atob("GBgBAAAAAAAAABgADhhwDDwwGP8YGf+YMf+MM//MM//MA//AA//AA//AA//AA//AA//AB//gD//wD//wAAAAADwAABgAAAAAAAAA"),xpos,0);
  }};
})()
