var keyboard = "textinput";
var Name = "";
Bangle.setLCDTimeout(0);
var menuOpen = 1;
var answers = new Array("no", "yes","WHAT????","What do you think", "That was a bad question", "YES!!!", "NOOOOO!!", "nope","100%","yup","why should I answer that?","think for yourself","ask again later, I'm busy", "what Was that horrible question","how dare you?","you wanted to hear yes? okay, yes", "Don't get angry when I say no","you are 100% wrong","totally, for sure","hmmm... I'll ponder it and get back to you later","wow, you really have a lot of questions", "NOPE","is the sky blue, hmmm...","I don't have time to answer","How many more questions before you change my name?","theres this thing called wikipedia","hmm... I don't seem to be able to reach the internet right now","if you phrase it like that, yes","Huh, never thought so hard in my life","The winds of time say no");
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
    "" : { title : Name },
    "< Back" : () => menu(),
    "Start" : () => {
      E.showMenu();
      g.clear();
      menuOpen = 0;
      Drawtext("ask " + Name + " a yes or no question");
    },
      "regenerate name" : () => {
      menu();
      generateName();
    },
    "show answers" : () => {
      var menu = new Array([]);
                for(var i = 0; i < answers.length; i++){
    menu.push({title : answers[i]});
  }
  E.showMenu(menu);


  },

    "Add answer" : () => {
      E.showMenu();
      keyboard.input({}).then(result => {if(result != ""){answers.push(result);} menu();});
    },
    "Edit name" : () => {
        E.showMenu();
        keyboard.input({}).then(result => {if(result != ""){Name = result;} menu();});

    },
    "Exit" : () => load(),
  });
}
menu();

      var answer;
function Drawtext(text)
{
  g.clear();
  g.setFont("Vector", 20);
  g.drawString(g.wrapString(text, g.getWidth(), -20).join("\n"));
}
function WriteAnswer()
{
  if (menuOpen == 0)
  {
      var randomnumber = Math.round(Math.random()*answers.length);
      answer = answers[randomnumber];
      Drawtext(answer);
    setTimeout(function() {
     Drawtext("ask " + Name + " a yes or no question");
}, 3000);

  }

}
setWatch(function() {
          menu();

}, (process.env.HWVERSION==2) ? BTN1 : BTN2, {repeat:true, edge:"falling"});

  Bangle.on('touch', function(button, xy) { WriteAnswer(); });
