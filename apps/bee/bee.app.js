
const S = require("Storage");
const words = S.read("bee.words");
var letters = [];

var centers = [];

var word = '';

var foundWords = [];
var score = 0;

var intervalID = -1;

function biSearch(w, ws, start, end, count) {
  "compile"
  if (start>end-w.legnth || count--<=0) return ws.substr(start, end-start).indexOf("\n"+w+"\n");
  var mid = (end+start)>>1;
  if (ws[mid-1]==="\n") --mid;
  else while (mid<end && ws[mid]!=="\n") mid++;
  var i = 0;
  while (i<w.length && ws[mid+i+1]==w[i]) ++i;
  if (i==w.length && ws[mid+i+1]==="\n") return mid+1;
  if (i==w.length || w[i]<ws[mid+i+1]) return biSearch(w, ws, start, mid+1, count);
  if (w[i]>ws[mid+i+1]) return biSearch(w, ws, mid+1, end, count);
}

function isPangram(w) {
  var ltrs = '';
  for (var i=0; i<w.length; ++i) if (ltrs.indexOf(w[i])===-1) ltrs += w[i];
  return ltrs.length==7;
}

function checkWord (w) {
  if (w.indexOf(String.fromCharCode(97+letters[0]))==-1) return false; // does it contain central letter?
  if (foundWords.indexOf(w)>=0) return false; // already found
  if (biSearch(w, words, 0, words.length, 20)>-1) {
    foundWords.push(w);
    foundWords.sort();
    if (w.length==4) score++;
    else score += w.length;
    if (isPangram(w)) score += 7;
    return true;
  }
  return false;
}

function getHexPoly(cx, cy, r, a) {
  var p = [];
  for (var i=0; i<6; ++i) p.push(cx+r*Math.sin((i+a)/3*Math.PI), cy+r*Math.cos((i+a)/3*Math.PI));
  return p;
}

function drawHive() {
  w = g.getWidth();
  h = g.getHeight();
  const R = w/3.3;
  centers = getHexPoly(w/2, h/2+10, R, 0);
  centers.push(w/2, h/2+10);
  g.clear();
  g.setFont("Vector", w/7).setFontAlign(0, 0, 0);
  g.setColor(g.theme.fg);
  for (var i=0; i<6; ++i) {
    g.drawPoly(getHexPoly(centers[2*i], centers[2*i+1], 0.9*R/Math.sqrt(3), 0.5), {closed:true});
    g.drawString(String.fromCharCode(65+letters[i+1]), centers[2*i]+2, centers[2*i+1]+2);
  }
  g.setColor(1, 1, 0).fillPoly(getHexPoly(w/2, h/2+10, 0.9*R/Math.sqrt(3), 0.5));
  g.setColor(0).drawString(String.fromCharCode(65+letters[0]), w/2+2, h/2+10+2);
}

function shuffleLetters(qAll) {
  for (var i=letters.length-1; i > 0; i--) {
    var j = (1-qAll) + Math.floor(Math.random()*(i+qAll));
    var temp = letters[i];
    letters[i] = letters[j];
    letters[j] = temp;
  }
}

function pickLetters() {
  var ltrs = "";
  while (ltrs.length!==7) {
    ltrs = [];
    var i = Math.floor((words.length-10)*Math.random());
    while (words[i]!="\n" && i<words.length) ++i;
    if (i<words.length-1) {
      ++i;
      while (words[i]!=="\n") {
        var c = words[i];
        if (ltrs.indexOf(c)===-1) ltrs += c;
        ++i;
      }
    }
  }
  for (var i=0; i<7; ++i) letters.push(ltrs.charCodeAt(i)-97);
  shuffleLetters(1);
}

function drawWord(c) {
  g.clearRect(0, 0, g.getWidth()-1, 19);
  g.setColor(c).setFont("Vector", 20).setFontAlign(0, 0, 0).drawString(word, g.getWidth()/2, 11).flip();
}

function touchHandler(e, x) {
  var hex = 0;
  var hex_d = 1e6;
  for (var i=0; i<7; ++i) {
    var d = (x.x-centers[2*i])*(x.x-centers[2*i]) + (x.y-centers[2*i+1])*(x.y-centers[2*i+1]);
    if (d < hex_d) {
      hex_d = d;
      hex = i+1;
    }
  }
  hex = hex%7;
  if (word.length <= 15) word += String.fromCharCode(letters[hex]+65);
  drawWord(g.theme.fg);
}

function drawScore() {
  g.setColor(g.theme.fg).setFont("Vector", 20).setFontAlign(0, 0, 0);
  g.clearRect(0, g.getHeight()-22, 60, g.getHeight()-1);
  g.clearRect(g.getWidth()-60, g.getHeight()-22, g.getWidth(), g.getHeight()-1);
  g.drawString(foundWords.length.toString(), 30, g.getHeight()-11);
  g.drawString(score.toString(), g.getWidth()-30, g.getHeight()-11);
}

function wordFound (c) {
  word = "";
  drawWord(g.theme.fg);
  drawScore();
  clearInterval(intervalID);
  intervalID = -1;
}

function swipeHandler(d, e) {
  if (d==-1 && word.length>0) {
    word = word.slice(0, -1);
    drawWord(g.theme.fg);
  }
  if (d==1 && word.length>=4) {
    drawWord("#00f");
    drawWord((checkWord(word.toLowerCase()) ? "#0f0" : "#f00"));
    if (intervalID===-1) intervalID = setInterval(wordFound, 800);
  }
  if (e===1) {
    shuffleLetters(0);
    drawHive();
    drawScore();
    drawWord(g.theme.fg);
  }
  if (e===-1 && foundWords.length>0) showWordList();
}

function showWordList() {
  Bangle.removeListener("touch", touchHandler);
  Bangle.removeListener("swipe", swipeHandler);
  E.showScroller({
    h : 20, c : foundWords.length,
    draw : (idx, r) => {
      g.clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1).setFont("6x8:2");
      g.setColor(isPangram(foundWords[idx])?'#0f0':g.theme.fg).drawString(foundWords[idx].toUpperCase(),r.x+10,r.y+4);
    },
    select : (idx) => { 
      setInterval(()=> {
        E.showScroller();
        drawHive();
        drawScore();
        drawWord(g.theme.fg);
        Bangle.on("touch", touchHandler);
        Bangle.on("swipe", swipeHandler);
        clearInterval();
      }, 100);
    }
  });
}

pickLetters();
drawHive();
drawScore();
Bangle.on("touch", touchHandler);
Bangle.on("swipe", swipeHandler);
