/* Imprecise Word Clock - A. Blanton
A remix of word clock
by Gordon Williams https://github.com/gfwilliams
- Changes the representation of time to be more general
- Shows accurate digital time when button 1 is pressed
*/
/* jshint esversion: 6 */

const allWords = [
    "AEARLYDN",
    "LATEYRZO",
    "MORNINGO",
    "KMIDDLEN",
    "AFTERDAY",
    "OFDZTHEC",
    "EVENINGR",
    "ORMNIGHT"
];


const timeOfDay = {
    0: ["", 0, 0],
    1: ["EARLYMORNING", 10, 20, 30, 40, 50, 02, 12, 22, 32, 42, 52, 62],
    2: ["MORNING", 02, 12, 22, 32, 42, 52, 62],
    3: ["LATEMORNING", 01, 11, 21, 31, 02, 12, 22, 32, 42, 52, 62],
    4: ["MIDDAY", 13, 23, 33, 54, 64, 74],
    5: ["EARLYAFTERNOON", 10, 20, 30, 40, 50, 04, 14, 24, 34, 44, 70, 71, 72, 73],
    6: ["AFTERNOON", 04, 14, 24, 34, 44, 70, 71, 72, 73],
    7: ["LATEAFTERNOON", 01, 11, 21, 31, 04, 14, 24, 34, 44, 70, 71, 72, 73],
    8: ["EARLYEVENING", 10, 20, 30, 40, 50, 06, 16, 26, 36, 46, 56, 66],
    9: ["EVENING", 06, 16, 26, 36, 46, 56, 66],
    10: ["NIGHT", 37, 47, 57, 67, 77],
    11: ["MIDDLEOFTHENIGHT", 13, 23, 33, 43, 53, 63, 05, 15, 45, 55, 65, 37,47,57,67,77 ],
};


// offsets and increments
const xs = 35;
const ys = 31;
const dy = 22;
const dx = 25;

// font size and color
const fontSize = 3;  // "6x8"
const passivColor = 0x3186 /*grey*/ ;
const activeColorNight = 0xF800 /*red*/ ;
const activeColorDay = 0xFFFF /* white */;

var hidxPrev;

function drawWordClock() {


    // get time
    var t = new Date();
    var h = t.getHours();
    var m = t.getMinutes();
    var time = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);
    var day = t.getDay();

    var hidx;

    var activeColor = activeColorDay;
    if(h < 7 || h > 19) {activeColor = activeColorNight;}

    g.setFont("6x8",fontSize);
    g.setColor(passivColor);
    g.setFontAlign(0, -1, 0);


    // Switch case isn't good for this in Js apparently so...
    if(h < 3){
    // Middle of the Night
    hidx = 11;
    }
    else if (h < 7){
    // Early Morning
    hidx = 1;
    }
    else if (h < 10){
    // Morning
    hidx = 2;
    }
    else if (h < 12){
    // Late Morning
    hidx = 3;
    }
    else if (h < 13){
    // Midday
    hidx = 4;
    }
    else if (h < 14){
    // Early afternoon
    hidx = 5;
    }
    else if (h < 16){
    // Afternoon
    hidx = 6;
    }
    else if (h < 17){
    // Late Afternoon
    hidx = 7;
    }
    else if (h < 19){
    // Early evening
    hidx = 8;
    }
    else if (h < 21){
    // evening
    hidx = 9;
    }
    else if (h < 24){
    // Night
    hidx = 10;
    }

    // check whether we need to redraw the watchface
    if (hidx !== hidxPrev) {
      // draw allWords
      var c;
      var y = ys;
      var x = xs;
      allWords.forEach((line) => {
          x = xs;
          for (c in line) {
              g.drawString(line[c], x, y);
              x += dx;
          }
          y += dy;
      });

      // write hour in active color
      g.setColor(activeColor);
      timeOfDay[hidx][0].split('').forEach((c, pos) => {
          x = xs + (timeOfDay[hidx][pos + 1] / 10 | 0) * dx;
          y = ys + (timeOfDay[hidx][pos + 1] % 10) * dy;
          g.drawString(c, x, y);
      });
      hidxPrev = hidx;
    }

    // Display digital time while button 1 is pressed
    g.clearRect(0, 215, 240, 240);
    if (BTN1.read()){
        g.setColor(activeColor);
        g.drawString(time, 120, 215);
    }
}


Bangle.on('lcdPower', function(on) {
  if (on) drawWordClock();
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
setInterval(drawWordClock, 1E4);
drawWordClock();

// Show digital time while top button is pressed
setWatch(drawWordClock, BTN1, {repeat:true,edge:"both"});

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
