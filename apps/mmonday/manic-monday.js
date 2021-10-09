// made using https://www.espruino.com/Making+Music
// Manic Monday tone by The Bangles

var s = require('Storage').readJSON('setting.json',1)||{};
/* Normally we'd just use Bangle.beep which works automatically
but because we're going lower level we need to account for the
different pin. */
if (s.beep=="vib") {
  function freq(f) {
    if (f===0) digitalWrite(D13, 0);
    else analogWrite(D13, 0.1, {freq: f});
  }
} else {
  function freq(f) {
    if (f===0) digitalWrite(D18, 0);
    else analogWrite(D18, 0.5, {freq: f});
  }
}


freq(1000);
freq(1500);
freq(0);

var pitches = {
  'G': 207.65,
  'a': 220.00,
  'b': 246.94,
  'c': 261.63,
  'd': 293.66,
  'e': 329.63,
  'f': 369.99,
  'g': 392.00,
  'A': 440.00,
  'B': 493.88,
  'C': 523.25,
  'D': 587.33,
  'E': 659.26,
  'F': 698.46
};

function step() {
  var ch = tune[pos];
  if (ch !== undefined) pos++;
  if (ch in pitches) freq(pitches[ch]);
  else freq(0); // off
}

var tune = "aggffefed";
var pos = 0;

setWatch(() => {
  pos = 0;
  var playing = setInterval(step, 500);
  if(playing === 0) clearInterval(playing);
}, BTN1);

E.showMessage('BTN1 to start', 'Manic Monday');
