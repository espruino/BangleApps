class BanglejsApp {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.settings = {
      xoffset: 0,
      yoffset: 0,
      };
  }

  load_settings() {
    let settings = require('Storage').readJSON('calibration.json', true) || {active: false};

    // do nothing if the calibration is deactivated
    if (settings.active === true) {
      // cancel the calibration offset 
      Bangle.on('touch', function(button, xy) {
        xy.x += settings.xoffset;
        xy.y += settings.yoffset;
      });
    }
    if (!settings.xoffset) settings.xoffset = 0;
    if (!settings.yoffset) settings.yoffset = 0;

    console.log('loaded settings:');
    console.log(settings);

    return settings;
  }

  save_settings() {
    this.settings.active = true;
    this.settings.reload = false;
    require('Storage').writeJSON('calibration.json', this.settings);

    console.log('saved settings:');
    console.log(this.settings);
  }

  explain() {
    /*
    * TODO:
    * Present how to use the application
    *
    */
  }

  drawTarget() {
    this.x = 16 + Math.floor(Math.random() * (g.getWidth() - 32));
    this.y = 40 + Math.floor(Math.random() * (g.getHeight() - 80));

    g.clearRect(0, 24, g.getWidth(), g.getHeight() - 24);
    g.drawLine(this.x, this.y - 5, this.x, this.y + 5);
    g.drawLine(this.x - 5, this.y, this.x + 5, this.y);
    g.setFont('Vector', 10);
    g.drawString('current offset: ' + this.settings.xoffset + ', ' + this.settings.yoffset, 0, 24);
  }

  setOffset(xy) {
    this.settings.xoffset = Math.round((this.settings.xoffset + (this.x - Math.floor((this.x + xy.x)/2)))/2);
    this.settings.yoffset = Math.round((this.settings.yoffset + (this.y - Math.floor((this.y + xy.y)/2)))/2);
  }
}


E.srand(Date.now());
Bangle.loadWidgets();
Bangle.drawWidgets();

calibration = new BanglejsApp();
calibration.load_settings();

let modes = {
  mode  : 'custom',
  btn   : function(n) {
    calibration.save_settings(this.settings);
    load();
  },
  touch : function(btn, xy) {
    calibration.setOffset(xy);
    calibration.drawTarget();
  },
};
Bangle.setUI(modes);
calibration.drawTarget();
