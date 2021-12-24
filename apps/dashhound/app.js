/* This is a simple T-Rex JavaScript game but with a new character and for the Bangle.js smartwatch.
Check it out on:
https://github.com/ocalla22/BangleApps/edit/master/apps/dashhound/app.js
*/

drawTransparentImage = (imgString) => {
  //transparent lets the empty blocks become see through when images collide.
  //If two images collide the whitespace of one image does not take precedence
  //Over the non whitespace of another image.
  image = Graphics.createImage(imgString);
  image.transparent = 0;
  return image;
};

//The images used to represent the main character
DashImgs = [drawTransparentImage(`
###
 ###
  ###
   ###                       ##  ##
    ###                      ###  ###
     ##################################
     ################################
     ############################
    ###  ###            ###  ###
   ###  ###              ###  ###
  ###  ###                ###  ###
`),

drawTransparentImage(`
  ###
  ###
   ###
    ###                      ##  ##
    ###                     ###  ###
    ###################################
     ################################
     ############################
    ###  ###            ###  ###
     ###  ###          ###  ###
      ###  ###        ###  ###
`),
drawTransparentImage(`

          ____/ (  (    )   )  \___
         /( (  (  )   _    ))  )   )\
        ((     (   )(    )  )   (   )  )
      ((/  ( _(   )   (   _) ) (  () )  )
      ( (  ( (_)   ((    (   )  .((_ ) .  )_
    ( (  )    (      (  )    )   ) . ) (   )
  (  (   (  (   ) (  _  ( _) ).  ) . ) ) ( )
  ( (  (   ) (  )   (  ))     ) _)(   )  )  )
  ( (  ( \ ) (    (_  ( ) ( )  )   ) )  )) ( )
  (  (   (  (   (_ ( ) ( _    )  ) (  )  )   )
  ( (  ( (  (  )     (_  )  ) )  _)   ) _( ( )
  ((  (   )(    (     _    )   _) _(_ (  (_ )
    (_((__(_(__(( ( ( |  ) ) ) )_))__))_)___)
    ((__)        \\||lll|l||///          \_))
             (   /(/ (  )  ) )\   )
          (    ( ( ( | | ) ) )\   )
            (   /(| / ( )) ) ) )) )
         (     ( ((((_(|)_)))))     )
          (      ||\(|(|)|/||     )
        (        |(||(||)||||        )
           (     //|/l|||)|\\ \     )
         (/ / //  /|//||||\\  \ \  \ _)
`)];

class Dash {
  //This class is responsible Dash's location and status and any physics on location manipulation.
  constructor() {
    this.alive = true;
    this.img = 0;
    this.x = 5; // this is a nice aesthetic starting position
    this.y = 0;
    this.vy = 0;
    this.score = 0;
    this.isJumped = false;
  }

  kill() {
    this.alive = false;
    // image 2 is the death image
    this.img = 2;
  }

  increaseScore() {
    this.score++;
  }

  moveLeft() {
    if (this.x>0) this.x--;
  }

  moveRight() {
    if (this.x<20) this.x++;
  }

  canJump() {
    return this.y==0;
  }

  executeJump() {
    if (this.canJump()) {
      this.isJumped = true;
      this.vy = 6;
      this.y += this.vy;
    }
  }

  continueJump() {
    if (this.isJumped) {
      this.vy -= 0.5;
      this.y += this.vy;
    }
    //after updates, re-evaluate jump status
    if (this.y<0) {
      this.isJumped = false;
      this.y=0;
      this.vy=0;
    }
  }
}


showOpeningPage = () => {
  title = "Dash Hound";
  author = "Andy OC";
  iconProvider = "Icon8";
  E.showMessage(`App by ${author}\nImgs by ${iconProvider}`, title);
  g.drawImage(require("Storage").read("dashhound.img"), 100, 50);
};

showOpeningPage();

greal = g;

//this line seems to initialise the array that is the display
g = Graphics.createArrayBuffer(width=120,height=64,bpp=1,options={msb:true});

g.flip = function() {
  //The image height and width are whats expected,
  image = {
    width:120,
    height:64,
    buffer:g.buffer
  };
  //x,y are the position of the images origin
  //The scale can be used to double up things without denormalising the array buffer?
  //the y value computation here is a mystery to me
  //looks like (240 - 128)/2 can be decomposed?
  //the two comes from the scale factor. -> 120-64
  //the 64 probably comes the the height of the buffer,
  // and the 120 is maybe the overall height of the screen?
  greal.drawImage(image=image
  ,x=0,y=(240-128)/2,options={scale:2});
};


var W = g.getWidth();
var BTNL = BTN4;
var BTNR = BTN5;
var BTNU = BTN1;

// The images used for obstacles
cactiImgs = [drawTransparentImage(`
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
###########
 #########
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
#####  #
 ####  #
   #####
   ####
   ##
   ##
   ##
   ##
`)];

// Images can be added like this in Espruino v2.00
//var IMG = {};

makeGround = () => {
  var random = new Uint8Array(128*3/8);
  for (var i=0;i<50;i++) {
    var a = 0|(Math.random()*random.length);
    var b = 0|(Math.random()*8);
    random[a]|=1<<b;
  }
  return { width: 128, height: 3, bpp : 1, buffer : random.buffer };
};

var ground, cacti, rex, frame, player;


function gameStart() {
  rex = new Dash();
  cacti = [ { x:W, img:1 } ];
  ground = makeGround();
  frame = 0;
  setInterval(onFrame, 2);
}

function gameStop() {
  rex.kill();
  clearInterval();
  setTimeout(function() {
    setWatch(gameStart, BTNU, {repeat:false,debounce:50,edge:"rising"});
  }, 1000);
  setTimeout(onFrame, 5);
}

function onFrame() {
  g.clear();
  if (rex.alive) {
    frame++; frame++;
    rex.increaseScore();
    //i think this alternates between image 1 and 2
    if (!(frame&3)) rex.img = rex.img?0:1;
    if (rex.isJumped) rex.continueJump();
    if (BTNL.read()) rex.moveLeft();
    if (BTNR.read()) rex.moveRight();
    if (BTNU.read()) rex.executeJump();

    // this seems to be logic about generating a cactus based on most recent cactus
    var lastCactix = cacti.length?cacti[cacti.length-1].x:W-1;
    if (lastCactix<W) {
      cacti.push({
        x : lastCactix + 35 + Math.random()*W,
        img : (Math.random()>0.3)?1:0
      });
    }
    cacti.forEach(c=>c.x-=4);
    while (cacti.length && cacti[0].x<0) cacti.shift();
  } 
  else {
    g.drawString("Game Over!",(W-g.stringWidth("Game Over!"))/2,20);
  }

  g.drawLine(0,60,239,60);
  cacti.forEach(c=>g.drawImage(cactiImgs[c.img],c.x,60-cactiImgs[c.img].height));

  // check against actual pixels
  var rexx = rex.x;
  var rexy = 50-rex.y;

  // whats special about these pixels that they cause death?
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
  g.drawImage(DashImgs[rex.img], rexx, rexy);
  var groundOffset = frame&127;
  g.drawImage(ground, -groundOffset, 61);
  g.drawImage(ground, 128-groundOffset, 61);
  g.drawString(rex.score,(W-1)-g.stringWidth(rex.score));
  g.flip();
}


start = () => {
  greal.clear();
  gameStart();
};

g.clear();
setWatch(start, BTNU, {repeat:false});

