/**
 * BangleJS Pong game
 *
 * Original Author: Frederic Rousseau https://github.com/fredericrous
 * Created: April 2020
 *
 * Inspired by:
 * - Let's make pong, One Man Army Studios, Youtube
 * - Pong.js, KanoComputing, Github
 * - Coding Challenge #67: Pong!, The Coding Train, Youtube
 */

const SCREEN_WIDTH = 240;
const FPS = 16;
const MAX_SCORE = 11;
let scores = [0, 0];
let aiSpeedRandom = 0;

function Vector(x, y) {
  this.x = x;
  this.y = y;
}
Vector.prototype.add = function (x) {
  this.x += x.x || 0;
  this.y += x.y || 0;
  return this;
};

const constrain = (n, low, high) => Math.max(Math.min(n, high), low);
const random = (min, max) => Math.random() * (max - min) + min;
const intersects = (circ, rect) => {
  var c1 = circ.pos, c2 = {x: circ.pos.x+circ.r, y: circ.pos.y+circ.r};
  var r1 = rect.pos, r2 = {x: rect.pos.x+rect.width*2, y: rect.pos.y+rect.height};
  return !(c1.x > r2.x || c2.x < r1.x ||
           c1.y > r2.y || c2.y < r1.y);
};

/////////////////////////////  Ball  //////////////////////////////////////////

function Ball() {
  this.r = 4;
  this.prevPos = null;
  this.originalSpeed = 4;
  this.maxSpeed = 6;

  this.reset();
}
Ball.prototype.show = function () {
  if (this.prevPos != null) {
    g.setColor(0);
    g.fillCircle(this.prevPos.x, this.prevPos.y, this.prevPos.r);
  }
  g.setColor(-1);
  g.fillCircle(this.pos.x, this.pos.y, this.r);
  this.prevPos = {
    x: this.pos.x,
    y: this.pos.y,
    r: this.r
  };
};
Ball.prototype.bouncePlayer = function (multiplyX, multiplyY, player) {
  this.speed = constrain(this.speed + 2, this.originalSpeed, this.maxSpeed);
  var relativeIntersectY = (player.pos.y+(player.height/2)) - this.pos.y;
  var normalizedRelativeIntersectionY = (relativeIntersectY/(player.height/2));
  var MAX_BOUNCE_ANGLE = 4 * Math.PI/12;
  var bounceAngle = normalizedRelativeIntersectionY * MAX_BOUNCE_ANGLE;
  this.velocity.x = this.speed * Math.cos(bounceAngle) * multiplyX;
  this.velocity.y = this.speed * -Math.sin(bounceAngle) * multiplyY;
};
Ball.prototype.bounce = function (multiplyX, multiplyY, player) {
  if (player)
    return this.bouncePlayer(multiplyX, multiplyY, player);

  if (multiplyX) {
    this.velocity.x = Math.abs(this.velocity.x) * multiplyX;
  }
  if (multiplyY) {
    this.velocity.y = Math.abs(this.velocity.y) * multiplyY;
  }
};
Ball.prototype.checkWallsCollision = function () {
  if (this.pos.y < 0) {
    this.bounce(0, 1);
  } else if (this.pos.y > SCREEN_WIDTH) {
    this.bounce(0, -1);
  } else if (this.pos.x < 0) {
    scores[1]++;
    if (scores[1] >= MAX_SCORE) {
      this.restart();
      state = 3;
      winnerMessage = "AI Wins!";
    } else {
      this.reset();
    }
  } else if (this.pos.x > SCREEN_WIDTH) {
    scores[0]++;
    if (scores[0] >= MAX_SCORE) {
      this.restart();
      state = 3;
      winnerMessage = "You Win!";
    } else {
      this.reset();
    }
  } else {
    return false;
  }
  return true;
};
Ball.prototype.checkPlayerCollision = function (player) {
  if (intersects(this, player)) {
    if (this.pos.x < SCREEN_WIDTH/2) {
      this.bounce(1, 1, player);
      this.pos.add(new Vector(this.width, 0));
      aiSpeedRandom = random(-1.6, 1.6);
    } else {
      this.bounce(-1, 1, player);
      this.pos.add(new Vector(-(this.width / 2 + 1), 0));
    }
    return true;
  }
  return false;
};
Ball.prototype.checkCollisions = function () {
  return this.checkWallsCollision() || this.checkPlayerCollision(player) || this.checkPlayerCollision(ai);
};
Ball.prototype.updatePosition = function () {
  var elapsed = new Date().getTime() - this.lastUpdate;
  var x = (elapsed / 50) * this.velocity.x;
  var y = (elapsed / 50) * this.velocity.y;
  this.pos.add(new Vector(x, y));
};
Ball.prototype.update = function () {
  this.updatePosition();
  this.lastUpdate = new Date().getTime();
  this.checkCollisions();
};
Ball.prototype.reset = function() {
  this.speed = this.originalSpeed;
  var x = scores[0] < scores[1] || (scores[0] === 0 && scores[1] === 0) ? -this.speed : this.speed;
  var bounceAngle = Math.PI/6;
  this.velocity = new Vector(x * Math.cos(bounceAngle), this.speed * -Math.sin(bounceAngle));
  this.pos = new Vector(SCREEN_WIDTH/2, random(0, SCREEN_WIDTH));
};
Ball.prototype.restart = function() {
  ai.pos = new Vector(SCREEN_WIDTH - ai.width*2, SCREEN_WIDTH/2 - ai.height/2);
  player.pos = new Vector(player.width*2, SCREEN_WIDTH/2 - player.height/2);
  this.pos = new Vector(SCREEN_WIDTH/2, SCREEN_WIDTH/2);
};

////////////////////////////  Player  /////////////////////////////////////////

function Player() {
  this.width = 4;
  this.height = 30;
  this.pos = new Vector(this.width*2, SCREEN_WIDTH/2 - this.height/2);
  this.acc = new Vector(0, 0);
  this.speed = 15;
  this.maxSpeed = 25;
  this.prevPos = null;
}
Player.prototype.show = function () {
  if (this.prevPos != null) {
    g.setColor(0);
    g.fillRect(this.prevPos.x1, this.prevPos.y1, this.prevPos.x2, this.prevPos.y2);
  }
  g.setColor(-1);
  g.fillRect(this.pos.x, this.pos.y, this.pos.x+this.width, this.pos.y+this.height);
  this.prevPos = {
    x1: this.pos.x,
    y1: this.pos.y,
    x2: this.pos.x+this.width,
    y2: this.pos.y+this.height
  };
};
Player.prototype.up = function () {
  this.acc.y -= this.speed;
};
Player.prototype.down = function () {
  this.acc.y += this.speed;
};
Player.prototype.stop = function () {
  this.acc.y = 0;
};
Player.prototype.update = function () {
  this.acc.y = constrain(this.acc.y, -this.maxSpeed, this.maxSpeed);
  this.pos.add(this.acc);
  this.pos.y = constrain(this.pos.y, 0, SCREEN_WIDTH-this.height);
};

//////////////////////////////  AI  ///////////////////////////////////////////

function AI() {
  Player.call(this);
  this.pos = new Vector(SCREEN_WIDTH-this.width*2, SCREEN_WIDTH/2 - this.height/2);
}
AI.prototype = Object.create(Player.prototype);
AI.prototype.constructor = Player;
AI.prototype.update = function () {
  var y = ball.pos.y - (this.height/2 * aiSpeedRandom);
  var yConstrained = constrain(y, 0, SCREEN_WIDTH-this.height);
  this.pos = new Vector(this.pos.x, yConstrained);
};

function net() {
  var dashSize = 5;
  for (let y = dashSize/2; y < SCREEN_WIDTH; y += dashSize*2) {
    g.setColor(-1);
    let halfScreen = SCREEN_WIDTH/2;
    g.fillRect(halfScreen-dashSize/2, y, halfScreen+dashSize/2, y+dashSize);
  }
}

var player = new Player();
var ai = new AI();
var ball = new Ball();
var state = 0;
var prevScores = [0, 0];

function drawScores() {
  let x1 = SCREEN_WIDTH/4-5;
  let x2 = SCREEN_WIDTH*3/4-5;

  g.setColor(0);
  g.setFont('Vector', 20);
  g.drawString(prevScores[0], x1, 7);
  g.drawString(prevScores[1], x2, 7);
  g.setColor(-1);
  g.setFont('Vector', 20);
  g.drawString(scores[0], x1, 7);
  g.drawString(scores[1], x2, 7);
  prevScores = scores.slice();
}

function drawGameOver() {
  g.setFont("Vector", 20);
  g.drawString(winnerMessage, 75, SCREEN_WIDTH/2 - 10);
}

function draw() {
  if (state === 1) {
    ball.update();
    player.update();
    ai.update();
    ball.show();
    player.show();
    ai.show();
    net();
    ball.show();
  } else if (state === 3) {
    g.clear();
    g.setColor(0);
    g.fillRect(0,0,240,240);
    state++;
  } else if (state === 4) {
    drawGameOver();
  } else {
    player.show();
    ai.show();
    net();
  }
  drawScores();
}

g.clear();
g.setColor(0);
g.fillRect(0,0,240,240);

setInterval(draw, 1000 / FPS);

setWatch(o => o.state ? player.up() : player.stop(), BTN1, {repeat: true, edge: 'both'});
setWatch(o => o.state ? player.down() : player.stop(), BTN3, {repeat: true, edge: 'both'});
//setWatch(o => o.state ? player.down() : player.stop(), BTN5, {repeat: true, edge: 'both'});
setWatch(o => {
  state++;
  if (state >= 2) {
    ball.restart();
    g.setColor(0);
    g.fillRect(0,0,240,240);
    scores = [0, 0];
    state = 1;
  }
}, BTN2, {repeat: true});
