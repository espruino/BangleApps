class BanglejsApp {
  constructor() {
    this.maxSamples = 16;
    this.target = {
      xMin: Math.floor(0.1 * g.getWidth()),
      xMax: Math.floor(0.9 * g.getWidth()),
      yMin: Math.floor(0.1 * g.getHeight()),
      yMax: Math.floor(0.9 * g.getHeight()),
    };
    this.x = 0;
    this.y = 0;
    this.step = 0;
    this.settings = {
      xoffset: [0],
      yoffset: [0],
      xMaxActual: [this.target.xMax],
      yMaxActual: [this.target.yMax],
      };
  }

  load_settings() {
    let settings = require('Storage').readJSON('calibration.json', true) || {active: false};

    console.log('loaded settings:');
    console.log(settings);

    return settings;
  }

  getMedian(array){
    array.sort();
    let i = Math.floor(array.length/2);
    if ( array.length % 2 && array.length > 1 ){
        return (array[i]+array[i+1])/2;
    } else {
        return array[i];
    }
  }

  getMedianSettings(){
    let medianSettings = {
      xoffset: this.getMedian(this.settings.xoffset),
      yoffset: this.getMedian(this.settings.yoffset)
    };

    medianSettings.xscale = this.target.xMax / (medianSettings.xoffset + this.getMedian(this.settings.xMaxActual));
    medianSettings.yscale = this.target.yMax / (medianSettings.yoffset + this.getMedian(this.settings.yMaxActual));
    return medianSettings;
  }

  save_settings() {
    let settingsToSave =  this.getMedianSettings();
    settingsToSave.active = true;
    settingsToSave.reload = false;
    require('Storage').writeJSON('calibration.json', settingsToSave);

    console.log('saved settings:', settingsToSave);
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
        this.x = this.target.xMin;
        this.y = this.target.yMin;
        break;
      case 1:
        this.x = this.target.xMax;
        this.y = this.target.yMin;
        break;
      case 2:
        this.x = this.target.xMin;
        this.y = this.target.yMax;
        break;
      case 3:
        this.x = this.target.xMax;
        this.y = this.target.yMax;
        break;
    }

    g.clearRect(0, 0, g.getWidth(), g.getHeight());
    g.setColor(g.theme.fg);
    g.drawLine(this.x, this.y - 5, this.x, this.y + 5);
    g.drawLine(this.x - 5, this.y, this.x + 5, this.y);
    g.setFont('Vector', 10);
    let medianSettings = this.getMedianSettings();
    g.drawString('current offset: ' + medianSettings.xoffset.toFixed(3) + ', ' + medianSettings.yoffset.toFixed(3), 2, (g.getHeight()/2)-6);
    g.drawString('current scale: ' + medianSettings.xscale.toFixed(3) + ', ' + medianSettings.yscale.toFixed(3), 2, (g.getHeight()/2)+6);
  }

  setOffset(xy) {
    switch (this.step){
      case 0:
        this.settings.xoffset.push(this.x - xy.x);
        this.settings.yoffset.push(this.y - xy.y);
        break;
      case 1:
        this.settings.xMaxActual.push(xy.x);
        this.settings.yoffset.push(this.y - xy.y);
        break;
      case 2:
        this.settings.xoffset.push(this.x - xy.x);
        this.settings.yMaxActual.push(xy.y);
        break;
      case 3:
        this.settings.xMaxActual.push(xy.x);
        this.settings.yMaxActual.push(xy.y);
        break;
    }

    for (let c in this.settings){
      if (this.settings[c].length > this.maxSamples) this.settings[c] = this.settings[c].slice(1, this.maxSamples);
    }
  }

  nextStep() {
    this.step++;
    if ( this.step == 4 ) this.step = 0;
  }
}


E.srand(Date.now());

const calibration = new BanglejsApp();
calibration.load_settings();
Bangle.disableCalibration = true;

function touchHandler (btn, xy){
  if (xy) calibration.setOffset(xy);
  calibration.nextStep();
  calibration.drawTarget();
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
calibration.drawTarget();
