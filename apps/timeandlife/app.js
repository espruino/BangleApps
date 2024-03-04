// Globals
const STEP_TIMEOUT = 1000;
const PAUSE_TIME = 3000;

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
let data = new Uint8Array(484);
let nextData = new Uint8Array(484);

let palette = new Uint16Array(256); // palette for rendering data
palette[0] = g.theme.bg;
palette[1] = g.theme.fg;

let lastPaused = new Date();

// Conway's game of life
// if < 2 neighbours, set off
// if 2 or 3 neighbours, set on
// if > 3 neighbours, set off
/*const updateStateC = E.compiledC(`
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
`);*/
// precompiled - taken from file downloaded from Bangle.js storage after
// Web IDE upload
const updateStateC=function(a){return a=atob('ACLwtU/08nMBJxZGAvLNFQL1536V+/P0A/sUVJ778/UD+xXlAvLPHhD4BMBEXZ778/UD+xXlZERFXQLy4x4sRJ778/UD+xXlAvLlHkVdLESe+/P1A/sV5QLy+R5FXSxEnvvz9QP7FeUC9f1+RV0sRJ778/UD+xXlAvL7HkVdLESe+/P1A/sV5UVdLEQCPAIsNL88RjRGjFQBMrL18n+10fC9AAA='),{run:E.nativeCall(1,'void(int, int)',a)}}();

function draw() {
  g.drawImage({
    width:22, height:22, bpp: 8,
    palette : palette, // ideally we'd just have BPP 1 and would render direct but it makes the code tricky
    buffer : data.buffer,
  },0,0,{scale:8});
}

const step = () => {
  if (new Date() - lastPaused < PAUSE_TIME) {
    return;
  }
  const dataAddr = E.getAddressOf(data, true);
  const nextDataAddr = E.getAddressOf(nextData, true);
  updateStateC.run(dataAddr, nextDataAddr);
  draw();
  data.set(nextData);
};

const setPixel = (i, j) => {
  data[i * 22 + j] = 1;
  nextData[i * 22 + j] = 1;
};

const setNum = (character, i, j) => {
  const startJ = j;
  character.forEach(row => {
    j = startJ;
    row.forEach(pixel => {
      if (pixel) setPixel(i, j);
      j++;
    });
    i++;
  });
};

const setDots = () => {
  setPixel(10, 10);
  setPixel(12, 10);
};

const drawTime = () => {
  lastPaused = new Date();
  g.clear();
  data.fill(0);
  const d = new Date();
  const hourTens = Math.floor(d.getHours() / 10);
  const hourOnes = d.getHours() % 10;
  const minuteTens = Math.floor(d.getMinutes() / 10);
  const minuteOnes = d.getMinutes() % 10;
  setNum(NUMBERS[hourTens], 8, 1);
  setNum(NUMBERS[hourOnes], 8, 6);
  setDots();
  setNum(NUMBERS[minuteTens], 8, 13);
  setNum(NUMBERS[minuteOnes], 8, 18);
  draw();
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
