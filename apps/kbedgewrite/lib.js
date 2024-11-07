exports.input = function(options) {

  let chart = {
    width : 352, height : 244, bpp : 1,
    buffer : require("heatshrink").decompress(atob("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"))
  };
  let chartX = 0;
  let chartY = 0;

  let settings = Object.assign({
    fontSize: 32,
  }, require('Storage').readJSON("kbedgewrite.json", true));

  let shouldShowWidgetBar = Bangle.appRect.y > 0;

  options = options||{};
  let text = options.text;
  // Substring doesn't play well with UTF8
  if (E.isUTF8(text)) {
    text = E.decodeUTF8(text);
  }
  let wrappedText = '';

  if ('string' != typeof text) text='';

  // Colours for number of corner occurrences
  let colours = ['#ff0', '#0f0', '#f00', '#00f' ,'#0ff', '#f0f', '#fff'];

  const cornerSize = g.getWidth() / 3;
  let punctuationMode = false;
  let extendedMode = false;
  let path = '';
  let cursorPos = text.length;
  let chartShown = false;

  let characterSet = Object.assign({}, require('Storage').readJSON('kbedgewrite.charset.json', true) || {});

  const accentedCharacters = {
    '#grave': {
      'a': String.fromCharCode(0xE0),
      'A': String.fromCharCode(0xC0),
      'e': String.fromCharCode(0xE8),
      'E': String.fromCharCode(0xC8),
      'i': String.fromCharCode(0xEC),
      'I': String.fromCharCode(0xCC),
      'o': String.fromCharCode(0xF2),
      'O': String.fromCharCode(0xD2),
      'u': String.fromCharCode(0xF9),
      'U': String.fromCharCode(0xD9)
    },
    '#acute': {
      'a': String.fromCharCode(0xE1),
      'A': String.fromCharCode(0xC1),
      'e': String.fromCharCode(0xE9),
      'E': String.fromCharCode(0xC9),
      'i': String.fromCharCode(0xED),
      'I': String.fromCharCode(0xCD),
      'o': String.fromCharCode(0xF3),
      'O': String.fromCharCode(0xD3),
      'u': String.fromCharCode(0xFA),
      'U': String.fromCharCode(0xDA),
      'y': String.fromCharCode(0xFD),
      'Y': String.fromCharCode(0xDD)
    },
    '#circumflex': {
      'a': String.fromCharCode(0xE2),
      'A': String.fromCharCode(0xC2),
      'e': String.fromCharCode(0xEA),
      'E': String.fromCharCode(0xCA),
      'i': String.fromCharCode(0xEE),
      'I': String.fromCharCode(0xCE),
      'o': String.fromCharCode(0xF4),
      'O': String.fromCharCode(0xD4),
      'u': String.fromCharCode(0xFB),
      'U': String.fromCharCode(0xDB)
    },
    '#umlaut': {
      'a': String.fromCharCode(0xE4),
      'A': String.fromCharCode(0xC4),
      'e': String.fromCharCode(0xEB),
      'E': String.fromCharCode(0xCB),
      'i': String.fromCharCode(0xEF),
      'I': String.fromCharCode(0xCF),
      'o': String.fromCharCode(0xF6),
      'O': String.fromCharCode(0xD6),
      'u': String.fromCharCode(0xFC),
      'U': String.fromCharCode(0xDC),
      'y': String.fromCharCode(0xFF)
    },
    '#tilde': {
      'a': String.fromCharCode(0xE3),
      'A': String.fromCharCode(0xC3),
      'n': String.fromCharCode(0xF1),
      'N': String.fromCharCode(0xD1),
      'o': String.fromCharCode(0xF5),
      'O': String.fromCharCode(0xD5)
    },
    '#ring': {
      'a': String.fromCharCode(0xE5),
      'A': String.fromCharCode(0xC5)
    },
    '#cedilla': {
      'c': String.fromCharCode(0xE7),
      'C': String.fromCharCode(0xC7)
    },

  };

  function wrapText() {
    let stringToWrap = text.substring(0, cursorPos) + '_' + text.substring(cursorPos);
    let l = [];
    let startPos = 0;

    g.setFont("Vector", settings.fontSize); // set the font so we can calculate a string width

    // Wrap the string into array of lines that will fit the screen width
    for (let i = 0; i < stringToWrap.length; i++) {
      // wrap if string is too long or we hit a line break
      if (stringToWrap.charCodeAt(i) == 10 || g.stringWidth(stringToWrap.substring(startPos, i+1)) > 176) {
        l.push(stringToWrap.substring(startPos, i));
        // skip the line break
        if (stringToWrap.charCodeAt(i) == 10) {
          i++;
        }
        startPos = i;
      }
    }
    // Add the final line
    l.push(stringToWrap.substring(startPos));

    // Number of lines that can fit on the screen
    let numLines = Math.floor(g.getHeight() / g.getFontHeight());

    // If too many lines, reposition so the cursor can be seen
    if (l.length > numLines) {
      let textPos = 0;
      let lineNum;
      for (lineNum = 0; lineNum < l.length; lineNum++) {
        textPos = textPos + l[lineNum].length;
        if (textPos >= cursorPos) break;
      }
      l=l.slice(lineNum - l.length - numLines + 1);
    }

    wrappedText = l.join('\n');
  }

  function draw() {
    g.clearRect(Bangle.appRect).setClipRect(Bangle.appRect.x, Bangle.appRect.y, Bangle.appRect.x2, Bangle.appRect.y2);

    g.setColor(g.theme.fg);
    g.setFont("Vector", settings.fontSize);
    g.setFontAlign(-1, -1, 0);
    g.drawString(wrappedText, Bangle.appRect.x, Bangle.appRect.y);

    // Draw punctuation or extended flags
    if (punctuationMode || extendedMode) {
      let x = (g.getWidth() / 2) - 12;
      let y = g.getHeight() - 32;
      g.setColor(punctuationMode ? '#F00' : '#0F0');
      g.fillRect(x,y,x+24,y+32);
      g.setColor('#FFF');
      g.setFont('6x8:4');
      g.drawString(punctuationMode ? 'P' : 'E', x+4, y+4, false);
    }

    // Draw corners
    for (let corner=1; corner<5; corner++) {
      // Count the occurences of the current corner to set the appropriate colour
      let regex = new RegExp(corner.toString(), 'g' );
      let count = (path.match(regex)||[]).length;
      if (count>0) {
        g.setColor(colours[count-1]);
        let x = (corner<3) ? 0 : g.getWidth() - (cornerSize);
        let y = (corner>1 && corner<4) ? 0 : g.getHeight() - (cornerSize);
        g.fillRect(x, y, x + (cornerSize), y + (cornerSize));
      }
    }
  }

  function processPath() {
    // Punctuation paths end in 5
    if (punctuationMode) {
      path = path + '5';
    }
    // Extended paths end in 6
    if (extendedMode) {
      path = path + '6';
    }

    // Find character from path
    let char = characterSet[path];

    // Unknown character, but ends in a 2 so may be a capital letter
    if (char == 'undefined' && path.slice(-1) == '2') {
      // Remove the 2 and look for a letter
      char = characterSet[path.slice(0,-1)];
      // Handle capitals
      if (char != 'undefined') {
        if (char.charCodeAt(0)>96 && char.charCodeAt(0)<123) {
        char = char.toUpperCase();
        }
      }
    }

    if (char != 'undefined') {
      switch (char) {
        // Backspace
        case '#bs': {
          text = text.substring(0,cursorPos-1) + text.substring(cursorPos);
          cursorPos--;
          break;
        }
        // Word Backspace
        case '#wbs': {
          let lastIndex = text.substring(0, cursorPos).lastIndexOf(' ');

          // If cursor character is the break character, remove it
          if (lastIndex == cursorPos - 1) {
            text = text.substring(0, cursorPos-1) + text.substring(cursorPos);
            cursorPos--;
          }
          // Remove everything up to the last word break character
          let words = text.substring(0, cursorPos).split(' ');
          text = words.slice(0, -1).join(' ') + ' ' + text.substring(cursorPos);
          cursorPos = cursorPos - words.slice(-1)[0].length;
          break;
        }
        // Enable punctuation mode
        case '#pu-on': {
          punctuationMode = true;
          break;
        }
        // Disable punctuation mode
        case '#pu-off': {
          punctuationMode = false;
          break;
        }
        // Enable extended mode
        case '#ex-on': {
          extendedMode = true;
          break;
        }
        // Disable extended mode
        case '#ex-off': {
          extendedMode = false;
          break;
        }
        // Cursor controls
        case '#cur-left': {
          if (cursorPos > 0) {
            cursorPos--;
          }
          break;
        }
        case '#cur-right': {
          if (cursorPos < text.length) {
            cursorPos++;
          }
          break;
        }
        case '#cur-word-left': {
          if (text.substring(cursorPos-1, cursorPos) == ' ') {
              cursorPos--;
          }
          cursorPos = 1 + text.substring(0, cursorPos).lastIndexOf(' ');
          break;
        }
        case '#cur-word-right': {
          if (text.substring(cursorPos, cursorPos+1) == ' ') {
              cursorPos++;
          }
          let nextPos = text.substring(cursorPos).indexOf(' ');
          if (nextPos > -1) {
            cursorPos = cursorPos + nextPos;
          } else {
            cursorPos = text.length;
          }
          break;
        }
        case '#cur-home': {
          cursorPos = 0;
          break;
        }
        case '#cur-end': {
          cursorPos = text.length;
          break;
        }
        // Accents
        case '#grave':
        case '#acute':
        case '#circumflex':
        case '#umlaut':
        case '#tilde':
        case '#ring':
        case '#cedilla':
          // If the previous character can be accented, replace it with the accented version
          if (cursorPos > 0) {
            char = accentedCharacters[char][text.substring(cursorPos-1, cursorPos)];
            if (char != 'undefined') {
              text = text.substring(0, cursorPos-1) + char + text.substring(cursorPos);
            }
          }
          break;
        // Append character
        default: {
          text = text.substring(0, cursorPos) + char + text.substring(cursorPos);
          cursorPos = cursorPos + char.length;
        }
      }
    }
    // Reset path
    path = "";
  }

  let dragHandler = e=>{
    'ram';
    if (!chartShown) {
      if (e.b == 0) { // Finger lifted, process completed path
        processPath();
        wrapText();
        draw();
      } else {
        let corner = 0;

        if (e.x < cornerSize) {
          if (e.y < cornerSize) {
            corner = 2;
          } else if (e.y > g.getHeight() - cornerSize) {
            corner = 1;
          }
        } else if (e.x > g.getWidth() - cornerSize) {
          if (e.y < cornerSize) {
            corner = 3;
          } else if (e.y > g.getHeight() - cornerSize) {
            corner = 4;
          }
        }

        // Append new corner to path
        if (corner > 0 && path.slice(-1) != corner) {
          path += corner;
          draw();
        }
      }
    } else {
      // Drag chart
      chartX = Math.clip(chartX + e.dx, -chart.width/2, 0);
      chartY = Math.clip(chartY + e.dy, -chart.height/2, 0);
      g.clearRect(Bangle.appRect).setClipRect(Bangle.appRect.x, Bangle.appRect.y, Bangle.appRect.x2, Bangle.appRect.y2);
      g.drawImage(chart, chartX, chartY + Bangle.appRect.y);
    }
  };


  return new Promise((resolve,reject) => {
    Bangle.setUI({
      mode: 'custom', 
      drag: dragHandler, 
      touch: (button, xy) => {
        if (xy.type == 2) {
          chartShown = true;
          path = "";
          g.clearRect(Bangle.appRect);
          g.drawImage(chart, chartX, chartY + Bangle.appRect.y);
        }
      },
      btn: () => {
        if (chartShown) {
          chartShown = false;
          draw();
        } else {
          // Exit and return text on button
          if (shouldShowWidgetBar) {
            require("widget_utils").show();
          }
          Bangle.setUI();
          g.clearRect(Bangle.appRect);
          resolve(text);
        }
      }
    });

    // Draw initial string
    require("widget_utils").hide();
    g.setBgColor(g.theme.bg);
    wrapText();
    draw();

  });


};
