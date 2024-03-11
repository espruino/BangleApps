/*fork of miclock, dynamic x,y, colors on realtime,
compatible with BJS1, BJS2 and bottom widgets
*/
var locale = require("locale");
var v_mode_debug=0; //, 0=no, 1 min, 2 prone detail
var v_model=process.env.BOARD;
var v_array4colors=0; // 0 undef, 1 forDark, 2 forLight
var a_colors=[]; //new Array(), values will depend on b_isarray4dark
var LastDrawDay; // to notice a change and repaint static texts
var Radius= []; //new Array();
var TxtPosition=[];
var v_bfont_size;
var v_vfont_size;
var v_str_pix_width; // to clear timer area
var v_color1;
var v_color2;
var v_color3;
var v_color_erase; //dynamic
var v_count_col;
var rect = Bangle.appRect;
var v_center_x;
var v_center_y;

g.clear(); //ONLY 1ST TIME
//show the exit button

function setMainBtn() { 
//if messages app installed shortcut otherwise default access to launcher 
if  (require("Storage").read("messagegui.app.js")===undefined) 
{
  if (require("Storage").read("messagelist.app.js")===undefined)  Bangle.setUI("clock"); // implies btn2(js1)  btn(js2)- launcher
   else if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') setWatch(function (){load("messagelist.app.js");}, BTN2, { repeat: true });   
      else setWatch(function (){load("messagelist.app.js");}, BTN1, { repeat: true });
}
else if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') setWatch(function (){load("messagegui.app.js");}, BTN2, { repeat: true });   
        else setWatch(function (){load("messagegui.app.js");}, BTN1, { repeat: true });
}

function setBJS1Btns() { 
  //only for bjs1, btns complementary to touch 
   setWatch(changeFGcolor, BTN1, { repeat: true });        
   setWatch(changeBGcolor, BTN3, { repeat: true });             
  }
  
Bangle.loadWidgets();

function getColorArray4BG() {    //1st=0 1st compatible color (dark/light theme)
  var var_bg=g.getBgColor();
  if (v_mode_debug>1) console.log(g.theme);
  if (v_mode_debug>0) console.log("func getbgcolor: "+var_bg+" g.theme.bg:  "+g.theme.bg);
  if (v_array4colors==0) {
    if (g.theme.dark==1)  v_array4colors=1;
      else if (g.theme.dark==0)    v_array4colors=2;
  }
  //for dark/black bg
  if (v_array4colors==1) a_colors= [0xFFFF, 0x0000, 0xFD20, 0x001F,0xF800,0x7be0,0x780F,0x07E0,0x07FF,0x7BEF,0xFFE0,0xFFBF00];
  //for light/white theme
  if (v_array4colors==2) a_colors= [0x0000, 0xFFFF, 0xFD20, 0x001F,0xF800,0x000F,0x780F,0x07E0,0xFFBF00];
  v_color_erase=a_colors[1];
  if (v_mode_debug>1) console.log(" erase: "+v_color_erase);
 return (v_array4colors);  //opt as using global vars
}

function setVariables() {
// different values depending on loaded widgets or not, so after load widgets
  rect = Bangle.appRect;
  v_center_x =  g.getWidth()/2;
  v_center_y =  g.getHeight()/2; //vertical middle
  //if (v_mode_debug>1) console.log(v_model+" center x, y "+v_center_x+" , "+v_center_y+" Max y,y2"+rect.y+" ,"+rect.y2);
  TxtPosition = {
    "x1": 3, "x2": g.getWidth()-3,
    "y1": rect.y+17, "y2": rect.y2-6,
    "x_HH": g.getWidth()/2 ,"y_mm": v_center_y+32 //center position for setFontAlign0,0
    };

  v_count_col=2; //realtime colors(avoid b/w) begin from this array position
  getColorArray4BG(); //set colors
  //v_color_erase=g.getBgColor();

  if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') {
    Radius = { "center": 7, "hour": 50, "min": 70, "dots": 88,"circleH":6,"circleM":2 };
    v_bfont_size=3;
    v_vfont_size=35;
    //1st watchface is multicolor
     v_color1=3; //ring orange
     v_color2=5; //text red
     v_color3=0; //hands, opposite to bg
    }else{
       Radius = { "center": 5, "hour": 35, "min": 50, "dots": 60, "circleH":5,"circleM":2 };
       v_bfont_size=2;
        v_vfont_size=22;
       v_color1=4; //ring
       v_color2=8; //text
       v_color3=0; //hands, opposite to bg
    }
}

function ClearScreen(){
  //avoid widget areas
 // var var_bg=g.getBgColor();
  if (v_mode_debug>1) console.log("ClearScreen getbgcolor: "+g.getBgColor()+" erasecl: "+v_color_erase);
  if (v_mode_debug>1) console.log("rect: "+rect.y+" "+rect.x2+" "+rect.y2);
  //g.setColor(v_color_erase);
  g.setBgColor(v_color_erase);
   //Fill a rectangular area in the Background Color
  g.clearRect(rect.x, rect.y, rect.x2, rect.y2);
  g.flip();
}

function ClearTimerArea(){   
  g.setBgColor(v_color_erase);
 // g.setBgColor(0xFFFFFF-a_colors[v_color1]); //kind of inverted clr just for testing   
  if (v_mode_debug>1) console.log("ClearTimerArea getbgcolor: "+g.getBgColor()+" erasecl: "+v_color_erase);
  if (v_mode_debug>1) console.log("txt x: "+TxtPosition.x_HH+" y "+TxtPosition.y_mm+" w "+v_str_pix_width);      
  //Fill a rectangular area in the Background Color, coords depends of setFontAlign 0,0=center
  g.clearRect(TxtPosition.x_HH-(v_str_pix_width/2), TxtPosition.y_mm-(v_vfont_size/2), TxtPosition.x_HH+(v_str_pix_width/2), TxtPosition.y_mm+(v_vfont_size/2));
  g.flip();  
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
  //ERASE previous last MINutes hand
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


  //drawing Time DIGITs above hands for allegedly better UX
  //g.setFont("6x8", 3); 3 bigger size
  ClearTimerArea();
  g.setFontVector(v_vfont_size);
  g.setColor(a_colors[v_color2]);
  g.setFontAlign(0, 0);
  //by default 24H, to use format config 12H 24H read from locale
  //x,y,solid - For bitmap fonts, true empty pixels be filled with bgcolor¿theme?
  //true clean previous text but default is not our erase
  //false write oiver previus text
  //g.drawString(dateArray[4].substr(0, 5), TxtPosition.x_HH, TxtPosition.y_mm, false);  
  v_str_pix_width=g.stringWidth(dateArray[4].substr(0, 5));
  g.drawString(dateArray[4].substr(0, 5), TxtPosition.x_HH, TxtPosition.y_mm);  
   // the central point requires redrawing because hands draw over it
   g.setColor(a_colors[v_color1]);
   g.fillCircle(v_center_x, v_center_y, Radius.center);
}

function changeFGcolor(){
 //change color but monocolor watchface
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
}
function changeBGcolor(){
  //pend to refactor
  //if black  bg
 if (v_array4colors==1) v_array4colors=2; // then white
 else if (v_array4colors==2) v_array4colors=1; //if white  bg         
 getColorArray4BG(); //set new list of colors
 g.setBgColor( v_color_erase);// 0 white, 1 black
 ClearScreen();
 //g.clear();//impact on widgets
 drawStaticRing(a_colors[v_color1]);
 drawDailyTxt(); //1st time
 drawMixedClock();
}
function changeRadiusRing(){
  drawStaticRing(v_color_erase);
  if (Radius.circleH<13) Radius.circleH++;
  else Radius.circleH=2;
  if (v_mode_debug>0)  console.log("radio: "+Radius.circleH);
  drawStaticRing(a_colors[v_color1]);
}

function UserInput(){
  Bangle.on('touch', function(button){
      switch(button){
          case 1:
            Bangle.showLauncher();
               break;
          case 2:
            changeFGcolor();
               break;
          case 3:
             //console.log("Touch 3 aka 1+2 not for BJS1 emul");//center 1+2
              break;
      }
  });
  //changing dimensions right
  Bangle.on('swipe', dir => {
    if(dir == 1) {
      changeRadiusRing();      
       }
    else { //swipe left,bg color 
      changeBGcolor();
        }      
  });
}
Bangle.on('lcdPower', function(on) {
  if (on)
    drawMixedClock();
});

setMainBtn(); //assign btn to messages when installed
setVariables();
Bangle.drawWidgets();
UserInput();
if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') setBJS1Btns(); //assign btn1 and btn3
setInterval(drawMixedClock, 30000);//not realtime update
drawStaticRing(a_colors[v_color1]);
drawDailyTxt();
drawMixedClock();
