/*fork of miclock, dynamic x,y, colors on realtime,
compatible with BJS1, BJS2 and bottom widgets
*/
var locale = require("locale");
var v_mode_debug=0; //, 0=no, 1 min, 2 prone detail
var v_model=process.env.BOARD;
var LastDrawDay; // to notice a change and repaint static texts
//RGB565 0x White , black, 'Orange',blue,red, olive,...
var a_colors= [0xFFFF,0x0000, 0xFD20, 0x001F,0xF800,0x7be0,0x780F,0x07E0]; //new Array(0xFFFF
var Radius= []; //new Array();
var TxtPosition=[];
var v_bfont_size;
var v_vfont_size;
var v_color1;
var v_color2;
var v_color3;
var v_color_erase;
var v_count_col;
var rect = Bangle.appRect;
var v_center_x;
var v_center_y;
if (v_mode_debug>0) console.log("a_colors.length "+a_colors.length);

g.clear();
//show the exit button
//Bangle.setUI();
Bangle.setUI("clock"); //implies center button for launcher
/*{
  mode : "custom",
  back : Bangle.showLauncher
});*/

Bangle.loadWidgets();



function setVariables() {
// different values depending on loaded widgets or not, so after load widgets
  rect = Bangle.appRect;
  v_center_x =  g.getWidth()/2;
  v_center_y =  g.getHeight()/2; //vertical middle
  //if (v_mode_debug>1) console.log(v_model+" center x, y "+v_center_x+" , "+v_center_y+" Max y,y2"+rect.y+" ,"+rect.y2);
  TxtPosition = {
    "x1": 3, "x2": g.getWidth()-3,
    "y1": rect.y+17, "y2": rect.y2-6,
    "x_HH": g.getWidth()/2 ,"y_mm": v_center_y+32
    };

  //emuls EMSCRIPTEN,EMSCRIPTEN2
  v_count_col=2; //1st=0 1st compatible color (dark/light theme)
  v_color_erase=g.getBgColor();
  if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') {
    Radius = { "center": 7, "hour": 50, "min": 70, "dots": 88,"circleH":6,"circleM":2 };
    v_bfont_size=3;
    v_vfont_size=35;
     v_color1=2; // orange
     v_color2=4;
     v_color3=0; //white , for hands PEND replace hardcoded by logic
    }else{
       Radius = { "center": 5, "hour": 35, "min": 50, "dots": 60, "circleH":5,"circleM":2 };
       v_bfont_size=2;
        v_vfont_size=22;
       v_color1=3; // blue
       v_color2=1;
       v_color3=1; //opposite to bg, for hands PEND replace hardcoded by logic
    }
  if (v_mode_debug>0) console.log("set vars for: "+v_model);
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

//no need to repaint
function drawStaticRing(v_colorparam){
  // draw hour and minute dots
  if (v_mode_debug>0) console.log("color: "+v_colorparam);
  //g.setColor(a_colors[v_color1]);
  g.setColor(v_colorparam);

  for (i = 0; i < 60; i++) {
    // ? 2 : 4;
    radius = (i % 5) ? Radius.circleM : Radius.circleH;
    point = rotatePoint(0, Radius.dots, i * 6);
    //if (v_mode_debug>1) console.log("point"+point);
    g.fillCircle(point[0], point[1], radius);
  }
}

//no need to repaint every min
function drawDailyTxt(){
  var date = new Date();
  var isEn = locale.name.startsWith("en");
  var dateArray = date.toString().split(" ");
  LastDrawDay=locale.dow(date,true);
  var hour = date.getHours();

  if (v_mode_debug>1) {
    console.log("full date "+date.toString());
    console.log("locale time "+locale.time(date,true));
    console.log("LastDrawDay "+LastDrawDay);
    console.log("locale new day "+(locale.dow(date,true)));
  }
  g.setColor(a_colors[v_color2]);
  //small size then bitmap
  g.setFont("4x6", v_bfont_size);  //6x8
  g.setFontAlign(-1, 0);
  g.drawString(locale.dow(date,true) + ' ',TxtPosition.x1 , TxtPosition.y1, true);
  g.drawString(isEn?(' ' + dateArray[2]):locale.month(date,true), TxtPosition.x1, TxtPosition.y2, true);
  g.setFontAlign(1, 0);
  g.drawString(isEn?locale.month(date,true):(' ' + dateArray[2]), TxtPosition.x2, TxtPosition.y1, true);
  g.drawString(dateArray[3], TxtPosition.x2, TxtPosition.y2, true);
}


function drawMixedClock() {
  var date = new Date();
  var dateArray = date.toString().split(" ");
  //var isEn = locale.name.startsWith("en");
  var point = [];
  var minute = date.getMinutes();
  var hour = date.getHours();
  var radius;
  //Call function only after a change of day
  if (LastDrawDay!=locale.dow(date,true)) drawDailyTxt();
    //ERASE previous hands
  // erase last MINutes hand
  g.setColor(v_color_erase);
  point = rotatePoint(0, Radius.min, (minute - 1) * 6);
  g.drawLine(v_center_x, v_center_y, point[0], point[1]);
  //to increase thicknes
  g.drawLine(v_center_x+1, v_center_y, point[0]+1, point[1]);
  // erase last two HOUR hands ¿2?
  g.setColor(v_color_erase);
  p = rotatePoint(0, Radius.hour, hour % 12 * 30 + (minute - 2) / 2 | 0);
  g.drawLine(v_center_x, v_center_y, p[0], p[1]);
  //to increase thicknes
  g.drawLine(v_center_x+1, v_center_y, p[0]+1, p[1]);

  point = rotatePoint(0, Radius.hour, hour % 12 * 30 + (minute - 1) / 2 | 0);
  g.drawLine(v_center_x, v_center_y, point[0], point[1]);
  //to increase thicknes
  g.drawLine(v_center_x+1, v_center_y, point[0]+1, point[1]);

  // here time DIGITs are draw  under hands

  // draw new MINute hand
  point = rotatePoint(0, Radius.min, minute * 6);
  g.setColor(a_colors[v_color3]);
  g.drawLine(v_center_x, v_center_y, point[0], point[1]);
  //to increase thicknes
  g.drawLine(v_center_x+1, v_center_y, point[0]+1, point[1]);
  // draw new HOUR hand
  point = rotatePoint(0, Radius.hour, hour % 12 * 30 + date.getMinutes() / 2 | 0);
  g.setColor(a_colors[v_color3]);
  g.drawLine(v_center_x, v_center_y, point[0], point[1]);
  //to increase thicknes
  g.drawLine(v_center_x+1, v_center_y, point[0]+1, point[1]);

  // draw DIGITs of time above hands for better UX
  //g.setFont("6x8", 3); 3 bigger size
  g.setFontVector(v_vfont_size);
  g.setColor(a_colors[v_color2]);
  g.setFontAlign(0, 0);
  //by default 24H, to use format config  12H 24H read from locale
  g.drawString(dateArray[4].substr(0, 5), TxtPosition.x_HH, TxtPosition.y_mm, true);
   // the central point requires redrawing because hands draw over it
   g.setColor(a_colors[v_color1]);
   g.fillCircle(v_center_x, v_center_y, Radius.center);
}
function UserInput(){
  Bangle.on('touch', function(button){
      switch(button){
          case 1:
            Bangle.showLauncher();
               break;
          case 2:
            //testing to improve
               if (v_mode_debug>0) console.log("v_count_col/total: "+v_count_col+"/"+a_colors.length);
               if (v_count_col<a_colors.length){
                v_color1=v_count_col;
                v_color2=v_count_col;
                v_color3=v_count_col;
                v_count_col++; //next color
               }
               else setVariables();   //v_count_col=3; //reset to 1st common color
               if (v_mode_debug>0) console.log("paint on color: "+v_count_col);
               drawStaticRing(a_colors[v_color1]);
               drawDailyTxt();
               break;
          case 3:
             //console.log("Touch 3 aka 1+2 not for emul");//center 1+2
              break;
      }
  });
  Bangle.on('swipe', dir => {
    if(dir == 1) {
      drawStaticRing(v_color_erase);
      if (Radius.circleH<13) Radius.circleH++;
      if (v_mode_debug>0)  console.log("radio: "+Radius.circleH);
      drawStaticRing(a_colors[v_color1]);
       }
    else {
      drawStaticRing(v_color_erase);
      if (Radius.circleH>1) Radius.circleH--;
      if (v_mode_debug>0) console.log("radio: "+Radius.circleH);
      drawStaticRing(a_colors[v_color1]);
       }
  });
}
Bangle.on('lcdPower', function(on) {
  if (on)
    drawMixedClock();
});

setVariables();
Bangle.drawWidgets();
UserInput();

setInterval(drawMixedClock, 5E3);
drawStaticRing(a_colors[v_color1]); 
drawDailyTxt(); //1st time
drawMixedClock();
