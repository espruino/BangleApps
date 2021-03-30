(function() {
  var setting = require('Storage').readJSON('hourstrike.json',1)||[];
  var cur = new Date();
  var cur_sec = cur.getMinutes()*60+cur.getSeconds();
  var notify_sec = setting.interval>0?setting.interval-cur_sec%setting.interval:-1;
  if (notify_sec>0) setTimeout(function() {load("hourstrike.js");}, notify_sec*1000);
})();

