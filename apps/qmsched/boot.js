// apply Quiet Mode schedules
(function qm() {
  let scheds = require("Storage").readJSON("qmsched.json", 1) || [];
  if (!scheds.length) { return;}
  const now = new Date(),
    hr = now.getHours()+(now.getMinutes()/60)+(now.getSeconds()/3600); // current (decimal) hour
  scheds.sort((a, b) => a.hr-b.hr);
  const tday = scheds.filter(s => s.hr>hr),  // scheduled for today
    tmor = scheds.filter(s => s.hr<=hr); // scheduled for tomorrow
  const next = tday.length ? tday[0] : tmor[0],
    mode = next.mode;
  let t = 3600000*(next.hr-hr); // timeout in milliseconds
  if (t<0) {t += 86400000;} // scheduled for tomorrow: add a day
  /* update quiet mode at the correct time. */
  setTimeout(() => {
    require("qmsched").setMode(mode);
    qm(); // schedule next update
  }, t);
})();
