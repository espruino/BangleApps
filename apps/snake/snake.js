Bangle.setLCDMode("120x120");

const H = g.getWidth();
const W = g.getHeight();
let running = true;
let score = 0;
let d;
const gridSize = 20;
const tileSize = 6;
let nextX = 0;
let nextY = 0;
const defaultTailSize = 3;
let tailSize = defaultTailSize;
const snakeTrail = [];
const snake = { x: 10, y: 10 };
const apple = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };

function drawBackground(){
  g.setColor("#000000");
  g.fillRect(0, 0, H, W);
}

function drawApple(){
  g.setColor("#FF0000");
  g.fillCircle((apple.x * tileSize) + tileSize/2, (apple.y * tileSize) + tileSize/2, tileSize/2);
}

function drawSnake(){
  g.setColor("#008000");
  for (let i = 0; i < snakeTrail.length; i++) {
    g.fillRect(snakeTrail[i].x * tileSize, snakeTrail[i].y * tileSize, snakeTrail[i].x * tileSize + tileSize, snakeTrail[i].y * tileSize + tileSize);

    //snake bites it's tail
    if (snakeTrail[i].x === snake.x && snakeTrail[i].y === snake.y && tailSize > defaultTailSize) {
      Bangle.buzz(1000);
      gameOver();
    }
  }
}

function drawScore(){
  g.setColor("#FFFFFF");
  g.setFont("6x8");
  g.setFontAlign(0, 0);
  g.drawString("Score:" + score, W / 2, 10);
}

function gameStart() {
  running = true;
  score = 0;
}

function gameOver() {
  g.clear();
  g.setColor("#FFFFFF");
  g.setFont("6x8");
  g.drawString("GAME OVER!", W / 2, H / 2 - 10);
  g.drawString("Tap to Restart", W / 2, H / 2 + 10);
  running = false;
  tailSize = defaultTailSize;
}

function draw() {
  if (!running) {
    return;
  }

  g.clear();

  // move snake in next pos
  snake.x += nextX;
  snake.y += nextY;

  // snake over game world
  if (snake.x < 0) {
    snake.x = gridSize - 1;
  }
  if (snake.x > gridSize - 1) {
    snake.x = 0;
  }

  if (snake.y < 0) {
    snake.y = gridSize - 1;
  }
  if (snake.y > gridSize - 1) {
    snake.y = 0;
  }

  //snake bite apple
  if (snake.x === apple.x && snake.y === apple.y) {
    Bangle.beep(20);
    tailSize++;
    score++;

    apple.x = Math.floor(Math.random() * gridSize);
    apple.y = Math.floor(Math.random() * gridSize);
    drawApple();
  }

  drawBackground();
  drawApple();
  drawSnake();
  drawScore();

  //set snake trail
  snakeTrail.push({ x: snake.x, y: snake.y });
  while (snakeTrail.length > tailSize) {
    snakeTrail.shift();
  }

  g.flip();
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
setWatch(() => {// Pause
  running = !running;
}, BTN2, { repeat: true });

Bangle.on('touch', button => {
  if (!running) {
    gameStart();
  }
});

// render X times per second
const x = 5;
setInterval(draw, 1000 / x);