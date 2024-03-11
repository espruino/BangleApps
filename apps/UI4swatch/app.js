/* UI/UX for Espruino and Bangle.js 
Testing USer interface and User usability  
v20200307
identify device and dimensions
max printable position max_x-1 i.e 239 
*/

 //var colbackg='#111111';//black 
 var colorange='#e56e06'; //RGB format rrggbb
 var v_color_lines=0xFFFF; //White hex format
 var v_color_b_area='#111111';
 var v_color_text=0x07E0;//'#FB0E01';//red
 var v_font1size=10; //out of quotes
 var v_font2size=12;
 var v_font_banner_size=30;
 //var v_clicks=0;
 //pend identify widget area dinamically
 var v_model=process.env.BOARD;
 console.log("device="+v_model);
  
 var x_max_screen=g.getWidth();//240;
 //var y_max_screen=g.getHeight(); //240; 
 var y_wg_bottom=g.getHeight()-25;
 var y_wg_top=25; 
 if (v_model=='BANGLEJS') {
    var x_btn_area=215;
    var x_max_usable_area=x_btn_area;//Pend! only for bangle.js
    var y_btn2=124; //harcoded for bangle.js  cuz it is not the half of display height
 } else x_max_usable_area=240;
 
  
 var x_mid_screen=x_max_screen/2;
 
 //PEND comment
 console.log("*** UI dimensions***"); 
 console.log("x="+x_max_screen);
 console.log("y_wg_bottom="+y_wg_bottom);
 
 
 
 //the biggest usable area, button area not included
function ClearActiveArea(){
  g.setColor(v_color_b_area); 
  g.fillRect(0,y_wg_top,x_max_usable_area,y_wg_bottom); //fill all screen except widget areas
  g.flip();
}


//Clean fill top area with a color
function ClearBannerArea(){
  g.setColor(v_color_b_area); 
  g.fillRect(55,28,185,60); 
  g.flip();
}
  

function PrintUserInput(boton){
  //var v_font_banner_size=30;//now global size= almost px height
  console.log("Pressed touch/BTN",boton);
  ClearBannerArea();
  g.setColor(colorange); 
  //print in banner area
  g.setFontVector(v_font_banner_size).drawString(boton, 63, 29);
  g.flip();           
}

function PrintBtn1(boton){ 
 console.log("Pressed BTN1");
 PrintUserInput("Button1"); 
 
}

function PrintBtn2(boton){ 
 console.log("Pressed BTN2");
 PrintUserInput("Button2");  
}

function DrawBangleButtons(){    
        g.setFontVector(v_font1size);
        g.setColor(v_color_lines);//White
        //line-separation with buttons area  
        g.drawLine(x_btn_area, 35, x_btn_area, 180);//vline right sep buttons
        
        //x for Border position in 2 lines
        g.drawString("x=",x_max_screen-g.stringWidth("x= "),68);          
        g.drawString(x_max_screen,x_max_screen-g.stringWidth("3ch"),78);  
        
        g.drawString("Dwn", x_max_screen-g.stringWidth("Dwn"),y_wg_top+v_font1size+1); 
        //above Btn2 
        //g.setFontVector(v_font1size).drawString("Off", x_max_screen-g.stringWidth("Off"),y_btn2-(2*v_font1size));        
        g.drawString("Set", x_max_screen-g.stringWidth("Set"),y_btn2-v_font1size);    
       //above Btn3  
        g.drawString("Quit", x_max_screen-g.stringWidth("Quit"),y_wg_bottom-(2*v_font1size));  
        g.flip(); 
        g.setColor(v_color_text);  //green   
        g.setFontVector(v_font1size);
        g.drawString("B1", x_max_screen-g.stringWidth("B1"),y_wg_top);
        g.drawString("B2", x_max_screen-g.stringWidth("B2"),y_btn2);
        g.drawString("B3",x_max_screen-g.stringWidth("B3"),y_wg_bottom-v_font1size);
        g.flip();
}
function DrawBottomInfoBanner(){
/* External Vars:v_color_text,v_font2size,x_max_usable_area,y_wg_bottom
*/  
    g.setColor(v_color_text);  
    var info_text1="Swipe: Next/Back screen"; 
    var info_text2="Touch: Left=Up  Right=Down"; 
    //aligned left of max usable area
    g.setFontVector(v_font2size);
    g.drawString(info_text2, x_max_usable_area-g.stringWidth(info_text2)-2 ,y_wg_bottom-(2*v_font2size)); 
    g.drawString(info_text1, x_max_usable_area-g.stringWidth(info_text1)-2 ,y_wg_bottom-v_font2size);  
    g.flip(); 
}

function PrintAreas(){  
  console.log("********************************");
  console.log("Log: *** Print Areas in screen");
  ClearActiveArea();     
  g.setColor(v_color_lines);
  
  //  **** Borders and Separation Lines for areas 
  g.drawLine(1, 35, 1, 180);//line for left border
  //
  g.drawLine(x_max_screen-1, 50, x_max_screen-1, 75);//vlide right border
  g.drawLine(x_mid_screen, 80, x_mid_screen, 105);//vline middle separation part1 up
  g.setFontVector(v_font2size).drawString("Output area for "+v_model,(x_max_usable_area-g.stringWidth("Output area for "+v_model))/2,67);
  g.setFontVector(v_font2size).drawString("x="+x_mid_screen,x_mid_screen-g.stringWidth("x=xxx"),85);  
  g.drawLine(x_mid_screen, 140, x_mid_screen, 180);//vline middle separation  part2 down
  
  
  //y=26 after widget line y=215 below widget line
        
    if (v_model=='BANGLEJS') DrawBangleButtons();
    
    g.setFontVector(v_font2size);
    g.setColor(v_color_text);  
    g.drawString("Touch", 80,110);
    g.drawString("Middle area", 80,125);
    g.drawString("Left area", 15, 145);
    g.drawString("Right area", 140,145);  
    g.flip();
    DrawBottomInfoBanner();
}  

function UserInput(){
    Bangle.on('touch', function(button){ 
        switch(button){
            case 1:
               PrintUserInput("Touch 1");//left
                 break;
            case 2:
               PrintUserInput("Touch 2");//right
                 break;
            case 3: 
              PrintUserInput("Touch 3");//center 1+2
                break;
        }
    });
    
    if (v_model=='BANGLEJS') {
        //only the name of the function
        setWatch(PrintBtn1, BTN1, { repeat: true });
        setWatch(PrintBtn2, BTN2, { repeat: true });
        setWatch(Bangle.showLauncher, BTN3, { repeat: true });
    }   
    Bangle.on('swipe', dir => {  
      if(dir == 1) PrintUserInput("  --->");
      else PrintUserInput("  <---");
    });
    console.log("Log: Input conditions loaded");
} //end of UserInput

//Main code
ClearActiveArea(); 
PrintAreas();
 Bangle.loadWidgets();
 Bangle.drawWidgets();
 
 
 
 //optional lines below and above both widget areas
 g.setColor(v_color_lines);    
 //line-separation with top widget area
 g.drawLine(60, y_wg_top, 180, y_wg_top); 
 g.setFontVector(v_font2size).drawString("y="+y_wg_top,10,y_wg_top+1);   
 //line-separation with bottom widget area
 g.drawLine(60, y_wg_bottom, 180, y_wg_bottom); 
 g.setFontVector(v_font2size).drawString("y="+y_wg_bottom,10,y_wg_bottom-v_font2size); 
 
 
 
 

 g.flip(); 
 //end optional 
 UserInput();