(function() {
  var setting = require('Storage').readJSON('hourstrike.json',1)||[];
  var notify_on = [];

  if (setting.on_hour || setting.on_harlf_hour) {
    var cur = new Date();
    var cur_hour = cur.getHours(), cur_sec = cur.getMinutes()*60+cur.getSeconds();
    var notify_on = [1800, 3600];
    var notify_func = function() {
        Bangle.buzz(200, 0.5)
            .then(() => new Promise(resolve => setTimeout(resolve,200)))
            .then(() => Bangle.buzz(200, 0.5));
    };
    var wait_sec = -1, notify_hour = cur_hour;
    if (cur_sec<notify_on[0]) {
      wait_sec = notify_on[0]-cur_sec;
    } else if (cur_sec<notify_on[1]) {
      wait_sec = notify_on[1]-cur_sec;
      notify_hour += 1;
    }
    if (wait_sec>0) {
      if (setting.start_hour<=notify_hour&&notify_hour<=setting.end_hour) {
        setTimeout(notify_func, wait_sec*1000);
        setTimeout(load, wait_sec*1000 + 800);
      } else {
        setTimeout(load, t*1000 + 800);
      }
  }
})();
