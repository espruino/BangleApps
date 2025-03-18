var Layout = require("Layout");
var myTimeout;
var pins = Object.assign(require('Storage').readJSON("pinsafe.json", true) || {});
function mainMenu() {
  if (myTimeout) clearTimeout(myTimeout);
  var menu = {
    "" : {title : "Decode:"},
    "< Back" : Bangle.load
  };
  if (Object.keys(pins).length==0) Object.assign(menu, {"NO CARDS":""});
  else for (let id in pins) {
    let p=pins[id];
    menu[id]=()=>{decode(p);};
  }
  menu["Add Card"]=addCard;
  menu["Remove Card"]=removeCard;
  g.clear();
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
    g.reset();
    g.clearRect(0,0,g.getWidth(),23);
    g.setFont("Vector:24").setFontAlign(1,0).drawString(text+key,g.getWidth(),12);
  }
  ds="12%";
  var numPad = new Layout ({
      type:"v", c: [{
        type:"v", c: [
          {type:"", height:24},
          {type:"h",filly:1, c: [
            {type:"btn", font:ds, width:58, label:"7", cb:l=>{addDigit("7");}},
            {type:"btn", font:ds, width:58, label:"8", cb:l=>{addDigit("8");}},
            {type:"btn", font:ds, width:58, label:"9", cb:l=>{addDigit("9");}}
          ]},
          {type:"h",filly:1, c: [
            {type:"btn", font:ds, width:58, label:"4", cb:l=>{addDigit("4");}},
            {type:"btn", font:ds, width:58, label:"5", cb:l=>{addDigit("5");}},
            {type:"btn", font:ds, width:58, label:"6", cb:l=>{addDigit("6");}}
          ]},
          {type:"h",filly:1, c: [
            {type:"btn", font:ds, width:58, label:"1", cb:l=>{addDigit("1");}},
            {type:"btn", font:ds, width:58, label:"2", cb:l=>{addDigit("2");}},
            {type:"btn", font:ds, width:58, label:"3", cb:l=>{addDigit("3");}}
          ]},
          {type:"h",filly:1, c: [
            {type:"btn", font:ds, width:58, label:"0", cb:l=>{addDigit("0");}},
            {type:"btn", font:ds, width:58, label:"C", cb:l=>{key=key.slice(0,-1); update();}},
            {type:"btn", font:ds, width:58, id:"OK", label:"OK", cb:callback}
          ]}
        ]}
      ], lazy:true});
  g.clear();
  numPad.render();  
  update();
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
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: "YES", cb:l=>{
              delete pins[card];          
              require('Storage').writeJSON("pinsafe.json", pins);
              mainMenu();
            }},
            {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: " NO", cb:l=>{mainMenu();}}
          ]}
        ], lazy:true});
      g.clear();
      confirmRemove.render();
    };
  }
  E.showMenu(menu);
}
function addCard() {
  var infoScreen = new Layout({
    type:"v", c: [
      {type:"txt", font:"10%", label:"Enter a name, PIN\nand key for your\ncard. The PIN will\nbe stored on your\ndevice in encrypted\nform.\nTap to continue!", cb:l=>{
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
  infoScreen.render();
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
Bangle.setUI();
mainMenu();
