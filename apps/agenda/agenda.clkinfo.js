(function() {
  function getPassedSec(date) {
    var now = new Date();
    var passed = (now-date)/1000;
    if(passed<0) return 0;
    return passed;
  }

  /*
   * Returns the array [interval, switchTimeout]
   * `interval` is the refresh rate (hourly or per minute)
   * `switchTimeout` is the time before the refresh rate should change (or expiration)
   */
  function getRefreshIntervals(ev) {
    const threshold = 2 * 60 * 1000; //2 mins
    const slices = 16;
    var now = new Date();
    var passed = now - (ev.timestamp*1000);
    var remaining = (ev.durationInSeconds*1000) - passed;
    if(remaining<0)
      return [];
    if(passed<0) //check once it's started
      return [ 2*-passed, -passed ];
    var slice = Math.round(remaining/slices);
    if(slice < threshold) { //no need to refresh frequently
      return [ threshold, remaining ];
    }
    return [ slice, remaining ];
  }

  function _doInterval(interval) {
    return setTimeout(()=>{
      this.emit("redraw");
      this.interval = setInterval(()=>{
        this.emit("redraw");
      }, interval);
    }, interval);
  }
  function _doSwitchTimeout(ev, switchTimeout) {
    return setTimeout(()=>{
      this.emit("redraw");
      clearInterval(this.interval);
      this.interval = undefined;
      var tmp = getRefreshIntervals(ev);
      var interval = tmp[0];
      var switchTimeout = tmp[1];
      if(!interval) return;
      this.interval = _doInterval.call(this, interval);
      this.switchTimeout = _doSwitchTimeout.call(this, ev, switchTimeout);
    }, switchTimeout);
  }

  var agendaItems = {
      name: "Agenda",
      img: atob("GBiBAAAAAAAAAADGMA///w///wf//wAAAA///w///w///w///x///h///h///j///D///X//+f//8wAABwAADw///w///wf//gAAAA=="),
      dynamic: true,
      items: []
    };
  var locale = require("locale");
  var now = new Date();
  var agenda = require("Storage").readJSON("android.calendar.json")
          .filter(ev=>ev.timestamp + ev.durationInSeconds > now/1000)
          .sort((a,b)=>a.timestamp - b.timestamp);

  agenda.forEach((entry, i) => {

    var title = g.setFont("6x8").wrapString(entry.title,100)[0];
    // All day events are always in UTC and always start at 00:00:00, so we
    // need to "undo" the timezone offsetting to make sure that the day is
    // correct.
    var offset = entry.allDay ? new Date().getTimezoneOffset() * 60 : 0
    var date = new Date((entry.timestamp+offset)*1000);
    var dateStr = locale.date(date).replace(/\d\d\d\d/,"");
    var shortStr = ((date-now) > 86400000 || entry.allDay) ? dateStr : locale.time(date,1);
    var color = "#"+(0x1000000+Number(entry.color)).toString(16).padStart(6,"0");
    dateStr += entry.durationInSeconds < 86400 ? "/ " + locale.time(date,1) : "";
    shortStr = shortStr.trim().replace(" ", "\n");

    agendaItems.items.push({
      name: "Agenda "+i,
      hasRange: true,
      get: () => ({ text: title + "\n" + dateStr,
        img: agendaItems.img, short: shortStr,
        color: color,
        v: getPassedSec(date), min: 0, max: entry.durationInSeconds}),
        show: function() {
          var tmp = getRefreshIntervals(entry);
          var interval = tmp[0];
          var switchTimeout = tmp[1];
          if(!interval) return;
          this.interval = _doInterval.call(this, interval);
          this.switchTimeout = _doSwitchTimeout.call(this, entry, switchTimeout);
        },
        hide: function() {
          if(this.interval)
            clearInterval(this.interval);
          if(this.switchTimeout)
            clearTimeout(this.switchTimeout);
          this.interval = undefined;
          this.switchTimeout = undefined;
        }
    });
  });

  return agendaItems;
})
