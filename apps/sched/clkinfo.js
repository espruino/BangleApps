(function() {
  const alarm = require('sched');
  const iconAlarmOn = atob("GBiBAAAAAAAAAAYAYA4AcBx+ODn/nAP/wAf/4A/n8A/n8B/n+B/n+B/n+B/n+B/h+B/4+A/+8A//8Af/4AP/wAH/gAB+AAAAAAAAAA==");
  const iconAlarmOff = atob("GBiBAAAAAAAAAAYAYA4AcBx+ODn/nAP/wAf/4A/n8A/n8B/n+B/n+B/nAB/mAB/geB/5/g/5tg/zAwfzhwPzhwHzAwB5tgAB/gAAeA==");
  const iconTimerOn = atob("GBiBAAAAAAAAAAAAAAf/4Af/4AGBgAGBgAGBgAD/AAD/AAB+AAA8AAA8AAB+AADnAADDAAGBgAGBgAGBgAf/4Af/4AAAAAAAAAAAAA==");
  const iconTimerOff = atob("GBiBAAAAAAAAAAAAAAf/4Af/4AGBgAGBgAGBgAD/AAD/AAB+AAA8AAA8AAB+AADkeADB/gGBtgGDAwGDhwfzhwfzAwABtgAB/gAAeA==");

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
      if(!a.on) return /*LANG*/"off";
      let time = Math.round(alarm.getTimeToAlarm(a)/(60*1000));
      if(time > 60)
        time = Math.round(time / 60) + "h";
      else
        time += "m";
      return time;
    }
    return require("time_utils").formatTime(a.t);
  }

  //workaround for sorting undefined values
  function getAlarmOrder(a) {
    let val = alarm.getTimeToAlarm(a);
    if(typeof val == "undefined") return 86400*1000;
    return val;
  }

  var img = iconAlarmOn;
  //get only alarms not created by other apps
  var alarmItems = {
    name: /*LANG*/"Alarms",
    img: img,
    dynamic: true,
    items: alarm.getAlarms().filter(a=>!a.appid)
    //.sort((a,b)=>alarm.getTimeToAlarm(a)-alarm.getTimeToAlarm(b))
    .sort((a,b)=>getAlarmOrder(a)-getAlarmOrder(b))
      .map((a, i)=>({
        name: null,
        hasRange: true,
        get: () => ({ text: getAlarmText(a), img: getAlarmIcon(a),
          v: getAlarmValue(a), min:0, max:getAlarmMax(a)}),
        show: function() {},
        hide: function () {},
        run: function() { }
      })),
  };

  return alarmItems;
})
