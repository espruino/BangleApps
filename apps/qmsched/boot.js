(function qm() {
  if (Bangle.qmTimeout) clearTimeout(Bangle.qmTimeout);
  delete Bangle.qmTimeout;
  let bSettings = require('Storage').readJSON('setting.json',true)||{};
  const curr = 0|bSettings.quiet;
  delete bSettings;
  if (curr) require("qmsched").applyOptions(curr);
  let settings = require('Storage').readJSON('qmsched.json',true)||{};
  let scheds = settings.scheds||[];
  if (!scheds.length) {return;}
  const days = 0b1111111;
  const now = new Date();
  const hr = now.getHours()+(now.getMinutes()/60)+(now.getSeconds()/3600);
  scheds.sort((a, b) => a.hr-b.hr);
  let best = null, bestT = Infinity;
  for (let i = 0; i < scheds.length; i++) {
    const s = scheds[i];
    const mask = s.days !== undefined ? s.days : days;
    for (let d = 0; d < 7; d++) {
      const dayBit = 1 << ((now.getDay() + d) % 7);
      if (!(mask & dayBit)) continue;
      let t = 3600000 * (s.hr - hr) + d * 86400000;
      if (t <= 0) continue;
      if (t < bestT) { bestT = t; best = s; }
      break;
    }
  }
  if (!best) {return;}
  Bangle.qmTimeout=setTimeout(() => {
    require("qmsched").setMode(best.mode);
    qm();
  }, bestT);
})();
