/* contacts.js */

var Layout = require("Layout");

var wp = require('Storage').readJSON("contacts.json", true) || [];

function writeContacts() {
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
  menu["Add"] = addContact;
  menu["Remove"] = removeContact;
  g.clear();
  E.showMenu(menu);
}

function showContact(i) {
  g.clear();
  (new Layout ({
    type:"v",
    c: [
      {type:"txt", font:"10%", pad:1, fillx:1, filly:1, label: i["name"] + "\n" + i["number"]},
      {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label: "Call", cb: l => callNumber(i['number'])},
      {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label: "Back to list", cb: mainMenu}
    ],
    lazy:true
  })).render();
}

function showNumpad() {
  return new Promise((resolve, reject) => {
    let number = ''
    E.showMenu();
    function addDigit(digit) {
      number += digit;
      Bangle.buzz(20);
      update();
    }
    function removeDigit() {
      number = number.slice(0, -1);
      Bangle.buzz(20);
      update();
    }
    function update() {
      g.reset();
      g.clearRect(0,0,g.getWidth(),23);
      g.setFont("Vector:24").setFontAlign(1,0).drawString(number, g.getWidth(),12);
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
            {type:"btn", font:ds, width:58, label:"C", cb: removeDigit},
            digitBtn('0'),
            {type:"btn", font:ds, width:58, id:"OK", label:"OK", cb: l => resolve(number)}
          ]}
        ]}
      ], lazy:true});
    g.clear();
    numPad.render();
    update();
  });
}

function removeContact() {
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
                writeContacts();
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


function addNewContact(name) {
  g.clear();
  showNumpad().then((number) => {
      wp.push({name: name, number: number});
      writeContacts();
      mainMenu();
  })



}

function tryAddContact(name) {
  if (wp.filter((e) => e.name === name).length) {
    E.showMenu();
    var alreadyExists = new Layout (
      {type:"v", c: [
        {type:"txt", font:Math.min(15,100/name.length)+"%", pad:1, fillx:1, filly:1, label:name},
        {type:"txt", font:"12%", pad:1, fillx:1, filly:1, label:"already exists."},
        {type:"h", c: [
          {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label: "REPLACE", cb:l=>{ addNewContact(name); }},
          {type:"btn", font:"10%", pad:1, fillx:1, filly:1, label: "CANCEL", cb:l=>{mainMenu();}}
        ]}
      ], lazy:true});
    g.clear();
    alreadyExists.render();
     return;
  }
  addNewContact(name);
}

function addContact() {
  require("textinput").input({text:""}).then(name => {
    if (name !== "") {
      tryAddContact(name);
    } else
      mainMenu();
  });
}

g.reset();
Bangle.setUI();
mainMenu();
