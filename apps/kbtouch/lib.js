exports.input = function(options) {
  options = options||{};
  var text = options.text;
  if ("string"!=typeof text) text="";

  // Key Maps for Keyboard
var KEYMAPLOWER = [
  "`1234567890-=\b",
  "\2qwertyuiop[]\n",
  "\2asdfghjkl;'#\n",
  " \\zxcvbnm,./  ",
  ];
var KEYMAPUPPER = [
  "¬!\"£$%^&*()_+\b",
  "\2QWERTYUIOP{}\n",
  "\2ASDFGHJKL:@~\n",
  " |ZXCVBNM<>?  ",
  ];
var KEYIMGL = Graphics.createImage(`


   #
  ###
 #####
   #
   #
   #
   #
   #
   #
   #
   #
   #
   #
   #
   #
   #
`);KEYIMGL.transparent=0;
var KEYIMGR = Graphics.createImage(`


  #
 ##
#####
 ##
  #



###
  #
  #
  #
  #
  #
#####
 ###
  #

#`);KEYIMGR.transparent=0;
/* If a char in the keymap is >=128,
subtract 128 and look in this array for
multi-character key codes*/
var KEYEXTRA = [
  String.fromCharCode(27,91,68), // 0x80 left
  String.fromCharCode(27,91,67), // 0x81 right
  String.fromCharCode(27,91,65), // 0x82 up
  String.fromCharCode(27,91,66), // 0x83 down
  String.fromCharCode(27,91,53,126), // 0x84 page up
  String.fromCharCode(27,91,54,126), // 0x85 page down
];

var settings = Object.assign({
  // default values
  textSize: 1,
  offsetKeyboard: 0,
  loopAround: 1,
  oneToOne: 0,
  speedScaling: 24
}, require('Storage').readJSON("kbtouch.settings.json", true) || {});

// state
const R = Bangle.appRect;
var kbx = 0, kby = 0, kbdx = 0, kbdy = 0, kbShift = false, flashToggle = false;
const PX=12, PY=16, DRAGSCALE=settings.speedScaling;
var xoff = 3, yoff = g.getHeight()-PY*(4+5*settings.offsetKeyboard);

function draw() {
  "ram";
  var map = kbShift ? KEYMAPUPPER : KEYMAPLOWER;
  //g.drawImage(KEYIMG,0,yoff);
  g.reset().setFont("6x8:2");
  g.clearRect(R);
  if (kbx>=0)
    g.setColor(g.theme.bgH).fillRect(xoff+kbx*PX,yoff+kby*PY, xoff+(kbx+1)*PX-1,yoff+(kby+1)*PY-1).setColor(g.theme.fg);
  g.drawImage(KEYIMGL,xoff,yoff+PY,{scale:2});
  g.drawImage(KEYIMGR,xoff+PX*13,yoff,{scale:2});
  g.drawString(map[0],xoff,yoff);
  g.drawString(map[1],xoff,yoff+PY);
  g.drawString(map[2],xoff,yoff+PY*2);
  g.drawString(map[3],xoff,yoff+PY*3);
  var l = g.setFont(settings.textSize ? "6x8:4":"6x8:2").wrapString(text+(flashToggle?"_":" "), R.w-8);
  if (l.length>2+2*settings.textSize) l=l.slice(-(2+2*settings.textSize));
  g.drawString(l.join("\n"),R.x+4,R.y+4 +82*settings.offsetKeyboard);

  g.flip();
}
  g.reset().clearRect(R);
  draw();
  var flashInterval = setInterval(() => {
    flashToggle = !flashToggle;
    draw();
  }, 1000);

  return new Promise((resolve,reject) => {

    Bangle.setUI({mode:"custom", drag:e=>{
      if (settings.oneToOne) {
        kbx = Math.max(Math.min(Math.floor((e.x-16) / (6*2)) , 13) , 0);
        kby = Math.max(Math.min(Math.floor((e.y-120) / (8*2)) , 3) , 0);
      //print(e.y, kby, e.x, kbx);
      }
      
      if (!settings.oneToOne) {
        kbdx += e.dx;
        kbdy += e.dy;
        var dx = Math.round(kbdx/DRAGSCALE), dy = Math.round(kbdy/DRAGSCALE);
        kbdx -= dx*DRAGSCALE;
        kbdy -= dy*DRAGSCALE;
        if (dx || dy) {
          if (settings.loopAround) {
            kbx = (kbx+dx+15)%15;
            kby = (kby+dy+4)%4;
          } else {
              kbx = Math.max(Math.min((kbx+dx),13),0);
              kby = Math.max(Math.min((kby+dy),3),0);
          }
        }
      }
      draw();
      
      if (!e.b && e.y>Bangle.appRect.y && settings.oneToOne /*&& settings.releaseToSelect*/) {
        var map = kbShift ? KEYMAPUPPER : KEYMAPLOWER;
        var ch = map[kby][kbx];
        if (ch=="\2") kbShift=!kbShift;
        else if (ch=="\b") text = text.slice(0,-1);
        else text += ch;
        Bangle.buzz(20);
        draw();
      }
    },touch:()=>{
      if ( !settings.oneToOne /*|| !settings.releaseToSelect*/) {
        var map = kbShift ? KEYMAPUPPER : KEYMAPLOWER;
        var ch = map[kby][kbx];
        if (ch=="\2") kbShift=!kbShift;
        else if (ch=="\b") text = text.slice(0,-1);
        else text += ch;
        Bangle.buzz(20);
        draw();
      }
    },back:()=>{
      clearInterval(flashInterval);
      Bangle.setUI();
      Bangle.prependListener&&Bangle.removeListener('swipe', catchSwipe); // Remove swipe lister if it was added with `Bangle.prependListener()` (fw2v19 and up).
      g.clearRect(Bangle.appRect);
      resolve(text);
    }});
    let catchSwipe = ()=>{E.stopEventPropagation&&E.stopEventPropagation();};
    Bangle.prependListener&&Bangle.prependListener('swipe', catchSwipe); // Intercept swipes on fw2v19 and later. Should not break on older firmwares.
  });
};
