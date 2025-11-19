//
// pure_numerals.font.js
//
// Uses polygons to render font
// Works better with small fonsizes than polygons and circles
//

// Creates the font, background-color must be passed. 
let createFont = function(bgColor) {

  let _bgColor = bgColor;

  const DISPLAY_SIZE = 176;   // Bangle.JS 2 : 176 x 176
  const DIGIT_HEIGHT = 72;
  const DIGIT_WIDTH = 60;
  const DIGIT_WIDTH_1 = 36;
     
  const numerals = {
    0 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,   48, 4, 52, 5, 55, 8, 56, 12,   56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60 ],
      holes: [[20, 20, 40, 20, 40, 52, 20, 52]],
    },
    1: {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  24, 4, 28, 5, 31, 8, 32, 12,   32, 60, 31, 64, 28, 67, 24, 68, 20, 67, 17, 64, 16, 60,  16, 20, 12, 20, 8, 19, 5, 16 ],
    },
    2 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  48, 4, 52, 5, 55, 8, 56, 12,  56, 36, 55, 40, 52, 43, 48, 44,   20, 44, 20, 52,  48, 52, 52, 53, 55, 56, 56, 60,  
         56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60,  4, 36, 5, 32, 8, 29, 12, 28,  40, 28, 40, 20,   12, 20, 8, 19, 5, 16 ],
    },
    3 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  48, 4, 52, 5, 55, 8, 56, 12,  56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60, 5, 56, 8, 53, 12, 52,  
        40, 52, 40, 44,   12, 44, 8, 43, 5, 40, 4, 36, 5, 32, 8, 29, 12, 28,  40, 28, 40, 20,   12, 20, 8, 19, 5, 16 ],
    },
    4 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4, 16, 5, 19, 8, 20, 12,  20, 28, 40, 28,  40, 12, 41, 8, 44, 5, 48, 4, 52, 5, 55, 8, 56, 12,  
        56, 60, 55, 64, 52, 67, 48, 68, 44, 67, 41, 64, 40, 60,  40, 44, 12, 44, 8, 43, 5, 40, 4, 36 ],
    },
    5 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  48, 4, 52, 5, 55, 8, 56, 12,  55, 16, 52, 19, 48, 20,  20, 20, 20, 28,  48, 28, 52, 29, 55, 32, 56, 36, 
        56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60,  5, 56, 8, 53, 12, 52,  40, 52, 40, 44,  12, 44, 8, 43, 5, 40, 4, 36 ],
    },
    6 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  48, 4, 52, 5, 55, 8, 56, 12,  55, 16, 52, 19, 48, 20,  20, 20, 20, 28,  48, 28, 52, 29, 55, 32, 56, 36, 
        56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60 ],
      holes: [[20, 44, 40, 44, 40, 52, 20, 52]],  
    },
    7 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,  48, 4, 52, 5, 55, 8, 56, 12,  55, 16, 16, 67, 12, 68, 8, 67, 5, 64, 4, 60, 5, 56, 32, 20, 
        12, 20, 8, 19, 5, 16 ],
    }, 
    8: {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,   48, 4, 52, 5, 55, 8, 56, 12,   56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60 ],
      holes: [[20, 20, 40, 20, 40, 28, 20, 28], [20, 44, 40, 44, 40, 52, 20, 52]],
    },
    9 : {
      polygon : [4, 12, 5, 8, 8, 5, 12, 4,   48, 4, 52, 5, 55, 8, 56, 12,   56, 60, 55, 64, 52, 67, 48, 68,   12, 68, 8, 67, 5, 64, 4, 60,
        5, 56, 8, 53, 12, 52,  40, 52, 40, 44,  12, 44, 8, 43, 5, 40, 4, 36 ],
      holes: [[20, 20, 40, 20, 40, 28, 20, 28]],
    }
  };

  // the character -
  const hyphen = [4, 36, 5, 32, 8, 29, 12, 28,  48, 28, 52, 29, 55, 32, 56, 36,  55, 40, 52, 43, 48, 44,  12, 44, 8, 43, 5, 40 ];

    // Draws digit in orginal size, for debug.
  function drawNumeral(digit) {
    let num = numerals[digit];
    g.setColor('#FF0000');
    g.fillPoly(num.polygon);
    let holes = num.holes;
    if (holes === undefined) { return; }
    g.setColor(_bgColor);
    for (let i=0; i<holes.length; i++) {
      g.fillPoly(holes[i]);
    }
  }

  // Returns the scaling factor.
  function getScale(fontSize) {
    return fontSize / DIGIT_HEIGHT;
  }

  // Returns the width in pixel for the given digit.
  function getDigitWidth(digit, fontSize) {
    let scale = getScale(fontSize);
    if (digit === 1) {
      return DIGIT_WIDTH_1 * scale;
    }
    return DIGIT_WIDTH * scale;
  }

  // Draws digit at given position (x,y) with given fontSize and color.
  // Anchor is top left.
  function drawDigit(digit, x, y, fontSize, color) {
    let scale = getScale(fontSize);
    let num = numerals[digit];
    g.setColor(color);
    g.fillPoly(g.transformVertices(num.polygon, {x:x, y:y, scale:scale}));
    
    let holes = num.holes;
    if (holes === undefined) { return; }
    g.setColor(_bgColor);
    for (let i=0; i<holes.length; i++) {
      g.fillPoly(g.transformVertices(holes[i], {x:x, y:y, scale:scale}));
    }
  }
  
  // Draws upper 2-digit number using full screen.
  // Parameter number must be string. 
  function drawUpperNumber(number, color) {
    let fontSize = DISPLAY_SIZE / 2;
    let d1 = +number.charAt(0);
    let d2 = +number.charAt(1);
    let w0 = getDigitWidth(0, fontSize);    // width digit 0
    let w1 = getDigitWidth(d1, fontSize);
    let w2 = getDigitWidth(d2, fontSize);
    let x2 = (DISPLAY_SIZE / 2 + w0) - w2;  // right aligned
    let x1 = x2 - w1;
    drawDigit(d1, x1, 0, fontSize, color);
    drawDigit(d2, x2, 0, fontSize, color);
  }

  // Draws lower 2-digit number using full screen.
  // Parameter number must be string. 
  function drawLowerNumber(number, color) {
    let fontSize = DISPLAY_SIZE / 2;
    let d1 = +number.charAt(0);
    let d2 = +number.charAt(1);
    let w0 = getDigitWidth(0, fontSize);    // width digit 0
    let w1 = getDigitWidth(d1, fontSize);
    let w2 = getDigitWidth(d2, fontSize);
    let x2 = (DISPLAY_SIZE / 2 + w0) - w2;  // right aligned
    let x1 = x2 - w1;
    let y = (DISPLAY_SIZE / 2) - 2;
    drawDigit(d1, x1, y, fontSize, color);
    drawDigit(d2, x2, y, fontSize, color);
  }

  // calculate width for given number (must be String),
  function getNumberWidth(number, fontSize) {
    let width = 0;
    for (let i=0; i<number.length; i++) {
      let d = +number.charAt(i);
      width += getDigitWidth(d, fontSize);
    }
    return width;
  }

  // draws given number (must be String) horizontal centered.
  function drawNumberCentered(number, y, fontSize, color) {

    let width = getNumberWidth(number, fontSize);

    // draw each digit
    let x = (DISPLAY_SIZE - width) / 2;
    for (let i=0; i<number.length; i++) {
      let d = +number.charAt(i);
      drawDigit(d, x, y, fontSize, color);
      x += getDigitWidth(d, fontSize);
    }
  }

  // draw number (must be string) at given position.
  function drawNumber(number, x, y, fontSize, color) {

    // draw each digit
    for (let i=0; i<number.length; i++) {
      let d = +number.charAt(i);
      drawDigit(d, x, y, fontSize, color);
      x += getDigitWidth(d, fontSize);
    }
  }

  // draws hyphen
  function drawHyphen(x, y, fontSize, color) {
    let scale = getScale(fontSize);
    g.setColor(color);
    g.fillPoly(g.transformVertices(hyphen, {x:x, y:y, scale:scale}));
  }

  // draws hyphen horizontal centered
  function drawHyphenCentered(y, fontSize, color) {
    let scale = getScale(fontSize);
    let wChar = DIGIT_WIDTH * scale;
    let x = (DISPLAY_SIZE - wChar) / 2;
    drawHyphen(x, y, fontSize, color);
  }

  // draws two hyphen horizontal centered
  function drawTwoHyphenCentered(y, fontSize, color) {
    let scale = getScale(fontSize);
    let wChar = DIGIT_WIDTH * scale;
    let x = (DISPLAY_SIZE - (2*wChar)) / 2;
    drawHyphen(x, y, fontSize, color);
    drawHyphen(x + wChar, y, fontSize, color);
  }
  
  return { drawNumeral, drawDigit, drawUpperNumber, drawLowerNumber, drawNumber, drawNumberCentered, getNumberWidth, drawHyphen, 
    drawHyphenCentered, drawTwoHyphenCentered };

};

// export as module
let exports = {
  createFont : createFont
};


// Testcode
// g.setBgColor('#000000');
// g.clear();
// font = createFont('#000000');
// font.drawHyphenCentered(40, 120, '#FFFFFF');

//font.drawDigit(7, 0, 0, 160, '#FFFFFF');
//font.drawUpperNumber('22', '#ff7700');
//font.drawUpperNumber('21', '#ff7700');
//font.drawUpperNumber('10', '#ff7700');
//font.drawLowerNumber('09', '#5d5d5d');
//font.drawNumberCentered('1234', 50, 40, '#FFFF00');


