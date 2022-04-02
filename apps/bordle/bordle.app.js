var Layout = require("Layout");

var gameState = 0;
var keyState = 0;
var keyStateIdx = 0;

function buttonPushed(b) {
  if (keyState==0) {
    keyState++;
    keyStateIdx = b;
    if (b<6) {
      for (i=1; i<=5; ++i) {
        var c = String.fromCharCode(i+64+(b-1)*5);
        layout["bt"+i.toString()].label = c;
        layout["bt"+i.toString()].bgCol = wordle.keyColors[c]||g.theme.bg;
      }
      layout.bt6.label = "<";
    }
    else {
      layout.bt1.label = "Z";
      layout.bt1.bgCol = wordle.keyColors.Z||g.theme.bg;
      layout.bt2.label = "<del>";
      layout.bt4.label = "<ent>";
      layout.bt3.label = layout.bt5.label = " ";
      layout.bt6.label = "<";
    }
  }
  else { // actual button pushed
    inp = layout.input.label;
    if (b!=6) {
      if ((keyStateIdx<=5 || b<=1) && inp.length<5) inp += String.fromCharCode(b+(keyStateIdx-1)*5+64);
      else if (layout.input.label.length>0 && b==2) inp = inp.slice(0,-1);
      layout.input.label = inp;
    }
    layout = getKeyLayout(inp);
    keyState = 0;
    if (inp.length==5 && keyStateIdx==6 && b==4) {
      rc = wordle.addGuess(inp);
      layout.input.label = "";
      layout.update();
      gameState = 0;
      if (rc>0) return;
      g.clear();
      wordle.render();
      return;
    }
  }
  layout.update();
  g.clear();
  layout.render();
}

function getKeyLayout(text) {
  return new Layout( {
  type: "v", c: [
    {type:"txt", font:"6x8:2", id:"input", label:text, pad: 3},
    {type: "h", c: [
      {type:"btn", font:"6x8:2", id:"bt1", label:"ABCDE", cb: l=>buttonPushed(1), pad:4, filly:1, fillx:1 },
      {type:"btn", font:"6x8:2", id:"bt2", label:"FGHIJ", cb: l=>buttonPushed(2), pad:4, filly:1, fillx:1 },
    ]},
    {type: "h", c: [
      {type:"btn", font:"6x8:2", id:"bt3", label:"KLMNO", cb: l=>buttonPushed(3), pad:4, filly:1, fillx:1 },
      {type:"btn", font:"6x8:2", id:"bt4", label:"PQRST", cb: l=>buttonPushed(4), pad:4, filly:1, fillx:1 },
    ]},
    {type: "h", c: [
      {type:"btn", font:"6x8:2", id:"bt5", label:"UVWXY", cb: l=>buttonPushed(5), pad:4, filly:1, fillx:1 },
      {type:"btn", font:"6x8:2", id:"bt6", label:"Z ...", cb: l=>buttonPushed(6), pad:4, filly:1, fillx:1 },
    ]}
  ]});
}

class Wordle {
  constructor(word) {
    this.word = word;
    this.guesses = [];
    this.guessColors = [];
    this.keyColors = [];
    this.nGuesses = -1;
    if (word == "rnd") {
      this.words = require("Storage").read("wordlencr.txt");
      i = Math.floor(Math.floor(this.words.length/5)*Math.random())*5;
      this.word = this.words.slice(i, i+5).toUpperCase();
    }
    console.log(this.word);
  }
  render(clear) {
    h = g.getHeight();
    bh = Math.floor(h/6);
    bbh = Math.floor(0.85*bh);
    w = g.getWidth();
    bw = Math.floor(w/5);
    bbw = Math.floor(0.85*bw);
    if (clear) g.clear();
    g.setFont("Vector", Math.floor(bbh*0.95)).setFontAlign(0,0);
    g.setColor(g.theme.fg);
    for (i=0; i<6; ++i) {
      for (j=0; j<5; ++j) {
        if (i<=this.nGuesses) {
          g.setColor(this.guessColors[i][j]).fillRect(j*bw+(bw-bbw)/2, i*bh+(bh-bbh)/2, (j+1)*bw-(bw-bbw)/2, (i+1)*bh-(bh-bbh)/2);
          g.setColor(g.theme.fg).drawString(this.guesses[i][j], 2+j*bw+bw/2, 2+i*bh+bh/2);
        }
        g.setColor(g.theme.fg).drawRect(j*bw+(bw-bbw)/2, i*bh+(bh-bbh)/2, (j+1)*bw-(bw-bbw)/2, (i+1)*bh-(bh-bbh)/2);
      }
    }
  }
  addGuess(w) {
    if ((this.words.indexOf(w.toLowerCase())%5)!=0) {
      E.showAlert(w+"\nis not a word", "Invalid word").then(function() { 
        layout = getKeyLayout("");
        wordle.render(true);
      });
      return 3;
    }
    this.guesses.push(w);
    this.nGuesses++;
    this.guessColors.push([]);
    correct = 0;
    var sol = this.word;
    for (i=0; i<w.length; ++i) {
      c = w[i];
      col = g.theme.bg;
      if (sol[i]==c) {
        sol = sol.substr(0,i) + '?' + sol.substr(i+1);
        col = "#0f0";
        ++correct;
      }
      else if (sol.includes(c)) col = "#ff0";
      if (col!=g.theme.bg) this.keyColors[c] = this.keyColors[c] || col;
      else this.keyColors[c] = "#00f";
      this.guessColors[this.nGuesses].push(col);
    }
    if (correct==5) { 
      E.showAlert("The word is\n"+this.word, "You won in "+(this.nGuesses+1)+" guesses!").then(function(){load();});
      return 1;
    }
    if (this.nGuesses==5) {
      E.showAlert("The word was\n"+this.word, "You lost!").then(function(){load();});
      return 2;
    }
  }
}

wordle = new Wordle("rnd");
layout = getKeyLayout("");
wordle.render(true);

Bangle.on('swipe', function (dir) {
  if (dir==1 || dir==-1) {
    g.clear();
    if (gameState==0) {
      layout.render();
      gameState = 1;
    }
    else if (gameState==1) {
      wordle.render();
      gameState = 0;
    }
  }
});
