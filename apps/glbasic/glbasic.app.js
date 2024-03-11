
Graphics.prototype.setFontLECO1976Regular5fix42 = function(scale) {
    // Actual height 42 (41 - 0)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('ADMD/gHFv/AAwkHB3QAtngGFj47Fh5KFh//BwkH/4OEgf/BwgGCBwcBAwIOEAwQODAwX/wB7CCos/Awo/BAAPgDgvwJwgGEBwX4LoplFAw0P/yCF/4GFh6YGKgQAhNAZGDAwZ4CB3ibCg4ODZoYO/BwyV/BxIA7YX7C/YRRZCAAZZDB2AAgNAMHO4v4O42PB3P4AIL+EwABBQwQO/BwgABBwgGBB34A0h/wAYMDSogDBSogGBUgoOOd/4O2AAbgEAAIO+AGY7C/AHDIIWAB3wQCBwjiDB34OGf1gOdAGbgDgZKFwF/JQn4g4O3/ABBBwmAB34OLcAgOBd4oO6AGY5CJQoADd4gO5f2wOdf1IOdAEgqBA4v//AOGwAO5AwqGCB34OJAAbRCAwbgDB3QAzO/4OL/ABBg4ODwABBv4O/BwyV/BxIAzHYX4gZKFSogOCSowOxf2gOdf1YOdAGkH/EAgY7DSgMASoSWCCIIO3ADg='))),
    46,
    atob("ERkmICYmJiYmJCYmEQ=="),
    60+(scale<<8)+(1<<16)
  );
  return this;
};

Graphics.prototype.setFontLECO1976Regular5fix22 = function(scale) {
    // Actual height 22 (21 - 0)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AAs8AYV8AaQjOgP8AYMPAYV/AYMH/4DBn///EA///4ADB/wSB//gAYQlCCIIABCIIAFDYIjBAaYjBLYIDTF64AH+CDCGdLLV/i7C/wfCAZ/4/BPCAaTiBAaaHBABaPIIaxPMcbxbBAapgCAahPhVYLDTUbA7CAZ/wv5PKN6xPzAof+AaTuXdcCbuJ8H4ngDCE4QDOJ+8PgBPBh+AE4IDPAA4'))),
    46,
    atob("CQ0UERQUFBQUExQUCQ=="),
    32+(scale<<8)+(1<<16)
  );
  return this;
};

Graphics.prototype.setFontLECO1976Regular5fix11 = function(scale) {
  // Actual height 11 (10 - 0)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AAMBwEDgEGgECgF8g/4v/w/+B+ARBg//h/+j/8mEYsEw//h//D/+AgEMg0Yhk/DofggHAFwMAh9+j38nv4scw41h/nD/OH+YdC5kxzAODxgsBw47CIIM/wF/gAGBhkAjBKFCAN/mH+FgUZw0zhl+jH8mP4CAJZEBwVmBwdj+HwgPggfAQoIxBFgJoDSwUDJQhZDO4QsB4CVB+cP80fNAiVGgaWDmAA=='))),
    46,
    atob("BAYJCAkJCQkJCQkJBA=="),
    15+(scale<<8)+(1<<16)
  );
  return this;
};

require("Font7x11Numeric7Seg").add(Graphics);


// the following 2 sections are used from waveclk to schedule minutely updates
// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function () {
        drawTimeout = undefined;
        draw();
    }, 60000 - (Date.now() % 60000));
}

function drawBackground() {
    g.setBgColor(0, 0, 0);
    g.setColor(1, 1, 1);
    g.clear();
}

function digit(num) {
    return String.fromCharCode(num + 48);
}

function timeString(h, m) {
    return digit(h / 10) + digit(h % 10) + ":" + digit(m / 10) + digit(m % 10);
}

function dayString(w) {
    return digit(w / 10) + digit(w % 10);
}

function getSteps() {
    if (WIDGETS.wpedom !== undefined) {
        return WIDGETS.wpedom.getSteps();
    }
    return '????';
}

/**
 * draws calender week view (-1,0,1) for given date 
 */
function drawCal() {
    d = /*this.date ? this.date : */ new Date();

    const DAY_NAME_FONT_SIZE = 10;
    const CAL_Y = g.getHeight() - 44; // Bangle.appRect.y+this.DATE_FONT_SIZE()+10+this.TIME_FONT_SIZE()+3;
    const CAL_AREA_H = 44; // g.getHeight()-CAL_Y+24; //+24: top widgtes only
    const CELL_W = g.getWidth() / 7; //cell width
    const CELL_H = 1+parseInt((CAL_AREA_H - DAY_NAME_FONT_SIZE) / 3); //cell heigth
    const DAY_NUM_FONT_SIZE = Math.min(CELL_H + 3, 15); //size down, max 15

    const wdStrt = 1;

    const ABR_DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const IS_SUNDAY = [1, 0, 0, 0, 0, 1, 1]; // what days are sunday?
    const nrgb = ["#000", "#FFF", "#F00", "#0F0", "#00F", "#FF0"]; //fg, r ,g , b
    const suClr = 5; // sunday color fg
    const tdyMrkClr = 3; // today bk
    //const tdyNumClr = 0; // today fg

    g.setFont("Vector", DAY_NAME_FONT_SIZE + 3);
    
    
    
    g.setColor(nrgb[1]);
    g.setFontAlign(-1, -1);
    // g.clearRect(Bangle.appRect.x, CAL_Y, Bangle.appRect.x2, CAL_Y+CAL_AREA_H);

    // == draw grid & Headline ==
    const dNames = ABR_DAY.map((a) => a.length <= 2 ? a : a.substr(0, 2)); //force shrt 2
    for (var dNo = 0; dNo < dNames.length; dNo++) {
        const dIdx = wdStrt >= 0 ? ((wdStrt + dNo) % 7) : ((dNo + d.getDay() + 4) % 7);
        const dName = dNames[dIdx];
        // if(dNo>0) { g.drawLine(dNo*CELL_W, CAL_Y, dNo*CELL_W, CAL_Y+CAL_AREA_H-1);}


        var colTx = 0;
        var colBk = 1;
        if (IS_SUNDAY[dIdx]) {
            colBk = suClr;
        }

        g.setColor(nrgb[colBk]);
        g.fillRect(dNo * CELL_W, CAL_Y, dNo * CELL_W + CELL_W, CAL_Y + DAY_NAME_FONT_SIZE - 1);
        g.setColor(nrgb[colTx]);
        g.drawString(dName, dNo * CELL_W + (CELL_W - g.stringWidth(dName)) / 2 + 2, CAL_Y - 1);
        // g.setColor(nrgb[clTxt]);
    }
    g.setColor(nrgb[1]);
    var nextY = CAL_Y + DAY_NAME_FONT_SIZE;

    // horizontal lines
    // for(i=0; i<3; i++){ const y=nextY+i*CELL_H; g.drawLine(Bangle.appRect.x, y, Bangle.appRect.x2, y); }

    // g.setFont("Vector", DAY_NUM_FONT_SIZE);

    // g.setFont("7x11Numeric7Seg", 1);
    g.setFontLECO1976Regular5fix11();

    //write days
    const tdyDate = d.getDate();
    const days = wdStrt >= 0 ? 7 + ((7 + d.getDay() - wdStrt) % 7) : 10; //start day (week before=7 days + days in this week realtive to week start) or fixed 7+3 days
    var rD = new Date(d.getTime());
    rD.setDate(rD.getDate() - days);
    var rDate = rD.getDate();
    
    // == today background rectangle ==
    for (var y = 0; y < 3; y++) {
        for (var x = 0; x < dNames.length; x++) {
            if (rDate === tdyDate) { //today
                g.setColor(nrgb[tdyMrkClr]); //today marker color or fg color

                // rectangle
                var frm=3; // fame pixels
                g.drawRect(x * CELL_W-frm, nextY + CELL_H - 1-frm, x * CELL_W + CELL_W+frm, nextY + CELL_H + CELL_H - 1+frm);
            }
            rD.setDate(rDate + 1);
            rDate = rD.getDate();
        }
    }
    
    // == individual days ==
    rD = new Date(d.getTime());
    rD.setDate(rD.getDate() - days);
    rDate = rD.getDate();
    for (var y = 0; y < 3; y++) {
        for (var x = 0; x < dNames.length; x++) {
            if (rDate === tdyDate) { //today
                g.setColor(nrgb[tdyMrkClr]); //today marker color or fg color

                // rectangle
                // g.fillRect(x * CELL_W, nextY + CELL_H - 1, x * CELL_W + CELL_W, nextY + CELL_H + CELL_H - 1);
                // g.setColor(nrgb[tdyNumClr]); //today color or fg color
                // g.drawRect(x * CELL_W, nextY + CELL_H - 1, x * CELL_W + CELL_W, nextY + CELL_H + CELL_H - 1);

                // simulate "bold"
                // g.setColor(nrgb[tdyNumClr]); //today color or fg color
                g.drawString(rDate, 1 + x * CELL_W + ((CELL_W - g.stringWidth(rDate)) / 2) + 2, nextY + ((CELL_H - DAY_NUM_FONT_SIZE + 2) / 2) + (CELL_H * y));

            } else if (IS_SUNDAY[rD.getDay()]) { //sundays
                g.setColor(nrgb[suClr]);
            } else { //default
                g.setColor(nrgb[1]);
            }
            g.drawString(rDate, x * CELL_W + ((CELL_W - g.stringWidth(rDate)) / 2) + 2, nextY + ((CELL_H - DAY_NUM_FONT_SIZE + 2) / 2) + (CELL_H * y));
            rD.setDate(rDate + 1);
            rDate = rD.getDate();
        }
    }
}


function draw() {
    g.reset();
    drawBackground();
    var date = new Date();
    var h = date.getHours(),
      m = date.getMinutes();
    var d = date.getDate()/*,w = date.getDay()*/; // d=1..31; w=0..6

    g.setBgColor(0, 0, 0);
    g.setColor(1, 1, 1);


    // g.setFont('Vector', 30);
    // g.setFont("7x11Numeric7Seg", 5);
    g.setFontLECO1976Regular5fix42();
    g.setFontAlign(0, -1);
    g.drawString(timeString(h, m), g.getWidth() / 2, 28);
    g.drawString(dayString(d), g.getWidth() * 3 / 4, 88);
    g.setColor(0, 1, 0);
    g.fillRect(0, 76, g.getWidth(), 80);
    g.reset();

    // Steps
    g.setFontLECO1976Regular5fix22();
    g.setFontAlign(-1, -1);
    g.drawString(getSteps(), 8, 88);

    drawCal();


    // widget redraw
    Bangle.drawWidgets();
    queueDraw();
}


////////////////////////////////////////////////////
// Bangle.setBarometerPower(true);

Bangle.setUI("clock");

Bangle.loadWidgets();
draw();


// Bangle.on('pressure', function(e){
//   temperature = e.temperature;
//  draw();
// });

//the following section is also from waveclk
Bangle.on('lcdPower', on => {
    if (on) {
        draw(); // draw immediately, queue redraw
    } else { // stop draw timer
        if (drawTimeout) clearTimeout(drawTimeout);
        drawTimeout = undefined;
    }
});


Bangle.drawWidgets();