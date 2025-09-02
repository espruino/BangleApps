
(function () {
  var BALL_RADIUS = 3;
  var PADDLE_WIDTH = 26;
  var PADDLE_HEIGHT = 6;
  var BRICK_ROWS = 2;
  var BRICK_HEIGHT = 8;
  var BRICK_PADDING = 4;
  var BRICK_OFFSET_TOP = 60;
  var BRICK_OFFSET_LEFT = 2;
  var SPEED_MULTIPLIER = 1.1;
  var PADDLE_SPEED = 12;

  var ball, paddle, interval;
  var bricks = [];
  var BRICK_WIDTH, BRICK_COLS;
  var score = 0;
  var level = 1;
  var highScore = 0;
  var paused = false;
  var gameOver = false;
  var lives = 3;
  var paddleMove = 0;

  var storage = require("Storage");

  function loadHighScore() {
    var saved = storage.readJSON("breakout_highscore.json", 1);
    highScore = saved && saved.highScore ? saved.highScore : 0;
  }

  function saveHighScore() {
    if (score > highScore) {
      highScore = score;
      storage.writeJSON("breakout_highscore.json", { highScore });
    }
  }

  function initBricks() {
    bricks = [];
    for (var i = 0; i < BRICK_ROWS * BRICK_COLS; i++) {
      bricks.push(1);
    }
  }

  function initGame() {
    var screenWidth = g.getWidth();
    BRICK_COLS = Math.min(5, Math.floor((screenWidth - BRICK_OFFSET_LEFT + BRICK_PADDING) / (15 + BRICK_PADDING)));
    BRICK_WIDTH = Math.floor((screenWidth - BRICK_OFFSET_LEFT - (BRICK_COLS - 1) * BRICK_PADDING) / BRICK_COLS);

    ball = {
      x: screenWidth / 2,
      y: g.getHeight() - 40,
      dx: (Math.random() > 0.5 ? 1 : -1) * 3,
      dy: -3,
      radius: BALL_RADIUS,
      prevPos: null
    };

    paddle = {
      x: screenWidth / 2 - PADDLE_WIDTH / 2,
      y: g.getHeight() - 20,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      prevPos: null
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
    var heartSize = 6;
    var spacing = 2;
    var startX = g.getWidth() - (lives * (heartSize + spacing)) - 2;
    var y = 32;
    g.setColor(1, 0, 0);
    for (var i = 0; i < lives; i++) {
      var x = startX + i * (heartSize + spacing);
      g.fillPoly([x + 3, y, x + 6, y + 3, x + 3, y + 6, x, y + 3], true);
    }
  }

  function drawBricks() {
    g.setColor(0, 1, 0);
    for (var i = 0; i < bricks.length; i++) {
      if (bricks[i]) {
        var c = i % BRICK_COLS;
        var r = Math.floor(i / BRICK_COLS);
        var brickX = BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING);
        var brickY = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING);
        g.fillRect(brickX, brickY, brickX + BRICK_WIDTH - 1, brickY + BRICK_HEIGHT - 1);
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
    g.setColor(0, 1, 1);
    g.fillRect(paddle.x, paddle.y, paddle.x + paddle.width - 1, paddle.y + paddle.height - 1);
  }

  function drawHUD() {
    g.setColor(0, 0, 0).fillRect(0, 0, g.getWidth(), BRICK_OFFSET_TOP - 1);
    g.setColor(1, 1, 1);
    g.setFont("6x8", 1);
    g.setFontAlign(-1, -1);
    g.drawString("Score: " + score, 2, 22);
    g.setFontAlign(0, -1);
    g.drawString("High: " + highScore, g.getWidth() / 2, 22);
    g.setFontAlign(1, -1);
    g.drawString("Lvl: " + level, g.getWidth() - 2, 22);
    drawLives();
    if (paused) {
      g.setFontAlign(0, 0);
      g.drawString("PAUSED", g.getWidth() / 2, g.getHeight() / 2);
    }
  }

  function draw() {
    if (paddle.prevPos) {
      g.setColor(0, 0, 0).fillRect(paddle.prevPos.x - 1, paddle.prevPos.y - 1, paddle.prevPos.x + paddle.width + 1, paddle.prevPos.y + paddle.height + 1);
    }
    if (ball.prevPos) {
      g.setColor(0, 0, 0).fillCircle(ball.prevPos.x, ball.prevPos.y, ball.radius + 1);
    }
    drawHUD();
    drawBall();
    drawPaddle();
    g.flip();
    ball.prevPos = { x: ball.x, y: ball.y };
    paddle.prevPos = { x: paddle.x, y: paddle.y, width: paddle.width, height: paddle.height };
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
    for (var i = 0; i < bricks.length; i++) {
      if (bricks[i]) {
        var c = i % BRICK_COLS;
        var r = Math.floor(i / BRICK_COLS);
        var brickX = BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING);
        var brickY = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING);
        if (ball.x + ball.radius > brickX && ball.x - ball.radius < brickX + BRICK_WIDTH && ball.y + ball.radius > brickY && ball.y - ball.radius < brickY + BRICK_HEIGHT) {
          ball.dy = -ball.dy;
          bricks[i] = 0;
          score += 10;
          g.setColor(0, 0, 0).fillRect(brickX, brickY, brickX + BRICK_WIDTH - 1, brickY + BRICK_HEIGHT - 1);
          break;
        }
      }
    }
  }

  function allBricksCleared() {
    for (var i = 0; i < bricks.length; i++) {
      if (bricks[i]) return false;
    }
    return true;
  }

  function resetAfterLifeLost() {
    clearInterval(interval);
    interval = undefined;
    ball.x = g.getWidth() / 2;
    ball.y = g.getHeight() - 40;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 3;
    ball.dy = -3;
    paddle.x = g.getWidth() / 2 - PADDLE_WIDTH / 2;
    ball.prevPos = null;
    paddle.prevPos = null;
    g.clear();
    drawBricks();
    draw();
    setTimeout(() => { interval = setInterval(update, 50); }, 1000);
  }

  function update() {
    if (paused || gameOver) return;
    if (paddleMove) {
      paddle.x += paddleMove * PADDLE_SPEED;
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.width > g.getWidth()) {
        paddle.x = g.getWidth() - paddle.width;
      }
    }
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.x + ball.radius > g.getWidth() || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }
    if (ball.y + ball.radius >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
      ball.dy = -ball.dy;
      ball.y = paddle.y - ball.radius;
    }
    if (ball.y + ball.radius > g.getHeight()) {
      lives--;
      if (lives > 0) {
        resetAfterLifeLost();
        return;
      } else {
        clearInterval(interval);
        interval = undefined;
        saveHighScore();
        gameOver = true;
        setTimeout(showGameOver, 50);
        return;
      }
    }
    collisionDetection();
    if (allBricksCleared()) {
      level++;
      ball.dx = (Math.random() > 0.5 ? 1 : -1) * Math.abs(ball.dx) * SPEED_MULTIPLIER;
      ball.dy *= SPEED_MULTIPLIER;
      initBricks();
      ball.prevPos = null;
      paddle.prevPos = null;
      g.clear();
      drawBricks();
    }
    draw();
  }

  function showGetReady(callback) {
    g.clear();
    g.setFont("6x8", 2);
    g.setFontAlign(0, 0);
    g.setColor(1, 1, 0);
    g.drawString("GET READY!", g.getWidth() / 2, g.getHeight() / 2);
    g.flip();
    setTimeout(() => {
      g.clear();
      drawBricks();
      draw();
      callback();
    }, 1500);
  }

  function startGame() {
    initGame();
    showGetReady(() => {
      interval = setInterval(update, 50);
    });
  }

  setWatch(() => {
    if (gameOver) {
      startGame();
      return;
    }
    paused = !paused;
    if (paused) {
      drawHUD();
      g.flip();
    } else {
      g.clear();
      drawBricks();
      draw();
    }
  }, BTN2, { repeat: true, edge: "rising" });

  setWatch(() => { paddleMove = -1; }, BTN1, { repeat: true, edge: "rising" });
  setWatch(() => { paddleMove = 0; }, BTN1, { repeat: true, edge: "falling" });
  setWatch(() => { paddleMove = 1; }, BTN3, { repeat: true, edge: "rising" });
  setWatch(() => { paddleMove = 0; }, BTN3, { repeat: true, edge: "falling" });

  startGame();
})();