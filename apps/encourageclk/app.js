require("FontHaxorNarrow7x17").add(Graphics);
require("FontDylex7x13").add(Graphics);

const storage = require('Storage');
const locale = require("locale");
const dateutil = require("date_utils");
const currentFont=g.getFont();

const width = 175; 
const height = 175;
const offset = 25;

var d = new Date();
var nowDate = d.getDate(); //today's date
var encourage = ["you\'re doing great!","pas de deux it!","you\'re amazing~","you got dis","keep going","you\'re one\nin a melon!","we\'re rooting\nfor you!","believe in\nyourself","dance like\nno one\'s\nwatching"];
var encouragementtest = "you\'re one\nin a melon!";

//TAP ALL THE THINGS
Bangle.on('touch', (n, e) => {
  // <88, top
  if (e.x > offset && e.y < height) { //bar
    clearText();
    g.setColor(0,0,0);
    g.setFont("Dylex7x13",2).setFontAlign(0,0).drawString(getEncour(), width/2, height/2);
    setInterval(loader,3000);
  }
});

//getters
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getEncour(){ //return string
  let rando = getRandomInt(encourage.length);
  return encourage[rando];
}

//clear stuff
function clearText(){
  g.clearRect(0,offset*2,175,175-offset*2);
  g.drawRect(0,offset*2,175,175-offset*2);
}

function time() {
  var time = locale.time(d, 1);
  var date = locale.date(d);
  var mo = dateutil.month(d.getMonth() + 1, 1);
  g.setFont("HaxorNarrow7x17").setColor(0,0,0);
  g.setFontAlign(0, 0).setFont(currentFont, 5).drawString(time, width/2, 100);
  g.setFontAlign(-1,0).setFont(currentFont, 3).drawString(mo + " " + nowDate, width/2, 120);
}


function loader() {
  g.clear();
  Bangle.drawWidgets();
  Bangle.loadWidgets();
  time();
}

//ready set go!
g.clear();
Bangle.drawWidgets();
Bangle.loadWidgets();
time();
