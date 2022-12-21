//fork of miclock, dynamic x,y compatible with BJS1, BJS2 and bottom widgets
/*replace g.setFontVector(height) by g.setFont("Vector", 60);
below size 20 replace g.setFontVector(13) by 
g.setFont("6x8",2 or  4x6 (built into all devices */
/* jshint esversion: 6 */
var locale = require("locale");
var v_mode_debug=1; //, 0=no, 1 min, 2 prone detail
var v_model=process.env.BOARD;

g.clear();
//show the exit button
Bangle.setUI();

/*{
  mode : "custom",
  back : Bangle.showLauncher 
});*/

Bangle.loadWidgets();

// different values depending on loaded widgets or not, so after load widgets
var rect = Bangle.appRect;
var v_center_x =  g.getWidth()/2;
var v_center_y =  g.getHeight()/2; //vertical middle
 
if (v_mode_debug>0) console.log(v_model+" center x, y "+v_center_x+" , "+v_center_y+" Max y,y2"+rect.y+" ,"+rect.y2);
var TxtPosition = {
  "x1": 3, "x2": g.getWidth()-3,
  "y1": rect.y+17, "y2": rect.y2-6,
  "x_HH": g.getWidth()/2 ,"y_mm": v_center_y+32
  };  

//emuls EMSCRIPTEN,EMSCRIPTEN2
if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') {
  var Radius = { "center": 7, "hour": 50, "min": 70, "dots": 88 };
  var v_bfont_size=3;
  var  v_vfont_size=35;
  var v_color1=0xFD20; // orange
  var v_color2=0x7be0; 
  var v_color3=0xFFFF; //white , for hands PEND replace hardcoded by logic 
  var v_color_erase=g.getBgColor(); //0  
  }else{
    var Radius = { "center": 5, "hour": 35, "min": 50, "dots": 60 };
    var v_bfont_size=2;
    var  v_vfont_size=22;
    var v_color1=0x001F; // blue
    var v_color2=0x03E0; //darkgreen
    var v_color3=0x0000; //opposite to bg, for hands PEND replace hardcoded by logic 
    var v_color_erase=g.getBgColor();     
  }
function rotatePoint(x, y, d) {
  rad = -1 * d / 180 * Math.PI;
  var sin = Math.sin(rad);
  var cos = Math.cos(rad);
  xn = ((v_center_x + x * cos - y * sin) + 0.5) | 0;
  yn = ((v_center_y + x * sin - y * cos) + 0.5) | 0;
  p = [xn, yn];
  return p;
}

function drawMixedClock() {
  var date = new Date();
  var dateArray = date.toString().split(" ");
  var isEn = locale.name.startsWith("en");
  var point = [];
  var minute = date.getMinutes();
  var hour = date.getHours();
  var radius;

  // draw date
  g.setColor(v_color2);
  //small size then bitmap
  g.setFont("4x6", v_bfont_size);  //6x8
  g.setFontAlign(-1, 0);
  g.drawString(locale.dow(date,true) + ' ',TxtPosition.x1 , TxtPosition.y1, true);
  g.drawString(isEn?(' ' + dateArray[2]):locale.month(date,true), TxtPosition.x1, TxtPosition.y2, true);
  g.setFontAlign(1, 0);
  g.drawString(isEn?locale.month(date,true):(' ' + dateArray[2]), TxtPosition.x2, TxtPosition.y1, true);
  g.drawString(dateArray[3], TxtPosition.x2, TxtPosition.y2, true);

  // draw hour and minute dots
  g.setColor(v_color1); // orange
  for (i = 0; i < 60; i++) {
    radius = (i % 5) ? 2 : 4;
    point = rotatePoint(0, Radius.dots, i * 6);
    g.fillCircle(point[0], point[1], radius);
  }

  // erase last minutes hand
  g.setColor(v_color_erase);
  point = rotatePoint(0, Radius.min, (minute - 1) * 6);
  g.drawLine(v_center_x, v_center_y, point[0], point[1]);
  //to increase thicknes
  g.drawLine(v_center_x+1, v_center_y, point[0]+1, point[1]);

  // erase last two hour hands
  g.setColor(v_color_erase);
  p = rotatePoint(0, Radius.hour, hour % 12 * 30 + (minute - 2) / 2 | 0);
  g.drawLine(v_center_x, v_center_y, p[0], p[1]);
  //to increase thicknes
  g.drawLine(v_center_x+1, v_center_y, p[0]+1, p[1]);

  point = rotatePoint(0, Radius.hour, hour % 12 * 30 + (minute - 1) / 2 | 0);
  g.drawLine(v_center_x, v_center_y, point[0], point[1]);
  //to increase thicknes
  g.drawLine(v_center_x+1, v_center_y, point[0]+1, point[1]);

  // draw digital time
  //g.setFont("6x8", 3); 3 bigger size
  g.setFontVector(v_vfont_size);
  g.setColor(v_color2);
  g.setFontAlign(0, 0);
  g.drawString(dateArray[4].substr(0, 5), TxtPosition.x_HH, TxtPosition.y_mm, true);

  // draw new minute hand
  point = rotatePoint(0, Radius.min, minute * 6);
  g.setColor(v_color3);
  g.drawLine(v_center_x, v_center_y, point[0], point[1]);
  //to increase thicknes
  g.drawLine(v_center_x+1, v_center_y, point[0]+1, point[1]);

  // draw new hour hand
  point = rotatePoint(0, Radius.hour, hour % 12 * 30 + date.getMinutes() / 2 | 0);
  g.setColor(v_color3);
  g.drawLine(v_center_x, v_center_y, point[0], point[1]);
  //to increase thicknes
  g.drawLine(v_center_x+1, v_center_y, point[0]+1, point[1]);

  // draw center
  g.setColor(v_color1);
  g.fillCircle(v_center_x, v_center_y, Radius.center);
}
function UserInput(){
  Bangle.on('touch', function(button){
      switch(button){
          case 1:
            //console.log("Touch 1");//left
            Bangle.showLauncher();
               break;
          case 2:
              //console.log("Touch 2");//right
               break;
          case 3: 
             //console.log("Touch 3");//center 1+2
              break;
      }
  });
}
Bangle.on('lcdPower', function(on) {
  if (on)
    drawMixedClock();
});

Bangle.drawWidgets();
UserInput();
setInterval(drawMixedClock, 5E3);
drawMixedClock();


