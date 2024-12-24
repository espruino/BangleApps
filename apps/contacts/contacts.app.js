var Layout = require("Layout");

var contacts = require('Storage').readJSON("contacts.json", true) || [];

function writeContacts() {
  require('Storage').writeJSON("contacts.json", contacts);
}

function callNumber (number) {
  E.showMessage('Calling ' + number + '...');
  setTimeout(() => mainMenu(), 2000);
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
    "": {
      "title": "Contacts",
    },
    "< Back" : Bangle.load
  };
  if (!contacts.length) {
    menu['No Contacts'] = () => {};
  }
  contacts.forEach((e, idx) => {
    menu[e.name] = () => showContact(idx)
  })
  menu["Add Contact"] = addContact;
  g.clear();
  E.showMenu(menu);
}

function showContact(idx) {
  g.clear();
  var name = contacts[idx].name;
  let longName = g.setFont("6x8:2").stringWidth(name) >= g.getWidth();
  var number = contacts[idx].number;
  let longNumber = g.setFont("6x8:2").stringWidth(number) >= g.getWidth();
  (new Layout ({
    type:"v",
    c: [
      {type: 'h', filly: 3, fillx:1, c: [
        {type:"btn", font:"6x8", pad:1, fillx:1, filly:1, label: "<- Back to list", cb: mainMenu},
        {type:"btn", pad:1, fillx:1, filly:3, src: require("heatshrink").decompress(atob("jUawYGDgVJkgQGBAOSBAsJkALBBIoaCDogaCAQYXBgIIFkmAC4IIFyVAgAIGGQUJHwo4FAo2QBwICDNAVAkgCEEAYUFEAQUFE34mRPwgmEcYgmDUg8AgjLGgAA==")),
          cb: () => (
            E.showPrompt("Delete Contact '" + name + "'?", )
              .then((res) => { if (res) { deleteContact(idx) } else { mainMenu() } })
          )
        },
      ]},
      {type:"txt", font:longName ? "6x8" : "6x8:2", pad:1, fillx:2, filly:3, label: longName ? name.slice(0, name.length/2) + '\n' + name.slice(name.length/2) : name},
      {type:"txt", font: "6x8:2", pad:1, fillx:2, filly:3, label: longNumber ? number.slice(0, number.length/2) + '\n' + number.slice(number.length/2) : number},
      {type: 'h', filly: 3, fillx:1, c: [
          {type:"btn", pad:1, fillx:1, filly:3, src:atob("GBiBAAAAAAAAAAAAAB8AAB+AAB+AAB+AAB+AAA+AAA8AAA4AAAYAAAcAAAMAAAGAAAHB8ADz+AA/+AAf+AAH+AAA+AAAAAAAAAAAAA=="), cb: l => callNumber(number)},
        ]},
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

function deleteContact(idx) {
  contacts.splice(idx, 1);
  writeContacts();
  mainMenu();
}

function addContact() {
  require("textinput").input({text:""})
    .then(name => {
      name = name.trim();
      if (name !== "") {
        g.clear();
        showNumpad().then((number) => {
          contacts.push({name: name, number: number});
          writeContacts();
          mainMenu();
        })
      } else {
        E.showMessage("Invalid name");
        setTimeout(() => mainMenu(), 1000);
      }
    });
}

g.reset();
Bangle.setUI();
mainMenu();
