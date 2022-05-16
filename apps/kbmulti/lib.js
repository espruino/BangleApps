//Multitap logic originally from here: http://www.espruino.com/Morse+Code+Texting

exports.input = function(options) {
  options = options||{};
  var text = options.text;
  if ("string"!=typeof text) text="";

  var settings = require('Storage').readJSON("kbmulti.settings.json", true) || {};
  if (settings.firstLaunch===undefined) { settings.firstLaunch = true; }
  if (settings.charTimeout===undefined) { settings.charTimeout = 500; }
  if (settings.showHelpBtn===undefined) { settings.showHelpBtn = true; }

  var fontSize = "6x15";
  var Layout = require("Layout");
  var letters = {
    "1":".,!?1","2":"ABC2","3":"DEF3",
    "4":"GHI4","5":"JKL5","6":"MNO6",
    "7":"PQRS7","8":"TUV80","9":"WXYZ9",
  };
  var helpMessage = 'Swipe:\nRight: Space\nLeft:Backspace\nUp/Down: Caps lock\n';

  var charTimeout; // timeout after a key is pressed
  var charCurrent; // current character (index in letters)
  var charIndex; // index in letters[charCurrent]
  var caps = true;
  var layout;
  var btnWidth = g.getWidth()/3

  function displayText(hideMarker) {
    layout.clear(layout.text);
    layout.text.label = text.slice(settings.showHelpBtn ? -11 : -13) + (hideMarker ? " " : "_");
    layout.render(layout.text);
  }

  function deactivateTimeout(charTimeout) {
    if (charTimeout!==undefined) {
      clearTimeout(charTimeout);
      charTimeout = undefined;
    }
  }

  function backspace() {
    deactivateTimeout(charTimeout);
    text = text.slice(0, -1);
    newCharacter();
  }

  function setCaps() {
    caps = !caps;
    for (var key in letters) {
      layout[key].label = caps ? letters[key].toUpperCase() : letters[key].toLowerCase();
    }
    layout.render();
  }

  function newCharacter(ch) {
    displayText();
    charCurrent = ch;
    charIndex = 0;
  }

  function onKeyPad(key) {
    deactivateTimeout(charTimeout);
    // work out which char was pressed
    if (key==charCurrent) {
      charIndex = (charIndex+1) % letters[charCurrent].length;
      text = text.slice(0, -1);
    } else {
      newCharacter(key);
    }
    var newLetter = letters[charCurrent][charIndex];
    text += (caps ? newLetter.toUpperCase() : newLetter.toLowerCase());
    // set a timeout
    charTimeout = setTimeout(function() {
      charTimeout = undefined;
      newCharacter();
    }, settings.charTimeout);
    displayText(charTimeout);
  }

  function onSwipe(dirLeftRight, dirUpDown) {
    if (dirUpDown) {
      setCaps();
    } else if (dirLeftRight == 1) {
      text += ' ';
      newCharacter();
    } else if (dirLeftRight == -1) {
      backspace();
    }
  }

  function onHelp(resolve,reject) {
    Bangle.removeListener("swipe", onSwipe);
    E.showPrompt(
      helpMessage, {title: "Help", buttons : {"Ok":true}}
    ).then(function(v) {
      Bangle.on('swipe', onSwipe);
      generateLayout(resolve,reject);
      layout.render();
    });
  }

  function generateLayout(resolve,reject) {
    layout = new Layout( {
    type:"v", c: [
      {type:"h", c: [
        {type:"txt", font:"12x20", label:text.slice(-12), id:"text", fillx:1},
        (settings.showHelpBtn ? {type:"btn", font:'6x8', label:'?', cb: l=>onHelp(resolve,reject), filly:1 } : {}),
      ]},
      {type:"h", c: [
        {type:"btn", font:fontSize, label:letters[1], cb: l=>onKeyPad(1), id:'1', width:btnWidth, filly:1 },
        {type:"btn", font:fontSize, label:letters[2], cb: l=>onKeyPad(2), id:'2', width:btnWidth, filly:1 },
        {type:"btn", font:fontSize, label:letters[3], cb: l=>onKeyPad(3), id:'3', width:btnWidth, filly:1 },
      ]},
      {type:"h", filly:1, c: [
        {type:"btn", font:fontSize, label:letters[4], cb: l=>onKeyPad(4), id:'4', width:btnWidth, filly:1 },
        {type:"btn", font:fontSize, label:letters[5], cb: l=>onKeyPad(5), id:'5', width:btnWidth, filly:1 },
        {type:"btn", font:fontSize, label:letters[6], cb: l=>onKeyPad(6), id:'6', width:btnWidth, filly:1 },
      ]},
      {type:"h", filly:1, c: [
        {type:"btn", font:fontSize, label:letters[7], cb: l=>onKeyPad(7), id:'7', width:btnWidth, filly:1 },
        {type:"btn", font:fontSize, label:letters[8], cb: l=>onKeyPad(8), id:'8', width:btnWidth, filly:1 },
        {type:"btn", font:fontSize, label:letters[9], cb: l=>onKeyPad(9), id:'9', width:btnWidth, filly:1 },
      ]},
    ]
    },{back: ()=>{
      deactivateTimeout(charTimeout);
      Bangle.setUI();
      Bangle.removeListener("swipe", onSwipe);
      g.clearRect(Bangle.appRect);
      resolve(text);
    }});
  }

  return new Promise((resolve,reject) => {
    g.clearRect(Bangle.appRect);
    if (settings.firstLaunch) {
      onHelp(resolve,reject);
      settings.firstLaunch = false;
      require('Storage').writeJSON("kbmulti.settings.json", settings);
    } else {
      generateLayout(resolve,reject);
      displayText(false);
      Bangle.on('swipe', onSwipe);
      layout.render();
    }
  });
};
