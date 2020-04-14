const H = g.getWidth();
const W = g.getHeight();
let running = true;
let score = 0;
let d;

// game world
const gridSize = 40;
const tileSize = 6;
let nextX = 0;
let nextY = 0;

// snake
const defaultTailSize = 3;
let tailSize = defaultTailSize;
const snakeTrail = [];
let snakeX = 10;
let snakeY = 10;

// apple
let appleX = Math.floor(Math.random() * gridSize);
let appleY = Math.floor(Math.random() * gridSize);

function gameStart() {
  running = true;
  score = 0;
}

function gameStop() {
  g.clear();
  g.setColor("#FFFFFF");
  g.setFont("6x8", 2);
  g.drawString("GAME OVER!", W / 2, H / 2 - 20);
  g.drawString("Tap to Restart", W / 2, H / 2 + 20);
  running = false;
  tailSize = defaultTailSize;
}

function draw() {
  if (!running) {
    return;
  }

  // move snake in next pos
  snakeX += nextX;
  snakeY += nextY;

  // snake over game world?
  if (snakeX < 0) {
    snakeX = gridSize - 1;
  }

  if (snakeX > gridSize - 1) {
    snakeX = 0;
  }

  if (snakeY < 0) {
    snakeY = gridSize - 1;
  }
  if (snakeY > gridSize - 1) {
    snakeY = 0;
  }

  //snake bite apple?
  if (snakeX === appleX && snakeY === appleY) {
    tailSize++;
    score++;

    appleX = Math.floor(Math.random() * gridSize);
    appleY = Math.floor(Math.random() * gridSize);
  }

  //paint background
  g.setColor("#000000");
  g.fillRect(0, 0, H, W);

  // paint snake
  g.setColor("#008000");

  for (let i = 0; i < snakeTrail.length; i++) {
    g.fillRect(snakeTrail[i].x * tileSize, snakeTrail[i].y * tileSize, snakeTrail[i].x * tileSize + tileSize, snakeTrail[i].y * tileSize + tileSize);

    //snake bites it's tail?
    if (snakeTrail[i].x === snakeX && snakeTrail[i].y === snakeY && tailSize > defaultTailSize) {
      gameStop();
    }
  }

  // paint apple
  g.setColor("#FF0000");
  g.fillRect(appleX * tileSize, appleY * tileSize, appleX * tileSize + tileSize, appleY * tileSize + tileSize);

  // paint score
  g.setColor("#FFFFFF");
  g.setFont("6x8");
  g.setFontAlign(0, 0);
  g.drawString("Score:" + score, W / 2, 10);

  //set snake trail
  snakeTrail.push({ x: snakeX, y: snakeY });
  while (snakeTrail.length > tailSize) {
    snakeTrail.shift();
  }
}

// input
setWatch(() => {// Up
  if (d !== 'd') {
    nextX = 0;
    nextY = -1;
    d = 'u';
  }
}, BTN1, { repeat: true });
setWatch(() => {// Down
  if (d !== 'u') {
    nextX = 0;
    nextY = 1;
    d = 'd';
  }
}, BTN3, { repeat: true });
setWatch(() => {// Left
  if (d !== 'r') {
    nextX = -1;
    nextY = 0;
    d = 'l';
  }
}, BTN4, { repeat: true });
setWatch(() => {// Right
  if (d !== 'l') {
    nextX = 1;
    nextY = 0;
    d = 'r';
  }
}, BTN5, { repeat: true });

Bangle.on('touch', button => {
  if (!running) {
    gameStart();
  }
});

// render X times per second
var x = 5;
setInterval(draw, 1000 / x);