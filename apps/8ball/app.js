try {keyboard = require(keyboard);} catch(e) {keyboard = null;}var keyboard = "textinput";
var Name = "";
var WaitTime = 0;
Bangle.setLCDTimeout(0);

var answers = new Array("no", "yes","WHAT????","What do you think", "That was a bad question", "YES!!!", "NOOOOO!!", "nope","100%","yup","why should I answer that?","think for yourself","ask again later, I'm busy", "what Was that horrible question","how dare you?","you wanted to hear yes? okay, yes", "Don't get angry when I say no","you are 100% wrong","totally, for sure","hmmm... I'll ponder it and get back to you later","I just asked the presedent and they say yes","wow, you really have a lot of questions", "NOPE","is the sky blue, hmmm...","I don't have time to answer","How many more questions before you change my name?","theres this thing called wikipedia","hmm... I don't seem to be able to reach the internet right now","if you phrase it like that, yes","Huh, never thought so hard in my life","The winds of time say no");
var consonants = new Array("b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","y","z");
var vowels = new Array("a","e","i","o","u");
try {keyboard = require(keyboard);} catch(e) {keyboard = null;}
function generateName()
{
  Name = "";
  var nameLength = Math.round(Math.random()*5);
    for(var i = 0; i < nameLength; i++){
  var cosonant = consonants[Math.round(Math.random()*consonants.length/2)];
  var vowel = vowels[Math.round(Math.random()*vowels.length/2)];
  Name = Name + cosonant + vowel;
  if(Name == "")
  {
    generateName();
  }
  }
}
generateName();
function menu()
{
  g.clear();
  E.showMenu();
  menuOpen = 1;
  E.showMenu({
    "" : { title : /*LANG*/Name },
    "< Back" : () => menu(),
    "Start" : () => {
      E.showMenu();
      g.clear();
      menuOpen = 0;
      Drawtext("ask " + Name + " a yes or no question");
    },
    "Show name" : () => {
      E.showMenu();
            if(Name == null)
      {
        E.showAlert("No Name Data").then(result => {menu();});
      }

      else
      {
        E.showAlert(Name).then(result => {menu();});
      }
          },
    
      "regenerate name" : () => {
      E.showMenu();
      generateName();
      E.showAlert("name regenerated as " + Name).then(result => {menu();});
      

    },
    "show answers" : () => {
      var menu = new Array();
                for(var i = 0; i < answers.length; i++){
    menu.push({title : answers[i]});
  }
  E.showMenu(menu);


  },

    "Add answer" : () => {
      E.showMenu();
      var result = keyboard.input({}).then(result => {if(result != ""){answers.push(result);} menu();});
    },
    "Edit name" : () => {
        E.showMenu();
        var result = keyboard.input({}).then(result => {Name = result, menu();});

    },
    "Exit" : () => load(),
  });
}
menu();

      var answer;
function Drawtext(text)
{
  g.clear();
  //g.setFontAlign(0,0);
  g.setFont("Vector", 20);
  g.drawString(g.wrapString(text, g.getWidth(), -20).join("\n"));


}
function DrawWidgets()
{
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
function WriteAnswer()
{
  if (menuOpen == 0)
  {
      var randomnumber = Math.round(Math.random()*answers.length);
      answer = answers[randomnumber];
  var i;

      Drawtext(answer);
    setTimeout(function() {
     Drawtext("ask " + Name + " a yes or no question");
}, 3000);

  }

}
//turns screen timeout off when menu closed
//needs attention
/*if(menuOpen == 1)
{
  Bangle.setLCDTimeout(10);
}
else
{
  Bangle.setLCDTimeout(undefined);
}*/

setWatch(function() {
          menu();

}, (process.env.HWVERSION==2) ? BTN1 : BTN2, {repeat:true, edge:"falling"});

  Bangle.on('touch', function(button, xy) { WriteAnswer(); });