var startOffsetX = 18;
var startOffsetHeight = 40;

var checkBarWidth = 10;
var checkBarHeight = 140;

var digitWidth = 14;
var digitHeight = 120;

var startDigitOffsetX = startOffsetX + checkBarWidth;

var midCheckBarOffsetX = startOffsetX + checkBarWidth + digitWidth * 4;

var midDigitOffsetX = startOffsetX + checkBarWidth + digitWidth * 4 + checkBarWidth;

var endCheckBarOffsetX = startOffsetX + checkBarWidth + digitWidth * 4 + checkBarWidth + digitWidth * 4;

let intCaster = num => Number(num);

var drawTimeout;

Bangle.loadWidgets();

function renderWatch(l) {
  g.setFont("4x6",2);
  
  // work out how to display the current time

  var offsetY = l.y;

  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var time = h + ":" + ("0"+m).substr(-2);
  var month = ("0" + (d.getMonth()+1)).slice(-2);
  var concatTime = ("0"+h).substr(-2) + ("0"+m).substr(-2) + month + 9;

  const chars = String(concatTime).split("").map((concatTime) => {
    return Number(concatTime);
  });

  drawStart(startOffsetX, offsetY);

  drawLDigit(chars[0], 0, offsetY);
  drawLDigit(chars[1], 1, offsetY);
  drawLDigit(chars[2], 2, offsetY);
  drawLDigit(chars[3], 3, offsetY);

  drawMid(midCheckBarOffsetX, offsetY);

  drawRDigit(chars[4], 0, offsetY);
  drawRDigit(chars[5], 1, offsetY);
  drawRDigit(chars[6], 2, offsetY);
  drawRDigit(calculateChecksum(chars), 3, offsetY);

  drawEnd(endCheckBarOffsetX, offsetY);

  // schedule a draw for the next minute
  if (drawTimeout) {
    clearTimeout(drawTimeout);
  }
  drawTimeout = setTimeout(function() {
    
    drawTimeout = undefined;
    layout.render(layout.watch);
  }, 60000 - (Date.now() % 60000));
}

function drawLDigit(digit, index, offsetY) {
  switch(digit) {
    case 0:
      drawLZeroWithOffset(startDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 1:
      drawLOneWithOffset(startDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 2:
      drawLTwoWithOffset(startDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 3:
      drawLThreeWithOffset(startDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 4:
      drawLFourWithOffset(startDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 5:
      drawLFiveWithOffset(startDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 6:
      drawLSixWithOffset(startDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 7:
      drawLSevenWithOffset(startDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 8:
      drawLEightWithOffset(startDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 9:
      drawLNineWithOffset(startDigitOffsetX+(digitWidth*index), offsetY);
      break;
  }
}

function drawRDigit(digit, index, offsetY) {
  switch(digit) {
    case 0:
      drawRZeroWithOffset(midDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 1:
      drawROneWithOffset(midDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 2:
      drawRTwoWithOffset(midDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 3:
      drawRThreeWithOffset(midDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 4:
      drawRFourWithOffset(midDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 5:
      drawRFiveWithOffset(midDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 6:
      drawRSixWithOffset(midDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 7:
      drawRSevenWithOffset(midDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 8:
      drawREightWithOffset(midDigitOffsetX+(digitWidth*index), offsetY);
      break;
    case 9:
      drawRNineWithOffset(midDigitOffsetX+(digitWidth*index), offsetY);
      break;
  }
}

/*
LEAN

01234567890123
    xxxx    xx
    xx    xxxx
  xxxxxxxx  xx
  xx      xxxx
  xxxx      xx
  xx  xxxxxxxx
  xxxxxx  xxxx
  xxxx  xxxxxx
      xx  xxxx
      xxxx  xx
*/
function drawLOneWithOffset(offset, offsetY) {
  let barOneX = 4;
  let barTwoX = 12;  
  g.fillRect(barOneX+offset,offsetY+0,barOneX+3+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight);
  g.drawString("1",offset+3,offsetY+digitHeight+5);
}

function drawLTwoWithOffset(offset, offsetY) {
  let barOneX = 4;
  let barTwoX = 10;  
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+3+offset,offsetY+digitHeight);
  g.drawString("2",offset+3,offsetY+digitHeight+5);
}

function drawLThreeWithOffset(offset, offsetY) {
  let barOneX = 2;
  let barTwoX = 12;  
  g.fillRect(barOneX+offset,offsetY+0,barOneX+7+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight);
  g.drawString("3",offset+3,offsetY+digitHeight+5);
}

function drawLFourWithOffset(offset, offsetY) {
  let barOneX = 2;
  let barTwoX = 10;  
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+3+offset,offsetY+digitHeight);
  g.drawString("4",offset+3,offsetY+digitHeight+5);
}

function drawLFiveWithOffset(offset, offsetY) {
  let barOneX = 2;
  let barTwoX = 12;  
  g.fillRect(barOneX+offset,offsetY+0,barOneX+3+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight);
  g.drawString("5",offset+3,offsetY+digitHeight+5);
}

function drawLSixWithOffset(offset, offsetY) {
  let barOneX = 2;
  let barTwoX = 6;  
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+7+offset,offsetY+digitHeight);
  g.drawString("6",offset+3,offsetY+digitHeight+5);
}

function drawLSevenWithOffset(offset, offsetY) {
  let barOneX = 2;
  let barTwoX = 10;  
  g.fillRect(barOneX+offset,offsetY+0,barOneX+5+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+3+offset,offsetY+digitHeight);
  g.drawString("7",offset+3,offsetY+digitHeight+5);
}

function drawLEightWithOffset(offset, offsetY) {
  let barOneX = 2;
  let barTwoX = 8;  
  g.fillRect(barOneX+offset,offsetY+0,barOneX+3+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+5+offset,offsetY+digitHeight);
  g.drawString("8",offset+3,offsetY+digitHeight+5);
}

function drawLNineWithOffset(offset, offsetY) {
  let barOneX = 6;
  let barTwoX = 10;  
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+3+offset,offsetY+digitHeight);
  g.drawString("9",offset+3,offsetY+digitHeight+5);
}

function drawLZeroWithOffset(offset, offsetY) {
  let barOneX = 6;
  let barTwoX = 12;  
  g.fillRect(barOneX+offset,offsetY+0,barOneX+3+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight);
  g.drawString("0",offset+3,offsetY+digitHeight+5);
}



/*
REAN

01234567890123
xxxx    xxxx
xxxx  xxxx
xx        xx
xx  xxxxxx
xx    xxxxxx
xx  xx
xx      xx
xx    xx
xxxxxx  xx
xxxxxx    xx

*/
function drawROneWithOffset(offset, offsetY) {
  let barOneX = 0;
  let barTwoX = 8;
  g.fillRect(offset+barOneX,offsetY+0,offset+barOneX+3,offsetY+digitHeight);
  g.fillRect(offset+barTwoX,offsetY+0,offset+barTwoX+3,offsetY+digitHeight);
  g.drawString("1",offset+2,offsetY+digitHeight+5);
}

function drawRTwoWithOffset(offset, offsetY) {
  let barOneX = 0;
  let barTwoX = 6;
  g.fillRect(offset+barOneX,offsetY+0,offset+barOneX+3,offsetY+digitHeight);
  g.fillRect(offset+barTwoX,offsetY+0,offset+barTwoX+3,offsetY+digitHeight);
  g.drawString("2",offset+2,offsetY+digitHeight+5);
}

function drawRThreeWithOffset(offset, offsetY) {
  let barOneX = 0;
  let barTwoX = 10;
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight);
  g.drawString("3",offset+2,offsetY+digitHeight+5);
}

function drawRFourWithOffset(offset, offsetY) {
  let barOneX = 0;
  let barTwoX = 4;
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+5+offset,offsetY+digitHeight);
  g.drawString("4",offset+2,offsetY+digitHeight+5);
}

function drawRFiveWithOffset(offset, offsetY) {
  let barOneX = 0;
  let barTwoX = 6;
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+5+offset,offsetY+digitHeight);
  g.drawString("5",offset+2,offsetY+digitHeight+5);
}

function drawRSixWithOffset(offset, offsetY) {
  let barOneX = 0;
  let barTwoX = 4;
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight);
  g.drawString("6",offset+2,offsetY+digitHeight+5);
}

function drawRSevenWithOffset(offset, offsetY) {
  let barOneX = 0;
  let barTwoX = 8;
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight);
  g.drawString("7",offset+2,offsetY+digitHeight+5);
}

function drawREightWithOffset(offset, offsetY) {
  let barOneX = 0;
  let barTwoX = 6;
  g.fillRect(offset+barOneX,offsetY+0,offset+barOneX+1,offsetY+digitHeight);
  g.fillRect(offset+barTwoX,offsetY+0,offset+barTwoX+1,offsetY+digitHeight);
  g.drawString("8",offset+2,offsetY+digitHeight+5);
}

function drawRNineWithOffset(offset, offsetY) {
  let barOneX = 0;
  let barTwoX = 8;
  g.fillRect(barOneX+offset,offsetY+0,barOneX+5+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight);
  g.drawString("9",offset+2,offsetY+digitHeight+5);
}

function drawRZeroWithOffset(offset, offsetY) {
  let barOneX = 0;
  let barTwoX = 10;
  g.fillRect(barOneX+offset,offsetY+0,barOneX+5+offset,offsetY+digitHeight);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight);
  g.drawString("0",offset+2,offsetY+digitHeight+5);
}





function drawStart(offset, offsetY) {
  let barOneX = 2;
  let barTwoX = 6;
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight+15);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight+15);
}

function drawMid(offset, offsetY) {
  let barOneX = 2;
  let barTwoX = 6;
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight+15);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight+15);
}

function drawEnd(offset, offsetY) {
  let barOneX = 2;
  let barTwoX = 6;
  g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitHeight+15);
  g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitHeight+15);
}

function calculateChecksum(digits) {
  let oddSum = digits[6] + digits[4] + digits[2] + digits[0];
  let evenSum = digits[5] + digits[3] + digits[1];

  let checkSum = (10 - ((3 * oddSum + evenSum) % 10)) % 10;

  return checkSum;
}

// The layout, referencing the custom renderer
var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"custom", render:renderWatch, id:"watch", bgCol:g.theme.bg, fillx:1, filly:1 }
  ]
});

// Clear the screen once, at startup
g.clear();
layout.render();
