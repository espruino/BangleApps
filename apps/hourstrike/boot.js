(function() {
  var setting = require('Storage').readJSON('hourstrike.json',1)||[];
  if (setting.on_hour || setting.on_harlf_hour) {
    var cur = new Date();
    var cur_hour = cur.getHours();
    if (setting.start_hour<=cur_hour&&cur_hour<=setting.end_hour) {
      var cur_sec = cur.getMinutes()*60+cur.getSeconds();
      var notify_on = [1800, 3600];
      var t=cur_sec<notify_on[0]?notify_on[0]-cur_sec:notify_on[1]-cur_sec;
      var notify_func = function() {
        Bangle.buzz(100, 0.5)
          .then(() => new Promise(resolve => setTimeout(resolve,200)))
          .then(() => Bangle.buzz(100, 0.5));
      };
      if (t>0) {
        setTimeout(notify_func, t*1000);
        setTimeout(load, t*1000 + 600);
      }
    }
  }
})();