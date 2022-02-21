var storage = require("Storage");
var score;
score = storage.readJSON("score.json",1);
console.log("Home: " + score.home + " Away: " + score.away);

var counter = score.home; //home
var counter1 = score.away; //away
function clear() {
g.clear();
}
var tempParamProm;
function prompt(promTxt, titleProm, paramss) {
if(paramss === undefined) {
E.showPrompt(promTxt, {title:titleProm}).then(function(promptData) {return promptData});
}
if(paramss !== undefined) {
tempParamProm = paramss;
//Usage for params
//{title: promptTitle, buttons: {"Bttn1", "Value", "Bttn2", 2, "Bttn3", 3}, img:atob(imgdata)}
tempParamProm.title = titleProm;
E.showPrompt(promTxt, tempParamProm).then(function(promptData) {updateScreen()});
}
}
var width, height;

var tempImg, tempParamsImg, imgLoaded;
function color(colorr) {
g.setColor(colorr);
}
imgLoaded = false;
function loadImage(filename443, callbackFunc) {
console.log("loading");
imgLoaded = false;
console.log(imgLoaded);
tempImg = require("Storage").read(filename443);
imgLoaded = true;
console.log(imgLoaded);
console.log("loaded");
if(callbackFunc !== undefined && typeof callbackFunc === 'function') {
callback(callbackFunc);
}
}
function resetImgLoaded() {
imgLoaded = false;
}
function getImage(filename444) {
return require("Storage").read(filename444);
}
function image(x5, y5) {
if(tempImg === undefined) {
console.log("IMG_NOT_LOADED");
} else if(tempImg !== undefined) {
g.drawImage(tempImg, x5, y5);
}
}
var tutorialDone;
tutorialDone = false;
//E.showMessage('Top Button = + Home, Middle\nButton = - Home, Bottom Button =\n + Away, Tap Screen = - Away', "Tutorial");
//g.drawString('Top Button = + Home, Middle\nButton = - Home, Bottom Button =\n + Away, Tap Screen = - Away', 115, 200);

function updateScreen() {
  tutorialDone = true;
    clear();
  if(imgLoaded === true) {
    image(0, 0);
  }
  g.setFont("6x8",1.5).setFontAlign(0,0);
  g.setColor(0xFFFF);
  g.setFont("Vector",40).setFontAlign(0,0);
  g.drawString("Home- " + counter, 100, 50);
  g.drawString("Away- " + counter1, 100, 100);
  score.home = counter;
  score.away = counter1;
  storage.write("score.json", score);
  //g.drawString('-', 45, 100);
  //g.drawString('+', 185, 100);
}


// add a count by using BTN1 or BTN5
setWatch(() => {
  if(tutorialDone === true){counter += 1;}
  updateScreen();
}, BTN1, {repeat:true});

setWatch(() => {
  if(tutorialDone === true){counter -= 1;}
  updateScreen();
}, BTN2, {repeat:true});


setWatch(() => {
  if(tutorialDone === true){counter1 -= 1;}
  updateScreen();
}, BTN4, {repeat:true});

setWatch(() => {
  if(tutorialDone === true){counter1 += 1;}
  updateScreen();
}, BTN5, {repeat:true});


var loopStop;
loopStop = false;
prompt('Top Button = + Home, Middle\nButton = - Home, Tap Right Side =\n + Away, Tap Left Side = - Away', "Tutorial", {buttons: {"OK": true}});
//not used

loadImage("upward.img", updateScreen);

// reset by using BTN2
/*setWatch(() => {
  counter = 0;
  updateScreen();
}, BTN2, {repeat:true});*/

//commented out for the tutorial to show
//updateScreen();


//Score saves to score.json file and is loaded on start 