// check for alarms
(function() {
  var alarms = require('Storage').readJSON('alarm.json',1)||[];
  var time = new Date();
  var active = alarms.filter(a=>a.on&&(a.last!=time.getDate()));
  if (active.length) {
    active = active.sort((a,b)=>a.hr-b.hr);
    var hr = time.getHours()+(time.getMinutes()/60)+(time.getSeconds()/3600);
    if (!require('Storage').read("alarm.js")) {
      console.log("No alarm app!");
      require('Storage').write('alarm.json',"[]")
    } else {
      var t = 3600000*(active[0].hr-hr);
      if (t<1000) t=1000;
      /* execute alarm at the correct time. We avoid execing immediately
      since this code will get called AGAIN when alarm.js is loaded. alarm.js
      will then clearInterval() to get rid of this call so it can proceed
      normally. */
      setTimeout(function() {
        load("alarm.js");
      },t);
    }
  }
})()
