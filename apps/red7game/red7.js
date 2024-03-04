const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
const colorRank = {"red":6, "orange":5, "yellow":4, "green":3, "blue":2, "indigo":1, "violet":0};
const colorsHex = ["#b01f26", "#d45727", "#cfb82e", "#309c47", "#36aeac", "#2c3a93", "#784298"];
const colorsRules = ["high-\nest\n card", "most\none #", "most\none\ncolor", "most\nevens", "most\nunique\ncolors","most\nin a\nrow", "most\n< 4"];
const numbers = [1,2,3,4,5,6,7];
const handPos = [0,24,24*2,24*3,24*4,24*5,24*6];

function pointRectangleIntersection(p, r) {
    return p.x > r.x1 && p.x < r.x2 && p.y > r.y1 && p.y < r.y2;
}

class Card {
  constructor(cardNum, cardColor) {
    this.cardNum = cardNum;
    this.cardColor = cardColor;
    this.selected = false;
    //this.rect = {};
    this.clippedRect = {};
  }
  get description() {
    return this.cardColor+" "+this.cardNum;
  }
  get number() {
    return this.cardNum;
  }
  get color() {
    return this.cardColor;
  }
  set isSelected(sel) {
    this.selected = sel;
  }
  get isSelected() {
    return this.isSelected;
  }
  get fullRect() {
    return this.rect;
  }
  get clipRect() {
    return this.clippedRect;
  }
  fillRect(x,y,x2,y2,r) {
    //This function allows using new rounded corners on newer firmware
    if(process.env.VERSION === "2v12" || process.env.VERSION === "2v11" || process.env.VERSION === "2v10") {
      g.fillRect(x,y,x2,y2);
    } else {
      g.fillRect({x:x,y:y,x2:x2,y2:y2,r:r});
    }
  }
  draw(x,y,outlined) {
    this.rect = {x1: x, x2: x+80, y1: y, y2: y+100};
    this.clippedRect = {x1: x, x2: x+24, y1: y, y2: y+100};
    var colorIndex = colors.indexOf(this.cardColor);
    var colorArr = colorsHex[colorIndex];
    var colorRule = colorsRules[colorIndex];
    if(outlined) {
      g.setColor(0,0,0);
      this.fillRect(x-1,y-1,x+81,y+101,6);
    }
    g.setColor(colorArr);
    g.setBgColor(colorArr);
    this.fillRect(x,y,x+80,y+100,6);
    g.setColor(255,255,255);
    g.setFont("Vector:40");
    g.setFontAlign(0,0,0);
    //g.drawString(this.cardNum,x+40,y+70,true);
    g.setFont("6x8:3");
    g.drawString(this.cardNum, x+14, y+14, true);
    g.setFont("6x8:2");
    g.drawString(colorRule, x+45, y+50, true);
    g.flip();
  }
  drawBack(x,y,flipped) {
    this.rect = {x1: x, x2: x+80, y1: y, y2: y-100};
    this.clippedRect = {x1: x, x2: x+24, y1: y, y2: y-100};
    g.setBgColor(0,0,0);
    if(flipped) {
      g.setColor(0,0,0);
      this.fillRect(x-1,y+1,x+81,y-101,6);
      g.setColor(255,255,255);
      this.fillRect(x,y,x+80,y-100,6);
      g.setFontAlign(0,0,2);
      g.setColor(255,0,0);
      g.setBgColor(255,255,255);
      g.setFont("Vector:40");
      //g.drawString(7,x+40,y-40,true);
    } else {
      g.setColor(0,0,0);
      this.fillRect(x-1,y-1,x+81,y+101,6);
      g.setColor(255,255,255);
      this.fillRect(x,y,x+80,y+100,6);
      g.setColor(0,0,0);
      g.setFontAlign(0,0,0);
      g.setColor(255,0,0);
      g.setBgColor(255,255,255);
      g.setFont("Vector:40");
      //g.drawString(7,x+40,y+40,true);
    }
    g.flip();
  }
  drawRot(x,y) {
    this.rect = {x1: x, x2: x+45, y1: y, y2: y+110};
    var colorIndex = colors.indexOf(this.cardColor);
    var colorArr = colorsHex[colorIndex];
    var colorRule = colorsRules[colorIndex];
    g.setColor(colorArr);
    g.setBgColor(colorArr);
    this.fillRect(x,y,x+110,y+45,6);
    g.setColor(255,255,255);
    g.setFontAlign(0,0,0);
    g.setFont("6x8:2");
    g.drawString(colorRule, x+55, y+23, true);
    g.flip();
  }
  drawMicro(x,y) {
    this.rect = {x1: x, x2: x+20, y1: y, y2: y+20};
    var colorIndex = colors.indexOf(this.cardColor);
    var colorArr = colorsHex[colorIndex];
    g.setColor(colorArr);
    g.setBgColor(colorArr);
    this.fillRect(x,y,x+20,y+20,2);
    g.setFontAlign(0,0,0);
    g.setFont("6x8:2");
    g.setColor(255,255,255);
    g.drawString(this.cardNum, x+12, y+12, true);
    g.flip();
  }
  isHigher(card) {
    if(this.number > card.number) {
      return true;
    } else if(this.number === card.number) {
      if(colorRank[this.color] > colorRank[card.color]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

class Hand {
  constructor(cards) {
    if(typeof cards === "undefined") {
      this.hand = [];
    } else {
      this.hand = cards;
    }
  }
  //Can be single card or array of cards
  addCard(card) {
    this.hand = this.hand.concat(card);
  }
  //removes card from hand and returns it
  removeCard(card) {
    var index = this.hand.indexOf(card);
    return this.hand.splice(index,1)[0];
  }
  get handCards() {
    return this.hand;
  }
  draw(y, outlined) {
    var count = 0;
    for(let c of this.hand) {
      c.draw(handPos[count],y, outlined);
      count++;
    }
  }
  drawMicro(x, y) {
    var count = 0;
    for(let c of this.hand) {
      c.drawMicro(x+handPos[count],y);
      count++;
    }
  }
  drawBacks(y, flipped) {
    var count = 0;
    for(let c of this.hand) {
      c.drawBack(handPos[count], y, flipped);
      count++;
    }
  }
  checkForClick(cord) {
    for(let card of this.hand) {
      //If last card, you can check the whole rectangle
      if(this.hand.indexOf(card) === this.hand.length - 1) {
        if(pointRectangleIntersection(cord,card.fullRect)) {
          return card;
        }
      }
      else if(pointRectangleIntersection(cord,card.clippedRect)) {
        return card;
      }
    }
  }
  bestHighestCard() {
    if(this.hand.length === 0) {
      return undefined;
    }
    var highestCard = this.hand[0];
    this.hand.forEach(function(card){
      if(card.isHigher(highestCard)) {
        highestCard = card;
      }
    });
    return new Hand(highestCard);
  }
  allCardsMatchingNumber(number) {
    var matchingHand = new Hand();
    this.hand.forEach(function(card){
      if(card.number === number) {
        matchingHand.addCard(card);
      }
    });
    return matchingHand;
  }
  bestCardsOneNumber() {
    if(this.hand.length === 0) {
      return undefined;
    }
    var counts = {'1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0};
    this.hand.forEach(function(card){
      counts[card.number]++;
    });
    var highestNumber = '1';
    for(let n of Object.keys(counts)) {
      if(counts[n] > counts[highestNumber]) {
        highestNumber = n;
      }
      if(counts[n] === counts[highestNumber] && n != highestNumber) {
        if(n > highestNumber) {
          highestNumber = n;
        }
      }
    }
    return this.allCardsMatchingNumber(highestNumber);
  }
  allCardsMatchingColor(color) {
    var matchingHand = new Hand();
    this.hand.forEach(function(card) {
      if(card.color === color) {
        matchingHand.addCard(card);
      }
    });
    return matchingHand;
  }
  bestCardsOneColor() {
    if(this.hand.length === 0) {
      return undefined;
    }
    var counts = {'red':0, 'orange':0, 'yellow':0, 'green':0, 'blue':0, 'indigo':0, 'violet':0};
    this.hand.forEach(function(card){
      counts[card.color]++;
    });
    var highestColor = 'red';
    for(let n of Object.keys(counts)) {
      if(counts[n] > counts[highestColor]) {
        highestColor = n;
      }
      if(counts[n] === counts[highestColor] && n != highestColor && counts[highestColor] > 0) {
        var h1 = this.allCardsMatchingColor(n);
        var h2 = this.allCardsMatchingColor(highestColor);
        if(h1.bestHighestCard().handCards.isHigher(h2.bestHighestCard().handCards)) {
          highestColor = n;
        }
      }
    }
    return this.allCardsMatchingColor(highestColor);
  }
  bestEvenCards() {
    if(this.hand.length === 0) {
      return undefined;
    }
    var matchingHand = new Hand();
    this.hand.forEach(function(card){
      if(card.number % 2 === 0) {
        matchingHand.addCard(card);
      }
    });
    return matchingHand;
  }
  bestCardsDiffColors() {
    if(this.hand.length === 0) {
      return undefined;
    }
    var cloneHand = new Hand();
    for(let c of this.handCards) {
      cloneHand.addCard(c);
    }
    var diffHand = new Hand();
    diffHand.addCard(cloneHand.bestHighestCard().handCards);
    cloneHand.removeCard(cloneHand.bestHighestCard().handCards);
    while(cloneHand.handCards.length > 0) {
      var highCard = cloneHand.bestHighestCard().handCards;
      var colorExists = false;
      diffHand.handCards.forEach(function(card){
        if(card.color === highCard.color) {
          colorExists = true;
        }
      });
      if(!colorExists) {
        diffHand.addCard(highCard);
      }
      cloneHand.removeCard(highCard);
    }
    return diffHand;
  }
  bestRun() {
    if(this.hand.length === 0) {
      return undefined;
    }
    var runs = {1:0,2:0,3:0,4:0,5:0,6:0,7:0};
    var highestCard = {0:new Card(0,"violet"),1:new Card(0,"violet"),2:new Card(0,"violet"),3:new Card(0,"violet"),4:new Card(0,"violet"),5:new Card(0,"violet"),6:new Card(0,"violet"),7:new Card(0,"violet")};
    var hands = {0:new Hand(),1:new Hand(),2:new Hand(),3:new Hand(),4:new Hand(),5:new Hand(),6:new Hand(),7:new Hand()};
    for(let start = 1; start < 8; start++) {
      //check length of run starting from each number
      var currentLen = 0;
      var highCard = new Card(0,"violet");
      for(let num = start; num < 8; num++) {
        var hasNum = false;
        var matchingCard = undefined;
        this.hand.forEach(function(card){
          if(card.number === num) {
            hasNum = true;
            if(matchingCard != undefined) {
              if(card.isHigher(matchingCard)) {
                matchingCard = card;
              }
            } else {
              matchingCard = card;
            }
          }
        });
        if(hasNum) {
          currentLen++;
          hands[start].addCard(matchingCard);
          highCard = matchingCard;
        } else {
          break;
        }
      }
      runs[start] = currentLen;
      highestCard[start] = highCard;
    }
    //determine best run
    var highestRun = 0;
    var highestCount = 0;
    for(let n = 1; n < 8; n++) {
      if(runs[n] > highestCount) {
        highestRun = n;
        highestCount = runs[n];
      } else if (runs[n] === highestCount) {
        if(highestCard[n].isHigher(highestCard[highestRun])) {
          highestRun = n;
          highestCount = runs[n];
        }
      }
    }
    return hands[highestRun];
  }
  bestCardsBelow4() {
    if(this.hand.length === 0) {
      return undefined;
    }
    var matchingHand = new Hand();
    this.hand.forEach(function(card){
      if(card.number < 4) {
        matchingHand.addCard(card);
      }
    });
    return matchingHand;
  }
}

function isWinningCombo(ruleCard, palette, otherPalette) {
  //The rules of red7 say that you are winning if you match the rule better than anyone else(more cards match rule with highest card in match breaking ties).
  switch(ruleCard.color) {
    case "red":
      if(palette.bestHighestCard().handCards.isHigher(otherPalette.bestHighestCard().handCards)) return true;
      break;
    case "orange":
      var best1 = palette.bestCardsOneNumber();
      var best2 = otherPalette.bestCardsOneNumber();
      if(best1.handCards.length >= best2.handCards.length) {
        if(best1.handCards.length === best2.handCards.length) {
          if(best1.bestHighestCard().handCards.isHigher(best2.bestHighestCard().handCards)) {
            return true;
          }
        } else {
          return true;
        }
      }
      break;
    case "yellow":
      var best1 = palette.bestCardsOneColor();
      var best2 = otherPalette.bestCardsOneColor();
      if(best1.handCards.length >= best2.handCards.length) {
        if(best1.handCards.length === best2.handCards.length) {
          if(best1.bestHighestCard().handCards.isHigher(best2.bestHighestCard().handCards)) {
            return true;
          }
        } else {
          return true;
        }
      }
      break;
    case "green":
      var best1 = palette.bestEvenCards();
      var best2 = otherPalette.bestEvenCards();
      if(best1.handCards.length >= best2.handCards.length) {
        if(best1.handCards.length === best2.handCards.length) {
          if(best1.handCards.length === 0) {
             return false;
          }
          else if(best1.bestHighestCard().handCards.isHigher(best2.bestHighestCard().handCards)) {
            return true;
          }
        } else {
          return true;
        }
      }
      break;
    case "blue":
      var best1 = palette.bestCardsDiffColors();
      var best2 = otherPalette.bestCardsDiffColors();
      if(best1.handCards.length >= best2.handCards.length) {
        if(best1.handCards.length === best2.handCards.length) {
          if(best1.bestHighestCard().handCards.isHigher(best2.bestHighestCard().handCards)) {
            return true;
          }
        } else {
          return true;
        }
      }
      break;
    case "indigo":
      var best1 = palette.bestRun();
      var best2 = otherPalette.bestRun();
      if(best1.handCards.length >= best2.handCards.length) {
        if(best1.handCards.length === best2.handCards.length) {
          if(best1.bestHighestCard().handCards.isHigher(best2.bestHighestCard().handCards)) {
            return true;
          }
        } else {
          return true;
        }
      }
      break;
    case "violet":
      var best1 = palette.bestCardsBelow4();
      var best2 = otherPalette.bestCardsBelow4();
      if(best1.handCards.length >= best2.handCards.length) {
        if(best1.handCards.length === best2.handCards.length) {
          if(best1.handCards.length === 0) {
             return false;
          }
          else if(best1.bestHighestCard().handCards.isHigher(best2.bestHighestCard().handCards)) {
            return true;
          }
        } else {
          return true;
        }
      }
      break;
  }
  return false;
}

function canPlay(hand, palette, otherPalette) {
  var clonePalette = new Hand();
    for(let c of palette) {
      clonePalette.addCard(c);
    }
    //Check if any card to palette can win first.
    for(let c of hand.handCards) {
      clonePalette.addCard(c);
      if(isWinningCombo(ruleCards.handCards[ruleCards.handCards.length-1],clonePalette, otherPalette)) {
        return true;
      }
      clonePalette.removeCard(c);
    }
    //Next check for wins with rule change.
    for(let c of hand.handCards) {
      if(isWinningCombo(c, clonePalette, otherPalette)) {
        return true;
      } else {
        //Check if any palette play can win with rule.
        for(let h of hand.handCards) {
          if(h !== c) {
            clonePalette.addCard(c);
            if(isWinningCombo(c, clonePalette, otherPalette)) {
              return true;
            }
            clonePalette.removeCard(c);
          }
        }
      }
    }
    return false;
}

class AI {
  constructor(hand, palette) {
    this.hand = hand;
    this.palette = palette;
  }
  takeTurn(ruleStack, otherPalette) {
    var clonePalette = new Hand();
    for(let c of this.palette) {
      clonePalette.addCard(c);
    }
    //Check if any card to palette can win first.
    for(let c of this.hand.handCards) {
      clonePalette.addCard(c);
      if(isWinningCombo(ruleStack.handCards[ruleStack.handCards.length-1],clonePalette, otherPalette)) {
        //Play card that wins
        this.palette.addCard(c);
        this.hand.removeCard(c);
        return { winning: true, paletteAdded: c };
      }
      clonePalette.removeCard(c);
    }
    //Next check for wins with rule change.
    for(let c of this.hand.handCards) {
      if(isWinningCombo(c, clonePalette, otherPalette)) {
        //Play rule card that wins
        ruleStack.addCard(c);
        this.hand.removeCard(c);
        return { winning: true, ruleAdded: c };
      } else {
        //Check if any palette play can win with rule.
        for(let h of this.hand.handCards) {
          if(h !== c) {
            clonePalette.addCard(h);
            if(isWinningCombo(c, clonePalette, otherPalette)) {
              ruleStack.addCard(c);
              this.hand.removeCard(c);
              this.palette.addCard(h);
              this.hand.removeCard(h);
              return { winning: true, ruleAdded: c, paletteAdded: h };
            }
            clonePalette.removeCard(h);
          }
        }
      }
    }
    return { winning: false };
  }
}

function shuffleDeck(deckArray) {
  E.srand(Date.now());
  deckArray.sort(() => Math.random() - 0.5);
}

var deck = [];
//var screen = 1;
var startedGame = false;
var playerHand = new Hand();
var playerPalette = new Hand();
var AIhand = new Hand();
var AIPalette = new Hand();
var ruleCards = new Hand();
var undoStack = [];
var aiPlayer = new AI(AIhand, AIPalette);

function drawScreen1_2(card) {
  Bangle.removeAllListeners("touch");
  Bangle.removeAllListeners("swipe");
  //determine what actions can be taken
  var playedRule = false;
  var playedPalette = false;
  for(let stack of undoStack) {
    if(stack.to === ruleCards) {
      playedRule = true;
    }
    if(stack.to === playerPalette) {
      playedPalette = true;
    }
  }
  Bangle.on('swipe', function(direction){
    if(direction === -1 && !playedRule) {
      undoStack.push({from:playerHand,to:ruleCards,card:card});
      ruleCards.addCard(card);
      playerHand.removeCard(card);
      drawScreen1();
    }
    if(direction === 1 && !playedPalette) {
      undoStack.push({from:playerHand,to:playerPalette,card:card});
      playerPalette.addCard(card);
      playerHand.removeCard(card);
      drawScreen1();
    }
  });
  Bangle.on("touch", function(z,cord){
    if(!pointRectangleIntersection(cord, card.fullRect)) {
      drawScreen1();
    }
  });
  //draw elements
  g.setBgColor(0,0,0);
  g.clear();
  playerHand.draw(130, true);
  AIhand.drawBacks(40, true);
  card.draw(47,47,true);
  g.setColor(255,255,255);
  if(!playedRule) g.fillPoly([20,50,20,70,40,70,40,90,20,90,20,110,0,80]);
  if(!playedPalette) g.fillPoly([155,50,155,70,135,70,135,90,155,90,155,110,175,80]);
  g.setFont("4x6:1");
  g.setBgColor(255,255,255);
  g.setColor(0,0,0);
  if(!playedRule) g.drawString("Rule", 20,80, true);
  if(!playedPalette) g.drawString("Palette", 155,80, true);
}

function drawScreen1() {
  Bangle.removeAllListeners("touch");
  Bangle.removeAllListeners("swipe");
  Bangle.on('swipe', function(direction){
    if(direction === -1) {
      drawScreen2();
      //screen = 2;
    } else if(direction === 1) {
      drawScreen1();
      //screen = 1;
    }
  });
  g.setBgColor(0,0,0);
  g.clear();
  playerHand.draw(130, true);
  Bangle.on("touch", function(z,cord){
    var card = playerHand.checkForClick(cord);
    if (card !== undefined) {
      drawScreen1_2(card);
    }
  });
  AIhand.drawBacks(40, true);
  //Draw win indicator
  var winning = isWinningCombo(ruleCards.handCards[ruleCards.handCards.length-1], playerPalette, AIPalette);
  winning ? g.setColor(0,255,0) : g.setColor(255,0,0);
  g.fillEllipse(50,50,130,70);
  g.setFont("4x6:2");
  g.setFontAlign(0,0,0);
  g.setColor(255,255,255);
  winning ? g.setBgColor(0,255,0) : g.setBgColor(255,0,0);
  g.drawString(winning ? "Winning" : "Losing", 90,60, true);
  //Draw current rule
  var rules = ruleCards.handCards;
  if(rules.length > 0) {
    rules[rules.length-1].drawRot(40,80);
  }
}

function drawScreen2() {
  Bangle.removeAllListeners("touch");
  g.setBgColor(0,0,0);
  g.clear();
  g.setColor(255,255,255);
  g.setFont("6x8:2");
  g.setFontAlign(0,0,0);
  g.drawString("AI Palette",85,40,false);
  g.drawString("Your Palette", 85, 130, false);
  playerPalette.drawMicro(5,150);
  AIPalette.drawMicro(5,0);
}

function drawScreenHelp() {
  //E.showAlert("Rules can be found on asmadigames.com").then(function(){drawMainMenu();});
  E.showScroller({
    h: 25,
    c: 10,
    draw: (idx,r) => {
      g.setBgColor("#000").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
      g.setColor("#fff");
      switch(idx) {
        case 0:
          g.setFont("6x8:2").drawString("Rules can be",r.x+10,r.y+4);
          break;
        case 1:
          g.setFont("6x8:2").drawString("found on",r.x+10,r.y+4);
          break;
        case 2:
          g.setFont("Vector:18").drawString("asmadigames.com",r.x+10,r.y+4);
          break;
        case 3:
          g.setFont("6x8:1").drawString("Use button to show menu.",r.x+10,r.y+4);
          break;
        case 4:
          g.setFont("6x8:1").drawString("Swipe L/R for hand/palette.",r.x+10,r.y+4);
          break;
        case 5:
          g.setFont("6x8:1").drawString("Tap card to see details.",r.x+10,r.y+4);
          break;
        case 6:
          g.setFont("6x8:1").drawString("Swipe card L/R to play.",r.x+10,r.y+4);
          break;
        case 7:
          g.setFont("6x8:1").drawString("Finish turn in menu.",r.x+10,r.y+4);
          break;
        case 9:
          g.fillRect(r.x+40,r.y+0,r.x+140,r.y+20);
          g.setColor(0,0,0);
          g.setFont("Vector:14").drawString("OK",r.x+80,r.y+4);
          break;
      }
    },
    select: (idx) => {
      if(idx === 9){
        E.showScroller();
        drawMainMenu();
      }
    }
  });
}

function drawGameOver(win) {
  startedGame = false;
  E.showAlert(win ? "AI has given up. You Win!" : "You cannot play. AI wins.").then(function(){
    undoStack = [];
    drawMainMenu();
  });
}

function finishTurn() {
  undoStack = [];
  //Check if AI has cards
  if(AIhand.handCards.length === 0) {
    drawGameOver(true);
  } else {
    var aiResult = aiPlayer.takeTurn(ruleCards, playerPalette);
    E.showPrompt("AI played: " + ("paletteAdded" in aiResult ? aiResult["paletteAdded"].description+" to pallete. ":"") + ("ruleAdded" in aiResult ? aiResult["ruleAdded"].description+" to rules.":""),{buttons: {"Ok":0}}).then(function(){
      //Check if game over conditions met.
      if(!aiResult["winning"]) {
        drawGameOver(true);
      } else if(playerHand.handCards.length === 0) {
        drawGameOver(false);
      } else if(!canPlay(playerHand, playerPalette, AIPalette)) {
        drawGameOver(false);
      } else {
        E.showMenu();
        drawScreen1();
      }
    });
  }
}

function resetToNewGame() {
  g.setBgColor(0,0,0);
  g.clear();
  deck = [];
  //Fill deck with cards
  for(let c of colors) {
    for(let n of numbers) {
      deck.push(new Card(n,c));
    }
  }
  shuffleDeck(deck);
  playerHand = new Hand();
  playerHand.addCard(deck.pop());
  playerHand.addCard(deck.pop());
  playerHand.addCard(deck.pop());
  playerHand.addCard(deck.pop());
  playerHand.addCard(deck.pop());
  playerHand.addCard(deck.pop());
  playerHand.addCard(deck.pop());
  playerPalette = new Hand();
  playerPalette.addCard(deck.pop());

  AIhand = new Hand();
  AIhand.addCard(deck.pop());
  AIhand.addCard(deck.pop());
  AIhand.addCard(deck.pop());
  AIhand.addCard(deck.pop());
  AIhand.addCard(deck.pop());
  AIhand.addCard(deck.pop());
  AIhand.addCard(deck.pop());
  AIPalette = new Hand();
  AIPalette.addCard(deck.pop());
  ruleCards = new Hand();
  ruleCards.addCard(new Card(0,"red"));
  undoStack = [];
  startedGame = true;
  aiPlayer = new AI(AIhand, AIPalette);
  //determine first player
  if(isWinningCombo(new Card(0,"red"), playerPalette, AIPalette)) {
    //AI needs to play first
    finishTurn();
  } else {
    drawScreen1();
  }
}

function drawMainMenu() {
  Bangle.removeAllListeners("touch");
  Bangle.removeAllListeners("swipe");
  var menu = {"": {"title":"Red 7"}};
  if(startedGame === true) {
     menu["Continue"] = function(){
       E.showMenu();
       drawScreen1();
     };
    if(undoStack.length > 0) {
      menu["Undo Turn"] = function(){
        for(let stack of undoStack) {
          stack.from.addCard(stack.card);
          stack.to.removeCard(stack.card);
        }
        undoStack = [];
        E.showMenu();
        drawScreen1();
      };
    }
    if(isWinningCombo(ruleCards.handCards[ruleCards.handCards.length-1], playerPalette, AIPalette)) {
      menu["Finish Turn"] = function(){
        finishTurn();
      };
    }
  }
  menu["New Game"] = function() {
    if(startedGame == true) {  
      E.showPrompt("Discard and start new game?").then(function(v) {
            if(v) {
              E.showMenu();
              resetToNewGame();  
            } else {
              E.showMenu();
              drawScreen1();
            }
      });  
    } else {
      E.showMenu();
      resetToNewGame();
    }
    };
  menu["Help"] = function() {
      drawScreenHelp();
  };
  menu["Exit"] = function() {
      E.showMenu();
      setTimeout(load,300);
    };
  E.showMenu(menu);
}

drawMainMenu();
setWatch(function(){
  drawMainMenu(); 
},BTN, {edge: "rising", debounce: 50, repeat: true});
