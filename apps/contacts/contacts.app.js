/* contacts.js */

var Layout = require("Layout");

var wp = require('Storage').readJSON("contacts.json", true) || [];
// var wp = [];

var key; /* Shared between functions, typically wp name */

function writeContact() {
  require('Storage').writeJSON("contacts.json", wp);
}

function callNumber (number) {
  Bluetooth.println(JSON.stringify({
    t:"intent",
    target:"activity",
    action:"android.intent.action.CALL",
    flags:["FLAG_ACTIVITY_NEW_TASK"],
    categories:["android.intent.category.DEFAULT"],
    data: 'tel:' + number,
  }))

}

function mainMenu() {
  var menu = {
    "< Back" : Bangle.load
  };
  if (!wp.length) {
    menu['No Contacts'] = () => {};
  } else {
    for (const e of wp) {
      const closureE = e;
      menu[e.name] = () => showContact(closureE);
    }
  }
  menu["Add"] = addCard;
  menu["Remove"] = removeCard;
  g.clear();
  E.showMenu(menu);
}

function showContact(i) {
  g.clear();
  (new Layout ({
    type:"v",
    c: [
      {type:"txt", font:"10%", pad:1, fillx:1, filly:1, label:i["name"] + "\n" + i["number"]},
      {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label:"Call", cb:l=>{callNumber(i['number']);}},
      {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label:"Back to list", cb:l=>{mainMenu();}}
    ],
    lazy:true
  })).render();
}

function showNumpad(prompt, callback) {
  let number = ''
  E.showMenu();
  function addDigit(digit) {
    number += digit;
    Bangle.buzz(20);
    update();
  }
  function update() {
    g.reset();
    g.clearRect(0,0,g.getWidth(),23);
    g.setFont("Vector:24").setFontAlign(1,0).drawString(prompt + number, g.getWidth(),12);
  }
  const ds="12%";
  const digitBtn = (digit) => ({type:"btn", font:ds, width:58, label:digit, cb:l=>{addDigit(digit);}});
  var numPad = new Layout ({
    type:"v", c: [{
      type:"v", c: [
        {type:"", height:24},
        {type:"h",filly:1, c: [digitBtn("1"), digitBtn("2"), digitBtn("3")]},
        {type:"h",filly:1, c: [digitBtn("4"), digitBtn("5"), digitBtn("6")]},
        {type:"h",filly:1, c: [digitBtn("7"), digitBtn("8"), digitBtn("9")]},
        {type:"h",filly:1, c: [
          {type:"btn", font:ds, width:58, label:"C", cb:l=>{key=key.slice(0,-1); update();}},
          {type:"btn", font:ds, width:58, label:"0", cb:l=>{addDigit("0");}},
          {type:"btn", font:ds, width:58, id:"OK", label:"OK", cb: callback}
        ]}
      ]}
    ], lazy:true});
  g.clear();
  numPad.render();  
  update();
}

function removeCard() {
  var menu = {
    "" : {title : "Select Contact"},
    "< Back" : mainMenu
  };
  if (wp.length===0) Object.assign(menu, {"No Contacts":""});
  else {
    wp.forEach((val, card) => {
      const name = wp[card].name;
      menu[name]=()=>{
        E.showMenu();
        var confirmRemove = new Layout (
          {type:"v", c: [
            {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:"Delete"},
            {type:"txt", font:"15%", pad:1, fillx:1, filly:1, label:name},
            {type:"h", c: [
              {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: "YES", cb:l=>{
                wp.splice(card, 1);
                writeContact();
                mainMenu();
              }},
              {type:"btn", font:"15%", pad:1, fillx:1, filly:1, label: " NO", cb:l=>{mainMenu();}}
            ]}
          ], lazy:true});
        g.clear();
        confirmRemove.render();
      };
    });
  }
  E.showMenu(menu);
}

function askPosition(callback) {
  showNumpad("", "", function() {
    callback(key, "");
  });
}

function createContact(lat, name) {
  wp.push({lat: lat, name: name});
  print("add -- contacts", wp);
  writeContact();
}

function addCardName2(key) {
  g.clear();
  askPosition(function(lat, lon) {
      print("position -- ", lat, lon);
      createContact(lat, result);
      mainMenu();
  });
}

function addCardName(key) {
  result = key;
  if (wp[result] !== undefined) {
  E.showMenu();
  var alreadyExists = new Layout (
    {type:"v", c: [
      {type:"txt", font:Math.min(15,100/result.length)+"%", pad:1, fillx:1, filly:1, label:result},
      {type:"txt", font:"12%", pad:1, fillx:1, filly:1, label:"already exists."},
      {type:"h", c: [
        {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label: "REPLACE", cb:l=>{ addCardName2(key); }},
        {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label: "CANCEL", cb:l=>{mainMenu();}}
      ]}
    ], lazy:true});
  g.clear();
  alreadyExists.render();
     return;
  }
  addCardName2(key);  
}

function addCard() {
  require("textinput").input({text:""}).then(result => {
    if (result !== "") {
      addCardName(result);
    } else
      mainMenu();
  });
}

g.reset();
Bangle.setUI();
mainMenu();
