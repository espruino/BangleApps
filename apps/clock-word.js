/* jshint esversion: 6 */
(function() {

    var buf = Graphics.createArrayBuffer(240, 240, 2, { msb: true });

    function flip() {
        var palette = new Uint16Array([0,,,0xFFFF]);
        g.drawImage({ width: buf.getWidth(), height: buf.getHeight(), bpp: 2, palette : palette, buffer: buf.buffer }, 0, 0);
    }

    const allWords = [
        "ATWENTYD",
        "QUARTERY",
        "FIVEHALF",
        "DPASTORO",
        "FIVEIGHT",
        "SIXTHREE",
        "TWELEVEN",
        "FOURNINE"
    ];
    const hours = {
        0: ["", 0, 0],
        1: ["ONE", 17, 47, 77],
        2: ["TWO", 06, 16, 17],
        3: ["THREE", 35, 45, 55, 65, 75],
        4: ["FOUR", 07, 17, 27, 37],
        5: ["FIVE", 04, 14, 24, 34],
        6: ["SIX", 05, 15, 25],
        7: ["SEVEN", 05, 46, 56, 66, 67],
        8: ["EIGHT", 34, 44, 54, 64, 74],
        9: ["NINE", 47, 57, 67, 77],
        10: ["TEN", 74, 75, 76],
        11: ["ELEVEN", 26, 36, 46, 56, 66, 76],
        12: ["TWELVE", 06, 16, 26, 36, 56, 66]
    };

    const mins = {
        0: ["A", 0, 0],
        1: ["FIVE", 02, 12, 22, 32],
        2: ["TEN", 10, 30, 40],
        3: ["QUARTER", 01, 11, 21, 31, 41, 51, 61],
        4: ["TWENTY", 10, 20, 30, 40, 50, 60],
        5: ["HALF", 42, 52, 62, 72],
        6: ["PAST", 13, 23, 33, 43],
        7: ["TO", 43, 53]
    };

    // offsets and incerments
    const xs = 30;
    const ys = 20;
    const dy = 22;
    const dx = 25;

    // font size and color
    const wordFontSize = 20;
    const timeFontSize = 30;
    const passivColor = 0x3186/*grey*/;
    const activeColor = 0xF800/*red*/;

    function drawWordClock() {

        // get time
        var t = new Date();
        var h = t.getHours();
        var m = t.getMinutes();
        var time = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);

        var hidx;
        var midx;
        var midxA=[];

        buf.clear();
        buf.setFontVector(wordFontSize);
        buf.setColor(passivColor);
        buf.setFontAlign(0, -1, 0);

        // draw allWords
        var c;
        var y = ys;
        var x = xs;
        allWords.forEach((line) => {
            x = xs;
            for (c in line) {
                buf.drawString(line[c], x, y);
                x += dx;
            }
            y += dy;
        });


        // calc indexes
        midx = Math.round(m / 5);
        hidx = h % 12;
        if (hidx === 0) { hidx = 12; }
        if (midx > 6) {
            if (midx == 12) { midx = 0; }
            hidx++;
        }
        if (midx !== 0) {
            if (midx <= 6) {
                midxA = [midx, 6];
            } else {
                midxA = [12 - midx, 7];
            }
        }

        // write hour in active color
        buf.setColor(activeColor);
        buf.setFontVector(wordFontSize);

        hours[hidx][0].split('').forEach((c, pos) => {
            x = xs + (hours[hidx][pos + 1] / 10 | 0) * dx;
            y = ys + (hours[hidx][pos + 1] % 10) * dy;
          
            buf.drawString(c, x, y);
        });

        // write min words in active color
        midxA.forEach(idx => {
            mins[idx][0].split('').forEach((c, pos) => {
                x = xs + (mins[idx][pos + 1] / 10 | 0) * dx;
                y = ys + (mins[idx][pos + 1] % 10) * dy;
                buf.drawString(c, x, y);
            });
        });

        // display digital time 
        buf.setColor(activeColor);
        buf.setFontVector(timeFontSize);
        buf.drawString(time, 120, 200);

        // display buf
        flip();
        drawWidgets();
    }

    Bangle.on('lcdPower', function(on) {
        if (on) {
            drawWordClock();
            drawWidgets();
        }
    });

    g.clear();
    setInterval(drawWordClock, 1E4);
    drawWordClock();

})();
