const SETTINGS_FILE = "torch.json";
let settings;

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'bg': '#FFFFFF', 'color': 'White'};
}

loadSettings();

Bangle.setLCDBrightness(1);
Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
g.reset();
g.setColor(settings.bg);
g.fillRect(0,0,g.getWidth(),g.getHeight());
Bangle.setUI({
  mode : 'custom',
  back : load, // B2: Clicking the hardware button or pressing upper left corner turns off (where red back button would be)
  btn : (n)=>{ // B1: Any button turns off
    if (process.env.HWVERSION==1 && (n==1 || n==2 || n==3)) {
      load();
    }
  },
});
