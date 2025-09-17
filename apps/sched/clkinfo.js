(function() {
  //from 0 to max, the higher the closer to fire (as in a progress bar)
  function getAlarmValue(a) {
    let min = Math.round(require('sched').getTimeToAlarm(a)/(60*1000));
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
      if(a.timer) return atob("GBiBAAAAAAAAAAAAAAf/4Af/4AGBgAGBgAGBgAD/AAD/AAB+AAA8AAA8AAB+AADnAADDAAGBgAGBgAGBgAf/4Af/4AAAAAAAAAAAAA==");
      if(a.date) return atob("GBiBAAAAAAAAAAAAAA//8B//+BgAGBgAGBgAGB//+B//+B//+B/++B/8+B/5+B8z+B+H+B/P+B//+B//+B//+A//8AAAAAAAAAAAAA==");
      return atob("GBiBAAAAAAAAAAYAYA4AcBx+ODn/nAP/wAf/4A/n8A/n8B/n+B/n+B/n+B/n+B/h+B/4+A/+8A//8Af/4AP/wAH/gAB+AAAAAAAAAA==");
    } else {
      if(a.timer) return atob("GBiBAAAAAAAAAAAAAAf/4Af/4AGBgAGBgAGBgAD/AAD/AAB+AAA8AAA8AAB+AADkeADB/gGBtgGDAwGDhwfzhwfzAwABtgAB/gAAeA==");
      if(a.date) return atob("GBgBAAAAAAAAAAAAD//wH//4GAAYGAAYGAAYH//4H//4H//4H/74H/wAH/gAHzB4H4H+H8m2H/MDH/OHH/OHD/MDAAG2AAH+AAB4");
      return atob("GBiBAAAAAAAAAAYAYA4AcBx+ODn/nAP/wAf/4A/n8A/n8B/n+B/n+B/nAB/mAB/geB/5/g/5tg/zAwfzhwPzhwHzAwB5tgAB/gAAeA==");
    }
  }

  function getAlarmText(a){
    if(a.timer) {
      if(!a.on) return /*LANG*/"off";
      let time = Math.round(require('sched').getTimeToAlarm(a)/(60*1000));
      if(time > 60)
        time = Math.round(time / 60) + "h";
      else
        time += "m";
      return time;
    }
    if(a.date){
      const d = new Date(a.date);
      return `${d.getDate()} ${require("locale").month(d, 1)}`;
    }
    return require("time_utils").formatTime(a.t);
  }

  //workaround for sorting undefined values
  function getAlarmOrder(a) {
    let val = require('sched').getTimeToAlarm(a);
    if(typeof val == "undefined") return 86400*1000;
    return val;
  }

  /*
   * Returns the array [interval, switchTimeout]
   * `interval` is the refresh rate (hourly or per minute)
   * `switchTimeout` is the time before the refresh rate should change (or expiration)
   */
  function getRefreshIntervals(a) {
    const minute = 60 * 1000;
    const halfhour = 30 * minute;
    const hour = 2 * halfhour;
    let msecs = require('sched').getTimeToAlarm(a);
    if(typeof msecs == "undefined" || msecs == 0)
      return [];
    if(msecs > hour) { //refresh every half an hour
      let remain = (msecs+minute) % halfhour;
      if(remain < 27 * minute && remain != 0) //first align period (some tolerance)
        return [ halfhour, remain ];
      return [ halfhour, msecs - hour ];
    } else { //refresh every minute
      //alarms just need the progress bar refreshed, no need every minute
      if(!a.timer) return [];
      return [ minute, msecs ];
    }
  }

  function _doInterval(interval) {
    return setTimeout(()=>{
      this.emit("redraw");
      this.interval = setInterval(()=>{
        this.emit("redraw");
      }, interval);
    }, interval);
  }
  function _doSwitchTimeout(a, switchTimeout) {
    return setTimeout(()=>{
      this.emit("redraw");
      clearInterval(this.interval);
      this.interval = undefined;
      var tmp = getRefreshIntervals(a);
      var interval = tmp[0];
      var switchTimeout = tmp[1];
      if(!interval) return;
      this.interval = _doInterval.call(this, interval);
      this.switchTimeout = _doSwitchTimeout.call(this, a, switchTimeout);
    }, switchTimeout);
  }

  // read the file direct here to avoid loading sched library (saves 10ms!)
  var all = /*require('sched').getAlarms()*/require("Storage").readJSON("sched.json",1)||[];
  //get only alarms not created by other apps
  var alarmItems = {
    name: /*LANG*/"Alarms",
    img: getAlarmIcon({on:1}),
    dynamic: true,
    items: all.filter(a=>!a.appid)
    //.sort((a,b)=>require('sched').getTimeToAlarm(a)-require('sched').getTimeToAlarm(b))
    .sort((a,b)=>getAlarmOrder(a)-getAlarmOrder(b))
      .map(a => ({
        name: null,
        hasRange: true,
        get: () => ({ text: getAlarmText(a), img: getAlarmIcon(a),
          v: getAlarmValue(a), min:0, max:getAlarmMax(a)}),
        show: function() {
          var tmp = getRefreshIntervals(a);
          var interval = tmp[0];
          var switchTimeout = tmp[1];
          if(!interval) return;
          this.interval = _doInterval.call(this, interval);
          this.switchTimeout = _doSwitchTimeout.call(this, a, switchTimeout);
        },
        hide: function() {
          if (this.interval) clearInterval(this.interval);
          if (this.switchTimeout) clearTimeout(this.switchTimeout);
          this.interval = undefined;
          this.switchTimeout = undefined;
        },
        run: function() {
          if (a.date) return; // ignore events
          this.hide();
          a.on = !a.on;
          a.last = 0;
          if(a.on && a.timer) require('sched').resetTimer(a);
          this.emit("redraw");
          require('sched').setAlarms(all);
          require('sched').reload(); // schedule/unschedule the alarm
          this.show();
        }
      })),
  };
  return alarmItems;
})
