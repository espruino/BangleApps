let btnLoadTimeout = 1500; //Bangle.getOptions().btnLoadTimeout; // Hardcode value to minimize impact on load time at boot. Change to the commented out code to couple it to the actual system setting in the options object.
let buzzTimeout;
setWatch(function(e) { buzzTimeout = setTimeout(Bangle.buzz, btnLoadTimeout-100, 30, 0.30); }, BTN, {
repeat:true, edge:'rising' });
setWatch(function(e) { if (buzzTimeout) clearTimeout(buzzTimeout); }, BTN, {
repeat:true, edge:'falling' });
