// Brian Kumanchik 
// Started 05-25-22
// My Invader Demo, for Bangle.js 2, written JavaScript - using Espruino Web IDE



// - variables -----------------------------------------
// invader variables
var inv_x = 77;
var inv_y = 20;

// turret variables
var tur_x = 77;
var tur_y = 138;

// misc variables
var score = 999;
var lives = 3;
var game_over = false;

// input(screen controller) variables
var BTNL, BTNR, BTNF;
var tap = {};
// use tapping on screen for left and right
Bangle.on('drag',e=>tap=e);
BTNL = { read : _=>tap.b && tap.x < 88 && tap.y > 88};
BTNR = { read : _=>tap.b && tap.x > 88 && tap.y > 88};
BTNF = { read : _=>tap.b && tap.x > 88 && tap.y < 88};



// - sprites -------------------------------------------
// invader sprites
var invader_a = 
  require("heatshrink").decompress(atob("kEgwkBiMRgACBAAQFFBJIPJBQgOKB55MGB64JCBoYQIB5yOKB+qvIA6pxHX5YPOAH4A/AH4A8A=="));
var invader_b = 
  require("heatshrink").decompress(atob("kEgxH+AAYJBAwgLQCaYfPB4oVHBpofnSpofvCY4HND9oAPD9IhTDpYfhd6IftN6IPtAH4A/AH4A/AH4A/AH4A9A="));
var boom =
  require("heatshrink").decompress(atob("kEgxH+AH4AFJYIHND9YTFAoYJJD9YRNMLKhbX/IRBV6JvND7p//f/4RHAoYJJD9a//AH4A/AH4A/AH4A9A=="));
var inv_shot =
  require("heatshrink").decompress(atob("kEgxH+AH4A/ABaRBD/pB/Hv69/IP4A/AH4A/AH4A/AH4A/AH4AzA"));

// turret sprites
var turret =
  require("heatshrink").decompress(atob("kEgxH+AH4A/AH4A/AH4A/AH4A/ABcAgAf7DoIADD/4fxC4oAPD84dVEJIf/D/4f/D74="));
var tur_exp_a = 
  require("heatshrink").decompress(atob("kEgxH+AH4A/AH4A/AH4A/AH4A/AAcAgATdD7YbJBJYLFAoYffDKqLXD6qlVB86lHLYoFDS5offA5YbRD8YZHABLbRD7aZLD5IlJD7YA="));
var tur_exp_b =
  require("heatshrink").decompress(atob("kEgxH+AH4A/AH4A/AH4A/AH4A/AAcAgATdD7YbJBJYLFAoYffDKqLXD6qlVB86lHLYoFDS5offA5YbRD8YZHABLbRD7aZLD5IlJD7YA="));
var shot =
  require("heatshrink").decompress(atob("kEgxH+AH4A/AH4A/ABcAgAf/D/4f9AH4A/AH4A/AH4A/AH4A/AGY"));



// - setup stuff ---------------------------------------
function gameStart() {
  setInterval(onFrame, 50); 
}



// - main loop -----------------------------------------
function onFrame() {
  // if not game over
  if(game_over == false) {
    g.clear();


    // check input (screen presses)
    if(BTNL.read()) { 
      tur_x -= 5;
    }
    else if(BTNR.read()) {
      tur_x += 5;
    }
    else if(BTNF.read()) {
      tur_y -= 5;
    }


    // - draw sprites ----------------------------------
    // draw invader sprites
    g.drawImage(invader_a, inv_x, inv_y);
    //g.drawImage(invader_b, inv_x + 30, inv_y);
    //g.drawImage(boom, inv_x + 60, inv_y);
    //g.drawImage(inv_shot, inv_x - 30, inv_y);

    // draw turret sprites
    g.drawImage(turret, tur_x, tur_y);
    //g.drawImage(tur_exp_a, tur_x + 30, tur_y);
    //g.drawImage(tur_exp_b, tur_x + 60, tur_y);
    //g.drawImage(shot, tur_x - 30, tur_y);


    // - draw text -------------------------------------
    g.setFont("4x6", 2);
    g.setColor(0,0,0);
    g.drawString("SCORE:" + score ,5,5);   // 
    g.drawString("LIVES:" + lives ,117,5); // 


    g.flip();
  }
}



gameStart();


