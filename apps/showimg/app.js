g.reset();
g.clear();
g.drawImage(require("Storage").read("showimg.user.img"),0,0);
/*let drawTimeout =*/ setTimeout(function() {
	load();
}, 60000);
setWatch(function() {
	load();
}, BTN, { repeat:false, edge:'falling' });
var savedOptions=Bangle.getOptions();
Bangle.setLCDBrightness(1);
var newOptions={
  lockTimeout:60000,
  backlightTimeout:60000
};
Bangle.setOptions(newOptions);
