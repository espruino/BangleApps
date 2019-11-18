Bangle.setLCDMode("doublebuffered");

const storage = require("Storage");

var BTN_L = BTN1;
var BTN_R = BTN3;
var BTN_ROT = BTN2;
var BTN_DOWN = BTN5;
var BTN_PAUSE = BTN4;

const W = g.getWidth();
const H = g.getHeight();
const CX = W / 2;
const CY = H / 2;

const HEIGHT_BUFFER = 4;

const LINES = 20;
const COLUMNS = 11;
const CELL_SIZE = Math.floor((H - HEIGHT_BUFFER) / (LINES + 1));

const BOARD_X = Math.floor((W - CELL_SIZE * COLUMNS) / 2) + 2;
const BOARD_Y = Math.floor((H - CELL_SIZE * (LINES + 1)) / 2);
const BOARD_W = COLUMNS * CELL_SIZE;
const BOARD_H = LINES * CELL_SIZE;

const TEXT_X = BOARD_X + BOARD_W + 10;

const BLOCKS = [
  [
    [2, 7],
    [2, 6, 2],
    [0, 7, 2],
    [2, 3, 2]
  ],
  [
    [1, 3, 2],
    [6, 3]
  ],
  [
    [2, 3, 1],
    [3, 6]
  ],
  [
    [2, 2, 6],
    [0, 7, 1],
    [3, 2, 2],
    [4, 7]
  ],
  [
    [2, 2, 3],
    [1, 7],
    [6, 2, 2],
    [0, 7, 4]
  ],
  [
    [2, 2, 2, 2],
    [0, 15]
  ],
  [[3, 3]]
];

const COLOR_WHITE = 0b1111111111111111;
const COLOR_BLACK = 0b0000000000000000;

const BLOCK_COLORS = [
  //0brrrrrggggggbbbbb
  0b0111100000001111,
  0b0000011111100000,
  0b1111100000000011,
  0b0111100111100000,
  0b0000000000011111,
  0b0000001111111111,
  0b1111111111100000
];

const EMPTY_LINE = 0b00000000000000;
const BOUNDARY = 0b10000000000010;
const FULL_LINE = 0b01111111111100;

let gameOver = false;
let paused = false;
let currentBlock = 0;
let nextBlock = 0;
let x, y;
let points;
let level;
let lines;
let board;
let rotation = 0;
let ticker = null;
let needDraw = true;
let highScore = parseInt(storage.read(".trishig") || 0, 10);

function getBlock(a, c, d) {
  const block = BLOCKS[a % 7];
  return block[(a + c) % block.length];
}

function drawBlock(block, screenX, screenY, x, y) {
  for (let row in block) {
    let mask = block[row];
    for (let col = 0; mask; mask >>= 1, col++) {
      if (mask % 2) {
        const dx = screenX + (x + col) * CELL_SIZE;
        const dy = screenY + (y + row) * CELL_SIZE;
        g.fillRect(dx, dy, dx + CELL_SIZE - 3, dy + CELL_SIZE - 3);
      }
    }
  }
}

function drawBoard() {
  g.setColor(COLOR_WHITE);
  g.drawRect(BOARD_X - 3, BOARD_Y - 3, BOARD_X + BOARD_W, BOARD_Y + BOARD_H);
  drawBlock(board, BOARD_X, BOARD_Y, -2, 0);

  g.setColor(BLOCK_COLORS[currentBlock]);
  drawBlock(getBlock(currentBlock, rotation), BOARD_X, BOARD_Y, x - 2, y);
}

function drawNextBlock() {
  g.setFontAlign(0, -1, 0);
  g.setColor(COLOR_WHITE);
  g.drawString("NEXT BLOCK", BOARD_X / 2, 10);
  g.setColor(BLOCK_COLORS[nextBlock]);
  drawBlock(getBlock(nextBlock, 0), BOARD_X / 2 - 2 * CELL_SIZE, 25, 0, 0);
}

function drawTextLine(text, line) {
  g.drawString(text, TEXT_X, 10 + line * 15);
}

function drawGameState() {
  g.setFontAlign(-1, -1, 0);
  g.setColor(COLOR_WHITE);
  let ln = 0;
  drawTextLine("CLOCK-TRIS", ln++);
  ln++;
  drawTextLine("LVL " + level, ln++);
  drawTextLine("LNS " + lines, ln++);
  drawTextLine("PTS " + points, ln++);
  drawTextLine("TOP " + highScore, ln++);
}

function drawBanner(text) {
  g.setFontAlign(0, 0, 0);
  g.setColor(COLOR_BLACK);
  g.fillRect(CX - 46, CY - 11, CX + 46, CY + 9);
  g.setColor(COLOR_WHITE);
  g.drawRect(CX - 45, CY - 10, CX + 45, CY + 8);
  g.drawString(text, CX, CY);
}

function drawPaused() {
  drawBanner("PAUSED");
}

function drawGameOver() {
  drawBanner("GAME OVER");
}

function draw() {
  g.clear();
  g.setFont("6x8");
  drawBoard();
  drawNextBlock();
  drawGameState();
  if (paused) {
    drawPaused();
  }
  if (gameOver) {
    drawGameOver();
  }
  g.flip();
}

function getNextBlock() {
  currentBlock = nextBlock;
  nextBlock = (Math.random() * BLOCKS.length) | 0;
  x = 6;
  y = 0;
  rotation = 0;
}

function landBlock(a) {
  const block = getBlock(currentBlock, rotation);
  for (let row in block) {
    board[y + (row | 0)] |= block[row] << x;
  }

  let clearedLines = 0;
  let keepLine = LINES;
  for (let line = LINES - 1; line >= 0; line--) {
    if (board[line] === FULL_LINE) {
      clearedLines++;
    } else {
      board[--keepLine] = board[line];
    }
  }

  lines += clearedLines;
  if (lines > level * 10) {
    level++;
    setSpeed();
  }

  while (--keepLine > 0) {
    board[keepLine] = EMPTY_LINE;
  }
  if (clearedLines) {
    points += 100 * (1 << (clearedLines - 1));
    needDraw = true;
  }

  getNextBlock();
  if (!checkMove(0, 0, 0)) {
    gameOver = true;
    needDraw = true;
    highScore = Math.max(points, highScore);
    storage.write(".trishig", highScore.toString());
  }
}

function checkMove(dx, dy, rot) {
  if (gameOver) {
    startGame();
    return;
  }
  if (paused) {
    return;
  }
  const block = getBlock(currentBlock, rotation + rot);
  for (const row in block) {
    const movedBlockRow = block[row] << (x + dx);
    if (
      row + y === LINES - 1 ||
      movedBlockRow & board[y + dy + row] ||
      movedBlockRow & BOUNDARY
    ) {
      if (dy) {
        landBlock();
      }
      return false;
    }
  }
  rotation += rot;
  x += dx;
  y += dy;
  needDraw = true;
  return true;
}

function drawLoop() {
  if (needDraw) {
    needDraw = false;
    draw();
  }
  setTimeout(drawLoop, 10);
}

function gameTick() {
  if (!gameOver) {
    checkMove(0, 1, 0);
  }
}

function setSpeed() {
  if (ticker) {
    clearInterval(ticker);
  }
  ticker = setInterval(gameTick, 1000 - level * 100);
}

function togglePause() {
  if (!gameOver) {
    paused = !paused;
    needDraw = true;
  }
}

function startGame() {
  board = [];
  for (let i = 0; i < LINES; i++) {
    board[i] = EMPTY_LINE;
  }

  gameOver = false;
  points = 0;
  lines = 0;
  level = 0;
  getNextBlock();
  setSpeed();
  needDraw = true;
}

function bindButton(btn, dx, dy, r) {
  setWatch(checkMove.bind(null, dx, dy, r), btn, { repeat: true });
}

bindButton(BTN_L, -1, 0, 0);
bindButton(BTN_R, 1, 0, 0);
bindButton(BTN_ROT, 0, 0, 1);
bindButton(BTN_DOWN, 0, 1, 0);

setWatch(togglePause, BTN_PAUSE, { repeat: true });

startGame();
drawLoop();
