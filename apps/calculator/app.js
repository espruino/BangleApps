/**
 * BangleJS Calculator
 *
 * Original Author: Frederic Rousseau https://github.com/fredericrous
 * Created: April 2020
 */

g.clear();
Graphics.prototype.setFont7x11Numeric7Seg = function() {
  this.setFontCustom(atob("ACAB70AYAwBgC94AAAAAAAAAAB7wAAPQhhDCGELwAAAAhDCGEMIXvAAeACAEAIAQPeAA8CEMIYQwhA8AB70IYQwhhCB4AAAIAQAgBAB7wAHvQhhDCGEL3gAPAhDCGEMIXvAAe9CCEEIIQPeAA94EIIQQghA8AB70AYAwBgCAAAAHgQghBCCF7wAHvQhhDCGEIAAAPehBCCEEIAAAAA=="), 46, atob("AgAHBwcHBwcHBwcHAAAAAAAAAAcHBwcHBw=="), 11);
};

var DEFAULT_SELECTION = '5';
var BOTTOM_MARGIN = 10;
var RIGHT_MARGIN = 20;
var COLORS = {
  // [normal, selected]
  DEFAULT: ['#7F8183', '#A6A6A7'],
  OPERATOR: ['#F99D1C', '#CA7F2A'],
  SPECIAL: ['#65686C', '#7F8183']
};

var keys = {
  '0': {
    xy: [0, 200, 120, 240],
    trbl: '2.00'
  },
  '.': {
    xy: [120, 200, 180, 240],
    trbl: '3=.0'
  },
  '=': {
    xy: [181, 200, 240, 240],
    trbl: '+==.',
    color: COLORS.OPERATOR
  },
  '1': {
    xy: [0, 160, 60, 200],
    trbl: '4201'
  },
  '2': {
    xy: [60, 160, 120, 200],
    trbl: '5301'
  },
  '3': {
    xy: [120, 160, 180, 200],
    trbl: '6+.2'
  },
  '+': {
    xy: [181, 160, 240, 200],
    trbl: '-+=3',
    color: COLORS.OPERATOR
  },
  '4': {
    xy: [0, 120, 60, 160],
    trbl: '7514'
  },
  '5': {
    xy: [60, 120, 120, 160],
    trbl: '8624'
  },
  '6': {
    xy: [120, 120, 180, 160],
    trbl: '9-35'
  },
  '-': {
    xy: [181, 120, 240, 160],
    trbl: '*-+6',
    color: COLORS.OPERATOR
  },
  '7': {
    xy: [0, 80, 60, 120],
    trbl: 'R847'
  },
  '8': {
    xy: [60, 80, 120, 120],
    trbl: 'N957'
  },
  '9': {
    xy: [120, 80, 180, 120],
    trbl: '%*68'
  },
  '*': {
    xy: [181, 80, 240, 120],
    trbl: '/*-9',
    color: COLORS.OPERATOR
  },
  'R': {
    xy: [0, 40, 60, 79],
    trbl: 'RN7R',
    color: COLORS.SPECIAL,
    val: 'AC'
  },
  'N': {
    xy: [60, 40, 120, 79],
    trbl: 'N%8R',
    color: COLORS.SPECIAL,
    val: '+/-'
  },
  '%': {
    xy: [120, 40, 180, 79],
    trbl: '%/9N',
    color: COLORS.SPECIAL
  },
  '/': {
    xy: [181, 40, 240, 79],
    trbl: '//*%',
    color: COLORS.OPERATOR
  }
};

var selected = DEFAULT_SELECTION;
var prevSelected = DEFAULT_SELECTION;
var prevNumber  = null;
var currNumber = null;
var operator = null;
var results = null;
var isDecimal = false;
var hasPressedEquals = false;

function drawKey(name, k, selected) {
  var rMargin = 0;
  var bMargin = 0;
  var color = k.color || COLORS.DEFAULT;
  g.setColor(color[selected ? 1 : 0]);
  g.setFont('Vector', 20);
  g.fillRect(k.xy[0], k.xy[1], k.xy[2], k.xy[3]);
  g.setColor(-1);
  // correct margins to center the texts
  if (name == '0') {
    rMargin = (RIGHT_MARGIN * 2) - 7;
  } else if (name === '/') {
    rMargin = 5;
  } else if (name === '*') {
    bMargin = 5;
    rMargin = 3;
  } else if (name === '-') {
    rMargin = 3;
  } else if (name === 'R' || name === 'N') {
    rMargin = k.val === 'C' ? 0 : -9;
  } else if (name === '%') {
    rMargin = -3;
  }
  g.drawString(k.val || name, k.xy[0] + RIGHT_MARGIN + rMargin, k.xy[1] + BOTTOM_MARGIN + bMargin);
}

function getIntWithPrecision(x) {
  var xStr = x.toString();
  var xRadix = xStr.indexOf('.');
  var xPrecision = xRadix === -1 ? 0 : xStr.length - xRadix - 1;
  return {
    num: Number(xStr.replace('.', '')),
    p: xPrecision
  };
}

function multiply(x, y) {
  var xNum = getIntWithPrecision(x);
  var yNum = getIntWithPrecision(y);
  return xNum.num * yNum.num / Math.pow(10, xNum.p + yNum.p);
}

function divide(x, y) {
  var xNum = getIntWithPrecision(x);
  var yNum = getIntWithPrecision(y);
  return xNum.num / yNum.num / Math.pow(10, xNum.p - yNum.p);
}

function sum(x, y) {
  let xNum = getIntWithPrecision(x);
  let yNum = getIntWithPrecision(y);

  let diffPrecision = Math.abs(xNum.p - yNum.p);
  if (diffPrecision > 0) {
    if (xNum.p > yNum.p) {
      yNum.num = yNum.num * Math.pow(10, diffPrecision);
    } else {
      xNum.num = xNum.num * Math.pow(10, diffPrecision);
    }
  }
  return (xNum.num + yNum.num) / Math.pow(10, Math.max(xNum.p, yNum.p));
}

function subtract(x, y) {
  return sum(x, -y);
}

function doMath(x, y, operator) {
  switch (operator) {
    case '/':
      return divide(x, y);
    case '*':
      return multiply(x, y);
    case '+':
      return sum(x, y);
    case '-':
      return subtract(x, y);
  }
}

function displayOutput(num) {
  var len;
  var minusMarge = 0;
  g.setColor(0);
  g.fillRect(0, 0, 240, 39);
  g.setColor(-1);
  if (num === Infinity || num === -Infinity || isNaN(num)) {
    // handle division by 0
    if (num === Infinity) {
      num = 'INFINITY';
    } else if (num === -Infinity) {
      num = '-INFINITY';
    } else {
      num = 'NOT A NUMBER';
      minusMarge = -25;
    }
    len = (num + '').length;
    currNumber = null;
    results = null;
    isDecimal = false;
    hasPressedEquals = false;
    prevNumber = null;
    operator = null;
    keys.R.val = 'AC';
    drawKey('R', keys.R);
    g.setFont('Vector', 22);
  } else {
    // might not be a number due to display of dot "."
    var numNumeric = Number(num);

    if (typeof num === 'string') {
      if (num.indexOf('.') !== -1) {
        // display a 0 before a lonely dot
        if (numNumeric == 0) {
          num = '0.';
        }
      } else {
        // remove preceding 0
        while (num.length > 1 && num[0] === '0')
          num = num.substr(1);
      }
    }

    len = (num + '').length;
    if (numNumeric < 0 || (numNumeric === 0 && 1/numNumeric === -Infinity)) {
      // minus is not available in font 7x11Numeric7Seg, we use Vector
      g.setFont('Vector', 20);
      g.drawString('-', 220 - (len * 15), 10);
      minusMarge = 15;
    }
    g.setFont('7x11Numeric7Seg', 2);
  }
  g.drawString(num, 220 - (len * 15) + minusMarge, 10);
}
var wasPressedEquals = false;
var hasPressedNumber = false;
function calculatorLogic(x) {
  if (wasPressedEquals && hasPressedNumber !== false) {
    prevNumber = null;
    currNumber = hasPressedNumber;
    wasPressedEquals = false;
    hasPressedNumber = false;
    return;
  }
  if (hasPressedEquals) {
    if (hasPressedNumber) {
      prevNumber = null;
      hasPressedNumber = false;
      operator = null;
    } else {
      currNumber = null;
      prevNumber = results;
    }
    hasPressedEquals = false;
    wasPressedEquals = true;
  }

  if (currNumber == null && operator != null && '/*-+'.indexOf(x) !== -1) {
    operator = x;
    displayOutput(prevNumber);
  } else if (prevNumber != null && currNumber != null && operator != null) {
    // we execute the calculus only when there was a previous number entered before and an operator
    results = doMath(prevNumber, currNumber, operator);
    operator = x;
    prevNumber = results;
    currNumber = null;
    displayOutput(results);
  } else if (prevNumber == null && currNumber != null && operator == null) {
    // no operator yet, save the current number for later use when an operator is pressed
    operator = x;
    prevNumber = currNumber;
    currNumber = null;
    displayOutput(prevNumber);
  } else if (prevNumber == null && currNumber == null && operator == null) {
    displayOutput(0);
  }
}

function buttonPress(val) {
  switch (val) {
    case 'R':
      currNumber = null;
      results = null;
      isDecimal = false;
      hasPressedEquals = false;
      if (keys.R.val == 'AC') {
        prevNumber = null;
        operator = null;
      } else {
        keys.R.val = 'AC';
        drawKey('R', keys.R, true);
      }
      wasPressedEquals = false;
      hasPressedNumber = false;
      displayOutput(0);
      break;
    case '%':
      if (results != null) {
        displayOutput(results /= 100);
      } else if (currNumber != null) {
        displayOutput(currNumber /= 100);
      }
      hasPressedNumber = false;
      break;
    case 'N':
      if (results != null) {
        displayOutput(results *= -1);
      } else {
        displayOutput(currNumber *= -1);
      }
      break;
    case '/':
    case '*':
    case '-':
    case '+':
      calculatorLogic(val);
      hasPressedNumber = false;
      break;
    case '.':
      keys.R.val = 'C';
      drawKey('R', keys.R);
      isDecimal = true;
      displayOutput(currNumber == null ? 0 + '.' : currNumber + '.');
      break;
    case '=':
      if (prevNumber != null && currNumber != null && operator != null) {
        results = doMath(prevNumber, currNumber, operator);
        prevNumber = results;
        displayOutput(results);
        hasPressedEquals = 1;
      }
      hasPressedNumber = false;
      break;
    default:
      keys.R.val = 'C';
      drawKey('R', keys.R);
      const is0Negative = (currNumber === 0 && 1/currNumber === -Infinity);
      if (isDecimal) {
        currNumber = currNumber == null || hasPressedEquals === 1 ? 0 + '.' + val : currNumber + '.' + val;
        isDecimal = false;
      } else {
        currNumber = currNumber == null || hasPressedEquals === 1 ? val : (is0Negative ? '-' + val : currNumber + val);
      }
      if (hasPressedEquals === 1) {
        hasPressedEquals = 2;
      }
      hasPressedNumber = currNumber;
      displayOutput(currNumber);
      break;
  }
}

for (var k in keys) {
  if (keys.hasOwnProperty(k)) {
    drawKey(k, keys[k], k == '5');
  }
}
g.setFont('7x11Numeric7Seg', 2.8);
g.drawString('0', 205, 10);

function moveDirection(d) {
  drawKey(selected, keys[selected]);
  prevSelected = selected;
  selected = (d === 0 && selected == '0' && prevSelected === '1') ? '1' : keys[selected].trbl[d];
  drawKey(selected, keys[selected], true);
}

setWatch(_ => moveDirection(0), BTN1, {repeat: true, debounce: 100});
setWatch(_ => moveDirection(2), BTN3, {repeat: true, debounce: 100});
setWatch(_ => moveDirection(3), BTN4, {repeat: true, debounce: 100});
setWatch(_ => moveDirection(1), BTN5, {repeat: true, debounce: 100});
setWatch(_ => buttonPress(selected), BTN2, {repeat: true, debounce: 100});
