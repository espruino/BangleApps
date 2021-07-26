const Clubs = { width : 48, height : 48, bpp : 1,  
  buffer : require("heatshrink").decompress(atob("ACcP+AFDn/8Aod//wFD///AgUBAoOAApsDAoPAAr4vLI4pTEgP8L4M/wEH/5rB//gh//x/x//wj//9/3//4n4iBAAIZBAol/Aof+Apv5z4FP+OPAo41BAoX8I4Pj45HBAoPD4YFBLIOD4JZBRAMD4CKC/AFBj59Cg/gQYYFXAB4="))
};

const Spades = { width : 48, height : 48, bpp : 1,
  buffer : require("heatshrink").decompress(atob("ABsBwAFDgfAAocH8AFDh/wAocf/AFDn/8Aod//wFD///FwYFBGAUDAoIwCg4FBGAUPAoIwCj4FBGAU/AoIwCv4FBGAQEBGAQuCGAQuCGAQFLHQQ8CAupHLL4prB+fPTgU/8fHVwbLLApbXFbpYFLdIoADA=="))
};

const Hearts = { width : 48, height : 48, bpp : 4,
  buffer : require("heatshrink").decompress(atob("ADlVqtQBQ8FBYIKIrnMAAINGqoKC4okGCwYAB4AKDhgKE4oWKAAILDBQwYEBYwwDFwojFgoLHEgQ6H5hhCBZAkCBRAjLEgI6IC4YLIC5Y7BBZXBjgjVABYX/C8CnKABbXLABTvMC8sMC6fAC4KQURwIABRypgULwRgULwRIUCwhIRIwiRSRoZITCwx5POoowRCxAwNFxIwNCxQwLFxYwLCxgwJFxowJCxwwHFx4wHCyAwFFyIwFCyQwDFycAgoXBqAXTgFc4oWUJAJGUJARGVAEo"))
};

const Diamonds = { width : 48, height : 48, bpp : 4,
  buffer : require("heatshrink").decompress(atob("AHUFC60M4AXV5nFIyvM5hGVC4JIUCwJIUIwRIUIwRIUCwZISIwgABqBGUJCQWFPKBGGJCFcC455OCw4wOOox5QIxB5NOpBIOFxZ5LCxYwKOpQwMIxh5KOxipLL6xgNR5QwMX5TvXPJZ1JJBpGLPJR1LJBZGNPJIWOJA5GOPJB1NJBIWQPIpGRJApGRPIoWSJAa8PJA5GTJAYWUJAJGVAAJGVAHo="))
};


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
  g.drawString(msg, 155, 200);
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

  g.drawString('RST', 220, 35);
  g.drawString('Hit', 60, 230);
  g.drawString('Stand', 165, 230);

  g.setFont(fontName, 3);
  for(i=0; i<computer.Hand.length; i++){
    g.drawImage(eval(computer.Hand[i].Suit), i*48, 10);
    if(i == 1 && HideCard == 1)
      g.drawString("?", i*48+18, 58);
    else
      g.drawString(computer.Hand[i].Value, i*48+18, 58);
  }
  g.setFont(fontName, 2);
  g.drawString('BangleJS has '+ calcWeight(computer.Hand, HideCard), 5, 85);

  g.setFont(fontName, 3);
  for(i=0; i<player.Hand.length; i++){
    g.drawImage(eval(player.Hand[i].Suit), i*48, 125);
    g.drawString(player.Hand[i].Value, i*48+18, 175);
  }
  g.setFont(fontName, 2);
  g.drawString('You have ' + calcWeight(player.Hand, 0), 5, 202);
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

setWatch(hitMe, BTN4, {repeat:true, edge:"falling"});
setWatch(stand, BTN5, {repeat:true, edge:"falling"});
setWatch(startGame, BTN1, {repeat:true, edge:"falling"});

startGame();
