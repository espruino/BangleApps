/* contacts.js */

var Layout = require("Layout");

//const W = g.getWidth();
//const H = g.getHeight();

var wp = require('Storage').readJSON("contacts.json", true) || [];
// Use this with corrupted contacts
//var wp = [];

var key; /* Shared between functions, typically wp name */

function writeContact() {
  require('Storage').writeJSON("contacts.json", wp);
}

function mainMenu() {
  var menu = {
    "< Back" : Bangle.load
  };
  if (Object.keys(wp).length==0) Object.assign(menu, {"NO Contacts":""});
  else for (let id in wp) {
    let i = id;
    menu[wp[id]["name"]]=()=>{ decode(i); };
  }
  menu["Add"]=addCard;
  menu["Remove"]=removeCard;
  g.clear();
  E.showMenu(menu);
}

function decode(pin) {
  var i = wp[pin];
  var l = i["name"] + "\n" + i["number"];
  var la = new Layout ({
    type:"v", c: [
      {type:"txt", font:"10%", pad:1, fillx:1, filly:1, label: l},
      {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label:"OK", cb:l=>{mainMenu();}}
    ], lazy:true});
  g.clear();
  la.render();
}

function showNumpad(text, key_, callback) {
  key = key_;
  E.showMenu();
  function addDigit(digit) {
    key+=digit;
    if (1) {
      l = text[key.length];
      switch (l) {
        case '.': case ' ': case "'":
          key+=l;
          break;
        case 'd': case 'D': default:
          break;
      }
    }
    Bangle.buzz(20);
    update();
  }
  function update() {
    g.reset();
    g.clearRect(0,0,g.getWidth(),23);
    s = key + text.substr(key.length, 999);
    g.setFont("Vector:24").setFontAlign(1,0).drawString(s,g.getWidth(),12);
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
    "" : {title : "Select Contact"},
    "< Back" : mainMenu
  };
  if (Object.keys(wp).length==0) Object.assign(menu, {"No Contacts":""});
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
  showNumpad("dddDDDddd", "", function() {
    callback(key, "");
  });
}

function createContact(lat, name) {
  let n = {};
  n["name"] = name;
  n["number"] = lat;
  wp.push(n);
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
  if (wp[result]!=undefined) {
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
    if (result != "") {
      addCardName(result);
    } else
      mainMenu();
  });
}

g.reset();
Bangle.setUI();
mainMenu();
