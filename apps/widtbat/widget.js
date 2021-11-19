Bangle.on('charging', function(charging) {
  if (charging) Bangle.buzz();
  WIDGETS["widtbat"].draw();
});
WIDGETS["widtbat"] = { area:"tr", width:32, draw: function() {
  const xo = 6, xl = 22, yo = 9, h = 17;
  g.reset().setColor("#08f").drawImage(require("heatshrink").decompress(atob("j0TwIHEv///kD////EfAYPwuEAgPB4EAg/HCgMfzgDBvwOC/IOC84ONDoUcFgc/AYOAHYRDE")), this.x + 1, this.y + 4);
  g.clearRect(this.x + xo, this.y + yo, this.x + xl, this.y + h);
  var cbc = (Bangle.isCharging()) ? "#0f0" : "#08f";
  g.setColor(cbc).fillRect(this.x + xo, this.y + yo, this.x + (xl - xo) / 100 * E.getBattery() + xo, this.y + h);
} };
