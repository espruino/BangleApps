class BanglejsApp {
  constructor() {
    this.updateFactor = 0.2;
    this.x = 0;
    this.y = 0;
    this.step = 0;
    this.settings = {
      xoffset: 0,
      yoffset: 0,
      xscale: 1,
      yscale: 1,
      };
  }

  load_settings() {
    let settings = require('Storage').readJSON('calibration.json', true) || {active: false};

    if (!settings.xoffset) settings.xoffset = 0;
    if (!settings.yoffset) settings.yoffset = 0;
    if (!settings.xscale) settings.xscale = 1;
    if (!settings.yscale) settings.yscale = 1;

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
    switch (this.step){
      case 0:
        this.x = Math.floor(0.2 * g.getWidth());
        this.y = Math.floor(0.2 * g.getHeight());
        break;
      case 1:
        this.x = Math.floor(0.8 * g.getWidth());
        this.y = Math.floor(0.2 * g.getHeight());
        break;
      case 2:
        this.x = Math.floor(0.5 * g.getWidth());
        this.y = Math.floor(0.5 * g.getHeight());
        break;
      case 3:
        this.x = Math.floor(0.2 * g.getWidth());
        this.y = Math.floor(0.8 * g.getHeight());
        break;
      case 4:
        this.x = Math.floor(0.8 * g.getWidth());
        this.y = Math.floor(0.8 * g.getHeight());
        break;
    }

    g.setColor(g.theme.fg);
    g.drawLine(this.x, this.y - 5, this.x, this.y + 5);
    g.drawLine(this.x - 5, this.y, this.x + 5, this.y);
    g.setFont('Vector', 10);
    g.drawString('current offset: ' + this.settings.xoffset.toFixed(3) + ', ' + this.settings.yoffset.toFixed(3), 2, 2);
    g.drawString('current scale: ' + this.settings.xscale.toFixed(3) + ', ' + this.settings.yscale.toFixed(3), 2, 12);
  }
  
  setOffset(xy) {
    this.last=xy;
    switch (this.step){
      case 0:
        this.settings.xoffset = this.settings.xoffset * (1-this.updateFactor) + (this.x - xy.x) * this.updateFactor;
        this.settings.yoffset = this.settings.yoffset * (1-this.updateFactor) + (this.y - xy.y) * this.updateFactor;
        break;
      case 1:
        this.settings.xscale = this.settings.xscale * (1-this.updateFactor) + ((xy.x + this.settings.xoffset) / this.x) * this.updateFactor;
        this.settings.yoffset = this.settings.yoffset * (1-this.updateFactor) + (this.y - xy.y) * this.updateFactor;
        break;
      case 3:
        this.settings.xoffset = this.settings.xoffset * (1-this.updateFactor) + (this.x - xy.x) * this.updateFactor;
        this.settings.yscale = this.settings.yscale * (1-this.updateFactor) + ((xy.y + this.settings.yoffset) / this.y) * this.updateFactor;
        break;
      case 2:
      case 4:
        this.settings.xscale = this.settings.xscale * (1-this.updateFactor) + ((xy.x + this.settings.xoffset) / this.x) * this.updateFactor;
        this.settings.yscale = this.settings.yscale * (1-this.updateFactor) + ((xy.y + this.settings.yoffset) / this.y) * this.updateFactor;
        break;
    }
  }
  
  nextStep() {
    this.step++;
    if ( this.step == 5 ) this.step = 0;
  }
}


E.srand(Date.now());

calibration = new BanglejsApp();
calibration.load_settings();
Bangle.disableCalibration = true;

function touchHandler (btn, xy){
  g.clearRect(0, 0, g.getWidth(), g.getHeight());
  if (xy) calibration.setOffset(xy);
  calibration.drawTarget();
  calibration.nextStep();
}

let modes = {
  mode  : 'custom',
  btn   : function(n) {
    calibration.save_settings(this.settings);
    load();
  },
  touch : touchHandler,
};
Bangle.setUI(modes);
touchHandler();
