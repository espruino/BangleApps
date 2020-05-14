var tStart = Date.now();
var cindex=0;  // index to iterate through colous
var bpm=60;  // ininital bpm value
var time_diffs = [1000, 1000, 1000];  //array to calculate mean bpm
var tindex=0;  //index to iterate through time_diffs

Bangle.setLCDTimeout(undefined);  //do not deaktivate display while running this app

function changecolor() {
  const maxColors = 2;
  const colors = {
        0: { value: 0xFFFF, name: "White" },
     //  1: { value: 0x000F, name: "Navy" },
     //   2: { value: 0x03E0, name: "DarkGreen" },
     //   3: { value: 0x03EF, name: "DarkCyan" },
     //   4: { value: 0x7800, name: "Maroon" },
     //   5: { value: 0x780F, name: "Purple" },
     //   6: { value: 0x7BE0, name: "Olive" },
     //   7: { value: 0xC618, name: "LightGray" },
     //   8: { value: 0x7BEF, name: "DarkGrey" },
     //   9: { value: 0x001F, name: "Blue" },
     //   10: { value: 0x07E0, name: "Green" },
     //   11: { value: 0x07FF, name: "Cyan" },
        1: { value: 0xF800, name: "Red" },
     //   13: { value: 0xF81F, name: "Magenta" },
     //   14: { value: 0xFFE0, name: "Yellow" },
     //   15: { value: 0xFFFF, name: "White" },
     //   16: { value: 0xFD20, name: "Orange" },
     //   17: { value: 0xAFE5, name: "GreenYellow" },
     //   18: { value: 0xF81F, name: "Pink" },
    };
    g.setColor(colors[cindex].value);
    if (cindex == maxColors-1) {
      cindex = 0;
    }
    else {
    cindex += 1;
    }
    return cindex;
}

function updateScreen() {
  g.clearRect(0, 50, 250, 150);
  changecolor();
  Bangle.buzz(50, 0.75);
  g.setFont("Vector",48);
  g.drawString(Math.floor(bpm)+"bpm", 5, 60);
}

Bangle.on('touch', function(button) {
// setting bpm by tapping the screen. Uses the mean time difference between several tappings.
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
    for(count = 0; count < time_diffs.length; count++) {
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
});

// enable bpm finetuning via buttons.
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

interval = setInterval(updateScreen, 60000 / bpm);

g.clear();
g.drawString('Touch the screen to set tempo.\nUse BTN1 to increase, and\nBTN3 to decrease bpm value by 1.', 15, 150);

Bangle.loadWidgets();
Bangle.drawWidgets();
