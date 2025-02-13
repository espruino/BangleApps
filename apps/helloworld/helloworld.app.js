//HolaMundo v202212
// place your const, vars, functions or classes here
{
    var contador=1; 
    var v_mode_debug=0;
    var v_model=process.env.BOARD;

    var v_color_statictxt='#b30000';
    //var v_color_b_area='#111111';   
    //orange RGB format rrggbb     //white,Orange,DarkGreen,Yellow,Maroon,Blue,green,Purple,cyan,olive,DarkCyan,pink
    var a_colors= [0xFFFF,0xFD20,0x03E0,0xFFE0,0x7800,0x001F,0x07E0,0x780F,0x07FF,0x7BE0,0x03EF,0xF81F];
    
    var x_max_screen=g.getWidth();
    //var y_max_screen=g.getHeight(); 
    var y_wg_bottom=g.getHeight()-25;
    var y_wg_top=25; 
    
    //EMSCRIPTEN,EMSCRIPTEN2
if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') {
    var v_color_lines=0xFFFF; //White hex format
    var v_color_text=0x07E0;
    var v_font1size=10; //out of quotes
    var v_font2size=12;
    var v_font_banner_size=30;    
    var v_font3size=12;
    var x_btn_area=215;
    var x_max_usable_area=x_btn_area;//Pend! only for bangle.js
    var y_btn2=124; //harcoded for bangle.js  cuz it is not the half of display height
    var graph_y=120;
    var box_x2=195;
    var box_y2=150;
  }else{   //BJS2
      //176x176
    var v_color_lines="#000"; //White hex format
    var v_color_text="#000";
    var v_font1size=9; //out of quotes
    var v_font2size=9;
    var v_font_banner_size=16;    
    var v_font3size=8;
    //g.setColor("#000"); //black or dark
    x_max_usable_area=176;	
    var graph_y=60;
    var box_x2=128;
    var box_y2=104;
  }
  if (v_mode_debug>0) console.log("device="+v_model);
    var v_arraypos=0;
    var v_acolorpos=0; //for fg
    var v_aBGcolorPos=5; //for bg
    var a_string1 = ['hola', 'hello', 'saluton', 'ola','ciao', 'salut','czesc','konnichiwa'];
    var a_string2 = ['mundo!', 'world!', 'mondo!','mundo!','mondo!','monde!','swiat!','sekai!'];

   
}
 if (v_mode_debug>0) {
     console.log("*** UI dimensions***"); 
     console.log("x="+x_max_screen);
     console.log("y_wg_bottom="+y_wg_bottom);
 }

    // special function to handle display switch on
    Bangle.on('lcdPower', (on) => {
      if (on) {
          contador=contador+1;
          PrintHelloWorld();      
        // call your app function here
        // If you clear the screen, do Bangle.drawWidgets();    
      }
    });
    
    //Clear/fill dynamic area except widget area, right and bottom status line
    function ClearActiveArea(){                 
        g.setColor(a_colors[v_aBGcolorPos]); //dynamic color
        g.fillRect(0,y_wg_top,box_x2,box_y2);
        g.flip();
      }
      
      function DrawBangleButtons(){    
        g.setFontVector(v_font1size);
        g.setColor(v_color_lines);//White        
        
        g.drawString("Lang", x_max_screen-g.stringWidth("Lang"),y_wg_top+v_font1size+1); 
        //above Btn2 
        //g.setFontVector(v_font1size).drawString("Off", x_max_screen-g.stringWidth("Off"),y_btn2-(2*v_font1size));        
        g.drawString("Color", x_max_screen-g.stringWidth("Color"),y_btn2-v_font1size);    
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
    var info_text1="Swipe <- -> (Lang)"; 
    //var info_text2="Touch: Left=Up  Right=Down"; 
    //aligned left of max usable area
    g.setFontVector(v_font2size);
    //g.drawString(info_text2, x_max_usable_area-g.stringWidth(info_text2)-2 ,y_wg_bottom-(2*v_font2size)); 
    g.drawString(info_text1, x_max_usable_area-g.stringWidth(info_text1)-2 ,y_wg_bottom-v_font2size);  
    g.flip(); 
}
    
    //function Graphics.setColor(r, g, b) binary
    // banglejs.com/reference#l_Graphics_setColor
    
    function PrintHelloWorld(){     
        ClearActiveArea(); //except widgets and bottom
        
        if (v_mode_debug>0) console.log("drawing a "+a_string1[v_arraypos]+" "+a_string2[v_arraypos]);
        
        g.setColor(a_colors[v_acolorpos]); //dynamic color
        g.setFont("Vector",v_font_banner_size); 
        g.drawString(a_string1[v_arraypos],2,55); 
        //line below 2nd string
        g.drawLine(10, 149, 150, 149);
        g.flip();
    
        g.setColor(a_colors[v_acolorpos+1]); //dynamic color
        g.drawString(a_string2[v_arraypos],5,85);   
        g.flip();
    
        g.setFont("Vector",v_font3size);   
        g.setColor(v_color_statictxt);  
        g.drawString("Display on/off: "+contador ,10,box_y2+7); 
        //var mem=process.memory();        
        //if (v_mode_debug>0) console.log("Mem free/total: "+mem.free+"/"+mem.total);            
        g.flip();    
    }
    
    function PrintMainStaticArea(){ 
        g.setColor(v_color_statictxt);  
        g.setFont("Vector",v_font3size);    
        g.drawString("#by DPG #bangle.js",10,box_y2+5+(v_font3size*2)); 
        g.drawString("#javascript #espruino",10,box_y2+5+(v_font3size*3)); 
        
        var img_obj_RedHi = {
            width : 40, height : 40, bpp : 4,
            transparent : 0,
            buffer : require("heatshrink").decompress(atob("AFkM7vd4EAhoTNhvQhvcgHdAQIAL5oWCFIPdExo+CEoIZCABI0DhvADIZhJL4IXDHRkMEAQmOCYgmOAAIOBHwImNRQgmPHgYmCUIIXMJobfB3jgCWZJNDEga1JYQQQCMYZoJJAJNDBwgTICQPdCY7lDRQx4DVIwTIHYZzEHZATFBwblDCZRKEO5ITFWAbIJCYrHBAAImICYwEB5raKCYwAMCYXc5gADE5hLDAAgTIBJLkBBJAyKHw5hKBRJJKKJSuII5Q0IhqPKCbjRKCc4AgA=="))
          }
          g.drawImage(img_obj_RedHi,box_x2+2,graph_y);		  
          g.flip();
    }
    
    
    //inc var postion for text array
    function ChangeLang(dir){        
        if (v_mode_debug>0) console.log("ChangeLang, dir, Prev pos: "+dir+" , "+v_arraypos);        
       
        if ((dir==1) && (v_arraypos<a_string1.length-1)) v_arraypos++;
        else if ((dir== 1) && (v_arraypos==a_string1.length-1)) v_arraypos=0;
         else if ((dir== -1) && (v_arraypos>0)) v_arraypos--;  
          else if ((dir== -1) && (v_arraypos==0)) v_arraypos=a_string1.length-1;  
        PrintHelloWorld();
    }
    
    //inc var postion for color array
    function ChangeColor(){
        //if (v_mode_debug>0) console.log("ChangeColor, colpos: "+v_acolorpos);
        if (v_acolorpos<a_colors.length-2) v_acolorpos++;
         else v_acolorpos=0;    
        PrintHelloWorld();
    }
    function ChangeBGColor(){        
        if (v_aBGcolorPos<a_colors.length-2) v_aBGcolorPos++;
         else v_aBGcolorPos=0; 
        ClearActiveArea(); //except widgets and bottom    
        PrintHelloWorld();
    }
    function UserInput(){   
        Bangle.on('touch', function(button){ 
            switch(button){
                case 1:       
                    ChangeLang();//left area
                         break;
                case 2:
                    ChangeBGColor();//right
                         break;
                case 3: 
                    ChangeColor();
                  //Bangle.showLauncher();//quit     
                        break;
            }  
        });
    
   if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') {
       setWatch(ChangeLang, BTN1, { repeat: true });//func  to quit
        setWatch(ChangeColor, BTN2, { repeat: true });
        setWatch(Bangle.showLauncher, BTN3, { repeat: true });  
     } //touchscreen to quit
     else setWatch(ChangeColor, BTN1, { repeat: true });//func  to quit
    Bangle.on('swipe', dir => {  
        if(dir == 1) ChangeLang(1); //right
        else ChangeLang(-1); //left
    });
    }
    
    if (v_mode_debug>0) console.log("**************************");
    if (v_mode_debug>0) console.log("Log: *** hola mundo app");
    g.clear();
      Bangle.loadWidgets();
      Bangle.drawWidgets();   
      Bangle.setUI({
      mode : "custom",
      back : function() {load();}
    });
    if (v_model=='BANGLEJS'||v_model=='EMSCRIPTEN') DrawBangleButtons();
      DrawBottomInfoBanner();
      UserInput();
      PrintMainStaticArea();
      PrintHelloWorld();
    