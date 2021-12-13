//Bangle.setLCDMode("176x176");
Bangle.setLCDTimeout(0);

const H = g.getWidth();
const W = g.getHeight();
let running = true;
let score = 0;
let d;
const gridSize = 29;
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

function drawBackgroundSuccess(){
  g.setColor("#00FFFF");
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
    g.setColor("#FFFFFF");
    g.fillRect(snake.x*tileSize, snake.y*tileSize, snake.x*tileSize+ tileSize, snake.y*tileSize + tileSize);
  
    g.setColor("#0000ff");
    g.fillRect((snake.x*tileSize)+1, (snake.y*tileSize)+2, (snake.x*tileSize)+2, (snake.y*tileSize)+4);
  
      g.setColor("#0000ff");
    g.fillRect((snake.x*tileSize)+tileSize-1, (snake.y*tileSize)+2, (snake.x*tileSize)+tileSize-2, (snake.y*tileSize)+4);

}

function drawScore(){
  g.setColor("#555555");
  g.setFont("Vector20");
  g.setFontAlign(0, 0);
  g.drawString("Score:" + score, W / 2, 10);
}

function gameStart() {
  running = true;
  score = 0;
}

function gameOver() {
  g.clear();
  g.setColor("#000000");
  g.setFont("Vector12");
  g.drawString("GAME OVER!", W / 2, H / 2 - 20);
  g.drawString("Score: " + score, W / 2, H / 2 - 10);
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
    drawBackgroundSuccess();
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

let dDiff = 10;

Bangle.on('drag', function(a) {
  
  if (a.dx > dDiff ) { // right
      if (d !== 'l')
      {
        nextX = 1;
        nextY = 0;
        d = 'r';
      }
  }

  if (a.dx < -dDiff ) { // left
      if (d !== 'r')
      {
        nextX = -1;
        nextY = 0;
        d = 'l';
      }
  }

  if (a.dy < -dDiff) { // Up
  if (d !== 'd') {
    nextX = 0;
    nextY = -1;
    d = 'u';
  }
  }
  

  if (a.dy > dDiff) { // Down
    if (d !== 'u') 
    {
      nextX = 0;
      nextY = 1;
      d = 'd';
    }
  }
  
});




Bangle.on('touch', button => {
  if (!running) {
    gameStart();
  }
});


// render X times per second
const x = 5;
setInterval(draw, 1000 / x);
