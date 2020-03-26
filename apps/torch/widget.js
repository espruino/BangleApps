var clickTimes = [];
var CLICK_COUNT = 4; // number of taps
var CLICK_PERIOD = 1; // second

// we don't actually create/draw a widget here at all...

Bangle.on("lcdPower",function(on) {
  // First click (that turns LCD on) isn't given to
  // setWatch, so handle it here
  if (on) clickTimes=[getTime()];
});
setWatch(function(e) {
  while (clickTimes.length>=CLICK_COUNT) clickTimes.shift();
  clickTimes.push(e.time);
  var clickPeriod = e.time-clickTimes[0];
  if (clickTimes.length==CLICK_COUNT && clickPeriod<CLICK_PERIOD)
    load("torch.app.js");
}, BTN3, {repeat:true, edge:"rising"});
