/*
Simple watch [slomoclock]
Mike Bennett mike[at]kereru.com
0.01 : Initial
0.03 : Use Layout library
0.20 : Add day of week display
*/

//var v='0.10';

// Colours
const col = [];
col[2] = 0xF800;
col[3] = 0xFAE0;
col[4] = 0xF7E0;
col[5] = 0x4FE0;
col[6] = 0x019F;
col[7] = 0x681F;
col[8] = 0xFFFF;

const colH = [];
colH[0]= 0x001F;
colH[1]= 0x023F;
colH[2]= 0x039F;
colH[3]= 0x051F;
colH[4]= 0x067F;
colH[5]= 0x07FD;
colH[6]= 0x07F6;
colH[7]= 0x07EF;
colH[8]= 0x07E8;
colH[9]= 0x07E3;
colH[10]= 0x07E0;
colH[11]= 0x5FE0;
colH[12]= 0x97E0;
colH[13]= 0xCFE0;
colH[14]= 0xFFE0;
colH[15]= 0xFE60;
colH[16]= 0xFC60;
colH[17]= 0xFAA0;
colH[18]= 0xF920;
colH[19]= 0xF803;
colH[20]= 0xF80E;
colH[21]= 0x981F;
colH[22]= 0x681F;
colH[23]= 0x301F;

// Colour incremented with every 10 sec timer event
var colNum = 0;
var lastMin = -1;

var Layout = require("Layout");
var layout = new Layout( {
  type:"h", c: [
      {type:"v", c: [
        {type:"txt", font:"40%", label:"", id:"hour", valign:1},
        {type:"txt", font:"40%", label:"", id:"min", valign:-1},
      ]},
      {type:"v", c: [        
        {type:"txt", font:"10%", label:"", id:"dow", col:0xEFE0, halign:1},
        {type:"txt", font:"10%", label:"", id:"day", col:0xEFE0, halign:1},
        {type:"txt", font:"10%", label:"", id:"mon", col:0xEFE0, halign:1},
      ]}
    ]
}, {lazy:true});

// update the screen
function draw() {
  var date = new Date();
  
  // Update time
  var timeStr = require("locale").time(date,1);
  var hh = parseFloat(timeStr.substring(0,2));
  var mm = parseFloat(timeStr.substring(3,5));

  // Surprise colours
  if ( lastMin != mm ) colNum = Math.floor(Math.random() * 24);  
  lastMin = mm;
  
  layout.hour.label = timeStr.substring(0,2);
  layout.min.label = timeStr.substring(3,5);
  
  // Mysterion (0) different colour each hour. Surprise (1) different colour every 10 secs.
  layout.hour.col = cfg.colour==0 ? colH[hh] : cfg.colour==1 ? colH[colNum] : col[cfg.colour];
  layout.min.col = cfg.colour==0 ? colH[hh] :  cfg.colour==1 ? colH[colNum] :col[cfg.colour];
  
  // Update date
  var dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  layout.dow.label = dayOfWeek[date.getDay()];
  layout.day.label = date.getDate();
  layout.mon.label = require("locale").month(date,1);
   
  layout.render();
}

// Events

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 10000);
    draw(); // draw immediately
  }
});

var secondInterval = setInterval(draw, 10000);

// Configuration
let cfg = require('Storage').readJSON('slomoclock.json',1)||{};
cfg.colour = cfg.colour||0;  // Colours

// update time and draw
g.clear();
draw();

// Show launcher when middle button pressed
Bangle.setUI("clock");

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
