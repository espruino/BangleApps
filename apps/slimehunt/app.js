//Create constants------------------------------------------------------------------

//Slimes
const GREEN_SLIME = 1; //Normal slime, is always neutral. | 0% Item chance
const PINK_SLIME = 2; //Can get angry.                    | 10% Item chance
const GRAY_SLIME = 3; //Can be neutral, angry or erratic. | 20% Item chance
const YELLOW_SLIME = 4; //Is always erratic.              | 50% Item chance
const PURPLE_SLIME = 5; //Is always angry.                | 100% Item chance

//Items
const ITEM_ATK_UP = 1; //Raises damage dealt by +1 for next battle
const ITEM_DEF_UP = 2; //Reduces all damage by +1 for next battle
const ITEM_HP_UP = 3; //Increases HP by 3
const ITEM_BLOCK_UP = 4; //Raises defence when defending by from 3 to 5 for next battle
const ITEM_CRIT_UP = 5; //Gives attack a 20% chance to instantly KO slime for next battle

//Base stats
const BASE_ATK = 1;
const BASE_DEF = 0;
const BASE_BLOCK = 3;
const BASE_CRIT = 0;

//Initialize variables------------------------------------------------------------------
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
var playerItem = 0;
var critChance = 0;

//Stats (Modifiers)
var statAtk = 1;
var statDef = 0;
var statBlock = 3;
var statCrit = 0;

//Item vars
var itemName = "";
var itemDesc = "";
var itemChance = 0;

var refreshInterval;
var waitTime = 0;

var highscore = 0;
var score = 0;

var themeNote = 0;

//Load files------------------------------------------------------------------
var file = require("Storage").open("highscore.txt", "r");
highscore = file.readLine();
if (highscore == undefined) highscore = 0;

var greenSlime = require("Storage").read("slime.img");
var pinkSlime = require("Storage").read("slimered.img");
var graySlime = require("Storage").read("slimegray.img");
var yellowSlime = require("Storage").read("slimeyellow.img");
var purpleSlime = require("Storage").read("slimepurple.img");

//UI Stuff------------------------------------------------------------------
function drawOpeningUI() {
  g.clear();
  g.setFont("Vector", screenWidth / 15);
  g.setFontAlign(0, 0); // center font
  g.drawString("SLIME HUNT", screenWidth / 2, screenHeight * 0.1);
  g.drawString("-SCORE TO BEAT-", screenWidth / 2, screenHeight * 0.3);
  g.drawString("<><><> " + highscore + " <><><>", screenWidth / 2, screenHeight * 0.45);
  g.setFont("Vector", screenWidth / 20);
  g.drawString("A Slime approches...", screenWidth / 2, screenHeight * 0.6);
  wait(8, waitForBattle);
}

function drawSlime() {
  switch (slimeType) {
    case GREEN_SLIME:
      g.drawImage(greenSlime, screenWidth / 2, screenHeight / 2, {
        scale: 4,
        rotate: 0
      });
      break;
    case PINK_SLIME:
      g.drawImage(pinkSlime, screenWidth / 2, screenHeight / 2, {
        scale: 4,
        rotate: 0
      });
      break;
    case GRAY_SLIME:
      g.drawImage(graySlime, screenWidth / 2, screenHeight / 2, {
        scale: 4,
        rotate: 0
      });
      break;
    case YELLOW_SLIME:
      g.drawImage(yellowSlime, screenWidth / 2, screenHeight / 2, {
        scale: 4,
        rotate: 0
      });
      break;
    case PURPLE_SLIME:
      g.drawImage(purpleSlime, screenWidth / 2, screenHeight / 2, {
        scale: 4,
        rotate: 0
      });
      break;
  }
}

function drawBattleUI() {
  g.clear();
  g.setFont("Vector", screenWidth / 8);
  g.setFontAlign(0, 0); // center font
  g.drawString("SLIME HP: " + slimeHP, screenWidth / 2, screenHeight * 0.1);
  g.setFont("Vector", screenWidth / 20);
  if (!showBattleResult) {
    switch (slimeState) {
      case 0:
        g.drawString("The slime seems neutral...", screenWidth / 2, screenHeight * 0.25);
        break;
      case 1:
        g.drawString("The slime seems angry...", screenWidth / 2, screenHeight * 0.25);
        break;
      case 2:
        g.drawString("The slime seems eratic...", screenWidth / 2, screenHeight * 0.25);
        break;
    }
  } else {
    var brString = (turn == 0 ? "The Slime loses " : "You lose ");
    g.drawString(brString + dmgDealt + "HP!", screenWidth / 2, screenHeight * 0.25);
  }
  drawSlime();
  g.drawLine(0, screenHeight * 0.72, screenWidth, screenHeight * 0.72);
  if (turn == 0) {
    g.setFont("Vector", screenWidth / 15);
    g.drawString("Your HP is " + playerHP + ".", screenWidth / 2, screenHeight * 0.8);
    g.setFont("Vector", screenWidth / 20);
    g.drawString("(B1) FIGHT\t|\t(B2) DEFEND\t|\t(B3) RUN", screenWidth / 2, screenHeight * 0.9);
  }
}

//Win / lose functions------------------------------------------------------------------
function win() {
  wait(5, winTheme);
  calcScore(slimeType);
  showBattleResult = false;
  g.clear();
  g.setFont("Vector", screenWidth / 8);
  g.setFontAlign(0, 0); // center font
  g.drawString("YOU WON!", screenWidth / 2, screenHeight * 0.1);
  g.drawLine(0, screenHeight * 0.2, screenWidth, screenHeight * 0.2);
  g.setFont("Vector", screenWidth / 12);
  g.drawString((playerItem == 0 ? "No Item." : "GOT ITEM!"), screenWidth / 2, screenHeight * 0.27);
  g.setFont("Vector", screenWidth / 15);
  g.drawString((playerItem == 0 ? "" : "<><> " + itemName + " <><>"), screenWidth / 2, screenHeight * 0.40);
  g.setFont("Vector", screenWidth / 20);
  g.drawString((playerItem == 0 ? "" : itemDesc), screenWidth / 2, screenHeight * 0.52);
  g.drawLine(0, screenHeight * 0.6, screenWidth, screenHeight * 0.6);
  g.drawString("Your score is << " + score + " >>", screenWidth / 2, screenHeight * 0.75);
  g.drawString("Press (B3) to find another slime!", screenWidth / 2, screenHeight * 0.9);
  turn = 0;
  setWatch(run, BTN3);
}

function lose() {
  wait(5, loseTheme);
  playerHP = 20;
  showBattleResult = false;
  g.clear();
  g.setFont("Vector", screenWidth / 8);
  g.setFontAlign(0, 0); // center font
  g.drawString("You lose...", screenWidth / 2, screenHeight * 0.1);
  g.drawLine(0, screenHeight * 0.2, screenWidth, screenHeight * 0.2);
  g.setFont("Vector", screenWidth / 12);
  g.drawString((score > highscore ? "-NEW HIGHSCORE-" : "-SCORE TO BEAT-"), screenWidth / 2, screenHeight * 0.27);
  g.setFont("Vector", screenWidth / 15);
  g.drawString((score > highscore ? "<><> " + score + " <><>" : "<><> " + highscore + " <><>"), screenWidth / 2, screenHeight * 0.43);
  g.drawLine(0, screenHeight * 0.6, screenWidth, screenHeight * 0.6);
  g.setFont("Vector", screenWidth / 20);
  g.drawString("Your score is << " + score + " >>", screenWidth / 2, screenHeight * 0.75);
  g.drawString("Press (B3) to try again...", screenWidth / 2, screenHeight * 0.9);
  score = 0;
  turn = 0;
  setWatch(run, BTN3);
}

//Battle Stuff------------------------------------------------------------------
function nextTurn() {
  turn = (turn == 0 ? 1 : 0);
}

function slimeFight() {
  Bangle.beep(100, 500);
  switch (slimeState) {
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
  dmgDealt = Math.max(0, dmgDealt - playerDefence);
  playerHP -= dmgDealt;
  slimeAI();
}

function fight() {
  if (turn == 0 && waitTime <= 0) {
    Bangle.beep(100, 1000);
    dmgDealt = statAtk;
    playerDefence = statDef;
    if (statCrit == 0) {
      slimeHP -= dmgDealt;
    }else{
      critChance = Math.floor(Math.random() * 100);
      if (critChance >= 100-statCrit) {
        slimeHP = 0;
        dmgDealt = 99;
      }else{
        slimeHP -= dmgDealt;
      }
      critChance = 0;
    }
    showBattleResult = true;
    drawBattleUI();
    wait(5, waitForTurn);
  }
}

function defend() {
  if (turn == 0 && waitTime <= 0) {
    dmgDealt = 0;
    playerDefence = statBlock + statDef;
    showBattleResult = true;
    drawBattleUI();
    wait(5, waitForTurn);
  }
}

function run() {
  if (turn == 0 && waitTime <= 0) {
    showBattleResult = false;
    Bangle.beep(200, 4000);
    wait(3, waitForBattle);
  }
}


function newBattle() {
  showBattleResult = false;
  slimeType = Math.floor(Math.random() * 5) + 1;
  useItem(); //Use item at start of new battle
  switch (slimeType) {
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
  setWatch(fight, BTN1);
  setWatch(defend, BTN2);
  setWatch(run, BTN3);
}

function slimeAI() {
  switch (slimeType) {
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
//Items------------------------------------------------------------------
function getItem() {
  playerItem = Math.floor(Math.random() * 5) + 1;
    switch (playerItem) {
    case ITEM_ATK_UP:
      itemName = "Attack Up";
      itemDesc = "+1 damage next battle.";
    break;
    case ITEM_DEF_UP:
      itemName = "Defence Up";
      itemDesc = "+1 defence next battle.";
    break;
    case ITEM_HP_UP:
      itemName = "HP Up";
      itemDesc = "+3 HP.";
    break;
    case ITEM_BLOCK_UP:
      itemName = "Block Up";
      itemDesc = "+2 block on DEFEND next battle.";
    break;
    case ITEM_CRIT_UP:
      itemName = "Critical Up";
      itemDesc = "20% chance to crit next battle.";
    break;
  }
}

function useItem() {
  statAtk = BASE_ATK;
  statDef = BASE_DEF;
  statBlock = BASE_BLOCK;
  statCrit = BASE_CRIT;
  switch (playerItem) {
    case ITEM_ATK_UP:
      statAtk = 2;
    break;
    case ITEM_DEF_UP:
      statDef = 1;
    break;
    case ITEM_HP_UP:
      playerHP += 3;
    break;
    case ITEM_BLOCK_UP:
      statBlock = 5;
    break;
    case ITEM_CRIT_UP:
      statCrit = 20;
    break;
  }
  playerItem = 0;
}

//Timed transitions------------------------------------------------------------------
function wait(duration, waitFunc) {
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
        wait(5, waitForTurn);
      } else {
        showBattleResult = false;
        battle();
      }
      drawBattleUI();
    } else {
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
  Bangle.beep(200, 100 * themeNote);
  themeNote++;
  if (waitTime <= 0) {
    themeNote = 0;
    clearInterval(refreshInterval);
    refreshInterval = undefined;
    setWatch(run, BTN3);
  }
  Bangle.setLCDPower(1);
}

function loseTheme() {
  waitTime--;
  Bangle.beep(200, 600 - (100 * themeNote));
  themeNote++;
  if (waitTime <= 0) {
    themeNote = 0;
    clearInterval(refreshInterval);
    refreshInterval = undefined;
    setWatch(run, BTN3);
  }
  Bangle.setLCDPower(1);
}

//Calculations------------------------------------------------------------------
function calcScore(slimeType) {
  switch (slimeType) {
    case GREEN_SLIME:
      score += 1;
      //No items
    break;
    case PINK_SLIME:
      score += 2;
      itemChance = Math.floor(Math.random() * 100);
      if (itemChance >= 100 - 10) { //100 - ITEM CHANCE %
          getItem();
      }
    break;
    case GRAY_SLIME:
      score += 3;
      itemChance = Math.floor(Math.random() * 100);
      if (itemChance >= 100 - 25) { //100 - ITEM CHANCE %
          getItem();
      }
    break;
    case YELLOW_SLIME:
      score += 5;
      itemChance = Math.floor(Math.random() * 100);
      if (itemChance >= 100 - 50) { //100 - ITEM CHANCE %
          getItem();
      }
    break;
    case PURPLE_SLIME:
      score += 10;
      getItem();
    break;
  }
  if (score > highscore) {
    file.erase();
    file = require("Storage").open("highscore.txt", "w");
    file.write(score);
  }
}


//------------------------------------GAME STARTS HERE -----------------------------------------------

//Load opening UI
drawOpeningUI();
