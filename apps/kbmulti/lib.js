//Multitap logic originally from here: http://www.espruino.com/Morse+Code+Texting

exports.input = function(options) {
  options = options||{};
  var text = options.text;
  if ("string"!=typeof text) text="";

  var fontSize = "6x15";
  var Layout = require("Layout");
  var letters = {
    "1":".,!?1","2":"ABC2","3":"DEF3",
    "4":"GHI4","5":"JKL5","6":"MNO6",
    "7":"PQRS7","8":"TUV8","9":"WXYZ9",
    "0":"_@:/0"
  };

  var charTimeout; // timeout after a key is pressed
  var charCurrent; // current character (index in letters)
  var charIndex; // index in letters[charCurrent]
  var caps = true;
  var layout;
  //var text = "";

  function displayText() {
    layout.clear(layout.text);
    layout.text.label = text;
    layout.render(layout.text);
  }

  function backspace() {
    // remove the timeout if we had one
    if (charTimeout!==undefined) {
      clearTimeout(charTimeout);
      charTimeout = undefined;
    }
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
    text = text.replace("_", " ");
    displayText();
    charCurrent = ch;
    charIndex = 0;
  }

  function onKeyPad(key) {
    // remove the timeout if we had one
    if (charTimeout!==undefined) {
      clearTimeout(charTimeout);
      charTimeout = undefined;
    }
    // work out which char was pressed
    if (key==charCurrent) {
      charIndex = (charIndex+1) % letters[charCurrent].length;
      text = text.slice(0, -1);
    } else {
      newCharacter(key);
    }
    var newLetter = letters[charCurrent][charIndex];
    text += (caps ? newLetter.toUpperCase() : newLetter.toLowerCase());
    displayText();
    // set a timeout
    charTimeout = setTimeout(function() {
      charTimeout = undefined;
      newCharacter();
    }, 750);
  }
  return new Promise((resolve,reject) => {
    layout = new Layout( {
      type:"v", c: [
        {type:"txt", font:"10%", label:"", id:"text", filly:1, fillx:1},
        {type:"h", c: [
          {type:"btn", font:fontSize, label:letters[1], cb: l=>onKeyPad(1), id:'1', fillx:1 },
          {type:"btn", font:fontSize, label:letters[2], cb: l=>onKeyPad(2), id:'2', fillx:1 },
          {type:"btn", font:fontSize, label:letters[3], cb: l=>onKeyPad(3), id:'3', fillx:1 },
        ]},
        {type:"h", c: [
          {type:"btn", font:fontSize, label:letters[4], cb: l=>onKeyPad(4), id:'4', fillx:1 },
          {type:"btn", font:fontSize, label:letters[5], cb: l=>onKeyPad(5), id:'5', fillx:1 },
          {type:"btn", font:fontSize, label:letters[6], cb: l=>onKeyPad(6), id:'6', fillx:1 },
        ]},
        {type:"h", c: [
          {type:"btn", font:fontSize, label:letters[7], cb: l=>onKeyPad(7), id:'7', fillx:1 },
          {type:"btn", font:fontSize, label:letters[8], cb: l=>onKeyPad(8), id:'8', fillx:1 },
          {type:"btn", font:fontSize, label:letters[9], cb: l=>onKeyPad(9), id:'9', fillx:1 },
        ]},
        {type:"h", c: [
          {type:"btn", font:fontSize, label:letters[0], cb: l=>onKeyPad(0), id:'0', fillx:1 },
          {type:"btn", font:fontSize, label:"^", cb: l=>setCaps(), id:'caps', fillx:1},
          {type:"btn", font:fontSize, label:"<", cb: l=>backspace(), fillx:1 },
        ]},
      ]
    },{back: ()=>{
      Bangle.setUI();
      g.clearRect(Bangle.appRect);
      resolve(text);
    }});
    g.clearRect(Bangle.appRect);
    layout.render();
  });
};