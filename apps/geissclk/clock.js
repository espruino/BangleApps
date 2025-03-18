var W = 79, H = 64;
// if screen is always on, only animate when unlocked
var isScreenAlwaysOn = process.env.BOARD=="BANGLEJS2";

/*var compiled = E.compiledC(`
// void transl(int, int, int )
int transl(unsigned char *map, unsigned char *imgfrom, unsigned char *imgto) {
  int n = 0;
  const int W = 79;
  const int H = 64;
  for (int y=0;y<H;y++)
    for (int x=0;x<W;x++) {
      int d = map[n];
      int nx = (x<<3) + ((d   )&0x0F) - 8;
      int ny = (y<<3) + ((d>>4)&0x0F) - 8;
      int ax = nx&7;
      int ay = ny&7;
      int a = (nx>>3) + ((ny>>3)*W);
      int c = 0;
      if (a>=0 && a<(W*H-(W+1))) {
        c = imgfrom[a]*(8-ax)*(8-ay) +
                imgfrom[a+1]*(ax)*(8-ay) +
                imgfrom[a+W]*(8-ax)*(ay) +
                imgfrom[a+W+1]*(ax)*(ay);
        c = (c>>6) - 4;
        if (c<0) c=0;
      }
      imgto[n] = c;
      n++;
    }
}
`);*/
var compiled = (function(){
  var bin=atob("Len3TwAnT/BPCPsAAJMI+wfzAOsDCdMYAZMAJhn4BkAAnQTwDwMD68YDBesUFAg7CDzdEE/q5AoI+wpaQfJvNapFItgB6woOA/AHAxH4CsCe+AGww/EIBQX7DPwD+wvMnvhPsATwBwQF+wv1ZUPE8QgKCvsMXJ74UFBrQwT7A8SkEQQ8JOrkdADgACQBm5xVATZPLsLRATdAL7bRA7C96PCPAAA=");
  return {
    transl:E.nativeCall(1, "void(int, int, int )", bin),
  };
})();

//require("Font5x9Numeric7Seg").add(Graphics);
Graphics.prototype.setFont5x9Numeric7Seg = function() {
   this.setFontCustom(atob("AAAAAAAAAAIAAAQCAQAAAd0BgMBdwAAAAAAAdwAB0RiMRcAAAERiMRdwAcAQCAQdwAcERiMRBwAd0RiMRBwAAEAgEAdwAd0RiMRdwAcERiMRdwAFAAd0QiEQdwAdwRCIRBwAd0BgMBAAABwRCIRdwAd0RiMRAAAd0QiEQAAAAAAAAAA="), 32, atob("BgAAAAAAAAAAAAAAAAYCAAYGBgYGBgYGBgYCAAAAAAAABgYGBgYG"), 9);
  }

// Allocate the data
var dataa = new Uint8Array(W*H);
var datab = new Uint8Array(W*H);
var map = new Uint8Array(W*H);
var pal = new Uint16Array(256);
var PALETTES = 3;
var MAPS = 6;
var animInterval;

// If we're missing any maps, compute them!
(function() {
  var files = require("Storage").list(/^geissclk/);
  var allOk = true;
  for (var n=0;n<PALETTES;n++)
    if (!files.includes("geissclk."+n+".pal"))
      allOk = false;
  for (var n=0;n<MAPS;n++)
    if (!files.includes("geissclk."+n+".map"))
      allOk = false;
  if (!allOk)
    eval(require("Storage").read("geissclk.precompute.js"));
})();

function randomPalette() {
  var n = (0|Math.random()*200000) % PALETTES;
  var p = new Uint8Array(pal.buffer);
  p.set(require("Storage").readArrayBuffer("geissclk."+n+".pal"));
  if (!g.theme.dark) // if not dark, invert colors
    E.mapInPlace(pal,pal,x=>x^0xFFFF);
}

function randomMap() {
  var n = (0|Math.random()*200000) % MAPS;
  map.set(require("Storage").readArrayBuffer("geissclk."+n+".map"));
}


randomPalette();
randomMap();

// Get the address
var addra = E.getAddressOf(dataa,true);
if (!addra) throw new Error("Not a Flat String");
var addrb = E.getAddressOf(datab,true);
if (!addrb) throw new Error("Not a Flat String");
var addrmap = E.getAddressOf(map,true);
if (!addrmap) throw new Error("Not a Flat String");
var gfx = Graphics.createArrayBuffer(W,H,8);
gfx.buffer = dataa.buffer;

var im = {
  width:W, height:H, bpp:8,
  palette: pal,
  buffer : dataa.buffer
};
var lastSeconds = -1;

function iterate(clearBuf) { "ram"
  var d = new Date();
  var time = require("locale").time(d,1);
  var seconds = d.getSeconds().toString().padStart(2,0);
  t = addra; addra = addrb; addrb = t;
  t = dataa; dataa = datab; datab = t;
  if (seconds!=lastSeconds) {
    lastSeconds = seconds;
    im.buffer = datab.buffer;
    gfx.buffer = datab.buffer;
  } else {
    im.buffer = dataa.buffer;
    gfx.buffer = dataa.buffer;
  }
  var x,y,n,t = getTime()/10;
  if (clearBuf) {
    gfx.clear();
  } else { // do geiss animation
    var amt = 100*Bangle.getAccel().diff;
    for (var i=0;i<amt;i++) {
      //x = Math.round((W/2) + 20*Math.sin(t));
      //y = Math.round((H/2) + 20*Math.cos(t));
      //t += 0.628;
      x = 1+(Math.random()*(W-2))|0;
      y = 1+(Math.random()*(H-2))|0;
      dataa[x + y*W] = 240;
    }
    compiled.transl(addrmap, addra, addrb);
  }


  x = 8;

  gfx.setFont("5x9Numeric7Seg",2);
  gfx.drawString(time, x, 20);
  if (!clearBuf) { // don't draw seconds if not animating
    gfx.setFont("5x9Numeric7Seg");
    gfx.drawString(seconds, x+55, 30);
  }
  // firmwares pre-2v09 wouldn't accelerate a 3x blit if it went right to the RHS - hence we're 79px not 80
  if (g.getWidth()==176)  // Bangle.js 2
    g.drawImage(im,8,24,{scale:2});
  else
    g.drawImage(im,3,24,{scale:3});
}

if (isScreenAlwaysOn) {
  Bangle.on('lock',function(on) {
    if (animInterval) {
      clearInterval(animInterval);
      animInterval = undefined;
    }
    if (!on) { // not locked - animate!
      randomMap();
      randomPalette();
      iterate();
      animInterval = setInterval(iterate, 50);
    } else {
      iterate(true); // just clear
      animInterval = setTimeout(function() {
        iterate(true);
        animInterval = setInterval(function() {
          iterate(true);
        }, 60000);
      }, 60000 - (Date.now() % 60000));
    }
  });
}

Bangle.on('lcdPower',function(on) {
  if (animInterval) {
    clearInterval(animInterval);
    animInterval = undefined;
  }
  if (on) {
    randomMap();
    randomPalette();
    iterate();
    animInterval = setInterval(iterate, 50);
  }
});

// Show launcher when button pressed
Bangle.setUI("clock");
g.clear(1);

Bangle.loadWidgets();
Bangle.drawWidgets();
iterate(true);
if (Bangle.isLCDOn() && (!isScreenAlwaysOn || !Bangle.isLocked())) {
  console.log("Starting");
  animInterval = setInterval(iterate, 50);
}


