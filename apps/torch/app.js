{
  const SETTINGS_FILE = "torch.json";
  let settings;

  let loadSettings = function() {
    settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'bg': '#FFFFFF', 'color': 'White'};
  };

  loadSettings();

  let brightnessBackup = require("Storage").readJSON('setting.json').brightness;
  let optionsBackup = Bangle.getOptions();
  Bangle.setLCDBrightness(1);
  Bangle.setLCDPower(1);
  Bangle.setLCDTimeout(0);
  g.reset();
  let themeBackup = g.theme;
  g.setTheme({bg:settings.bg,fg:"#000"});
  g.setColor(settings.bg);
  g.fillRect(0,0,g.getWidth(),g.getHeight());
  Bangle.setUI({
    mode : 'custom',
    back : Bangle.showClock, // B2: SW back button to exit
    btn :  _=>Bangle.showClock(), // B1&2: HW button to exit. 
    remove : ()=>{
      Bangle.setLCDBrightness(brightnessBackup);
      Bangle.setOptions(optionsBackup);
      g.setTheme(themeBackup);
    }
  });
}
