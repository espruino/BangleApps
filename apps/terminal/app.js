/* Espruino VT100 JS REPL


TODO: Add option to connect to a remote BLE device

*/

var settings = Object.assign({
  // default values
  textSize: 1,
  loopAround: 1,
  oneToOne: 0,
  speedScaling: 24
}, /*require('Storage').readJSON("repl.settings.json", true) || */{});

// Key Maps for Keyboard
var KEYMAPLOWER = [
  "`1234567890-=\b\b",
  "\tqwertyuiop[]\n\n",
  "\2asdfghjkl;'#\x82\n",
  "\2\\zxcvbnm,./\x80\x83\x81",
];
var KEYMAPUPPER = [
  "¬!\"£$%^&*()_+\b\b",
  "\tQWERTYUIOP{}\n\n",
  "\2ASDFGHJKL:@~\x82\n",
  "\2|ZXCVBNM<>?\x80\x83\x81",
];
var KEYIMGL = Graphics.createImage(`

  #  #
  ## #
######
  ## #
  #  #


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
`);
KEYIMGL.transparent = 0;
var KEYIMGR = Graphics.createImage(`


       #
      ##
     #########
      ##
       #



      #######
            #
            #
            #
            #
            #
          #####
           ###
            #

        #
       ###
      #####


  #          #
 ##          ##
###   #####  ###
 ##    ###   ##
  #     #    #   

`);
KEYIMGR.transparent = 0;
/* If a char in the keymap is >=128,
subtract 128 and look in this array for
multi-character key codes*/
var KEYEXTRA = [
  String.fromCharCode(27, 91, 68), // 0x80 left
  String.fromCharCode(27, 91, 67), // 0x81 right
  String.fromCharCode(27, 91, 65), // 0x82 up
  String.fromCharCode(27, 91, 66), // 0x83 down
  String.fromCharCode(27, 91, 53, 126), // 0x84 page up
  String.fromCharCode(27, 91, 54, 126), // 0x85 page down
];

// state
const R = Bangle.appRect;
var kbx = 0,
  kby = 0,
  kbdx = 0,
  kbdy = 0,
  kbShift = false,
  flashToggle = false;
const PX = 12,
  PY = 16,
  DRAGSCALE = settings.speedScaling;
var xoff = 0,
  yoff = g.getHeight() - PY * 4;

function draw() {
  "ram";
  var map = kbShift ? KEYMAPUPPER : KEYMAPLOWER;
  //g.drawImage(KEYIMG,0,yoff);
  g.reset().setFont("6x8:2");
  g.clearRect(R.x, yoff, R.x2, R.y2);
  if (kbx >= 0)
    g.setColor(g.theme.bgH).fillRect(xoff + kbx * PX, yoff + kby * PY, xoff + (kbx + 1) * PX - 1, yoff + (kby + 1) * PY - 1).setColor(g.theme.fg);
  g.drawImage(KEYIMGL, xoff - 1, yoff + PY, { scale: 2 });
  g.drawImage(KEYIMGR, xoff + PX * 12, yoff, { scale: 2 });
  var replace = /[\x80\x81\x82\x83\x84\x85]/g;
  g.drawString(map[0].replace(replace," "), xoff, yoff);
  g.drawString(map[1].replace(replace," "), xoff, yoff + PY);
  g.drawString(map[2].replace(replace," "), xoff, yoff + PY * 2);
  g.drawString(map[3].replace(replace," "), xoff, yoff + PY * 3);
  g.flip();
}

function startTerminal(dataOutCallback) {
  g.reset().clearRect(R);
  // Set up the terminal
  term = require("VT100").connect(g, {
    charWidth: 6,
    charHeight: 8
  });
  term.oy = R.y;
  term.h = yoff; // we added this - it's not usually part of it
  term.consoleHeight = 0 | ((term.h - term.oy) / term.charH);
  term.scrollDown = function() {
    g.setClipRect(R.x, term.y, R.x2, term.oy + term.h);
    g.scroll(0, -this.charH);
    g.setClipRect(R.x, R.y, R.x2, R.y2);
    this.y--;
  };
  term.fgCol = g.theme.fg;
  term.bgCol = g.theme.bg;
  draw();
  setInterval(() => {
    flashToggle = !flashToggle;
    draw();
  }, 1000);

  function keyPress(kbx, kby) {
    var map = kbShift ? KEYMAPUPPER : KEYMAPLOWER;
    var ch = map[kby][kbx];
    if (ch == "\2")
      kbShift = !kbShift;
    else {
      if (ch.charCodeAt(0) > 127)
        ch = KEYEXTRA[ch.charCodeAt(0) - 128];
      dataOutCallback(ch);
    }
    Bangle.buzz(20);
    draw();
  }

  Bangle.setUI({
    mode: "custom",
    drag: e => {
      if (settings.oneToOne) {
        kbx = Math.max(Math.min(Math.floor((e.x - 16) / (6 * 2)), 13), 0);
        kby = Math.max(Math.min(Math.floor((e.y - 120) / (8 * 2)), 3), 0);
        //print(e.y, kby, e.x, kbx);
      }

      if (!settings.oneToOne) {
        kbdx += e.dx;
        kbdy += e.dy;
        var dx = Math.round(kbdx / DRAGSCALE),
          dy = Math.round(kbdy / DRAGSCALE);
        kbdx -= dx * DRAGSCALE;
        kbdy -= dy * DRAGSCALE;
        if (dx || dy) {
          if (settings.loopAround) {
            kbx = (kbx + dx + 15) % 15;
            kby = (kby + dy + 4) % 4;
          } else {
            kbx = Math.max(Math.min((kbx + dx), 13), 0);
            kby = Math.max(Math.min((kby + dy), 3), 0);
          }
        }
      }
      draw();

      if (!e.b && e.y > Bangle.appRect.y && settings.oneToOne /*&& settings.releaseToSelect*/ )
        keyPress(kbx, kby);
    },
    touch: () => {
      if (!settings.oneToOne /*|| !settings.releaseToSelect*/ )
        keyPress(kbx, kby);
    }
  });
  let catchSwipe = () => {
    E.stopEventPropagation && E.stopEventPropagation();
  };
  Bangle.prependListener && Bangle.prependListener('swipe', catchSwipe); // Intercept swipes on fw2v19 and later. Should not break on older firmwares.
  return {
    dataReceived : function(d) {
       g.reset().setFont("6x8");
      // USB.write(e); // optionally mirror back to the PC
      // Send characters to the terminal
      for (var i in d) term.char(d[i]);
      // update the screen
      g.flip();
    }
  };
}

function mainMenu() {
  E.showMenu({
    "":{title:"Terminal"},
    /*LANG*/"JS REPL" : function() {
      var t = startTerminal(function(d) {
        LoopbackB.write(d);
      });
      LoopbackB.on('data', function(d) {
        t.dataReceived(d);
      });
      // Now move the console to Loopback
      LoopbackA.setConsole();
    },
    /*LANG*/"Bluetooth" : function() {
      Bangle.setUI();
      E.showMessage(/*LANG*/"Scanning...", /*LANG*/"Bluetooth");
      NRF.findDevices(function(devices) {
        if (!devices.length)
          return E.showAlert("No devices found").then(() => mainMenu());
        var menu = { "" : { title: /*LANG*/"Bluetooth", back : () => mainMenu() } };
        devices.forEach(dev => {
          var name = dev.name || dev.id.substr(0,17);
          menu[name] = function() {
            Bangle.setUI();
            E.showMessage(/*LANG*/"Connecting...", /*LANG*/"Bluetooth");
            require("ble_uart").connect(dev).then(function(uart) {
              var t = startTerminal(function(d) {
                uart.write(d);
              });
              t.dataReceived("Connected to:\n   "+name+"\n")
              uart.on('data', function(d) { t.dataReceived(d); });
            }).catch(err => {
              E.showAlert(err.toString()).then(() => mainMenu());
            });
          };          
        });
        E.showMenu(menu);
      }, { filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }], timeout: 2000, active:true });
    }
  });
}

mainMenu();