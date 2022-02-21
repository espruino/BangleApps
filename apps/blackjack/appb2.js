var Clubs = require("heatshrink").decompress(atob("j0ewcBkmSpICipEAiQLHwA3BBY8gBQMEEA1AJwQgGyAKChILGBQUCFgxwDJpEAO5AVCII44CAQI1GAAg1GAAZQCWxCDEAAqJBQYQAFRIJWCAApcCR4YADPoRWCgQdBPopfCwAdBTw47BcBAvBU44vDfBDUIRIbUHATuQ"));

var Spades = require("heatshrink").decompress(atob("j0ewcBkmSpICuoALJIQILHpAKBJQ+QLIUJBYsgMoY1GBQcCBYmAPgkSEBEAgggIKApBDIg4KFHAZiCAAgsDBQw4DFitJFhQ4FTwplBgRoCSQoRBBYJ6EF4jgUwDUHAVOQA=="));

var Hearts = require("heatshrink").decompress(atob("j0ewY96gMkyAEByVIBQcSpILBhMkBYkEyQLBAQYKCCIQLEEwQgCBYuAEBFJkBBCBYw4CEA44CgQLHIYQsHLJsAEBJEHSQhxENwQADMQoAEKAdAWowLCYJESXggAFGowA/AAQ"));

var Diamonds = require("heatshrink").decompress(atob("j0ewY1ykgKJhIKJiVIEBOSoAKHpILBBQ+SBYOQBIsBCgILBwAKEgQgCAQIKEggICAQMgKwgUDAQI1GBY4IFLgoLGJpGSPoo4EMoxNIMoqSHiR6HLgizIPoLgfAFA"));

var deck = [];
var player = {Hand:[]};
var computer = {Hand:[]};
var ctx = {ready:true};

function createDeck() {
  var suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
  var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

  var dck = [];
  for (var i = 0 ; i < values.length; i++) {
    for(var x = 0; x < suits.length; x++) {
      dck.push({ Value: values[i], Suit: suits[x] });
    }
  }
  return dck;
}

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function EndGameMessdage(msg){
  ctx.ready = false;
  g.clearRect(0,160,176,176);
  g.setColor(255,255,255);
  g.fillRect(0,160,176,176);
  g.setColor(0,0,0);
  g.drawString(msg, 12, 155);
  setTimeout(function(){
    startGame();
  }, 2500);

}

function hitMe() {
  if (!ctx.ready) return;
  player.Hand.push(deck.pop());
  renderOnScreen(1);
  var playerWeight = calcWeight(player.Hand, 0);

  if(playerWeight == 21)
    EndGameMessdage('WINNER');
  else if(playerWeight > 21)
    EndGameMessdage('LOSER'); 
}

function calcWeight(hand, hideCard) {
  if(hideCard === 1) {
    if (hand[0].Value == "J" || hand[0].Value == "Q" || hand[0].Value == "K")
      return "10 +";
    else if (hand[0].Value == "A")
      return "11 +";
    else
      return parseInt(hand[0].Value) +" +";
  }
  else {
    var weight = 0;
    for(i=0; i<hand.length; i++){
      if (hand[i].Value == "J" || hand[i].Value == "Q" || hand[i].Value == "K") {
        weight += 10;
      }
      else if (hand[i].Value == "A") {
        weight += 1;
      }
      else
        weight += parseInt(hand[i].Value);
    }

    // Find count of aces because it may be 11 or 1
    var numOfAces = hand.filter(function(x){ return x.Value === "A"; }).length;
    for (var j = 0; j < numOfAces; j++) {
      if (weight + 10 <= 21) {
        weight +=10;
      }
    }
    return weight;
  }
}

function stand(){
  if (!ctx.ready) return;
  ctx.ready = false;
  function sleepFor( sleepDuration ){
    console.log("Sleeping...");
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
  }

  renderOnScreen(0);
  var playerWeight = calcWeight(player.Hand, 0);
  var bangleWeight = calcWeight(computer.Hand, 0);

  while(bangleWeight<17){
    sleepFor(500);
    computer.Hand.push(deck.pop());
    renderOnScreen(0);
    bangleWeight = calcWeight(computer.Hand, 0);
  }

  if (bangleWeight == playerWeight)
    EndGameMessdage('TIES');
  else if(playerWeight==21 || bangleWeight > 21 ||  bangleWeight < playerWeight)
    EndGameMessdage('WINNER');
  else if(bangleWeight > playerWeight)
    EndGameMessdage('LOOSER');
}

function renderOnScreen(HideCard) {
  const fontName = "6x8";

  g.clear();  // clear screen
  g.reset();  // default draw styles
  g.setFont(fontName, 1);
  
  g.setColor(255,255,255);
  g.fillRect(Bangle.appRect);
  g.setColor(0,0,0);
  
  g.drawString('Hit', 176/4-10, 160);
  g.drawString('Stand', 176/4+176/2-10, 160);

  g.setFont(fontName, 3);
  for(i=0; i<computer.Hand.length; i++){
    g.drawImage(eval(computer.Hand[i].Suit), i*40, -1);
    if(i == 1 && HideCard == 1)
      g.drawString("?", i*40+8, 30);
    else
      g.drawString(computer.Hand[i].Value, i*40+8, 30);
  }
  g.setFont(fontName, 2);
  g.drawString('AI has '+ calcWeight(computer.Hand, HideCard), 5, 55);

  g.setFont(fontName, 3);
  for(i=0; i<player.Hand.length; i++){
    g.drawImage(eval(player.Hand[i].Suit), i*40, 83);
    g.drawString(player.Hand[i].Value, i*40+8, 110);
  }
  g.setFont(fontName, 2);
  g.drawString('You have ' + calcWeight(player.Hand, 0), 5, 133);
}

function dealHands() {
  player.Hand= [];
  computer.Hand= [];
  ctx.ready = false;

  setTimeout(function(){
    player.Hand.push(deck.pop());
    renderOnScreen(0);
  }, 500);

  setTimeout(function(){
    computer.Hand.push(deck.pop());
    renderOnScreen(1);
  }, 1000);

  setTimeout(function(){
    player.Hand.push(deck.pop());
    renderOnScreen(1);
  }, 1500);

  setTimeout(function(){
    computer.Hand.push(deck.pop());
    renderOnScreen(1);
    ctx.ready = true;
  }, 2000);
}

function startGame(){
  deck = createDeck();
  deck = shuffle(deck);
  dealHands();
}

Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.2);
  var right = g.getWidth() - left;

  var is_left = e.x < left;
  var is_right = e.x > right;

  if(is_left){
    hitMe();

  } else if(is_right){
    stand();
  }
});
setWatch(startGame, BTN1, {repeat:true, edge:"falling"});

startGame();
