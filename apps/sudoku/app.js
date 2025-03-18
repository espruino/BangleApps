var settings = require("Storage").readJSON("sudoku.json",1)||{};

const Layout = require("Layout");
var puzzle = ""; // start puzzle space for blanks, 81 char str
var solution = ""; // the solution for the puzzle 81 char str
var current = ""; // current puzzle state, 81 char str 
var sx=4, sy=4; // selected item
var dx=0, dy=0, dmoved=false; // current drag amount
const DRAG = 20;
const CHOOSERFONT = "12x20:2";
const COL_GOOD = "#00F";
const COL_BAD  = "#F00";

function saveSettings() {
  settings.puzzle = puzzle;
  settings.solution = solution;
  settings.current = current;
  require("Storage").writeJSON("sudoku.json",settings);
}

function startGame(difficulty) {
  let file = require("Storage").read("sudoku.easy.txt");
  let games = 0|(file.length/163);
  let game = Math.floor(Math.random()*games);
  let line = file.substr(game*163, 162);
  puzzle = line.substr(0,81).replaceAll("-"," ");
  current = ""+puzzle; // new string
  solution = line.substr(81,81);
  showGrid();
}

function draw() {
  g.clear(1);  
  for (var i=0;i<10;i++) {
    g.setColor((i%3)?"#888":g.theme.fg);
    g.fillRect(7+18*i, 7, 7+18*i, 169);
    g.fillRect(7, 7+18*i, 169, 7+18*i);
  }
  i = 0;
  g.setFont("6x8:2").setFontAlign(0,0);
  for (var y=0;y<9;y++) 
    for (var x=0;x<9;x++) 
      g.setColor(puzzle[i]==" "?((solution[i]==current[i])?COL_GOOD:COL_BAD):g.theme.fg).drawString(current[i++], 16 + 18*x, 16 + 18*y);
}
function drawSq(x,y,sel) {
  g.setColor(sel ? g.theme.bgH : g.theme.bg).fillRect(8+x*18,8+y*18,24+x*18,24+y*18);  
  g.setFont("6x8:2").setFontAlign(0,0).setColor(sel ? g.theme.fgH : g.theme.fg);  
  var i = x+y*9;
  g.setColor(puzzle[i]==" "?((solution[i]==current[i])?COL_GOOD:COL_BAD):g.theme.fg).drawString(current[i++], 16 + 18*x, 16 + 18*y);
}

// precalculate our layout
var choose = function(num) {
  if (num!==undefined) {
    Bangle.buzz(100);
    var i = sx+sy*9;
    current = current.substr(0,i)+num+current.substr(i+1);
  }
  showGrid();
  if (current == solution) {
    saveSettings();
    E.showMessage(/*LANG*/"Well done,\nyou finished!", {
      title:"Sudoku",
      buttons : {"Ok":true},
      img : require("heatshrink").decompress(atob("k8pwcBkmSpICCnVp0IIFAQl27dt2wOJ9On7/582YtOJBws7tv/DoQKCBwubvvmzVp0wCCHAvf9u2DpE8uOn7waEjQdDq1Itv+DQQCB0gZBkMkyPHj1tHAuGAQOJktt/Ubvo4DAQI3ChMcuPHzd5HAeasICBtFOr/kw3fDQe27RhCofH/lx4xxFSQIFBiu/rNhHAp0DyHx447BHAh0Ekt/61YlodFOgaPBDoJWFAQeJrf1yySBDohWCoVJOgUcKw+YyVOrtly0LKw4eBp4dCjytHBwNOrNlyUbDoVpHAYDBo4dH02EFoTpBDoQ7B2MyZALMCHYsGtOOjALDAQQ7CyM6tFkFIgCDDoPBnkT4wLFAQegxP8z/JBxNwp8E+ALHAQMl+V/n4aIAQI4B4McBxU/z/P8gOKjnx4JHJAQP//5WKSoVwDRICBv//FJTRDBxeT/5WLkmR45WLkitLARNIA"))
    }).then(showMenu);
  }
};
var numberChooser = new Layout( {
  type:"v", c: [
    {type:"h", c: [
      {type:"btn", font:CHOOSERFONT, label:"1", fillx:1, cb:()=>choose(1) },
      {type:"btn", font:CHOOSERFONT, label:"2", fillx:1, cb:()=>choose(2) },
      {type:"btn", font:CHOOSERFONT, label:"3", fillx:1, cb:()=>choose(3) }
    ]},
    {type:"h", c: [
      {type:"btn", font:CHOOSERFONT, label:"4", fillx:1, cb:()=>choose(4) },
      {type:"btn", font:CHOOSERFONT, label:"5", fillx:1, cb:()=>choose(5) },
      {type:"btn", font:CHOOSERFONT, label:"6", fillx:1, cb:()=>choose(6) }
    ]},
    {type:"h", c: [
      {type:"btn", font:CHOOSERFONT, label:"7", fillx:1, cb:()=>choose(7) },
      {type:"btn", font:CHOOSERFONT, label:"8", fillx:1, cb:()=>choose(8) },
      {type:"btn", font:CHOOSERFONT, label:"9", fillx:1, cb:()=>choose(9) }
    ]}
  ], fillx:1
}, {btns:[ {label:/*LANG*/"Back", cb: l=>choose()} ]});

function showGrid() {
  Bangle.setUI({mode:"custom", drag:e=>{
    if (e.b) {
      dx += e.dx;
      dy += e.dy;
      while (Math.abs(dx) >= DRAG) {
        Bangle.buzz(40);
        let old = sx;
        sx = (sx+9+Math.sign(dx))%9;
        dx -= Math.sign(dx)*DRAG;
        drawSq(old,sy,0);
        drawSq(sx,sy,1);
        dmoved = true;
      }
      while (Math.abs(dy) >= DRAG) {
        Bangle.buzz(40);
        let old = sy;
        sy = (sy+9+Math.sign(dy))%9;
        dy -= Math.sign(dy)*DRAG;
        drawSq(sx,old,0);
        drawSq(sx,sy,1);
        dmoved = true;
      }
    } else {
      if (!dmoved && puzzle[sx+sy*9]==" ") {
        Bangle.buzz(100);
        setTimeout(showSelectNumber, 10);
      }
      dx = dy = 0;
      dmoved = false;
    }
  }, btn:() => {
    saveSettings();
    showMenu();
  }});
  draw();
  drawSq(sx,sy,1);
}

function showSelectNumber() {
  g.clear();
  numberChooser.setUI();
  numberChooser.render();
}

function showMenu() {
  var menu = { "" : { title: "Sudoku" } };
  if (settings.puzzle) 
    menu["Resume Game"] = () => {
      puzzle = settings.puzzle;
      solution = settings.solution;
      current = settings.current;
      showGrid();
    };
  menu["New Game"] = () => {
    E.showMenu({ "" : { title: /*LANG*/"Difficulty", back : showMenu },
      "Easy" : () => startGame("easy"),
      "Medium" : () => startGame("medium"),
      "Hard" : () => startGame("hard")
    });
  };
  menu["Exit"] = () => load();
  E.showMenu(menu);
}

if (settings.puzzle) {
  puzzle = settings.puzzle;
  solution = settings.solution;
  current = settings.current;
  showGrid();
} else {
  showMenu();
}

E.on("kill", saveSettings); // ensure we save the game
