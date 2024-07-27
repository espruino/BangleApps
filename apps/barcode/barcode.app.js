/* Sizes */
let checkBarWidth = 10;
let checkBarHeight = 140;

let digitBarWidth = 14;
let digitBarHeight = 100;

let textBarWidth = 56;
let textBarHeight = 20;

//let textWidth = 14;
//let textHeight = 20;

/* Offsets */
var startOffsetX = 17;
var startOffsetY = 30;

let startBarOffsetX = startOffsetX;
let startBarOffsetY = startOffsetY;

let upperTextBarLeftOffsetX = startBarOffsetX + checkBarWidth;
let upperTextBarLeftOffsetY = startOffsetY;

let midBarOffsetX = upperTextBarLeftOffsetX + textBarWidth;
let midBarOffsetY = startOffsetY;

let upperTextBarRightOffsetX = midBarOffsetX + checkBarWidth;
let upperTextBarRightOffsetY = startOffsetY;

let endBarOffsetX = upperTextBarRightOffsetX + textBarWidth;
let endBarOffsetY = startOffsetY;

let leftBarsStartX = startBarOffsetX + checkBarWidth;
let leftBarsStartY = upperTextBarLeftOffsetY + textBarHeight;

let rightBarsStartX = midBarOffsetX + checkBarWidth;
let rightBarsStartY = upperTextBarRightOffsetY + textBarHeight;

/* Utilities */
let stepCount = require("Storage").readJSON("stepCount",1);
if(stepCount === undefined) stepCount = 0;
//let intCaster = num => Number(num);

var drawTimeout;

function renderWatch(l) {
    g.setFont("4x6",2);

    // work out how to display the current time

    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    //var time = h + ":" + ("0"+m).substr(-2);
    //var month = ("0" + (d.getMonth()+1)).slice(-2);
    var dayOfMonth = ('0' + d.getDate()).slice(-2);
    var dayOfWeek = d.getDay() || 7;
    var concatTime = ("0"+h).substr(-2) + ("0"+m).substr(-2) + dayOfMonth + dayOfWeek;

    const chars = String(concatTime).split("").map((concatTime) => {
        return Number(concatTime);
    });
    const checkSum = calculateChecksum(chars);
    concatTime += checkSum;

    drawCheckBar(startBarOffsetX, startBarOffsetY);

    drawLDigit(chars[0], 0, leftBarsStartY);
    drawLDigit(chars[1], 1, leftBarsStartY);
    drawLDigit(chars[2], 2, leftBarsStartY);
    drawLDigit(chars[3], 3, leftBarsStartY);

    g.drawString(getStepCount(), startOffsetX + checkBarWidth + 3, startOffsetY + 4);
    g.drawString(concatTime.substring(0,4), startOffsetX + checkBarWidth + 3, startOffsetY + textBarHeight + digitBarHeight + 6);

    drawCheckBar(midBarOffsetX, midBarOffsetY);

    drawRDigit(chars[4], 0, rightBarsStartY);
    drawRDigit(chars[5], 1, rightBarsStartY);
    drawRDigit(chars[6], 2, rightBarsStartY);
    drawRDigit(checkSum, 3, rightBarsStartY);

    g.drawString(Bangle.getStepCount(), midBarOffsetX + checkBarWidth + 3, startOffsetY + 4);
    g.drawString(concatTime.substring(4), midBarOffsetX + checkBarWidth + 3, startOffsetY + textBarHeight + digitBarHeight + 6);

    drawCheckBar(endBarOffsetX, endBarOffsetY);

    // schedule a draw for the next minute
    if (drawTimeout) {
        clearTimeout(drawTimeout);
    }
    drawTimeout = setTimeout(function() {
        drawTimeout = undefined;
        layout.render(layout.watch);
    }, (1000 * 60 * 5) - (Date.now() % (1000 * 60 * 5)));
}

function drawLDigit(digit, index, offsetY) {
    switch(digit) {
        case 0:
            drawLZeroWithOffset(leftBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 1:
            drawLOneWithOffset(leftBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 2:
            drawLTwoWithOffset(leftBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 3:
            drawLThreeWithOffset(leftBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 4:
            drawLFourWithOffset(leftBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 5:
            drawLFiveWithOffset(leftBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 6:
            drawLSixWithOffset(leftBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 7:
            drawLSevenWithOffset(leftBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 8:
            drawLEightWithOffset(leftBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 9:
            drawLNineWithOffset(leftBarsStartX+(digitBarWidth*index), offsetY);
            break;
    }
}

function drawRDigit(digit, index, offsetY) {
    switch(digit) {
        case 0:
            drawRZeroWithOffset(rightBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 1:
            drawROneWithOffset(rightBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 2:
            drawRTwoWithOffset(rightBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 3:
            drawRThreeWithOffset(rightBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 4:
            drawRFourWithOffset(rightBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 5:
            drawRFiveWithOffset(rightBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 6:
            drawRSixWithOffset(rightBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 7:
            drawRSevenWithOffset(rightBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 8:
            drawREightWithOffset(rightBarsStartX+(digitBarWidth*index), offsetY);
            break;
        case 9:
            drawRNineWithOffset(rightBarsStartX+(digitBarWidth*index), offsetY);
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
    g.fillRect(barOneX+offset,offsetY+0,barOneX+3+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitBarHeight);
    //g.drawString("1",offset+3,offsetY+digitHeight+5);
}

function drawLTwoWithOffset(offset, offsetY) {
    let barOneX = 4;
    let barTwoX = 10;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+3+offset,offsetY+digitBarHeight);
    //g.drawString("2",offset+3,offsetY+digitHeight+5);
}

function drawLThreeWithOffset(offset, offsetY) {
    let barOneX = 2;
    let barTwoX = 12;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+7+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitBarHeight);
    //g.drawString("3",offset+3,offsetY+digitHeight+5);
}

function drawLFourWithOffset(offset, offsetY) {
    let barOneX = 2;
    let barTwoX = 10;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+3+offset,offsetY+digitBarHeight);
    //g.drawString("4",offset+3,offsetY+digitHeight+5);
}

function drawLFiveWithOffset(offset, offsetY) {
    let barOneX = 2;
    let barTwoX = 12;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+3+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitBarHeight);
    //g.drawString("5",offset+3,offsetY+digitHeight+5);
}

function drawLSixWithOffset(offset, offsetY) {
    let barOneX = 2;
    let barTwoX = 6;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+7+offset,offsetY+digitBarHeight);
    //g.drawString("6",offset+3,offsetY+digitHeight+5);
}

function drawLSevenWithOffset(offset, offsetY) {
    let barOneX = 2;
    let barTwoX = 10;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+5+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+3+offset,offsetY+digitBarHeight);
    //g.drawString("7",offset+3,offsetY+digitHeight+5);
}

function drawLEightWithOffset(offset, offsetY) {
    let barOneX = 2;
    let barTwoX = 8;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+3+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+5+offset,offsetY+digitBarHeight);
    //g.drawString("8",offset+3,offsetY+digitHeight+5);
}

function drawLNineWithOffset(offset, offsetY) {
    let barOneX = 6;
    let barTwoX = 10;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+3+offset,offsetY+digitBarHeight);
    //g.drawString("9",offset+3,offsetY+digitHeight+5);
}

function drawLZeroWithOffset(offset, offsetY) {
    let barOneX = 6;
    let barTwoX = 12;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+3+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitBarHeight);
    //g.drawString("0",offset+3,offsetY+digitHeight+5);
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
    g.fillRect(offset+barOneX,offsetY+0,offset+barOneX+3,offsetY+digitBarHeight);
    g.fillRect(offset+barTwoX,offsetY+0,offset+barTwoX+3,offsetY+digitBarHeight);
    //g.drawString("1",offset+2,offsetY+textHeight+5);
}

function drawRTwoWithOffset(offset, offsetY) {
    let barOneX = 0;
    let barTwoX = 6;
    g.fillRect(offset+barOneX,offsetY+0,offset+barOneX+3,offsetY+digitBarHeight);
    g.fillRect(offset+barTwoX,offsetY+0,offset+barTwoX+3,offsetY+digitBarHeight);
    //g.drawString("2",offset+2,offsetY+textHeight+5);
}

function drawRThreeWithOffset(offset, offsetY) {
    let barOneX = 0;
    let barTwoX = 10;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitBarHeight);
    //g.drawString("3",offset+2,offsetY+textHeight+5);
}

function drawRFourWithOffset(offset, offsetY) {
    let barOneX = 0;
    let barTwoX = 4;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+5+offset,offsetY+digitBarHeight);
    //g.drawString("4",offset+2,offsetY+textHeight+5);
}

function drawRFiveWithOffset(offset, offsetY) {
    let barOneX = 0;
    let barTwoX = 6;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+5+offset,offsetY+digitBarHeight);
    //g.drawString("5",offset+2,offsetY+textHeight+5);
}

function drawRSixWithOffset(offset, offsetY) {
    let barOneX = 0;
    let barTwoX = 4;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitBarHeight);
    //g.drawString("6",offset+2,offsetY+textHeight+5);
}

function drawRSevenWithOffset(offset, offsetY) {
    let barOneX = 0;
    let barTwoX = 8;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+1+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitBarHeight);
    //g.drawString("7",offset+2,offsetY+textHeight+5);
}

function drawREightWithOffset(offset, offsetY) {
    let barOneX = 0;
    let barTwoX = 6;
    g.fillRect(offset+barOneX,offsetY+0,offset+barOneX+1,offsetY+digitBarHeight);
    g.fillRect(offset+barTwoX,offsetY+0,offset+barTwoX+1,offsetY+digitBarHeight);
    //g.drawString("8",offset+2,offsetY+textHeight+5);
}

function drawRNineWithOffset(offset, offsetY) {
    let barOneX = 0;
    let barTwoX = 8;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+5+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitBarHeight);
    //g.drawString("9",offset+2,offsetY+textHeight+5);
}

function drawRZeroWithOffset(offset, offsetY) {
    let barOneX = 0;
    let barTwoX = 10;
    g.fillRect(barOneX+offset,offsetY+0,barOneX+5+offset,offsetY+digitBarHeight);
    g.fillRect(barTwoX+offset,offsetY+0,barTwoX+1+offset,offsetY+digitBarHeight);
    //g.drawString("0",offset+2,offsetY+textHeight+5);
}

function drawCheckBar(offsetX, offsetY) {
    const barOneX = offsetX+2;
    const barOneWidth = 1;
    const barTwoX = offsetX+6;
    const barTwoWidth = 1;
    g.fillRect(barOneX,offsetY,barOneX+barOneWidth,offsetY+checkBarHeight);
    g.fillRect(barTwoX,offsetY,barTwoX+barTwoWidth,offsetY+checkBarHeight);
}

function calculateChecksum(digits) {
    let oddSum = digits[6] + digits[4] + digits[2] + digits[0];
    let evenSum = digits[5] + digits[3] + digits[1];

    let checkSum = (10 - ((3 * oddSum + evenSum) % 10)) % 10;

    return checkSum;
}

function storeStepCount() {
    stepCount = Bangle.getStepCount();
    require("Storage").writeJSON("stepCount",stepCount);
}

function getStepCount() {
    let accumulatedSteps = Bangle.getStepCount();
    if(accumulatedSteps <= stepCount) {
        return 0;
    }
    return accumulatedSteps - stepCount;
}

function resetAtMidnight() {
    let now = new Date();
    let night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(), // the next day, ...
        23, 58, 0 // ...at 00:00:00 hours
);
    let msToMidnight = night.getTime() - now.getTime();

    setTimeout(function() {
        storeStepCount();              //      <-- This is the function being called at midnight.
        resetAtMidnight();    //      Then, reset again next midnight.
    }, msToMidnight);
}

resetAtMidnight();

// The layout, referencing the custom renderer
var Layout = require("Layout");
var layout = new Layout( {
    type:"v", c: [
        {type:"custom", render:renderWatch, id:"watch", bgCol:g.theme.bg, fillx:1, filly:1 }
    ]
});

// Clear the screen once, at startup
g.clear();
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
layout.render();

Bangle.on('lock', function(locked) {
    if(!locked) {
        layout.render();
    }
});
