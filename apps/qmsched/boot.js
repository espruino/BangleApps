// apply Quiet Mode schedules
(function qm() {
  let scheds = require("Storage").readJSON("qmsched.json", 1) || [];
  if (!scheds.length) return;
  let next,idx;
  scheds.forEach(function(s, i) {
    if (!next || (s.hr+s.last*24)<(next.hr+next.last*24)) {
      next = s;
      idx = i;
    }
  });
  const now = new Date(),
    hr = now.getHours()+(now.getMinutes()/60)+(now.getSeconds()/3600);
  let t = 3600000*(next.hr-hr);
  if (next.last===now.getDate()) t += 86400000;
  /* update quiet mode at the correct time. */
  setTimeout(function() {
    let scheds = require("Storage").readJSON("qmsched.json", 1) || [];
    require("qmsched").setMode(scheds[idx].mode);
    scheds[idx].last = (new Date()).getDate();
    require("Storage").writeJSON("qmsched.json", scheds);
    qm(); // schedule next update
  }, t);
})();
