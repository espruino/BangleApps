/**
 * BangleJS Calculator
 *
 * Original Author: Frederic Rousseau https://github.com/fredericrous
 * Created: April 2020
 * 
 * Contributors: thyttan https://github.com/thyttan
 */

g.clear();
require("Font7x11Numeric7Seg").add(Graphics);

var DEFAULT_SELECTION_NUMBERS = '5';
var RESULT_HEIGHT = 40;
var RESULT_MAX_LEN = Math.floor((g.getWidth() - 20) / 14);
var COLORS = {
  // [normal, selected]
  DEFAULT: ['#7F8183', '#A6A6A7'],
  OPERATOR: ['#F99D1C', '#CA7F2A'],
  SPECIAL: ['#65686C', '#7F8183']
};

var KEY_AREA = [0, RESULT_HEIGHT, g.getWidth(), g.getHeight()];

var screen, screenColor;
var globalGrid = [4, 5];
var swipeEnabled;

var numbersGrid = [3, 4];
var numbers = {
  '0': {grid: [1, 3], globalGrid: [1, 4], trbl: '2.00'},
  '.': {grid: [2, 3], globalGrid: [2, 4], trbl: '3=.0'},
  '1': {grid: [0, 2], globalGrid: [0, 3], trbl: '4201'},
  '2': {grid: [1, 2], globalGrid: [1, 3], trbl: '5301'},
  '3': {grid: [2, 2], globalGrid: [2, 3], trbl: '6+.2'},
  '4': {grid: [0, 1], globalGrid: [0, 2], trbl: '7514'},
  '5': {grid: [1, 1], globalGrid: [1, 2], trbl: '8624'},
  '6': {grid: [2, 1], globalGrid: [2, 2], trbl: '9-35'},
  '7': {grid: [0, 0], globalGrid: [0, 1], trbl: 'R847'},
  '8': {grid: [1, 0], globalGrid: [1, 1], trbl: 'N957'},
  '9': {grid: [2, 0], globalGrid: [2, 1], trbl: '%*68'},
};

var operatorsGrid = [2, 3];
var operators = {
  '+': {grid: [0, 0], globalGrid: [3, 3], trbl: '-+=3'},
  '-': {grid: [1, 0], globalGrid: [3, 2], trbl: '*-+6'},
  '*': {grid: [0, 1], globalGrid: [3, 1], trbl: '/*-9'},
  '/': {grid: [1, 1], globalGrid: [3, 0], trbl: '//*%'},
  '=': {grid: [1, 2], globalGrid: [3, 4], trbl: '+==.'},
};

var specialsGrid = [2, 2];
var specials = {
  'R': {grid: [0, 0], globalGrid: [0, 0], trbl: 'RN7R', val: 'AC'},
  'N': {grid: [1, 0], globalGrid: [1, 0], trbl: 'N%8R', val: '+/-'},
  '%': {grid: [0, 1], globalGrid: [2, 0], trbl: '%/9N'},
};

var selected = DEFAULT_SELECTION_NUMBERS;
var prevSelected = DEFAULT_SELECTION_NUMBERS;
var prevNumber  = null;
var currNumber = null;
var operator = null;
var results = null;
var isDecimal = false;
var hasPressedEquals = false;

function prepareScreen(screen, grid, defaultColor) {
  for (var k in screen) {
    if (screen.hasOwnProperty(k)) {
      screen[k].color = screen[k].color || defaultColor;
      var position = [];
      var xGrid = (KEY_AREA[2]-KEY_AREA[0])/grid[0];
      var yGrid = (KEY_AREA[3]-KEY_AREA[1])/grid[1];
      if (swipeEnabled) {
        position[0] = KEY_AREA[0]+xGrid*screen[k].grid[0];
        position[1] = KEY_AREA[1]+yGrid*screen[k].grid[1];
      } else {
        position[0] = KEY_AREA[0]+xGrid*screen[k].globalGrid[0];
        position[1] = KEY_AREA[1]+yGrid*screen[k].globalGrid[1];
      }
      position[2] = position[0]+xGrid-1;
      position[3] = position[1]+yGrid-1;
      screen[k].xy = position;
    }
  }
}

function drawKey(name, k, selected) {
  var color = k.color || COLORS.DEFAULT;
  g.setColor(color[selected ? 1 : 0]);
  g.setFont('Vector', 20).setFontAlign(0,0);
  g.fillRect(k.xy[0], k.xy[1], k.xy[2], k.xy[3]);
  g.setColor(-1);
  g.drawString(k.val || name, (k.xy[0] + k.xy[2])/2, (k.xy[1] + k.xy[3])/2);
}

function drawKeys() {
  g.setColor(screenColor[0]);
  g.fillRect(KEY_AREA[0], KEY_AREA[1], KEY_AREA[2], KEY_AREA[3]);
  for (var k in screen) {
    if (screen.hasOwnProperty(k)) {
      drawKey(k, screen[k], k == selected);
    }
  }
}
function drawGlobal() {
  screen = {};
  screenColor = COLORS.DEFAULT;
  prepareScreen(numbers, globalGrid, COLORS.DEFAULT);
  for (var k in numbers) {
    screen[k] = numbers[k];
  }
  prepareScreen(operators, globalGrid, COLORS.OPERATOR);
  for (var k in operators) {
    screen[k] = operators[k];
  }
  prepareScreen(specials, globalGrid, COLORS.SPECIAL);
  for (var k in specials) {
    screen[k] = specials[k];
  }
  drawKeys();
}
function drawNumbers() {
  screen = numbers;
  screenColor = COLORS.DEFAULT;
  drawKeys();
}
function drawOperators() {
  screen = operators;
  screenColor =COLORS.OPERATOR;
  drawKeys();
}
function drawSpecials() {
  screen = specials;
  screenColor = COLORS.SPECIAL;
  drawKeys();
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
  g.setBgColor(0).clearRect(0, 0, g.getWidth(), RESULT_HEIGHT-1);
  g.setColor(-1);
  if (num === Infinity || num === -Infinity || isNaN(num)) {
    // handle division by 0
    if (num === Infinity) {
      num = 'INFINITY';
    } else if (num === -Infinity) {
      num = '-INFINITY';
    } else {
      num = 'NOT A NUMBER';
    }
    currNumber = null;
    results = null;
    isDecimal = false;
    hasPressedEquals = false;
    prevNumber = null;
    operator = null;
    specials.R.val = 'AC';
    if (!swipeEnabled) drawKey('R', specials.R);
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
    num = num.toString();
    num = num.replace("-","- "); // fix padding for '-'
    g.setFont('7x11Numeric7Seg', 2);
    if (num.length > RESULT_MAX_LEN) {
      num = num.substr(0, RESULT_MAX_LEN - 1)+'...';
    }
  }
  g.setFontAlign(1,0);
  g.drawString(num, g.getWidth()-20, RESULT_HEIGHT/2);
  if (operator) {
    g.setFont('Vector', 22).setFontAlign(1,0);
    g.drawString(operator, g.getWidth()-1, RESULT_HEIGHT/2);
  }
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
      if (specials.R.val == 'AC') {
        prevNumber = null;
        operator = null;
      } else {
        specials.R.val = 'AC';
        drawKey('R', specials.R, true);
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
      if (swipeEnabled) drawNumbers();
      break;
    case '.':
      specials.R.val = 'C';
      if (!swipeEnabled) drawKey('R', specials.R);
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
    default: {
      specials.R.val = 'C';
      if (!swipeEnabled) drawKey('R', specials.R);
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
}

function moveDirection(d) {
  drawKey(selected, screen[selected]);
  prevSelected = selected;
  selected = (d === 0 && selected == '0' && prevSelected === '1') ? '1' : screen[selected].trbl[d];
  drawKey(selected, screen[selected], true);
}

if (process.env.HWVERSION==1) {
  setWatch(_ => moveDirection(0), BTN1, {repeat: true, debounce: 100});
  setWatch(_ => moveDirection(2), BTN3, {repeat: true, debounce: 100});
  setWatch(_ => moveDirection(3), BTN4, {repeat: true, debounce: 100});
  setWatch(_ => moveDirection(1), BTN5, {repeat: true, debounce: 100});
  setWatch(_ => buttonPress(selected), BTN2, {repeat: true, debounce: 100});
  swipeEnabled = false;
  drawGlobal();
} else { // touchscreen?
    selected = "NONE";
  swipeEnabled = true;
  prepareScreen(numbers, numbersGrid, COLORS.DEFAULT);
  prepareScreen(operators, operatorsGrid, COLORS.OPERATOR);
  prepareScreen(specials, specialsGrid, COLORS.SPECIAL);
  drawNumbers();

  Bangle.setUI({ 
    mode : 'custom',
    back : load, // Clicking physical button or pressing upper left corner turns off (where red back button would be)
    touch : (n,e)=>{
      for (var key in screen) {
        if (typeof screen[key] == "undefined") break;
        var r = screen[key].xy;
        if (e.x>=r[0] && e.y>=r[1] && e.x<r[2] && e.y<r[3]) {
          //print("Press "+key);
          buttonPress(""+key);
        }
      }
    },
    swipe : (LR, UD) => {
      if (LR == 1) { // right
        drawSpecials();
      }
      if (LR == -1) { // left
        drawOperators();
      }
      if (UD == 1) { // down
        drawNumbers();
      }
      if (UD == -1) { // up
        drawNumbers();
      }
    }
  });

}

displayOutput(0);
