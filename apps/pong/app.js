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
 * - Pixl.js Multiplayer Pong, espruino website
 */

const SCREEN_WIDTH = 240;
const FPS = 16;
const MAX_SCORE = 11;
let scores = [0, 0];
let aiSpeedRandom = 0;
let winnerMessage = '';

const sound = {
  ping: () => Bangle.beep(8, 466),
  pong: () => Bangle.beep(8, 220),
  fall: () => Bangle.beep(16*3, 494).then(_ => Bangle.beep(32*3, 3322))
};

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
const intersects = (circ, rect, right) => {
  var c = circ.pos;
  var r = circ.r;
  if (c.y - r < rect.pos.y + rect.height && c.y + r > rect.pos.y) {
    if (right) {
      return c.x + r > rect.pos.x - rect.width*2 && c.x < rect.pos.x + rect.width
    } else {
      return c.x - r < rect.pos.x + rect.width*2 && c.x > rect.pos.x - rect.width
    }
  }
  return false;
}

/////////////////////////////  Ball  //////////////////////////////////////////

function Ball() {
  this.r = 4;
  this.prevPos = null;
  this.originalSpeed = 4;
  this.maxSpeed = 6;

  this.reset();
}
Ball.prototype.reset = function() {
  this.speed = this.originalSpeed;
  var x = scores[0] < scores[1] || (scores[0] === 0 && scores[1] === 0) ? -this.speed : this.speed;
  var bounceAngle = Math.PI/6;
  this.velocity = new Vector(x * Math.cos(bounceAngle), this.speed * -Math.sin(bounceAngle));
  this.pos = new Vector(SCREEN_WIDTH/2, random(0, SCREEN_WIDTH));
  this.ballReturn = 0;
};
Ball.prototype.restart = function() {
  this.reset();
  ai.pos = new Vector(SCREEN_WIDTH - ai.width*2, SCREEN_WIDTH/2 - ai.height/2);
  player.pos = new Vector(player.width*2, SCREEN_WIDTH/2 - player.height/2);
  this.pos = new Vector(SCREEN_WIDTH/2, SCREEN_WIDTH/2);
};
Ball.prototype.show = function (invert) {
  if (this.prevPos != null) {
    g.setColor(invert ? -1 : 0);
    g.fillCircle(this.prevPos.x, this.prevPos.y, this.prevPos.r);
  }
  g.setColor(invert ? 0 : -1);
  g.fillCircle(this.pos.x, this.pos.y, this.r);
  this.prevPos = {
    x: this.pos.x,
    y: this.pos.y,
    r: this.r
  };
};
function bounceAngle(playerY, ballY, playerHeight, maxHangle) {
  let relativeIntersectY = (playerY + (playerHeight/2)) - ballY;
  let normalizedRelativeIntersectionY = relativeIntersectY / (playerHeight/2);
  let bounceAngle = normalizedRelativeIntersectionY * maxHangle;
  return { x: Math.cos(bounceAngle), y: -Math.sin(bounceAngle) };
}
Ball.prototype.bouncePlayer = function (directionX, directionY, player) {
  this.ballReturn++;
  this.speed = constrain(this.speed + 2, this.originalSpeed, this.maxSpeed);
  var MAX_BOUNCE_ANGLE = 4 * Math.PI/12;
  var angle = bounceAngle(player.pos.y, this.pos.y, player.height, MAX_BOUNCE_ANGLE)
  this.velocity.x = this.speed * angle.x * directionX;
  this.velocity.y = this.speed * angle.y * directionY;
  this.ballReturn % 2 === 0 ? sound.ping() : sound.pong();
};
Ball.prototype.bounce = function (directionX, directionY, player) {
  if (player)
    return this.bouncePlayer(directionX, directionY, player);

  if (directionX) {
    this.velocity.x = Math.abs(this.velocity.x) * directionX;
  }
  if (directionY) {
    this.velocity.y = Math.abs(this.velocity.y) * directionY;
  }
};
Ball.prototype.fall = function (playerId) {
  scores[playerId]++;
  if (scores[playerId] >= MAX_SCORE) {
    this.restart();
    state = 3;
    if (playerId === 1) {
      winnerMessage = startOption === 0 ? "AI Wins!" : "Player 2 Wins!";
    } else {
      winnerMessage = startOption === 0 ? "You Win!" : "Player 1 Wins!";
    }
  } else {
    sound.fall();
    this.reset();
  }
};
Ball.prototype.wallCollision = function () {
  if (this.pos.y < 0) {
    this.bounce(0, 1);
  } else if (this.pos.y > SCREEN_WIDTH) {
    this.bounce(0, -1);
  } else if (this.pos.x < 0) {
    this.fall(1);
  } else if (this.pos.x > SCREEN_WIDTH) {
    this.fall(0);
  } else {
    return false;
  }
  return true;
};
Ball.prototype.playerCollision = function (player) {
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
Ball.prototype.collisions = function () {
  return this.wallCollision() || this.playerCollision(player) || this.playerCollision(ai);
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
  this.collisions();
};

////////////////////////////  Player  /////////////////////////////////////////

function Player(right) {
  this.width = 4;
  this.height = 30;
  this.pos = new Vector(right ? SCREEN_WIDTH-this.width : this.width, SCREEN_WIDTH/2 - this.height/2);
  this.acc = new Vector(0, 0);
  this.speed = 15;
  this.maxSpeed = 25;
  this.prevPos = null;
  this.right = right;
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
  var y = ball.pos.y - this.height/2;
  var randomizedY = ball.ballReturn < 3 ? y : y + (aiSpeedRandom * this.height/2);
  var yConstrained = constrain(randomizedY, 0, SCREEN_WIDTH-this.height);
  this.pos = new Vector(this.pos.x, yConstrained);
};

/////////////////////////////// Scenes ////////////////////////////////////////

function net() {
  var dashSize = 5;
  for (let y = dashSize/2; y < SCREEN_WIDTH; y += dashSize*2) {
    g.setColor(-1);
    let halfScreen = SCREEN_WIDTH/2;
    g.fillRect(halfScreen-dashSize/2, y, halfScreen+dashSize/2, y+dashSize);
  }
}

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
  g.drawString(winnerMessage, startOption === 0 ? 55 : 75, SCREEN_WIDTH/2 - 10);
}

function showControls(hide) {
  g.setColor(hide ? 0 : -1);
  g.setFont("Vector", 8);
  var topArrowString = `
         ########
                ##
           ##  ##
        ###   ##
     ###     ##
  ###
##
`;

  var arrows = [Graphics.createImage(topArrowString), Graphics.createImage(`
               ##
                 ##
####################
                 ##
               ##
`), Graphics.createImage(topArrowString.split('\n').reverse().join('\n'))
  ];

  g.drawString('UP', 170, 50);
  g.drawImage(arrows[0], 200, 40);
  g.drawString('DOWN', 156, 120);
  g.drawImage(arrows[1], 200, 120);
  g.drawString('START', 152, 190);
  g.drawImage(arrows[2], 200, 200);
}

function drawStartScreen(hide) {
  g.setColor(hide ? 0 : -1);
  g.setFont("Vector", 10);
  g.drawString("1 PLAYER", 95, 80);
  g.drawString("2 PLAYERS", 95, 110);

  const ball1 = new Ball();
  ball1.prevPos = null;
  ball1.pos = new Vector(87, 86);
  ball1.show(hide || !(startOption === 0));

  const ball2 = new Ball();
  ball2.prevPos = null;
  ball2.pos = new Vector(87, 116);
  ball2.show(hide || !(startOption === 1));
}

function drawStartTimer(count, callback) {
  setTimeout(_ => {
    player.show();
    ai.show();
    net();
    g.setColor(0);
    g.fillRect(117-7, 115-7, 117+14, 115+14);
    if (count >= 0) {
      g.setFont("Vector", 10);
      g.drawString(count+1, 115, 115);
      g.setColor(-1);
      g.drawString(count === 0 ? 'Go!' : count, 115 - (count === 0 ? 4: 0), 115);
      drawStartTimer(count - 1, callback);
    } else {
      g.setColor(0);
      g.fillRect(117-7, 115-7, 117+14, 115+14);
      callback();
    }
  }, 800);
}

//////////////////////////////// Main /////////////////////////////////////////

function onFrame() {
  if (state === 1) {
    ball.update();
    player.update();
    ai.update();
    ball.show();
    player.show();
    ai.show();
    net();
    ball.show();
    g.flip()
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

function startThatGame() {
  player.show();
  ai.show();
  net();
  drawScores();
  drawStartTimer(3, () => setInterval(onFrame, 1000 / FPS));
}

var player = new Player();
var ai;
var ball = new Ball();
var state = 0;
var prevScores = [0, 0];
//var playerBle = null;
var startOption = 0;

g.clear();
g.setColor(0);
g.fillRect(0,0,240,240);
showControls();
setTimeout(() => {
  showControls(true);
  drawStartScreen();
}, 2000);

////////////////////////////// Controls ///////////////////////////////////////

setWatch(o => {
  if (state === 0) {
    if (o.state) {
      startOption = startOption === 0 ? startOption : startOption - 1;
      drawStartScreen();
    }
  } else o.state ? player.up() : player.stop();
}, BTN1, {repeat: true, edge: 'both'});
setWatch(o => {
  if (state === 0) {
    if (o.state) {
      startOption = startOption === 1 ? startOption : startOption + 1;
      drawStartScreen();
    }
  } else o.state ? player.down() : player.stop();
}, BTN2, {repeat: true, edge: 'both'});
setWatch(o => {
  state++;
  clearInterval();
  if (state >= 2) {
    g.setColor(0);
    g.fillRect(0, 0, 240, 240);
    ball.show(true);
    scores = [0, 0];
    //playerBle = null;
    ball = new Ball();
    state = 1;
    startThatGame();
  } else {
    drawStartScreen(true);
    showControls(true);
    if (startOption === 1) {
      ai = new Player(true);
      startThatGame();
    } else {
      ai = new AI();
      startThatGame();
    }
  }
}, BTN3, {repeat: true});

setWatch(o => startOption === 1 && (o.state ? ai.up() : ai.stop()), BTN4, {repeat: true, edge: 'both'});
setWatch(o => startOption === 1 && (o.state ? ai.down() : ai.stop()), BTN5, {repeat: true, edge: 'both'});
