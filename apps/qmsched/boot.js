// apply Quiet Mode schedules
(function qm() {
  if (Bangle.qmTimeout) clearTimeout(Bangle.qmTimeout); // so the app can eval() this file to apply changes right away
  delete Bangle.qmTimeout;
  let bSettings = require('Storage').readJSON('setting.json',true)||{};
  const curr = 0|bSettings.quiet;
  delete bSettings;
  if (curr) require("qmsched").applyOptions(curr); // no need to re-apply default options

  let settings = require('Storage').readJSON('qmsched.json',true)||{};
  let scheds = settings.scheds||[];
  if (!scheds.length) {return;}
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
  Bangle.qmTimeout=setTimeout(() => {
    require("qmsched").setMode(mode);
    qm(); // schedule next update
  }, t);
})();
