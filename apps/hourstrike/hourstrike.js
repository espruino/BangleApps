clearInterval();

var setting = require('Storage').readJSON('hourstrike.json',1)||[];

function notify_func () {
  Bangle.buzz(200, setting.vlevel||0.5)
    .then(() => new Promise(resolve => setTimeout(resolve,200)))
    .then(() => Bangle.buzz(200, setting.vlevel||0.5));
}

notify_func();
setTimeout(load, 800);
