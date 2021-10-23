/*
Simple watch [slomoclock]
Mike Bennett mike[at]kereru.com
0.01 : Initial
0.03 : Use Layout library
*/

var v='0.03';

var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:undefined, height:40 },  // Widgets top

    {type:"h", c: [
      {type:"v", c: [
        {type:"txt", font:"40%", label:"", id:"hour", valign:1},
        {type:"txt", font:"40%", label:"", id:"min", valign:-1},
      ]},
      {type:"v", c: [
        {type:"txt", font:"10%", label:"", id:"day", col:0xEFE0, halign:1},
        {type:"txt", font:"10%", label:"", id:"mon", col:0xEFE0, halign:1},
      ]}
    ]},

    {type:undefined, height:40 },  // Widgets bottom

  ]  
  
}, {lazy:true});

// update the screen
function draw() {
  var date = new Date();
  
  // Update time
  var timeStr = require("locale").time(date,1);
  var t = parseFloat(timeStr);
  var colTime;
  
  if ( t < 24 ) colTime = 0x01BD;
  if ( t < 19 ) colTime = 0x701F;
  if ( t < 18 ) colTime = 0xEC80;
  if ( t < 17 ) colTime = 0xF780;
  if ( t < 12 ) colTime = 0xAEC2;
  if ( t < 7 ) colTime = 0x1EC2;
  if ( t < 6 ) colTime = 0x01BD;  

  layout.hour.label = timeStr.substring(0,2);
  layout.min.label = timeStr.substring(3,5);
  layout.hour.col = colTime;
  layout.min.col = colTime;
  
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
