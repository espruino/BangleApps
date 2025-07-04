(function () {
  const BALL_RADIUS = 3;
  const PADDLE_WIDTH = 26;
  const PADDLE_HEIGHT = 6;
  const BRICK_ROWS = 2;
  const BRICK_HEIGHT = 8;
  const BRICK_PADDING = 4;
  const BRICK_OFFSET_TOP = 40;
  const BRICK_OFFSET_LEFT = 2;
  const SPEED_MULTIPLIER = 1.1;
  const PADDLE_SPEED = 12;

  let ball, paddle, interval;
  let bricks = [];
  let BRICK_WIDTH, BRICK_COLS;
  let paddleIntervalLeft, paddleIntervalRight;
  let score = 0;
  let level = 1;
  let highScore = 0;
  let paused = false;
  let gameOver = false;
  let lives = 3;

  const storage = require("Storage");
  //const BEEP = () => Bangle.buzz(100);

  function loadHighScore() {
    const saved = storage.readJSON("breakout_highscore.json", 1);
    highScore = saved && saved.highScore ? saved.highScore : 0;
  }

  function saveHighScore() {
    if (score > highScore) {
      highScore = score;
      storage.writeJSON("breakout_highscore.json", { highScore });
    }
  }

  function initBricks() {
    bricks = []; // Reset the array completely
let brickCount = 0;
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        let brickX = BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING);
        let brickY = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING);
if (brickCount++ > 20) return;
        bricks.push({ x: brickX, y: brickY, status: 1 });
      }
    }
  }

  function showGetReady(callback) {
    g.clear();
    g.setFont("6x8", 2);
    g.setFontAlign(0, 0);
    g.setColor(1, 1, 0);
    g.drawString("GET READY!", g.getWidth() / 2, g.getHeight() / 2);
    g.flip();
    setTimeout(callback, 1500); // wait 1.5 seconds then start
  }

  function initGame() {
    const screenWidth = g.getWidth();
    BRICK_COLS = Math.min(5, Math.floor((screenWidth - BRICK_OFFSET_LEFT + BRICK_PADDING) / (15 + BRICK_PADDING)));
    BRICK_WIDTH = Math.floor((screenWidth - BRICK_OFFSET_LEFT - (BRICK_COLS - 1) * BRICK_PADDING) / BRICK_COLS);

    ball = {
      x: screenWidth / 2,
      y: g.getHeight() - 20,
      dx: 3,
      dy: -3,
      radius: BALL_RADIUS
    };

    paddle = {
      x: screenWidth / 2 - PADDLE_WIDTH / 2,
      y: g.getHeight() - 10,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT
    };
    lives = 3;
    score = 0;
    level = 1;
    gameOver = false;
    paused = false;
    loadHighScore();
    initBricks();
  }

  function drawLives() {
    const heartSize = 6;
    const spacing = 2;
    const startX = g.getWidth() - (lives * (heartSize + spacing)) - 2;
    const y = 12;

    g.setColor(1, 0, 0); // red

    for (let i = 0; i < lives; i++) {
      const x = startX + i * (heartSize + spacing);
      g.fillPoly([
        x + 3, y,
        x + 6, y + 3,
        x + 3, y + 6,
        x, y + 3
      ], true);
    }
  }

  function drawBricks() {
    g.setColor(0, 1, 0);
    for (let i = 0; i < bricks.length; i++) {
      let b = bricks[i];
      if (b.status) {
        g.fillRect(b.x, b.y, b.x + BRICK_WIDTH, b.y + BRICK_HEIGHT);
      }
    }
  }

  function drawBall() {
    g.setColor(1, 1, 1);
    g.fillCircle(ball.x, ball.y, ball.radius);
    g.setColor(0.7, 0.7, 0.7);
    g.fillCircle(ball.x - 0.5, ball.y - 0.5, ball.radius - 1);
  }

  function drawPaddle() {
    g.setColor(0,1, 1);
    g.fillRect(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y + paddle.height);
  }

  function drawHUD() {
    g.setColor(1, 1, 1);
    g.setFont("6x8", 1);
    g.setFontAlign(-1, -1);
    g.drawString("Score: " + score, 2, 2);
    g.setFontAlign(0, -1);
    g.drawString("High: " + highScore, g.getWidth() / 2, 2);
    g.setFontAlign(1, -1);
    g.drawString("Lvl: " + level, g.getWidth() - 2, 2);
    drawLives();
    if (paused) {
      g.setFontAlign(0, 0);
      g.drawString("PAUSED", g.getWidth() / 2, g.getHeight() / 2);
    }
  }

  function draw() {
    g.clear();
    drawBricks();
    drawBall();
    drawPaddle();
    drawHUD();
    g.flip();
  }

  function showGameOver() {
    g.clear();
    g.setFont("6x8", 2);
    g.setFontAlign(0, 0);
    g.setColor(1, 0, 0);
    g.drawString("GAME OVER", g.getWidth() / 2, g.getHeight() / 2 - 20);
    g.setFont("6x8", 1);
    g.setColor(1, 1, 1);
    g.drawString("Score: " + score, g.getWidth() / 2, g.getHeight() / 2);
    g.drawString("High: " + highScore, g.getWidth() / 2, g.getHeight() / 2 + 12);
    g.drawString("BTN2 = Restart", g.getWidth() / 2, g.getHeight() / 2 + 28);
    g.flip();
  }

  function collisionDetection() {
    for (let i = 0; i < bricks.length; i++) {
      let b = bricks[i];
      if (b.status) {
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + BRICK_WIDTH &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + BRICK_HEIGHT
        ) {
          ball.dy = -ball.dy;
          b.status = 0;
          score += 10;
          break;
        }
      }
    }
  }


  function allBricksCleared() {
    for (let i = 0; i < bricks.length; i++) {
      if (bricks[i].status !== 0) return false;
    }
    return true;
  }

  function update() {
    if (paused || gameOver) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > g.getWidth() || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }

    if (
      ball.y + ball.radius >= paddle.y &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width
    ) {
      ball.dy = -ball.dy;
      ball.y = paddle.y - ball.radius;
    }

    if (ball.y + ball.radius > g.getHeight()) {
      lives--;
      if (lives > 0) {
        // Reset ball and paddle only
        ball.x = g.getWidth() / 2;
        ball.y = g.getHeight() - 30;
        ball.dx = 3;
        ball.dy = -3;
        paddle.x = g.getWidth() / 2 - PADDLE_WIDTH / 2;
        paddle.y = g.getHeight() - 20;
        draw();
        return;
      } else {
        clearInterval(interval);
        interval = undefined;
        if (paddleIntervalLeft) {
          clearInterval(paddleIntervalLeft);
          paddleIntervalLeft = null;
        }
        if (paddleIntervalRight) {
          clearInterval(paddleIntervalRight);
          paddleIntervalRight = null;
        }
        saveHighScore();
        gameOver = true;
        draw();
        setTimeout(showGameOver, 50);
        return;
      }
    }

    collisionDetection();

    if (allBricksCleared()) {
      ball.dx *= SPEED_MULTIPLIER;
      ball.dy *= SPEED_MULTIPLIER;
      level++;
      initBricks();
    }

    draw();
  }

  function movePaddle(x) {
    if (gameOver || paused) return; // prevent paddle movement when not needed
    paddle.x += x;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > g.getWidth()) {
      paddle.x = g.getWidth() - paddle.width;
    }
  }

  function startGame() {
    initGame();
    draw();
    showGetReady(() => {
      interval = setInterval(update, 80);
    });
  }

  setWatch(() => {
    if (gameOver) {
      startGame();
    } else {
      paused = !paused;
      draw();
    }
  }, BTN2, { repeat: true, edge: "rising" });

  setWatch(() => {
    if (!paddleIntervalLeft) {
      paddleIntervalLeft = setInterval(() => movePaddle(-PADDLE_SPEED), 50);
    }
  }, BTN1, { repeat: true, edge: "rising" });

  setWatch(() => {
    if (paddleIntervalLeft) {
      clearInterval(paddleIntervalLeft);
      paddleIntervalLeft = null;
    }
  }, BTN1, { repeat: true, edge: "falling" });

  setWatch(() => {
    if (!paddleIntervalRight) {
      paddleIntervalRight = setInterval(() => movePaddle(PADDLE_SPEED), 50);
    }
  }, BTN3, { repeat: true, edge: "rising" });

  setWatch(() => {
    if (paddleIntervalRight) {
      clearInterval(paddleIntervalRight);
      paddleIntervalRight = null;
    }
  }, BTN3, { repeat: true, edge: "falling" });

  startGame();
})();