clearInterval();

var setting = require('Storage').readJSON('hourstrike.json',1)||[];
var cur = new Date();
var cur_hour = cur.getHours();
var cur_min = cur.getMinutes();
var cur_sec = cur.getSeconds();

var wait_sec;
if (cur_hour<setting.start) {
  wait_sec = ((setting.start-1-cur_hour)*60+59-cur_min)*60+60-cur_sec;
} else if (cur_hour>setting.end) {
  wait_sec = ((23-cur_hour+setting.start)*60+59-cur_min)*60+60-cur_sec;
} else {
  wait_sec = 0;
}

console.log(wait_sec);

var notify_func = function () {
  Bangle.buzz(200, 0.5)
    .then(() => new Promise(resolve => setTimeout(resolve,200)))
    .then(() => Bangle.buzz(200, 0.5));
};

setTimeout(notify_func, wait_sec*1000);
setTimeout(load, wait_sec*1000+800);
