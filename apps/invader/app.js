// Brian Kumanchik
// Started 05-25-22
// My Invader Demo, for Bangle.js 2, written JavaScript - using Espruino Web IDE


// note: resolution is 176x176


// to do:
//   upload to official app page
//   make invader clock



// - variables -----------------------------------------
// invader variables
var inv_x             = 77;
var inv_y             = 20;
var i_anim_delay      = 10;     // invader animation (and move) delay
var inv_frame         = 1;      // invader start animation frame
var ix_speed          = 6;      // march speed
var i_dir             = 1;      // 1 = right, 0 = left
var been_hit          = false;  // invader hit state
// - shoot variables
var inv_shot_x        = -32;
var inv_shot_y        = -32;
var inv_fire_pause    = 30;
var inv_fired         = false;  // invader fired state
// - explode variables
var been_hit          = false;  // invader hit state
//var bx                = -32;    // blast x
//var by                = -32;    // blast y
var blast_delay       = 15;     // invader blast delay - pause after explosion
var boom_play         = false;

// turret variables
var tur_x               = 77;
var tur_y               = 148;
var shot_fired          = false; // turret fired state
var sx                  = -20;   // turret shot starting x - off screen
var sy                  = -20;   // turret shot starting y - off screen
var turret_been_hit     = false;
var turret_blast_delay  = 25;    // keep blast active on screen for 60 frames
var turret_exp_frame    = 1;     // turret explode start animation frame
var turret_anim_delay   = 3;     // turret explode animation delay
var explosion_play      = false;

// misc variables
var score               = 0;     // starting score
var lives               = 3;     // starting lives
var game_state          = 0;     // game state - 0 = game not started, 1 = game running, 3 = game over
//var ang                 = 0.1;
var start_been_pressed  = false; // stops double press on restart
var fire_been_pressed   = false; // stops auto fire

// input(screen controller) variables
var BTNL, BTNR, BTNF, BTNS; // button - left, right, fire, start
var tap = {};
// use tapping on screen for left, right, fire, start
Bangle.on('drag',e=>tap=e);
BTNL = { read : _=>tap.b && tap.x < 88 && tap.y > 88};
BTNR = { read : _=>tap.b && tap.x > 88 && tap.y > 88};
BTNF = { read : _=>tap.b && tap.x > 88 && tap.y < 88};
BTNS = { read : _=>tap.b && tap.x < 88 && tap.y < 88};


// - sprites -------------------------------------------
// invader sprites
var invader_a =
  require("heatshrink").decompress(atob("hcIwkBiIBBAQoECCQQFBgEQAIMBEhUBDoYWDAYI="));
var invader_b =
  require("heatshrink").decompress(atob("hcIwkBiIBBAQMQAoQEBgISCAYUQAIQAEB4YEBEAgEDAYIA=="));
var boom =
  require("heatshrink").decompress(atob("hcJwkBiMQAIURgMQAgIKBAIICFAIMAAwIWBBAYSIEAgrDiA="));
var inv_shot =
  require("heatshrink").decompress(atob("gcFwkBiERiAABAYQ"));

// turret sprites
var turret =
  require("heatshrink").decompress(atob("h8IwkBiIABAYYACgAHFiEABggADCAInFgITBAAgOPA=="));
var tur_exp_a =
  require("heatshrink").decompress(atob("h8IwkBiMRiACBAAwJEiAABBQgZCAAkAiAJBBoIUBgIABBgQACDIQ9ECQIA=="));
var tur_exp_b =
  require("heatshrink").decompress(atob("h8IwkBiIBBAAUBiADCiMQAwQFDCIYXEB4IABgMAEYQXBiEAAQIQBAoIABDAQUCAAIVBA"));
var shot =
  require("heatshrink").decompress(atob("gMDwkBAoIA=="));


// function to move and animate invader
function move_anim_inv() {
  // invader anim code
  i_anim_delay -= 1;
  if ((i_anim_delay < 0) && !(been_hit)) {
    i_anim_delay = 10;

    inv_frame += 1;
    if (inv_frame > 2) {
      inv_frame = 1;
    }

    // move right
    if (i_dir == 1){
      inv_x += ix_speed;
      if (inv_x >= 142) {
        inv_y += 8; // step down
        i_dir = -1;
      }
    }

    // move left
    if (i_dir < 1){
      inv_x -= ix_speed;
      if (inv_x <= 10) {
        inv_y += 8; // step down
        i_dir = 1;
      }
    }
  }
}


// function to make invader fire
function invader_fire() {
  inv_fire_pause -= 1;

  if (!(inv_fired)) { // so once invader shot is fired it doesn't follow the invader still
    inv_shot_x = inv_x + 8;
    inv_shot_y = inv_y + 18;
  }

  if (inv_fire_pause < 0) {
    inv_fired = true;
    inv_shot_y += 8;
  }
}


// function to make turret explode (when hit) then start back in center
function turret_hit() {
  if (turret_been_hit) {
    if (!(explosion_play)) {
      //Bangle.buzz();
      //Bangle.beep();
    }

    explosion_play = true;
    turret_anim_delay -= 1;
    turret_blast_delay -= 1;

    if (turret_anim_delay < 0) {
      turret_exp_frame += 1;
      if (turret_exp_frame > 2) {
        Bangle.buzz();
        turret_exp_frame = 1;
      }
      turret_anim_delay = 3;
    }

    if (turret_blast_delay < 0) {
      turret_blast_delay = 21;
      turret_been_hit = false;
      explosion_play = false;
      tur_x = 77;   // reset turret x
      tur_y = 148;  // reset turret y
    }
  }
}


// function to make invader explode (when hit) then randomly start somewhere else
function invader_hit() {
  if (been_hit) {
    if (!(boom_play)) {
      Bangle.buzz();
      //Bangle.beep();
    }

    inv_shot_x = -32;      // hide shot
    inv_shot_y = -32;      // hide shot
    inv_fire_pause = 30;   // and reset pause

    boom_play = true;
    blast_delay -= 1;

    if (blast_delay < 0) {
      blast_delay = 15;
      boom_play = false;
      been_hit = false;
      //bx = -32;                         // move boom off screen (following invader)
      //by = -32;
      // generate a random rounded number between 10 and 142;
      inv_x = Math.floor(Math.random() * 142) + 10;
      inv_y = 20;                       // move invader back up after being hit
      i_dir = 1;                        // reset invader direction
    }
  }
}


// - setup stuff ---------------------------------------
function gameStart() {
  setInterval(onFrame, 50);
}


// - main loop -------------------------------------------------------------
function onFrame() {

  // game not started state (title screen) ***************************
  if(game_state == 0) {    
    g.clear();


    if (!(BTNS.read())) {
      start_been_pressed  = false; // stops double press on restart
    }


    // draw text during game over state
    g.setFont("4x6", 4);  // set font and size x 2
    g.setColor(0,1,0);    // set color (black)
    g.drawString("INVADER", 33, 55);


    // just animate invader
    // invader anim code
    i_anim_delay -= 1;
    if(i_anim_delay < 0) {
      i_anim_delay = 15;

      inv_frame += 1;
      if (inv_frame > 2) {
        inv_frame = 1;
      }
    }


    // draw sprites during game over state
    // next 2 line for a rotating invader on the title screen
    //ang += 0.1;
    //g.drawImage(invader_a, 88, 98, {scale:4, rotate:ang});
    if(inv_frame == 1) {
      g.drawImage(invader_a, 88-22, 85, {scale:4});
    }
    else if(inv_frame == 2) {
      g.drawImage(invader_b, 88-22, 85, {scale:4});
    }

    // reset stuff
    if(BTNS.read() && !(start_been_pressed)) {
      turret_been_hit  = false;
      tur_x            = 77;       // reset turret to center of screen
      tur_y            = 148;      // reset turret y
      inv_x            = 77;       // reset invader to center of screen
      inv_y            = 20;       // reset invader back to top
      i_dir            = 1;        // reset invader direction
      lives            = 3;        // reset lives
      score            = 0;        // reset score
      explosion_play   = false;
      game_state       = 1;
      turret_blast_delay  = 25;
  }


    g.flip();
  }


  // game over state *************************************************
  if(game_state == 3) {
    g.clear();

    // draw text during game over state
    g.setFont("4x6", 2);  // set font and size x 2
    g.setColor(0,0,0);    // set color (black)
    g.drawString("SCORE:" + score ,5, 5);
    g.drawString("LIVES:" + lives ,117, 5);
    g.drawString("GAME OVER", 52, 80);


    // draw sprites during game over state
    // - invader frame 2
    g.drawImage(invader_b, inv_x, inv_y, {scale:2});
    g.drawImage(tur_exp_b, tur_x, tur_y, {scale:2});
    g.drawImage(inv_shot, inv_shot_x, inv_shot_y, {scale:2});


    // reset stuff
    if(BTNS.read()) {
      //turret_been_hit  = false;
      //tur_x            = 77;       // reset turret to center of screen
      //tur_y            = 148;      // reset turret y
      //inv_x            = 77;       // reset invader to center of screen
      //inv_y            = 20;       // reset invader back to top
      //i_dir            = 1;        // reset invader direction
      //lives            = 3;        // reset lives
      //score            = 0;        // reset score
      //explosion_play   = false;
      game_state       = 0;
      start_been_pressed  = true;
      //turret_blast_delay  = 25;
    }


    g.flip();
  }


  // not game over state (game running) ******************************
  if(game_state == 1) {
    Bangle.setLCDPower(1); // optional - this keeps the watch LCD lit up
    g.clear();


    if (!(BTNF.read())) {
      fire_been_pressed  = false; // stops auto fire
    }


    // call function to move and animate invader
    move_anim_inv();

    // call function to make invader fire
    invader_fire();


    // check input (screen presses)
    if(BTNL.read() && tur_x >= 12 && !(turret_been_hit)) {
      tur_x -= 6;
    }
    else if(BTNR.read() && tur_x <= 140 && !(turret_been_hit)) {
      tur_x += 6;
    }
    else if(BTNF.read() && !(turret_been_hit) && !(fire_been_pressed) && !(shot_fired)) {
      shot_fired = true;
      fire_been_pressed = true; // stops auto fire
      sx=tur_x + 12;
      sy=tur_y - 7;
    }


    // check for turret shot going off screen before allowing to fire again
    if (shot_fired) {
      sy -= 8;
      if (sy < 22) {
        shot_fired = false;
        sx = -32;
        sy = -32;
      }
    }


    // check for invader shot going off screen before allowing to fire again
    if (inv_shot_y > 150
    ) {
      inv_fired = false;
      inv_shot_x = inv_x - 1;
      inv_shot_y = inv_y + 7;
      inv_fire_pause = 30;
    }


    // check for turret shot and invader collision
    if ((sx >= inv_x) && (sx <= inv_x + 20) && (sy <= inv_y + 14)) {
        sx = -32;
        sy = -32;
        been_hit = true;
        score += 10;
    }


    // check for invader shot and turret collision
    if ((inv_shot_x + 4) >= (tur_x) && (inv_shot_x) <= (tur_x + 24) && (inv_shot_y + 8) >= (tur_y + 6)) {
      if (!(turret_been_hit)) {
        lives -= 1;

        if (lives == 0) {
          game_state = 3;
          Bangle.buzz();
        }
      turret_been_hit = true;
      }
    }


    // - draw sprites ----------------------------------
    // invader sprites
    if(!(been_hit)) {
      if(inv_frame == 1) {
        // - invader frame 1
        g.drawImage(invader_a, inv_x, inv_y, {scale:2});
      }
      else if(inv_frame == 2) {
        // - invader frame 2
        g.drawImage(invader_b, inv_x, inv_y, {scale:2});
      }
    }
    else {
      // - invader explosion
      g.drawImage(boom, inv_x, inv_y, {scale:2});
    }
    // - invader shot
    if (inv_fired) {
      g.drawImage(inv_shot, inv_shot_x, inv_shot_y, {scale:2});
    }
    else {
      g.drawImage(inv_shot, -32, -32, {scale:2}); 
    }

    // turret sprites
    if(!(turret_been_hit)) {
      // - undamaged turret
      g.drawImage(turret, tur_x, tur_y, {scale:2});
    }
    else {
      if(turret_exp_frame == 1) {
        // - turret explosion frame 1
        g.drawImage(tur_exp_a, tur_x, tur_y, {scale:2});
      }
      else if(turret_exp_frame == 2) {
        // - turret explosion frame 2
        g.drawImage(tur_exp_b, tur_x, tur_y, {scale:2});
      }
    }
    // - turret shot
    g.drawImage(shot, sx, sy, {scale:2});


    // call function to make invader explode then randomly start somewhere else
    invader_hit();


    // call function to make turret explode (when hit) then start back in center
    turret_hit();


    // - draw text -------------------------------------
    g.setFont("4x6", 2);  // set font and size x 2
    g.setColor(0,0,0);    // set color (black)
    g.drawString("SCORE:" + score ,5,5);
    g.drawString("LIVES:" + lives ,117,5);


    g.flip();
  }

} // end main loop ---------------------------------------------------------


gameStart();


