(function() {
  var setting = require('Storage').readJSON('hourstrike.json',1)||[];
  var t = new Date();
  var t_min_sec = t.getMinutes()*60+t.getSeconds();
  var wait_msec = setting.interval>0?(setting.interval-t_min_sec%setting.interval)*1000:-1;
  if (wait_msec>0) {
    t.setMilliseconds(t.getMilliseconds()+wait_msec);
    var t_hour = t.getHours();
    if (t_hour<setting.start||t_hour>setting.end) {
      var strike = new Date(t.getTime());
      strike.setHours(setting.start);
      if (t_hour>setting.end) {
        strike.setDate(strike.getDate()+1);
      }
      wait_msec += strike-t;
    }
    setTimeout(function() {load("hourstrike.js");}, wait_msec);
  }
})();
