(function() {
  function setup () {
    var settings = require('Storage').readJSON('hourstrike.json',1);
    var t = new Date();
    var t_min_sec = t.getMinutes()*60+t.getSeconds();
    var wait_msec = settings.interval>0?(settings.interval-t_min_sec%settings.interval)*1000:-1;
    if (wait_msec>0) {
      t.setMilliseconds(t.getMilliseconds()+wait_msec);
      var t_hour = t.getHours();
      if (t_hour<settings.start||t_hour>settings.end) {
        var strike = new Date(t.getTime());
        strike.setHours(settings.start);
        strike.setMinutes(0);
        if (t_hour>settings.end) {
          strike.setDate(strike.getDate()+1);
        }
        wait_msec += strike-t;
        settings.next_hour = strike.getHours();
        settings.next_minute = strike.getMinutes();
      } else {
        settings.next_hour = t_hour;
        settings.next_minute = t.getMinutes();
      }
      setTimeout(strike_func, wait_msec);
    } else {
      settings.next_hour = -1;
      settings.next_minute = -1;
    }
    require('Storage').write('hourstrike.json', settings);
  }
  function strike_func () {
    var setting = require('Storage').readJSON('hourstrike.json',1)||[];
    if (0 == setting.buzzOrBeep) {
      if (2 == setting.scount) {
        Bangle.buzz(200, setting.vlevel||0.5)
          .then(() => new Promise(resolve => setTimeout(resolve,200)))
          .then(() => Bangle.buzz(200, setting.vlevel||0.5));
      } else {
        Bangle.buzz(200, setting.vlevel||0.5);
      }
    } else {
      if (2 == setting.scount) {
        Bangle.beep(200)
          .then(() => new Promise(resolve => setTimeout(resolve,100)))
          .then(() => Bangle.beep(300));
      } else {
        Bangle.beep(200);
      }
    }
    setup();
  }
  setup();
})();
