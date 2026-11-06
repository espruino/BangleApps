// Morse Keyboard for Bangle.js
// Touch-based 4-button Morse input

exports.input = function(options) {
  options = options || {};

  // -------------------- MORSE TABLE --------------------
  const MORSE = {
    ".-":"A", "-...":"B", "-.-.":"C", "-..":"D", ".":"E",
    "..-.":"F", "--.":"G", "....":"H", "..":"I", ".---":"J",
    "-.-":"K", ".-..":"L", "--":"M", "-.":"N", "---":"O",
    ".--.":"P", "--.-":"Q", ".-.":"R", "...":"S", "-":"T",
    "..-":"U", "...-":"V", ".--":"W", "-..-":"X", "-.--":"Y",
    "--..":"Z",
    "-----":"0", ".----":"1", "..---":"2", "...--":"3",
    "....-":"4", ".....":"5", "-....":"6", "--...":"7",
    "---..":"8", "----.":"9"
  };

  // -------------------- STATE --------------------
  let currentSignals = "";
  let outputText = ("string" == typeof options.text) ? options.text : "";
  let pauseCount = 0;
  let resolver;
  let swipeListener = null;

  // -------------------- BUTTON LAYOUT --------------------
  const R = Bangle.appRect;
  const BW = R.w/2;
  const BH = R.h/2;

  const buttons = {
    dot  : {x:R.x,    y:R.y,    w:BW, h:BH},
    dash : {x:R.x+BW, y:R.y,    w:BW, h:BH},
    ret  : {x:R.x,    y:R.y+BH, w:BW, h:BH},
    del  : {x:R.x+BW, y:R.y+BH, w:BW, h:BH}
  };

  // -------------------- UI DRAWING --------------------
  function drawUI() {
    g.clearRect(R);
    g.setFont("6x8", 2);
    g.drawString(".", R.x+2, R.y+2);
    g.drawString("-", R.x2-8, R.y+2);
    g.drawString("ret", R.x+2, R.y2-20);
    g.drawString("del", R.x2-40, R.y2-20);
    g.drawString("Morse: " + currentSignals, R.x+10, R.y+BH+20);
    // right-aligned, so the most recent text and the character the current
    // signals decode to stay visible instead of being clipped off screen
    g.setFontAlign(1,-1);
    g.drawString("Text:" + outputText.slice(-20), R.x2-2, R.y+BH);
    let ch = MORSE[currentSignals];
    if (ch) g.drawString(ch, R.x2-2, R.y+BH+20);
    g.setFontAlign(-1,-1);
  }

  // -------------------- INPUT HANDLING --------------------
  function addSignal(s) {
    currentSignals += s;
    pauseCount = 0;
    Bangle.buzz(30);
    drawUI();
  }

  function commitCharacter() {
    if (!currentSignals) return;
    let ch = MORSE[currentSignals] || "?";
    outputText += ch;
    currentSignals = "";
    drawUI();
  }

  function deletePressed() {
    if (currentSignals.length) {
      currentSignals = currentSignals.slice(0, -1);
    } else if (outputText.length) {
      outputText = outputText.slice(0, -1);
    }
    Bangle.buzz(50);
    drawUI();
  }

  function pausePressed() {
    pauseCount++;
    if (pauseCount === 1) {
      commitCharacter();
    } else if (pauseCount === 3) {
      outputText += " ";
      pauseCount = 0;
    }
    Bangle.buzz(20);
    drawUI();
  }

  function addChar(c) {
    outputText += c;
    drawUI();
  }

  function openSpecialMenu() {
    removeSwipeListeners();
    E.showMenu({
      "" : { title : "Special" },
      "." : () => {addChar("."); exitMenu();},
      "," : () => {addChar(","); exitMenu();},
      "?" : () => {addChar("?"); exitMenu();},
      "!" : () => {addChar("!"); exitMenu();},
      "-" : () => {addChar("-"); exitMenu();},
      "< Back" : () => exitMenu()
    });
  }

  function exitMenu() {
    addSwipeListeners();
    setupUI();
    drawUI();
  }

  function handleTouch(x, y) {
    for (let k in buttons) {
      let b = buttons[k];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        if (k === "dot") addSignal(".");
        else if (k === "dash") addSignal("-");
        else if (k === "ret") pausePressed();
        else if (k === "del") deletePressed();
        return true;
      }
    }
    return false;
  }

  function handleSwipe(lr, ud) {
    if (lr === 1) {
      // Swipe right - DONE
      commitCharacter();
      cleanup();
      resolver(outputText);
    } else if (lr === -1) {
      // Swipe left - CANCEL
      cleanup();
      resolver(undefined);
    }
    if (ud === 1) {
      // Swipe up - Special menu
      openSpecialMenu();
    }
  }

  // -------------------- UI SETUP / CLEANUP --------------------
  function setupUI() {
    Bangle.setUI({
      mode: "custom",
      touch: (_, xy) => {
        handleTouch(xy.x, xy.y);
      }
    });
    // Hardware button - DONE. Handled via btnWatches (like kbmorse) instead of
    // setUI's "back" option, because "back" adds a back-widget in the top left
    // corner which would overlap the dot button.
    Bangle.btnWatches = [
      setWatch(() => {
        commitCharacter();
        cleanup();
        resolver(outputText);
      }, BTN1, {edge:"rising"})
    ];
  }

  function addSwipeListeners() {
    // A single prepended listener that both handles the swipe and stops it
    // from propagating to the calling app. A separate catch-swipe listener
    // would run first and stop this one from ever being called.
    swipeListener = (lr, ud) => {
      E.stopEventPropagation && E.stopEventPropagation();
      handleSwipe(lr, ud);
    };
    if (Bangle.prependListener) {
      Bangle.prependListener('swipe', swipeListener);
    } else {
      Bangle.on('swipe', swipeListener);
    }
  }

  function removeSwipeListeners() {
    if (swipeListener) {
      Bangle.removeListener('swipe', swipeListener);
      swipeListener = null;
    }
  }

  function cleanup() {
    removeSwipeListeners();
    Bangle.setUI(); // also clears btnWatches and touch/drag handlers
    g.clearRect(R);
  }

  return new Promise((resolve, reject) => {
    resolver = resolve;
    addSwipeListeners();
    setupUI();
    drawUI();
  });
}
