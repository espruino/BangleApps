<<<<<<< HEAD
/* jshint esversion: 6 */
(() => {
  const CBS = 0x41f, CBC = 0x07E0;
  var batS = require("heatshrink").decompress(atob("j0TwIHEv///kD////EfAYPwuEAgPB4EAg/HCgMfzgDBvwOC/IOC84ONDoUcFgc/AYOAHYRDE"));
  var xo = 6, xl = 22, yo = 9, h = 17;

  function draw() {
    g.reset().setColor(CBS).drawImage(batS, this.x + 1, this.y + 4);
    g.setColor(0).fillRect(this.x + xo, this.y + yo, this.x + xl, this.y + h);
    var cbc = (Bangle.isCharging()) ? CBC : CBS;
    g.setColor(cbc).fillRect(this.x + xo, this.y + yo, this.x + (xl - xo) / 100 * E.getBattery() + xo, this.y + h);
  }
  Bangle.on('charging', function(charging) {
    if (charging) Bangle.buzz();
    Bangle.drawWidgets();
  });
  WIDGETS["widtbat"] = { area:"tr", width:32, draw: draw };
})();
=======
/* jshint esversion: 6 */
(() => {
  const CBS = 0x41f, CBC = 0x07E0;
  var xo = 6, xl = 22, yo = 9, h = 17;

  function draw() {
    g.reset().setColor(CBS).drawImage(require("heatshrink").decompress(atob("j0TwIHEv///kD////EfAYPwuEAgPB4EAg/HCgMfzgDBvwOC/IOC84ONDoUcFgc/AYOAHYRDE")), this.x + 1, this.y + 4);
    g.setColor(0).fillRect(this.x + xo, this.y + yo, this.x + xl, this.y + h);
    var cbc = (Bangle.isCharging()) ? CBC : CBS;
    g.setColor(cbc).fillRect(this.x + xo, this.y + yo, this.x + (xl - xo) / 100 * E.getBattery() + xo, this.y + h);
  }
  Bangle.on('charging', function(charging) {
    if (charging) Bangle.buzz();
    Bangle.drawWidgets();
  });
  WIDGETS["widtbat"] = { area:"tr", width:32, draw: draw };
})();
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
