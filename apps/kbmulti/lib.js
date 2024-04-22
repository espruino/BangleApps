//Multitap logic originally from here: http://www.espruino.com/Morse+Code+Texting

exports.input = function(options) {
  options = options||{};
  var text = options.text;
  if ("string"!=typeof text) text="";

  var settings = Object.assign({
    firstLaunch: true,
    showHelpBtn: true,
    charTimeout: 500,
    autoLowercase: true,
    vibrate: false,
  }, require('Storage').readJSON("kbmulti.settings.json", true));

  var fontSize = "6x15";
  var Layout = require("Layout");
  var letters = {
    "1":".,!?1","2":"ABC2","3":"DEF3",
    "4":"GHI4","5":"JKL5","6":"MNO6",
    "7":"PQRS7","8":"TUV80","9":"WXYZ9",
  };
  var helpMessage = 'Swipe:\nRight: Space\nLeft:Backspace\nUp: Move mode\nDown:Caps lock';

  var charTimeout; // timeout after a key is pressed
  var charCurrent; // current character (index in letters)
  var charIndex; // index in letters[charCurrent]
  var textIndex = text.length;
  var textWidth = settings.showHelpBtn ? 10 : 14;
  var caps = true;
  var layout;
  var btnWidth = g.getWidth()/3;

  function getMoveChar(){
    return "\x00\x0B\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x00@\x1F\xE1\x00\x10\x00\x10\x01\x0F\xF0\x04\x01\x00";
  }

  function getMoreChar(){
    return "\x00\x0B\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xDB\x1B`\x00\x00\x00";
  }

  function getCursorChar(){
    return "\x00\x0B\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\xAA\xAA\x80";
  }

  function displayText(hideMarker) {
    layout.clear(layout.text);

    //let charsBeforeCursor = textIndex;
    let charsAfterCursor = Math.min(text.length - textIndex, (textWidth)/2);


    let start = textIndex - Math.ceil(textWidth - charsAfterCursor);
    let startMore = false;
    if (start > 0) {start++; startMore = true}
    if (start < 0) start = 0;
    let cursor = textIndex + 1;

    let end = cursor + Math.floor(start + textWidth - cursor);
    if (end <= text.length) {end--; if (startMore) end--;}
    if (end > text.length) end = text.length;

    let pre = (start > 0 ? getMoreChar() : "") + text.slice(start, cursor);
    let post = text.slice(cursor, end) + (end < text.length - 1 ? getMoreChar() : "");

    layout.text.label = pre + (hideMarker ? " " : (moveMode? getMoveChar():getCursorChar())) + post;
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
    if (textIndex > -1){
      text = text.slice(0, textIndex) + text.slice(textIndex + 1);
      textIndex--;
      if (textIndex == -1 && !caps)
        setCaps()
      newCharacter();
    }
  }

  function setCaps() {
    caps = !caps;
    for (var key in letters) {
      layout[key].label = caps ? letters[key].toUpperCase() : letters[key].toLowerCase();
    }
    layout.render();
  }

  function newCharacter(ch) {
    displayText(false);
    if (ch && textIndex < text.length) textIndex ++;
    charCurrent = ch;
    charIndex = 0;
  }

  function onInteract() {
    if (settings.vibrate) Bangle.buzz(20);
  }

  function onKeyPad(key) {
    onInteract();
    var retire = 0;
    deactivateTimeout(charTimeout);
    // work out which char was pressed
    if (key==charCurrent) {
      charIndex = (charIndex+1) % letters[charCurrent].length;
      text = text.slice(0, -1);
    } else {
      retire = charCurrent !== undefined;
      newCharacter(key);
    }
    var newLetter = letters[charCurrent][charIndex];
    let pre = text.slice(0, textIndex);
    let post = text.slice(textIndex, text.length);

    text = pre + (caps ? newLetter.toUpperCase() : newLetter.toLowerCase()) + post;

    if(retire)
      retireCurrent();

    // set a timeout
    charTimeout = setTimeout(function() {
      charTimeout = undefined;
      newCharacter();
      retireCurrent();
    }, settings.charTimeout);
    displayText(true);
  }

  function retireCurrent() {
    if (caps && settings.autoLowercase)
      setCaps();
  }

  var moveMode = false;

  function onSwipe(dirLeftRight, dirUpDown) {
    onInteract();
    if (dirUpDown == -1) {
      moveMode = !moveMode;
      displayText(false);
    } else if (dirUpDown == 1) {
      setCaps();
    } else if (dirLeftRight == 1) {
      if (!moveMode){
        text = text.slice(0, textIndex + 1) + " " + text.slice(++textIndex);
        newCharacter();
      } else {
        if (textIndex < text.length) textIndex++;
        displayText(false);
      }
    } else if (dirLeftRight == -1) {
      if (!moveMode){
        backspace();
      } else {
        if (textIndex > -1) textIndex--;
        displayText(false);
      }
    }
    E.stopEventPropagation&&E.stopEventPropagation();
  }

  function onHelp(resolve,reject) {
    Bangle.removeListener("swipe", onSwipe);
    E.showPrompt(
      helpMessage, {title: "Help", buttons : {"Ok":true}}
    ).then(function(v) {
      if (Bangle.prependListener) {Bangle.prependListener('swipe', onSwipe);} else {Bangle.on('swipe', onSwipe);}
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
      if (Bangle.prependListener) {Bangle.prependListener('swipe', onSwipe);} else {Bangle.on('swipe', onSwipe);}
      layout.render();
    }
  });
};
