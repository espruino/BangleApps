/*
Simple watch [slomoclock]
Mike Bennett mike[at]kereru.com
0.01 : Initial
0.03 : Use Layout library
*/

var v='0.04';

// Colours
const col = [];
col[0]= 0x001F;
col[1]= 0x023F;
col[2]= 0x039F;
col[3]= 0x051F;
col[4]= 0x067F;
col[5]= 0x07FD;
col[6]= 0x07F6;
col[7]= 0x07EF;
col[8]= 0x07E8;
col[9]= 0x07E3;
col[10]= 0x07E0;
col[11]= 0x5FE0;
col[12]= 0x97E0;
col[13]= 0xCFE0;
col[14]= 0xFFE0;
col[15]= 0xFE60;
col[16]= 0xFC60;
col[17]= 0xFAA0;
col[18]= 0xF920;
col[19]= 0xF803;
col[20]= 0xF80E;
col[21]= 0xF817;
col[22]= 0xE81F;
col[23]= 0x801F;

var Layout = require("Layout");
var layout = new Layout( {
  type:"h", c: [
      {type:"v", c: [
        {type:"txt", font:"40%", label:"", id:"hour", valign:1},
        {type:"txt", font:"40%", label:"", id:"min", valign:-1},
      ]},
      {type:"v", c: [
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
  
  layout.hour.label = timeStr.substring(0,2);
  layout.min.label = timeStr.substring(3,5);
  layout.hour.col = col[hh];
  layout.min.col = col[hh];
  
  // Update date
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

// update time and draw
g.clear();
draw();

// Show launcher when middle button pressed
Bangle.setUI("clock");

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
