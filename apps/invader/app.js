// Brian Kumanchik 
// Started 05-25-22
// My Invader Demo, for Bangle.js 2, written JavaScript - using Espruino Web IDE


// resolution 176x176


// to do:
// add buzz


// - variables -----------------------------------------
// invader variables
var inv_x             = 77;
var inv_y             = 20;
var i_anim_delay      = 10;     // invader animation (and move) delay
var inv_frame         = 1;      // invader start animation frame
var ix_speed          = 6;      // march speed
var i_dir             = 1;      // 1 = right, 0 = left
var been_hit          = false;  // invader hit state
//// shoot variables
var inv_shot_x        = -32; 
var inv_shot_y        = -32; 
var inv_fire_pause    = 30;
var inv_fired = false;          // invader fired state
//// explode variables
var been_hit          = false;  // invader hit state
var bx                = -32;    // blast x
var by                = -32;    // blast y
var blast_delay       = 60;     // invader blast delay - pause after explosion
var boom_play         = false; 

// turret variables
var tur_x = 77;
var tur_y = 148;

// misc variables
var score = 0;
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








// - setup stuff ---------------------------------------
function gameStart() {
  setInterval(onFrame, 50); 
}



// - main loop -----------------------------------------
function onFrame() {
  // if not game over
  if(game_over == false) {
    g.clear();
    
    // call function to move and animate invader
    move_anim_inv();
    
    // call function to make invader fire
    invader_fire();


    // check input (screen presses)
    if(BTNL.read() && tur_x >= 12) { 
      tur_x -= 6;
    }
    else if(BTNR.read() && tur_x <= 140) {
      tur_x += 6;
    }
    else if(BTNF.read()) {
      tur_y -= 5;
    }


    
    
    
    // check for invader shot going off screen before allowing to fire again
    if (inv_shot_y > 150
    ) {
        inv_fired = false;
        inv_shot_x = inv_x - 1;
        inv_shot_y = inv_y + 7;
        inv_fire_pause = 30;
    }
    
    
    
    
    // - draw sprites ----------------------------------
    // draw invader sprites
    if(inv_frame == 1) {
      g.drawImage(invader_a, inv_x, inv_y, {scale:2});
    }
     else if(inv_frame == 2) {
      g.drawImage(invader_b, inv_x, inv_y, {scale:2});
    }
    //g.drawImage(invader_b, inv_x + 30, inv_y, {scale:2});
    //g.drawImage(boom, inv_x + 60, inv_y, {scale:2});
    // - invader shot
    if (inv_fired) {
      //DrawTexture(inv_shot, inv_shot_x, inv_shot_y, WHITE); 
      g.drawImage(inv_shot, inv_shot_x, inv_shot_y, {scale:2});      
    }
    else {
      //DrawTexture(inv_shot, -32, -32, WHITE);
      g.drawImage(inv_shot, -32, -32, {scale:2}); 
    }  
    

    // draw turret sprites    
    g.drawImage(turret, tur_x, tur_y, {scale:2});
    //g.drawImage(tur_exp_a, tur_x + 30, tur_y, {scale:2});
    //g.drawImage(tur_exp_b, tur_x + 60, tur_y, {scale:2});
    //g.drawImage(shot, tur_x - 30, tur_y, {scale:2});


    // - draw text -------------------------------------
    g.setFont("4x6", 2);
    g.setColor(0,0,0);
    g.drawString("SCORE:" + score ,5,5);   // 
    g.drawString("LIVES:" + lives ,117,5); // 


    g.flip();
  }
}



gameStart();


