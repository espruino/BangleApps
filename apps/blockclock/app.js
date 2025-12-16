var settings = Object.assign({
  beginner: false,
  colour: false,
}, require('Storage').readJSON("blockclock.json", true) || {});

// Gap between digits.
const digitGap = settings.beginner ? 4 : 3;
const blockGap = settings.beginner ? 0 : 3;
// Size of a block ("pixel").
const blockSize = settings.beginner ? 41 : 40;
// Colours.
const colours = {
  normal: ["#000", "#fff"],
  colour: [
    "#000", "#ff0", "#0ff", "#0f0", "#f0f",
  ],
};
// A digit is made-up of four blocks.
// [0][1]
// [2][3]
const digits = [
  [
    // Top left
    [0,0],
    [1 * blockSize, 1 * blockSize]
  ],
  [
    // Top right
    [1 * blockSize + blockGap, 0],
    [2 * blockSize + blockGap, 1 * blockSize]
  ],
  [
    // Bottom left
    [0, 1 * blockSize + blockGap],
    [1 * blockSize, 2 * blockSize + blockGap]
  ],
  [
    // Bottom right
    [1 * blockSize + blockGap, 1 * blockSize + blockGap],
    [2 * blockSize + blockGap, 2 * blockSize + blockGap]
  ]
];
// Top-left of each digit.
const digitGrid = [
  [
    // Hour tens
    digitGap,
    digitGap
  ],
  [
    // Hour units
    2 * digitGap + blockGap + 2 * blockSize,
    digitGap
  ],
  [
    // Minute tens
    digitGap,
    2 * digitGap + blockGap + 2 * blockSize
  ],
  [
    // Minute units
    2 * digitGap + blockGap + 2 * blockSize,
    2 * digitGap + blockGap + 2 * blockSize]
];

// Decimal representation of the digit's binary value.
const numbers = [0, 5, 6, 7, 9, 14, 11, 12, 15, 13];

// Global timer.
let timer = null;

function getArray(num) {
  return num.toString(2).padStart(4, 0).split("").map(Number);
}

function buildBangleClock() {
  // Clear background.
  g.clear(1);
  //Bangle.drawWidgets();
  g.reset();
  // Set background.
  g.setColor("#000");
  g.fillRect(0, 0, g.getWidth(), g.getWidth());

  const time = new Date();
  // Get numbers.
  const clockDigits = getDigits(time);
  for (const idx in clockDigits) {
    buildBangleDigit(~~idx, clockDigits[idx]);
  }

  const t = time.getSeconds()*1000 + time.getMilliseconds();
  timer = setTimeout(buildBangleClock, 60000 - t); // time till next minute
}

function getDigits(time) {
  const hours = `${time.getHours()}`.padStart(2, 0).split("");
  const hourDigit1 = hours[0], hourDigit2 = hours[1];
  const minutes = `${time.getMinutes()}`.padStart(2, 0).split("");
  const minDigit1 = minutes[0], minDigit2 = minutes[1];

  return [
    numbers[~~hourDigit1],
    numbers[~~hourDigit2],
    numbers[~~minDigit1],
    numbers[~~minDigit2]
  ];
}

function buildBangleDigit(pos, number) {
  const digitArray = getArray(number);
  // Draw each of the four blocks.
  for (let block=0; block<4; block++) {
    if (settings.colour) {
      g.setColor(
        digitArray[block]
          ? colours.colour[pos + 1]
          : colours.colour[0]
      );
    } else {
      g.setColor(colours.normal[~~digitArray[block]]);
    }
    g.fillRect(
      digitGrid[pos][0] + digits[block][0][0],
      digitGrid[pos][1] + digits[block][0][1],
      digitGrid[pos][0] + digits[block][1][0],
      digitGrid[pos][1] + digits[block][1][1]
    );
  }
}

Bangle.on("lcdPower", function(on) {
  if (on) {
    buildBangleClock();
  } else {
    if (timer) {
      clearTimeout(timer);
    }
  }
});
Bangle.setUI("clock");
buildBangleClock();
