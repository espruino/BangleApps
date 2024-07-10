// Teach a user the NATO Phonetic Alphabet + numbers
// Based on the Morse Code app

const FONT_NAME = 'Vector12';
const FONT_SIZE = 80;
const SCREEN_PIXELS = 240;
//const UNIT = 100;
const NATO_MAP = {
  A: 'ALFA',
  B: 'BRAVO',
  C: 'CHARLIE',
  D: 'DELTA',
  E: 'ECHO',
  F: 'FOXTROT',
  G: 'GOLF',
  H: 'HOTEL',
  I: 'INDIA',
  J: 'JULIETT',
  K: 'KILO',
  L: 'LIMA',
  M: 'MIKE',
  N: 'NOVEMBER',
  O: 'OSCAR',
  P: 'PAPA',
  Q: 'QUEBEC',
  R: 'ROMEO',
  S: 'SIERRA',
  T: 'TANGO',
  U: 'UNIFORM',
  V: 'VICTOR',
  W: 'WHISKEY',
  X: 'X-RAY',
  Y: 'YANKEE',
  Z: 'ZULU',
  '0': 'ZE-RO',
  '1': 'WUN',
  '2': 'TOO',
  '3': 'TREE',
  '4': 'FOW-ER',
  '5': 'FIFE',
  '6': 'SIX',
  '7': 'SEV-EN',
  '8': 'AIT',
  '9': 'NIN-ER',
};

let INDEX = 0;
let showLetter = true;

const writeText = (txt) => {
  g.clear();
  g.setFont(FONT_NAME, FONT_SIZE);

  var width = g.stringWidth(txt);

  // Fit text to screen
  var fontFix = FONT_SIZE;
  while(width > SCREEN_PIXELS-10){
    fontFix--;
    g.setFont(FONT_NAME, fontFix);
    width = g.stringWidth(txt);
  }
  g.drawString(txt, (SCREEN_PIXELS / 2) - (width / 2), SCREEN_PIXELS / 2);
};
const writeLetter = () => {
  writeText(Object.keys(NATO_MAP)[INDEX]);
};
const writeCode = () => {
  writeText(NATO_MAP[Object.keys(NATO_MAP)[INDEX]]);
};
const toggle = () => {
  showLetter = !showLetter;
  if(showLetter){
    writeLetter();
  }else {
    writeCode();
  }
};

// Bootstrapping

g.clear();
g.setFont(FONT_NAME, FONT_SIZE);
g.setColor(0, 1, 0);
g.setFontAlign(-1, 0, 0);


const step = (positive) => () => {
  if (positive) {
    INDEX = INDEX + 1;
    if (INDEX > Object.keys(NATO_MAP).length - 1) INDEX = 0;
  } else {
    INDEX = INDEX - 1;
    if (INDEX < 0) INDEX = Object.keys(NATO_MAP).length - 1;
  }
  showLetter = true; // for toggle()
  writeLetter();
};

writeLetter();

// Press the middle button to see the NATO Phonetic wording
setWatch(toggle, BTN2, { repeat: true });
// Allow user to switch between letters
setWatch(step(true), BTN1, { repeat: true });
setWatch(step(false), BTN3, { repeat: true });
