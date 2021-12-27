// Globals
const X = 176,
  Y = 176; // screen resolution of bangle 2
const STEP_TIMEOUT = 1000;
const PAUSE_TIME = 3000;

// Each of my pixels is an 8x8 square.
const ON = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 0,
  buffer: new Uint8Array([
    0xff,
    0xff,
    0xff,
    0xff,
    0xff,
    0xff,
    0xff,
    0xff,
  ]).buffer,
  state: 1,
};
const OFF = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ]).buffer,
  state: 0,
};

const ONE = [
  [0, 1, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 1],
];
const TWO = [
  [0, 1, 0],
  [1, 0, 1],
  [0, 0, 1],
  [0, 1, 0],
  [1, 0, 0],
  [1, 0, 0],
  [1, 1, 1],
];
const THREE = [
  [0, 1, 0],
  [1, 0, 1],
  [0, 0, 1],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const FOUR = [
  [0, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 0, 1],
  [0, 0, 1],
  [0, 0, 1],
];
const FIVE = [
  [1, 1, 1],
  [1, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const SIX = [
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 0],
  [1, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const SEVEN = [
  [1, 1, 1],
  [1, 0, 1],
  [0, 0, 1],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
];
const EIGHT = [
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const NINE = [
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const ZERO = [
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
];
const NUMBERS = [ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE];

// Arraybuffers to store game state
// 484 8 bit integers that are either 1 or 0 form the 22 x 22 grid
let emptySeed = [];
for (i = 0; i < 484; i++) {
  emptySeed.push(0);
}
let data = E.toUint8Array(emptySeed);
let nextData = E.toUint8Array(emptySeed);
const dataAddr = E.getAddressOf(data, true);
const nextDataAddr = E.getAddressOf(nextData, true);

let lastPaused = new Date();

const forAllElements = fn => {
  let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  numbers.forEach(i => {
    numbers.forEach(j => {
      fn(i, j);
    });
  });
};

// Conway's game of life
// if < 2 neighbours, set off
// if 2 or 3 neighbours, set on
// if > 3 neighbours, set off
const updateStateC = E.compiledC(`
// void run(int, int)
void run(char* n, char* m){
  // n is a pointer to the first byte in data, m is for nextdata
  int count = 0;
  for (int i=0;i<484;i++) {
    // Add 8 neighbours, wrapping around
    count =
      *(n+(i+484-23)%484) +
      *(n+(i+484-22)%484) +
      *(n+(i+484-21)%484) +
      *(n+(i+484-1)%484) +
      *(n+(i+484+1)%484) +
      *(n+(i+484+21)%484) +
      *(n+(i+484+22)%484) +
      *(n+(i+484+23)%484);
    if (count < 2 || count > 3) {
      *(m+i) = 0;
    } else {
      *(m+i) = 1;
    }
  }
}
`);
const copyStateC = E.compiledC(`
// void run(int, int)
void run(char* n, char* m){
  // n is a pointer to the first byte in data, m is for nextdata
  for (int i=0;i<484;i++) {
    *(n+i) = *(m+i);
  }
}
`);

const step = () => {
  if (new Date() - lastPaused < PAUSE_TIME) {
    return;
  }
  let startTime = new Date();
  updateStateC.run(dataAddr, nextDataAddr);
  nextData.forEach((e, i) => {
    if (e && !data[i]) {
      g.drawImage(ON, Math.floor(i / 22) * 8, i % 22 * 8);
    } else if (data[i]) {
      g.drawImage(OFF, Math.floor(i / 22) * 8, i % 22 * 8);
    }
  });
  copyStateC.run(dataAddr, nextDataAddr);
};

const drawPixel = (i, j, value) => {
  g.drawImage(value, j * 8, i * 8);
  data[j * 22 + i] = value.state;
  nextData[j * 22 + i] = value.state;
};

const drawNum = (character, i, j) => {
  const startJ = j;
  character.forEach(row => {
    j = startJ;
    row.forEach(pixel => {
      if (pixel) {
        drawPixel(i, j, ON);
      }
      j++;
    });
    i++;
  });
};

const drawDots = () => {
  drawPixel(10, 10, ON);
  drawPixel(12, 10, ON);
};

const drawTime = () => {
  lastPaused = new Date();
  g.clear();
  data.forEach((el, i) => {
    data[i] = 0;
  });
  const d = new Date();
  const hourTens = Math.floor(d.getHours() / 10);
  const hourOnes = d.getHours() % 10;
  const minuteTens = Math.floor(d.getMinutes() / 10);
  const minuteOnes = d.getMinutes() % 10;
  drawNum(NUMBERS[hourTens], 8, 1);
  drawNum(NUMBERS[hourOnes], 8, 6);
  drawDots();
  drawNum(NUMBERS[minuteTens], 8, 13);
  drawNum(NUMBERS[minuteOnes], 8, 18);
};

const start = () => {
  Bangle.setUI("clock"); // Show launcher when middle button pressed
  g.clear();
  Bangle.setLCDTimeout(20); // backlight/lock timeout in seconds
  let stepInterval = setInterval(step, STEP_TIMEOUT);

  // Handlers
  Bangle.on('touch', drawTime);

  // Sleep mode
  Bangle.on('lock', isLocked => {
    if (stepInterval) {
      clearInterval(stepInterval);
    }
    stepInterval = undefined;
    if (!isLocked) {
      drawTime();
      stepInterval = setInterval(step, STEP_TIMEOUT);
    }
  });

  drawTime();
};

start();
