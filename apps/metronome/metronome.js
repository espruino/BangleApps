var tStart = Date.now();
var cindex=0;  // index to iterate through colous
var bpm=60;  // ininital bpm value
var time_diffs = [1000, 1000, 1000];  //array to calculate mean bpm
var tindex=0;  //index to iterate through time_diffs
// set background colour
g.setTheme({bg:"#000"});
Bangle.setLCDTimeout(undefined);  //do not deactivate display while running this app
const storage = require("Storage");
const SETTINGS_FILE = 'metronome.settings.json';

//return setting
function setting(key) {
  //define default settings
  const DEFAULTS = {
    'beatsperbar': 4,
    'buzzintens': 1.0,
  };
  if (!settings) { loadSettings(); }
  return (key in settings) ? settings[key] : DEFAULTS[key];
}

//load settings
let settings;

function loadSettings() {
  settings = storage.readJSON(SETTINGS_FILE, 1) || {};
}

function changecolor() {
  const colors = {
    0: { value: 0xF800, name: "Red" },
    1: { value: 0xFFFF, name: "White" },
    2: { value: 0x9492, name: "gray" },
    3: { value: 0xFFFF, name: "White" },
    4: { value: 0x9492, name: "gray" },
    5: { value: 0xFFFF, name: "White" },
    6: { value: 0x9492, name: "gray" },
    7: { value: 0xFFFF, name: "White" },
  };
  g.setColor(colors[cindex].value);
  if ((process.env.HWVERSION==2 )) {
   g.drawLine(39,0,39,g.getWidth()/3);
   g.drawLine(136,0,136,g.getWidth()/3);
  }
  if (cindex == setting('beatsperbar')-1) {
    cindex = 0;
  }
  else {
    cindex += 1;
  }
  return cindex;
}

function updateScreen() {
  g.reset().clearRect(0, 50, 250, 120);
  changecolor();
  try {
    Bangle.buzz(50, setting('buzzintens'));
  } catch(err) {
  }
  g.setFont("Vector",40).setFontAlign(0,0);
  g.drawString(Math.floor(bpm)+"bpm", g.getWidth()/2,  g.getWidth()/2);
}

//Write user instructuins to screen
function printInstructions() {
 g.clear(1).setFont("4x6");
 g.setColor(-1);  //set color to white
 g.drawString('Drum the beat on the center\nof the screen to set tempo.', 30, g.getWidth()/3*2+15);
 if(process.env.HWVERSION==1) {
   g.drawString('Use BTN1 to increase, and\nBTN3 to decrease bpm value by 1.', 30, g.getWidth()/3*2+30);
 }
 else {
   g.drawString('Touch left part of the screen\nto decrease, or the right site\nto increase bpm value by 1.', 30, g.getWidth()/3*2+30);
 }
}

Bangle.on('touch', function(zone, e) {
// setting bpm by tapping the screen. Uses the mean time difference between several tappings.
  if ((process.env.HWVERSION==2 && e.x > 39 && e.x < 136) || process.env.HWVERSION==1){
      if (tindex < time_diffs.length) {
        if (Date.now()-tStart < 5000) {
          time_diffs[tindex] = Date.now()-tStart;
        }
      } else {
        tindex=0;
        time_diffs[tindex] = Date.now()-tStart;
      }
      tindex += 1;
      mean_time = 0.0;
      for (count = 0; count < time_diffs.length; count++) {
        mean_time += time_diffs[count];
      }
      time_diff = mean_time/count;

      tStart = Date.now();
      clearInterval(time_diff);
      bpm = (60 * 1000/(time_diff));
      updateScreen();
      clearInterval(interval);
      interval = setInterval(updateScreen, 60000 / bpm);
      return bpm;
  }
  else if (e.x < 39) {
    if (bpm > 1) {
    bpm -= 1;
    clearInterval(interval);
    interval = setInterval(updateScreen, 60000 / bpm);
  }
  }
  else if (e.x > 136) {
    if (bpm > 1) {
    bpm += 1;
    clearInterval(interval);
    interval = setInterval(updateScreen, 60000 / bpm);
  }}
});


// enable bpm finetuning
if ((process.env.HWVERSION==1)) {
setWatch(() => {
  bpm += 1;
  clearInterval(interval);
  interval = setInterval(updateScreen, 60000 / bpm);
}, BTN1, {repeat:true});

setWatch(() => {
  if (bpm > 1) {
    bpm -= 1;
    clearInterval(interval);
    interval = setInterval(updateScreen, 60000 / bpm);
  }
}, BTN3, {repeat:true});

}
interval = setInterval(updateScreen, 60000 / bpm);
printInstructions();


Bangle.loadWidgets();
Bangle.drawWidgets();
