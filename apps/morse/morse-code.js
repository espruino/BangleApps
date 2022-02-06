/**
  * Teach a user morse code
*/
/**
 * Constants
*/
const FONT_NAME = 'Vector';
const FONT_SIZE = 80;
const SCREEN_PIXELS = 240;
const UNIT = 100;
const MORSE_MAP = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '0': '-----',
};

/**
 * Set the local state
*/
let INDEX = 0;
let BEEPING = false;
let BUZZING = true;
let UNIT_INDEX = 0;
let UNITS = MORSE_MAP[Object.keys(MORSE_MAP)[INDEX]].split('');
/**
 * Utility functions for writing text, changing state
*/
const writeText = (txt) => {
  g.clear();
  const width = g.stringWidth(txt);
  g.drawString(txt, (SCREEN_PIXELS / 2) - (width / 2), SCREEN_PIXELS / 2);
};
const writeLetter = () => {
  writeText(Object.keys(MORSE_MAP)[INDEX]);
};
const writeCode = () => {
  writeText(MORSE_MAP[Object.keys(MORSE_MAP)[INDEX]]);
};
const setUnits = () => {
  UNITS = MORSE_MAP[Object.keys(MORSE_MAP)[INDEX]].split('');
};
/**
 * Bootstrapping
*/
g.clear();
g.setFont(FONT_NAME, FONT_SIZE);
g.setColor(0, 1, 0);
g.setFontAlign(-1, 0, 0);
/**
 * The length of a dot is one unit
 * The length of a dash is three units
 * The length of a space is one unit
 * The space between letters is three units
 * The space between words is seven units
*/
const beepItOut = () => {
  // If we are starting the beeps, use a timeout for pause of three units
  const wait = UNIT_INDEX === 0 ? UNIT * 3 : 0;
  setTimeout(() => {
    Promise.all([
      Bangle.beep(UNITS[UNIT_INDEX] === '.' ? UNIT : 3 * UNIT),
      // Could make buzz optional or switchable potentially
      BUZZING ? Bangle.buzz(UNITS[UNIT_INDEX] === '.' ? UNIT : 3 * UNIT) : null
    ])
      .then(() => {
        if (UNITS[UNIT_INDEX + 1]) {
          setTimeout(() => {
            UNIT_INDEX++;
            beepItOut();
          }, UNIT);
        } else {
          setTimeout(() => {
            BEEPING = false;
            UNIT_INDEX = 0;
            writeLetter();
          }, 3 * UNIT);
        }
      });
  }, wait);
};
const startBeep = () => {
  if (BEEPING) return;
  else {
    BEEPING = true;
    writeCode();
    beepItOut();
  }
};

const step = (positive) => () => {
  if (BEEPING) return;
  if (positive) {
    INDEX = INDEX + 1;
    if (INDEX > Object.keys(MORSE_MAP).length - 1) INDEX = 0;
  } else {
    INDEX = INDEX - 1;
    if (INDEX < 0) INDEX = Object.keys(MORSE_MAP).length - 1;
  }
  setUnits();
  writeLetter();
};

const toggleBuzzing = () => (BUZZING = !BUZZING);

writeLetter();

// Press the middle button to hear the morse code translation
setWatch(startBeep, BTN2, { repeat: true });
// Allow user to switch between letters
setWatch(step(true), BTN1, { repeat: true });
setWatch(step(false), BTN3, { repeat: true });
// Toggle buzzing/beeping with the touchscreen
setWatch(toggleBuzzing, BTN4, { repeat: true });
setWatch(toggleBuzzing, BTN5, { repeat: true });
