(function() {
  var clickTimes = [];
  var clickPattern = "";
  var TAPS = 4; // number of taps
  var PERIOD = 1; // seconds

  // we don't actually create/draw a widget here at all...
  Bangle.on("lcdPower",function(on) {
  // First click (that turns LCD on) isn't given to
  // setWatch, so handle it here
    if (!on) return;
    clickTimes=[getTime()];
    clickPattern="x";
  });
  function tap(e,c) {
    clickPattern = clickPattern.substr(-3)+c;
    while (clickTimes.length>=TAPS) clickTimes.shift();
    clickTimes.push(e.time);
    var clickPeriod = e.time-clickTimes[0];
    if (clickPeriod<PERIOD && clickPattern.match(/.131/)) {
      load("rtorch.app.js");
    }
  }
  setWatch(function(e) { tap(e,"1"); }, BTN1, {repeat:true, edge:"rising"});
  setWatch(function(e) { tap(e,"3"); }, BTN3, {repeat:true, edge:"rising"});
})();
