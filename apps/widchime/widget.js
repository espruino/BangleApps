(function() {
  // 0: off, 1: buzz, 2: beep, 3: both
  const type = (require("Storage").readJSON("widchime.json", 1) || {type: 1}).type;
  if (!type) return;

  function chime() {
    if ((require("Storage").readJSON("setting.json", 1) || {}).quiet) return;
    if (type&1) Bangle.buzz(100);
    if (type&2) Bangle.beep();
  }

  let lastHour = (new Date()).getHours(); // don't chime when (re)loaded at a whole hour
  function check() {
    const now = new Date(),
      h = now.getHours(), m = now.getMinutes(),
      s = now.getSeconds(), ms = now.getMilliseconds();
    if (h!==lastHour && m===0) chime();
    lastHour = h;
    // check again when this hour is over
    const mLeft = 60-m, sLeft = (mLeft*60)-s, msLeft = (sLeft*1000)-ms;
    setTimeout(check, msLeft);
  }

  check();
})
();
