greal = g;
g.clear();
g = Graphics.createArrayBuffer(120,64,1,{msb:true});
g.flip = function() {
  greal.drawImage({
    width:120,
    height:64,
    buffer:g.buffer
  },0,(240-128)/2,{scale:2});
};
var W = g.getWidth();
var BTNL = BTN4;
var BTNR = BTN5;
var BTNU = BTN1;

// Images can be added like this in Espruino v2.00
var IMG = {
  rex: [Graphics.createImage(`
           ########
          ##########
          ## #######
          ##########
          ##########
          ##########
          #####
          ########
#        #####
#      #######
##    ##########
###  ######### #
##############
##############
 ############
  ###########
   #########
    #######
     ### ##
     ##   #
          #
          ##
`),Graphics.createImage(`
           ########
          ##########
          ## #######
          ##########
          ##########
          ##########
          #####
          ########
#        #####
#      #######
##    ##########
###  ######### #
##############
##############
 ############
  ###########
   #########
    #######
     ### ##
     ##   ##
     #
     ##
`),Graphics.createImage(`
           ########
          #   ######
          # # ######
          #   ######
          ##########
          ##########
          #####
          ########
#        #####
#      #######
##    ##########
###  ######### #
##############
##############
 ############
  ###########
   #########
    #######
     ### ##
     ##   #
     #    #
     ##   ##
`)],
  cacti: [Graphics.createImage(`
     ##
    ####
    ####
    ####
    ####
    ####  #
 #  #### ###
### #### ###
### #### ###
### #### ###
### #### ###
### #### ###
### #### ###
### #### ###
###########
 #########
    ####
    ####
    ####
    ####
    ####
    ####
    ####
    ####
`),Graphics.createImage(`
   ##
   ##
 # ##
## ##  #
## ##  #
## ##  #
## ##  #
#####  #
 ####  #
   #####
   ####
   ##
   ##
   ##
   ##
   ##
   ##
   ##
`)],
};
IMG.rex.forEach(i=>i.transparent=0);
IMG.cacti.forEach(i=>i.transparent=0);
var cacti, rex, frame;

function gameStart() {
  rex = {
    alive : true,
    img : 0,
    x : 10, y : 0,
    vy : 0,
    score : 0
  };
  cacti = [ { x:W, img:1 } ];
  var random = new Uint8Array(128*3/8);
  for (var i=0;i<50;i++) {
    var a = 0|(Math.random()*random.length);
    var b = 0|(Math.random()*8);
    random[a]|=1<<b;
  }
  IMG.ground = { width: 128, height: 3, bpp : 1, buffer : random.buffer };
  frame = 0;
  setInterval(onFrame, 50);
}
function gameStop() {
  rex.alive = false;
  rex.img = 2; // dead
  clearInterval();
  setTimeout(function() {
    setWatch(gameStart, BTNU, {repeat:0,debounce:50,edge:"rising"});
  }, 1000);
  setTimeout(onFrame, 10);
}

function onFrame() {
  "ram"
  g.clear();
  if (rex.alive) {
    frame++;
    rex.score++;
    if (!(frame&3)) rex.img = rex.img?0:1;
    // move rex
    if (BTNL.read() && rex.x>0) rex.x--;
    if (BTNR.read() && rex.x<20) rex.x++;
    if (BTNU.read() && rex.y==0) rex.vy=4;
    rex.y += rex.vy;
    rex.vy -= 0.2;
    if (rex.y<=0) {rex.y=0; rex.vy=0; }
    // move cacti
    var lastCactix = cacti.length?cacti[cacti.length-1].x:W-1;
    if (lastCactix<W) {
      cacti.push({
        x : lastCactix + 24 + Math.random()*W,
        img : (Math.random()>0.5)?1:0
      });
    }
    cacti.forEach(c=>c.x--);
    while (cacti.length && cacti[0].x<0) cacti.shift();
  } else {
    g.drawString("Game Over!",(W-g.stringWidth("Game Over!"))/2,20);
  }
  g.drawLine(0,60,239,60);
  cacti.forEach(c=>g.drawImage(IMG.cacti[c.img],c.x,60-IMG.cacti[c.img].height));
  // check against actual pixels
  var rexx = rex.x;
  var rexy = 38-rex.y;
  if (rex.alive &&
     (g.getPixel(rexx+0, rexy+13) ||
      g.getPixel(rexx+2, rexy+15) ||
      g.getPixel(rexx+5, rexy+19) ||
      g.getPixel(rexx+10, rexy+19) ||
      g.getPixel(rexx+12, rexy+15) ||
      g.getPixel(rexx+13, rexy+13) ||
      g.getPixel(rexx+15, rexy+11) ||
      g.getPixel(rexx+17, rexy+7) ||
      g.getPixel(rexx+19, rexy+5) ||
      g.getPixel(rexx+19, rexy+1))) {
    return gameStop();
  }
  g.drawImage(IMG.rex[rex.img], rexx, rexy);
  var groundOffset = frame&127;
  g.drawImage(IMG.ground, -groundOffset, 61);
  g.drawImage(IMG.ground, 128-groundOffset, 61);
  g.drawString(rex.score,(W-1)-g.stringWidth(rex.score));
  g.flip();
}

gameStart();
