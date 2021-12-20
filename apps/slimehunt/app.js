//Create constants
const GREEN_SLIME = 1; //Normal slime, is always neutral.
const PINK_SLIME = 2; //Can get angry
const GRAY_SLIME = 3; //Can be neutral, angry or erratic
const YELLOW_SLIME = 4; //Is always erratic
const PURPLE_SLIME = 5; //Is always angry

//Initialize variables
var playerHP = 20;
var slimeHP = 3;
var slimeType = GREEN_SLIME;
var turn = 0;
var screenWidth = g.getWidth();
var screenHeight = g.getHeight();
var slimeState = 0;
var showBattleResult = false;
var dmgDealt = 0;
var playerDefence = 0;

var refreshInterval;
var waitTime = 0;

var highscore = 0;
var score = 0;

var themeNote = 0;

//Load files
var file = require("Storage").open("highscore.txt","r");
highscore = file.readLine();
if (highscore == undefined) highscore = 0;

var greenSlime = require("Storage").read("slime.img");
var pinkSlime = require("Storage").read("slimered.img");
var graySlime = require("Storage").read("slimegray.img");
var yellowSlime = require("Storage").read("slimeyellow.img");
var purpleSlime = require("Storage").read("slimepurple.img");

//UI Stuff
function drawOpeningUI() {
  g.clear();
  g.setFont("Vector",screenWidth/15);
  g.setFontAlign(0,0); // center font
  g.drawString("SLIME HUNT",screenWidth/2,screenHeight*0.1);
  g.drawString("-SCORE TO BEAT-",screenWidth/2,screenHeight*0.3);
  g.drawString("<><><> "+highscore+" <><><>",screenWidth/2,screenHeight*0.45);
  g.setFont("Vector",screenWidth/20);
  g.drawString("A Slime approches...",screenWidth/2,screenHeight*0.6);
  wait(8,waitForBattle);
}

function drawSlime() {
  switch(slimeType) {
    case GREEN_SLIME:
      g.drawImage(greenSlime,screenWidth/2,screenHeight/2,{scale:4,rotate:0});
    break;
    case PINK_SLIME:
      g.drawImage(pinkSlime,screenWidth/2,screenHeight/2,{scale:4,rotate:0});
    break;
    case GRAY_SLIME:
      g.drawImage(graySlime,screenWidth/2,screenHeight/2,{scale:4,rotate:0});
    break;
    case YELLOW_SLIME:
      g.drawImage(yellowSlime,screenWidth/2,screenHeight/2,{scale:4,rotate:0});
    break;
    case PURPLE_SLIME:
      g.drawImage(purpleSlime,screenWidth/2,screenHeight/2,{scale:4,rotate:0});
    break;
  }
}

function drawBattleUI() {
  g.clear();
  g.setFont("Vector",screenWidth/8);
  g.setFontAlign(0,0); // center font
  g.drawString("SLIME HP: " + slimeHP,screenWidth/2,screenHeight*0.1);
  g.setFont("Vector",screenWidth/20);
  if (!showBattleResult) {
    switch(slimeState) {
      case 0:
        g.drawString("The slime seems neutral...",screenWidth/2,screenHeight*0.25);
      break;
      case 1:
        g.drawString("The slime seems angry...",screenWidth/2,screenHeight*0.25);
      break;
      case 2:
        g.drawString("The slime seems eratic...",screenWidth/2,screenHeight*0.25);
      break;
    }
  }else{
    var brString = (turn == 0 ? "The Slime loses " : "You lose ");
    g.drawString(brString + dmgDealt + "HP!",screenWidth/2,screenHeight*0.25);
  }
  drawSlime();
  g.drawLine(0,screenHeight*0.72,screenWidth,screenHeight*0.72);
  if (turn == 0) {
    g.setFont("Vector",screenWidth/15);
    g.drawString("Your HP is " + playerHP + ".",screenWidth/2,screenHeight*0.8);
    g.setFont("Vector",screenWidth/20);
    g.drawString("(B1) FIGHT\t|\t(B2) DEFEND\t|\t(B3) RUN",screenWidth/2,screenHeight*0.9);
  }
}

function win() {
  wait(5,winTheme);
  calcScore(slimeType);
  showBattleResult = false;
  g.clear();
  g.setFont("Vector",screenWidth/8);
  g.setFontAlign(0,0); // center font
  g.drawString("YOU WON!",screenWidth/2,screenHeight/2);
  g.setFont("Vector",screenWidth/20);
  g.drawString("Your score is << " + score + " >>",screenWidth/2,screenHeight*0.75);
  g.drawString("Press (B3) to find another slime!",screenWidth/2,screenHeight*0.9);
  turn = 0;
  setWatch(run,BTN3);
}

function lose() {
  wait(5,loseTheme);
  playerHP = 20;
  showBattleResult = false;
  g.clear();
  g.setFont("Vector",screenWidth/8);
  g.setFontAlign(0,0); // center font
  g.drawString("You lose...",screenWidth/2,screenHeight/2);
  g.setFont("Vector",screenWidth/20);
  g.drawString("Your score is << " + score + " >>",screenWidth/2,screenHeight*0.75);
  g.drawString("Press (B3) to try again...",screenWidth/2,screenHeight*0.9);
  score = 0;
  turn = 0;
  setWatch(run,BTN3);
}

//Battle Stuff
function nextTurn() {
  turn = (turn == 0 ? 1 : 0);
}

function slimeFight() {
  Bangle.beep(100, 500);
  switch(slimeState) {
    case 0:
      dmgDealt = Math.floor(Math.random() * 2);
    break;
    case 1:
      dmgDealt = Math.floor(Math.random() * 3) + 3;
    break;
    case 2:
      dmgDealt = Math.floor(Math.random() * 6);
    break;
  }
  dmgDealt = Math.max(0,dmgDealt - playerDefence);
  playerHP -= dmgDealt;
  slimeAI();
}

function fight() {
  if (turn == 0 && waitTime <= 0) {
    Bangle.beep(100, 1000);
    dmgDealt = 1;
    playerDefence = 0;
    slimeHP -= dmgDealt;
    showBattleResult = true;
    drawBattleUI();
    wait(5,waitForTurn);
  }
}

function defend() {
  if (turn == 0 && waitTime <= 0) {
    dmgDealt = 0;
    playerDefence = 3;
    showBattleResult = true;
    drawBattleUI();
    wait(5,waitForTurn);
  }
}

function run() {
  if (turn == 0 && waitTime <= 0) {
    showBattleResult = false;
    Bangle.beep(200, 4000);
    wait(3,waitForBattle);
  }
}


function newBattle() {
  showBattleResult = false;
  slimeType = Math.floor(Math.random() * 5) + 1;
  switch(slimeType) {
    case GREEN_SLIME:
      slimeHP = 3;
    break;
    case PINK_SLIME:
      slimeHP = 3;
    break;
    case GRAY_SLIME:
      slimeHP = 5;
    break;
    case YELLOW_SLIME:
      slimeHP = 5;
    break;
    case PURPLE_SLIME:
      slimeHP = 5;
    break;
  }
  turn = 0;
  battle();
  slimeAI();
  drawBattleUI();
}

function battle() {
  setWatch(fight,BTN1);
  setWatch(defend,BTN2);
  setWatch(run,BTN3);
}

function slimeAI() {
  switch(slimeType) {
    case GREEN_SLIME:
      slimeState = 0;
    break;
    case PINK_SLIME:
      slimeState = Math.floor(Math.random() * 2);
    break;
    case GRAY_SLIME:
      slimeState = Math.floor(Math.random() * 3);
    break;
    case YELLOW_SLIME:
      slimeState = 2;
    break;
    case PURPLE_SLIME:
      slimeState = 1;
    break;
  }
}


//Timed transitions
function wait(duration,waitFunc) {
    waitTime = duration;
    if (!refreshInterval)
      refreshInterval = setInterval(waitFunc, 500);
}

function waitForTurn() {
  waitTime--;
  if (waitTime <= 0) {
    clearInterval(refreshInterval);
    refreshInterval = undefined;
    nextTurn();
    if (playerHP > 0 && slimeHP > 0) {
      if (turn == 1) {
        slimeFight();
        wait(5,waitForTurn);
      }else{
        showBattleResult = false;
        battle();
      }
      drawBattleUI();
    }else{
      if (playerHP <= 0) {
        lose();
      }
      if (slimeHP <= 0) {
        win();
      }
    }
  }
  Bangle.setLCDPower(1);
}

function waitForBattle() {
  waitTime--;
  Bangle.beep(100, 1000);
  if (waitTime <= 0) {
    clearInterval(refreshInterval);
    refreshInterval = undefined;
    showBattleResult = false;
    newBattle();
  }
  Bangle.setLCDPower(1);
}

function winTheme() {
  waitTime--;
  Bangle.beep(200, 100*themeNote);
  themeNote++;
  if (waitTime <= 0) {
    themeNote = 0;
    clearInterval(refreshInterval);
    refreshInterval = undefined;
  }
  Bangle.setLCDPower(1);
}

function loseTheme() {
  waitTime--;
  Bangle.beep(200, 600-(100*themeNote));
  themeNote++;
  if (waitTime <= 0) {
    themeNote = 0;
    clearInterval(refreshInterval);
    refreshInterval = undefined;
  }
  Bangle.setLCDPower(1);
}

//Calculations
function calcScore(slimeType) {
  switch(slimeType) {
    case GREEN_SLIME:
      score += 1;
    break;
    case PINK_SLIME:
      score += 2;
    break;
    case GRAY_SLIME:
      score += 2;
    break;
    case YELLOW_SLIME:
      score += 5;
    break;
    case PURPLE_SLIME:
      score += 10;
    break;
  }
  if (score > highscore) {
    file.erase();
    file = require("Storage").open("highscore.txt","w");
    file.write(score);
  }
}

//------------------------------------GAME STARTS HERE -----------------------------------------------

//Load opening UI
drawOpeningUI();
