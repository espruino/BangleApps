var Layout = require("Layout");
var key = "";
var myTimeout;
var pins = Object.assign(require('Storage').readJSON("pinsafe.json", true) || {});
print (pins);

function mainMenu() {
  if (myTimeout) clearTimeout(myTimeout);
  var menu = {
    "" : {title : "Decode:"},
    "< Back" : Bangle.load
  };
  if (Object.keys(pins).length==0) Object.assign(menu, {"NO CARDS":""});
  else for (let c in pins) {
    let pin=pins[c];
    menu[c]=()=>{decode(pin);};
  }
  Object.assign(menu, {"Add Card": addCard});
  Object.assign(menu, {"Remove Card":removeCard});
  E.showMenu(menu);
}
function decode(pin) {
  showNumpad("Key:", function() {
    if (key.length==0) mainMenu(); 
    else {
      var pinDecrypted="";
      for (let n=0;n<pin.length;n++) {
        pinDecrypted+=(10+Number(pin[n])-Number(key[n%key.length]))%10;
      }
      var showPin = new Layout ({
        type:"v", c: [
          {type:"txt", font:"30%", pad:1, fillx:1, filly:1, label:"PIN:"},
          {type:"txt", font:100/pinDecrypted.length+"%", pad:1, fillx:1, filly:1, label: pinDecrypted},
          {type:"btn", font:"30%", pad:1, fillx:1, filly:1, label:"OK", cb:l=>{mainMenu();}}
        ], lazy:true});
      g.clear();
      showPin.render();
      myTimeout = setTimeout(Bangle.load, 10000);
    }
  });
}
function showNumpad(text, callback) {
  E.showMenu();
  key="";
  function addDigit(digit) {
    key+=digit;
    Bangle.buzz(20);
    update();
  }
  function update() {
    numPad.clear(numPad.output);
    numPad.output.label="Key:"+key;
    numPad.render(numPad.output);
  }
  var numPad = new Layout ({
      type:"v", c: [{
        type:"v", width:180, c: [
          {type:"txt", font:"15%", pad:1, fillx:1, filly:1, id: "output", label:text+key},
          {type:"h", c: [
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"7", cb:l=>{addDigit("7");}},
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"8", cb:l=>{addDigit("8");}},
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"9", cb:l=>{addDigit("9");}}
          ]},
        {type:"h", c: [
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"4", cb:l=>{addDigit("4");}},
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"5", cb:l=>{addDigit("5");}},
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"6", cb:l=>{addDigit("6");}}
          ]},
          {type:"h", c: [
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"1", cb:l=>{addDigit("1");}},
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"2", cb:l=>{addDigit("2");}},
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:"3", cb:l=>{addDigit("3");}}
          ]},
          {type:"h", c: [
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:" 0 ", cb:l=>{addDigit("0");}},
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label:" C ", cb:l=>{key=key.slice(0,-1); update();}},
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, id:"OK", label:" OK", cb:callback}
          ]}
        ]}
      ], lazy:true});
  g.clear();
  numPad.render();  
}

function removeCard() {
  var menu = {
    "" : {title : "select card"},
    "< Back" : mainMenu
  };
  if (Object.keys(pins).length==0) Object.assign(menu, {"NO CARDS":""});
  else for (let c in pins) {
    let card=c;
    menu[c]=()=>{
      E.showMenu();
      var confirmRemove = new Layout (
        {type:"v", c: [
          {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:"Delete"},
          {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:card+"?"},
          {type:"h", c: [
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: "YES", cb:l=>{delete pins[card];mainMenu();}},
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: "NO", cb:l=>{mainMenu();}}
          ]}
        ], lazy:true});
      g.clear();
      confirmRemove.render();
    };
  }
  E.showMenu(menu);
}
function addCard() {
  var help = new Layout({
    type:"v", c: [
      {type:"btn", font:"8%", label:"Enter a name, PIN\nand key for your\ncard. The pin will\nbe stored on your\ndevice in encrypted\nform.", cb:l=>{
        require("textinput").input({text:""}).then(result => {
          if (pins[result]!=undefined) {
            E.showMenu();
            var alreadyExists = new Layout (
              {type:"v", c: [
                {type:"txt", font:Math.min(15,100/result.length)+"%", pad:1, fillx:1, filly:1, label:result},
                {type:"txt", font:"12%", pad:1, fillx:1, filly:1, label:"already exists."},
                {type:"h", c: [
                  {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label: "REPLACE", cb:l=>{encodeCard(result);}},
                  {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label: "CANCEL", cb:l=>{mainMenu();}}
                ]}
              ], lazy:true});
            g.clear();
            alreadyExists.render();
          } else 
            encodeCard(result);
        });
      }}
    ]
  });
  g.clear();
  help.render();
}

function encodeCard(name) {
  showNumpad("PIN:", function() {
    if (key.length==0) mainMenu();
    else {
      var pin=key;
      showNumpad("Key:", function() {
        if (key.length==0) mainMenu(); 
        else {
          var pinEncrypted="";
          for (let n=0;n<pin.length;n++) {
            a=(10+Number(pin[n])+Number(key[n%key.length]))%10;
            pinEncrypted+=a;
          }
          pins[name]=pinEncrypted;
          require('Storage').writeJSON("pinsafe.json", pins);
          mainMenu();
        }
      });
    }
  });
}
g.reset();
g.clear();
Bangle.setUI();
mainMenu();
