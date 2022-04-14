//Keep banglejs screen on for 100 sec at 0.55 power level for development purposes
//Bangle.setLCDTimeout(30);
//Bangle.setLCDPower(1);

exports.input = function(options) {
  options = options||{};
  var text = options.text;
  if ("string"!=typeof text) text="";
  
  //Draw the alphabet on the screen

  var abc = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
  var fontSize = "6x8";
  //var xStep = 6;
  var abcPadding = (g.getWidth()-6*abc.length)/2;

  var numPunct = ' 1234567890!?,.- ';
  var numPunctHidden = ' 1234567890!?,.- ';
  var numPunctPadding = (g.getWidth()-6*numPunct.length)/2;

  var rectHeight = 40;

  var bgColor = [0,0,0];
  var HLColor = [1,1,1];
  var abcColor = [1,0,0];
  var numPunctColor = [0,1,0];
  var delLast;
  var spaceLast;

  function drawABC() {
    g.clear();
    g.setFont(fontSize);
    g.setColor(1,0,0);
    g.drawString(abc, abcPadding, g.getHeight()/2);
    g.fillRect(0, g.getHeight()-26, g.getWidth(), g.getHeight());
  }

  function drawNumPunct() {
    g.setFont(fontSize);
    g.setColor(0,1,1);
    g.drawString(numPunct, numPunctPadding, g.getHeight()/4);

    g.fillRect(numPunctPadding, g.getHeight()-rectHeight*4/3, g.getWidth()-numPunctPadding, g.getHeight()-rectHeight*2/3);
  }

  function initMarker() {
    g.setColor(0.5,0,0);
    g.fillRect(5,5,11,13);
    g.setColor(1,1,1);
  }

  function updateTopString() {
    g.setColor(0,0,0);
    g.fillRect(0,5,176,13);
    g.setColor(0.2,0,0);
    g.fillRect(5,5,5+text.length*6,13);
    g.setColor(0.7,0,0);
    g.fillRect(text.length*6+5,5,10+text.length*6,13);
    g.setColor(1,1,1);
    g.drawString(text, 5, 5);
  }

  drawABC();
  drawNumPunct();
  initMarker();

  var charHL;
  var charHLPrev = -10;
  var numPunctHL;
  var numPunctHLPrev = -10;
  var type = '';
  var typePrev = '';
  var largeCharOffset = 6;
  var letterCase = 1;

  // Interpret touch input
  Bangle.on('drag', function(event) {
    g.setFont('6x8');

    // hide delete sign
    if (delLast == 1) {
      g.setColor(0,0,0);
      g.setFont('6x8:3');
      g.drawString('del', g.getWidth()/2 -27, g.getHeight()/3);
      g.setFont('6x8');
      delLast = 0;
    }

    //hide space sign
    if (spaceLast == 1) {
      g.setColor(0,0,0);
      g.setFont('6x8:3');
      g.drawString('space', g.getWidth()/2 -6*3*5/2, g.getHeight()/3);
      g.setFont('6x8');
      spaceLast = 0;
    }


    // ABCDEFGHIJKLMNOPQRSTUVWXYZ
    // Choose character by draging along red rectangle at bottom of screen
    if (event.y >= ( g.getHeight() - 12 )) {
      // Translate x-position to character
      if (event.x < abcPadding) { charHL = 0; }
      else if (event.x >= 176-abcPadding) { charHL = 25; }
      else { charHL = Math.floor((event.x-abcPadding)/6); }

      // Datastream for development purposes
      //print(event.x, event.y, event.b, abc.charAt(charHL), abc.charAt(charHLPrev));

      // Unmark previous character and mark the current one...
      // Handling switching between letters and numbers/punctuation
      if (typePrev != 'abc') {
        // Small character in list
        g.setColor(0,1,0);
        g.drawString(numPunct.charAt(numPunctHLPrev), numPunctPadding + numPunctHLPrev*6, g.getHeight()/4);
        // Large character
        g.setColor(0,0,0);
        g.setFont('6x8:3');
        g.drawString(numPunct.charAt(numPunctHLPrev), numPunctPadding + numPunctHLPrev*6 -largeCharOffset, g.getHeight()/3);
        g.setFont('6x8');
      }

      if (charHL != charHLPrev) {
        // unmark in the list
        g.setColor(1,0,0);
        g.drawString(abc.charAt(charHLPrev), abcPadding + charHLPrev*6, g.getHeight()/2);
        // hide previous large character
        g.setColor(0,0,0);
        g.fillRect(0,g.getHeight()/3,176,g.getHeight()/3+24);
        g.setColor([0,0,0]);
        g.setFont('6x8:3');
        g.drawString(abc.charAt(charHLPrev), abcPadding + charHLPrev*6 -largeCharOffset, g.getHeight()/3);
        g.setFont('6x8');
        // mark in the list
        g.setColor(1,1,1);
        g.setFont('6x8');
        g.drawString(abc.charAt(charHL), abcPadding + charHL*6, g.getHeight()/2);
        // show new large character
        //g.setColor(1,1,1);
        g.setFont('6x8:3');
        g.drawString(abc.charAt(charHL), abcPadding + charHL*6 -largeCharOffset, g.getHeight()/3);
        g.setFont('6x8');
      }
      // Print string at top of screen
      if (event.b == 0) {
          text = text + abc.charAt(charHL);
        updateTopString();

        // Autoswitching letter case
        if (abc.charAt(charHL) == abc.charAt(charHL).toUpperCase()) {
          g.setColor(0,0,0);
          g.drawString(abc, abcPadding, g.getHeight()/2);
          abc = abc.toLowerCase();
          g.setColor(1,0,0);
          g.drawString(abc, abcPadding, g.getHeight()/2);
          letterCase = 0
        }
          //print(text);
      }
      // Update previous character to current one
      charHLPrev = charHL;
      typePrev = 'abc';
    }

    // 12345678901234567890
    // Choose number or puctuation by draging on green rectangle
    else if ((event.y < ( g.getHeight() - 12 )) && (event.y > ( g.getHeight() - 52 ))) {
      // Translate x-position to character
      if (event.x < numPunctPadding) { numPunctHL = 0; }
      else if (event.x > 176-numPunctPadding) { numPunctHL = numPunct.length-1; }
      else { numPunctHL = Math.floor((event.x-numPunctPadding)/6); }

      // Datastream for development  purposes
      //print(event.x, event.y, event.b, numPunct.charAt(numPunctHL), numPunct.charAt(numPunctHLPrev));

      // Unmark previous character and mark the current one...
      // Handling switching between letters and numbers/punctuation
      if (typePrev != 'numPunct') {
        // Small character in list
        g.setColor(1,0,0);
        g.drawString(abc.charAt(charHLPrev), abcPadding + charHLPrev*6, g.getHeight()/2);
        // Large character
        g.setColor(0,0,0);
        g.setFont('6x8:3');
        g.drawString(abc.charAt(charHLPrev), abcPadding + charHLPrev*6 -largeCharOffset, g.getHeight()/3);
        g.setFont('6x8');
      }
      if (numPunctHL != numPunctHLPrev) {
        // unmark in the list
        g.setColor(0,1,0);
        g.drawString(numPunct.charAt(numPunctHLPrev), numPunctPadding + numPunctHLPrev*6, g.getHeight()/4);
        // hide previous large character
        g.setColor(0,0,0);
        g.fillRect(0,g.getHeight()/3,176,g.getHeight()/3+24);
        g.setColor(0,0,0);
        g.setFont('6x8:3');
        g.drawString(numPunct.charAt(numPunctHLPrev), numPunctPadding + numPunctHLPrev*6 -largeCharOffset, g.getHeight()/3);
        g.setFont('6x8');
        // mark in the list
        g.setColor(1,1,1);
        g.setFont('6x8');
        g.drawString(numPunct.charAt(numPunctHL), numPunctPadding + numPunctHL*6, g.getHeight()/4);
        // show new large character
        //g.setColor(1,1,1);
        g.setFont('6x8:3');
        g.drawString(numPunct.charAt(numPunctHL), numPunctPadding + numPunctHL*6 -largeCharOffset, g.getHeight()/3);
        g.setFont('6x8');
      }
      // Print string at top of screen
      if (event.b == 0) {
        g.setColor(1,1,1);
        // Backspace if releasing before list of numbers/punctuation
        if (event.x < numPunctPadding) {
          // show delete sign
          g.setColor(1,1,1);
          g.setFont('6x8:3');
          g.drawString('del', g.getWidth()/2 -27, g.getHeight()/3);
          g.setFont('6x8');
          delLast = 1;

          text = text.slice(0, -1);
          updateTopString();
          //print(text);
        }
        // Append space if releasing after list of numbers/punctuation
        else if (event.x > g.getWidth()-numPunctPadding) {
          //show space sign
          g.setColor(1,1,1);
          g.setFont('6x8:3');
          g.drawString('space', g.getWidth()/2 -6*3*5/2, g.getHeight()/3);
          g.setFont('6x8');
          spaceLast = 1;

          text = text + ' ';
          updateTopString();
          //print(text);
        }
        // Append selected number/punctuation
        else {
          text = text + numPunctHidden.charAt(numPunctHL);
          updateTopString();

          // Autoswitching letter case
          if ((text.charAt(text.length-1) == '.') || (text.charAt(text.length-1) == '!')) {
            g.setColor(0,0,0);
            g.drawString(abc, abcPadding, g.getHeight()/2);
            abc = abc.toUpperCase();
            g.setColor(1,0,0);
            g.drawString(abc, abcPadding, g.getHeight()/2);
            letterCase = 1;

        }
          //print(text);
        }
      }
      // Update previous character to current one
      numPunctHLPrev = numPunctHL;
      typePrev = 'numPunct';
    }
    // Make a space or backspace by swiping right or left on screen above green rectangle
    else {
      if (event.b == 0) {
        g.setColor(1,1,1);
        if (event.x < g.getWidth()/2) {
          // unmark character in the list
          g.setColor(1,0,0);
          g.drawString(abc.charAt(charHLPrev), abcPadding + charHLPrev*6, g.getHeight()/2);

          // unmark number/punctuation in the list
          g.setColor(0,1,0);
          g.drawString(numPunct.charAt(numPunctHLPrev), numPunctPadding + numPunctHLPrev*6, g.getHeight()/4);

          // hide previous large character
          g.setColor([0,0,0]);
          g.setFont('6x8:3');
          g.drawString(abc.charAt(charHLPrev), abcPadding + charHLPrev*6 -largeCharOffset, g.getHeight()/3);

          // hide previous large character
          g.setColor(0,0,0);
          g.setFont('6x8:3');
          g.drawString(numPunct.charAt(numPunctHLPrev), numPunctPadding + numPunctHLPrev*6 -largeCharOffset, g.getHeight()/3);

          // show delete sign
          g.setColor(1,1,1);
          g.setFont('6x8:3');
          g.drawString('del', g.getWidth()/2 -27, g.getHeight()/3);
          g.setFont('6x8');
          delLast = 1;

          // Backspace and draw string upper right corner
          text = text.slice(0, -1);
          updateTopString();
          if (text.length==0) {
            g.setColor(0,0,0);
            g.drawString(abc, abcPadding, g.getHeight()/2);
            abc = abc.toUpperCase();
            g.setColor(1,0,0);
            g.drawString(abc, abcPadding, g.getHeight()/2);
            letterCase = 1;
          }
          //print(text, 'undid');
        }
        else {
          // unmark character in the list
          g.setColor(1,0,0);
          g.drawString(abc.charAt(charHLPrev), abcPadding + charHLPrev*6, g.getHeight()/2);

          // unmark number/punctuation in the list
          g.setColor(0,1,0);
          g.drawString(numPunct.charAt(numPunctHLPrev), numPunctPadding + numPunctHLPrev*6, g.getHeight()/4);

          // hide previous large character
          g.setColor([0,0,0]);
          g.setFont('6x8:3');
          g.drawString(abc.charAt(charHLPrev), abcPadding + charHLPrev*6 -largeCharOffset, g.getHeight()/3);

          // hide previous large character
          g.setColor(0,0,0);
          g.setFont('6x8:3');
          g.drawString(numPunct.charAt(numPunctHLPrev), numPunctPadding + numPunctHLPrev*6 -largeCharOffset, g.getHeight()/3);

          //show space sign
          g.setColor(1,1,1);
          g.setFont('6x8:3');
          g.drawString('space', g.getWidth()/2 -6*3*5/2, g.getHeight()/3);
          g.setFont('6x8');
          spaceLast = 1;

          // Append space and draw string upper right corner
          text = text + numPunctHidden.charAt(0);
          updateTopString();
          //print(text, 'made space');
        }
      }
    }
  });

  return new Promise((resolve,reject) => {
    Bangle.setUI({mode:"custom", back:()=>{
      Bangle.setUI();
      g.clearRect(Bangle.appRect);
      resolve(text);
    }});
  });

};
