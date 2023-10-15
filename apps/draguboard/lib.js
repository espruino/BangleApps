exports.input = function(options) {
  options = options||{};
  var text = options.text;
  if ("string"!=typeof text) text="";
  let settings = require('Storage').readJSON('draguboard.json',1)||{};

  var R;
  const paramToColor = (param) => g.toColor(`#${settings[param].toString(16).padStart(3,0)}`);
  var BGCOLOR = g.theme.bg;
  var HLCOLOR = settings.Highlight ? paramToColor("Highlight") : g.theme.fg;
  var ABCCOLOR = settings.ABC ? paramToColor("ABC") : g.toColor(1,0,0);//'#FF0000';
  var NUMCOLOR = settings.Num ? paramToColor("Num") : g.toColor(0,1,0);//'#00FF00';
  var BIGFONT = '6x8:3';
  var SMALLFONT = '6x8:1';

  var LEFT = "IJKLMNOPQ";
  var MIDDLE = "ABCDEFGH";
  var RIGHT = "RSTUVWXYZ";

  var NUM = ' 1234567890!?,.-@';
  var rectHeight = 40;
  var vLength = LEFT.length;
  var MIDPADDING;
  var NUMPADDING;
  var showCharY;
  var middleWidth;
  var middleStart;
  var topStart;

  function drawAbcRow() {
    g.clear();
    try { // Draw widgets if they are present in the current app.
      if (WIDGETS) Bangle.drawWidgets();
    } catch (_) {}
    g.setColor(ABCCOLOR);
    g.setFont('6x8:2x1');
    g.setFontAlign(-1, -1, 0);
    g.drawString(RIGHT.split("").join("\n\n"), R.x2-28, topStart);
    g.drawString(LEFT.split("").join("\n\n"), R.x+22, topStart);
    g.setFont('6x8:1x2');
    var spaced = MIDDLE.split("").join(" ");
    middleWidth = g.stringWidth(spaced);
    middleStart = (R.x2-middleWidth)/2;
    g.drawString(spaced, (R.x2-middleWidth)/2, (R.y2)/2);
    g.fillRect(MIDPADDING, (R.y2)-26, (R.x2-MIDPADDING), (R.y2));
    // Draw left and right drag rectangles
    g.fillRect(R.x, R.y, 12, R.y2);
    g.fillRect(R.x2, R.y, R.x2-12, R.y2);
  }

  function drawNumRow() {
    g.setFont('6x8:1x2');
    g.setColor(NUMCOLOR);
    NUMPADDING = (R.x2-g.stringWidth(NUM))/2;
    g.setFontAlign(-1, -1, 0);
    g.drawString(NUM, NUMPADDING, (R.y2)/4);
    g.drawString("<-", NUMPADDING+10, showCharY+5);
    g.drawString("->", R.x2-(NUMPADDING+20), showCharY+5);

    g.fillRect(NUMPADDING, (R.y2)-rectHeight*4/3, (R.x2)-NUMPADDING, (R.y2)-rectHeight*2/3);
  }

  function updateTopString() {
    g.setFont(SMALLFONT);
    g.setColor(BGCOLOR);
    g.fillRect(R.x,R.y,R.x2,R.y+9);
    var rectLen = text.length<27? text.length*6:27*6;
    g.setColor(0.7,0,0);
    //draw cursor at end of text
    g.fillRect(R.x+rectLen+5,R.y,R.x+rectLen+10,R.y+9);
    g.setColor(HLCOLOR);
    g.setFontAlign(-1, -1, 0);
    g.drawString(text.length<=27? text : '<- '+text.substr(-24,24), R.x+5, R.y+1);
  }

  function showChars(chars) {
    "ram";

    // clear large character
    g.setColor(BGCOLOR);
    g.fillRect(R.x+65,showCharY,R.x2-65,showCharY+28);

    // show new large character
    g.setColor(HLCOLOR);
    g.setFont(BIGFONT);
    g.setFontAlign(-1, -1, 0);
    g.drawString(chars, (R.x2 - g.stringWidth(chars))/2, showCharY+4);
  }

  var charPos;
  var char;
  var prevChar;

  function moveCharPos(list, select, posPixels) {
    charPos = Math.min(list.length-1, Math.max(0, Math.floor(posPixels)));
    char = list.charAt(charPos);

    if (char != prevChar) showChars(char);
    prevChar = char;

    if (select) {
      text += char;
      updateTopString();
    }
  }

  let dragHandlerUB = function(event) {
    "ram";

    // drag on middle bottom rectangle
    if (event.x > MIDPADDING - 2 && event.x < (R.x2-MIDPADDING + 2) && event.y >= ( (R.y2) - 12 )) {
      moveCharPos(MIDDLE, event.b == 0, (event.x-middleStart)/(middleWidth/MIDDLE.length));
    }
    // drag on left or right rectangle
    else if (event.y > R.y && (event.x < MIDPADDING-2 || event.x > (R.x2-MIDPADDING + 2))) {
      moveCharPos(event.x<MIDPADDING-2 ? LEFT : RIGHT, event.b == 0, (event.y-topStart)/((R.y2 - topStart)/vLength));
    }
    // drag on top rectangle for number or punctuation
    else if ((event.y < ( (R.y2) - 12 )) && (event.y > ( (R.y2) - 52 ))) {
      moveCharPos(NUM, event.b == 0, (event.x-NUMPADDING)/6);
    }
    // Make a space or backspace by tapping right or left on screen above green rectangle
    else if (event.y > R.y && event.b == 0) {
      if (event.x < (R.x2)/2) {
        showChars('<-');
        text = text.slice(0, -1);
      } else {
        //show space sign
        showChars('->');
        text += ' ';
      }
      prevChar = null;
      updateTopString();
    }
  };

  let catchSwipe = ()=>{
    E.stopEventPropagation&&E.stopEventPropagation();
  };

  return new Promise((resolve,reject) => {
    // Interpret touch input
    Bangle.setUI({
      mode: 'custom',
      back: ()=>{
        Bangle.setUI();
        Bangle.prependListener&&Bangle.removeListener('swipe', catchSwipe); // Remove swipe lister if it was added with `Bangle.prependListener()` (fw2v19 and up).
        g.clearRect(Bangle.appRect);
        resolve(text);
      },
      drag: dragHandlerUB
    });
    Bangle.prependListener&&Bangle.prependListener('swipe', catchSwipe); // Intercept swipes on fw2v19 and later. Should not break on older firmwares.

    R = Bangle.appRect;
    MIDPADDING = R.x + 35;
    showCharY = (R.y2)/3;
    topStart = R.y+12;

    drawAbcRow();
    drawNumRow();
    updateTopString();
  });
};
