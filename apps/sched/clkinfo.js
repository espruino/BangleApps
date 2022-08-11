(function() {
  const alarm = require('sched');
  const iconAlarmOn = atob("GBiBAAAAAAAAAAYAYA4AcBx+ODn/nAP/wAf/4A/n8A/n8B/n+B/n+B/n+B/n+B/h+B/4+A/+8A//8Af/4AP/wAH/gAB+AAAAAAAAAA==");
  const iconAlarmOff =
    atob("GBjBAP////8AAAAAAAAGAGAOAHAcfjg5/5wD/8AH/+AP5/AP5/Af5/gf5/gf5wAf5gAf4Hgf+f4P+bYP8wMH84cD84cB8wMAebYAAf4AAHg=");
    //atob("GBjBAP//AAAAAAAAAAAGAGAOAHAcfjg5/5wD/8AH/+AP5/AP5/Af5/gf5/gf5wAf5gAf4Hgf+f4P+bYP8wMH84cD84cB8wMAebYAAf4AAHg=");

  const iconTimerOn =
    atob("GBjBAP////8AAAAAAAAAAAAH/+AH/+ABgYABgYABgYAA/wAA/wAAfgAAPAAAPAAAfgAA5wAAwwABgYABgYABgYAH/+AH/+AAAAAAAAAAAAA=");
    //atob("GBjBAP//AAAAAAAAAAAAAAAH/+AH/+ABgYABgYABgYAA/wAA/wAAfgAAPAAAPAAAfgAA5wAAwwABgYABgYABgYAH/+AH/+AAAAAAAAAAAAA=");
  const iconTimerOff =
    atob("GBjBAP////8AAAAAAAAAAAAH/+AH/+ABgYABgYABgYAA/wAA/wAAfgAAPAAAPAAAfgAA5HgAwf4BgbYBgwMBg4cH84cH8wMAAbYAAf4AAHg=");
    //atob("GBjBAP//AAAAAAAAAAAAAAAH/+AH/+ABgYABgYABgYAA/wAA/wAAfgAAPAAAPAAAfgAA5HgAwf4BgbYBgwMBg4cH84cH8wMAAbYAAf4AAHg=");

  //from 0 to max, the higher the closer to fire (as in a progress bar)
  function getAlarmValue(a){
    let min = Math.round(alarm.getTimeToAlarm(a)/(60*1000));
    if(!min) return 0; //not active or more than a day
    return getAlarmMax(a)-min;
  }

  function getAlarmMax(a) {
    if(a.timer)
      return Math.round(a.timer/(60*1000));
    //minutes cannot be more than a full day
    return 1440;
  }

  function getAlarmIcon(a) {
    if(a.on) {
      if(a.timer) return iconTimerOn;
      return iconAlarmOn;
    } else {
      if(a.timer) return iconTimerOff;
      return iconAlarmOff;
    }
  }

  function getAlarmText(a){
    if(a.timer) {
      if(!a.on) return "off";
      let time = Math.round(alarm.getTimeToAlarm(a)/(60*1000));
      if(time > 60)
        time = Math.round(time / 60) + "h";
      else
        time += "m";
      return time;
    }
    return require("time_utils").formatTime(a.t);
  }

  var img = iconAlarmOn;
  //get only alarms not created by other apps
  var alarmItems = {
    name: "Alarms",
    img: img,
    items: alarm.getAlarms().filter(a=>!a.appid)
    .sort((a,b)=>alarm.getTimeToAlarm(a)-alarm.getTimeToAlarm(b))
    //.sort((a,b)=>getAlarmMinutes(a)-getAlarmMinutes(b))
      .map((a, i)=>({
        name: null,
        get: () => ({ text: getAlarmText(a), img: getAlarmIcon(a),
          hasRange: true, v: getAlarmValue(a), min:0, max:getAlarmMax(a)}),
        show: function() { alarmItems.items[i].emit("redraw"); },
        hide: function () {},
        run: function() { }
      })),
  };

  return alarmItems;
})
