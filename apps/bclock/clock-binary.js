const canvasWidth = 290;
const numberOfColumns = 6;
const drawFullGrid = false;

const colpos = canvasWidth / numberOfColumns - 10;
const binSize = (canvasWidth / numberOfColumns) / 3;

const findBinary = target => {
  return [
    [0, 0, 0, 0],  // 0
    [1, 0, 0, 0],  // 1
    [0, 1, 0, 0],  // 2
    [1, 1, 0, 0],  // 3
    [0, 0, 1, 0],  // 4
    [1, 0, 1, 0],  // 5
    [0, 1, 1, 0],  // 6
    [1, 1, 1, 0],  // 7
    [0, 0, 0, 1],  // 8
    [1, 0, 0, 1],  // 9
  ][target];
};

const getCurrentTime = () => {
  const flattenArray = (array = []) => [].concat.apply([], array);
  const format = number => {
    const numberStr = number.toString();
    return numberStr.length === 1 ? ["0", numberStr] : numberStr.split("");
  };
  const now = new Date();
  return flattenArray([now.getHours(), now.getMinutes(), now.getSeconds()].map(format));
};

let prevFrame = [];
const drawColumn = (position = 0, column = [0, 0, 0, 0]) => {
  const maxDotsPerColumn = [2, 4, 3, 4, 3, 4];

  const columnPos = position * colpos;
  let pos = colpos / 2 + 45;
  const frame = column.reverse();
  const drawDot = fn => g[fn]((columnPos + colpos / 2), pos, binSize);

  for (let i = 0; i < frame.length; i += 1) {
    if (i + maxDotsPerColumn[position] >= 4 || drawFullGrid) {
      if (prevFrame && prevFrame[position] && prevFrame[position][i]) {
        if (frame[i] !== prevFrame[position][i]) {
          // subsequent draw
          g.clearRect((columnPos + colpos / 2) - 15, pos - 15, (columnPos + colpos / 2) + 20, pos + 20);
          if (frame[i]) {
            drawDot('fillCircle');
          } else {
            drawDot('drawCircle');
          }
        }
      } else {
        // First draw
        if (frame[i]) {
          drawDot('fillCircle');
        } else {
          drawDot('drawCircle');
        }
      }
    }
    pos += colpos;
  }
};

const drawClock = () => {
  const data = getCurrentTime().map(findBinary);
  for (let i = 0; i < data.length; i += 1) {
    drawColumn(i, data[i]);
  }
  prevFrame = data;
};

// Themes
const drawTheme = (idx) => () => {
  idx += 1;
  const themes = [
    [[0, 0, 0], [1, 1, 1]],
    [[1, 1, 1], [0, 0, 0]],
    [[0, 0, 0], [1, 0, 0]],
    [[0, 0, 0], [0, 1, 0]],
    [[0, 0, 0], [0, 0, 1]],
  ];
  if (idx >= themes.length) idx = 0;
  const color = themes[idx];
  g.setBgColor.apply(g, color[0]);
  g.setColor.apply(g, color[1]);
  g.clear();
};

const nextTheme = drawTheme(0);
setWatch(() => {
  prevFrame = [];
  Bangle.beep();
  nextTheme();
}, BTN1, { repeat: true });

Bangle.on('lcdPower', on => {
  if (on) drawClock();
});

// Show launcher when button pressed
Bangle.setUI("clock");

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
setInterval(() => { drawClock(); }, 1000);
drawClock();

