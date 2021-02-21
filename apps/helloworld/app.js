//HolaMundo v2021
// place your const, vars, functions or classes here
{
    var contador=1; 
    var v_color_statictxt='#e56e06'; //orange RGB format rrggbb 
    //white,Orange,DarkGreen,Yellow,Maroon,Blue,green,Purple,cyan,olive,DarkCyan,pink
    var a_colors= Array(0xFFFF,0xFD20,0x03E0,0xFFE0,0x7800,0x001F,0x07E0,0x780F,0x07FF,0x7BE0,0x03EF,0xF81F);
    var v_color_lines=0xFFFF; //White hex format
    var v_font1size='32';
    var v_font2size='12';
    var v_font3size='12';
    var v_arraypos=0;
    var v_acolorpos=0;
    var a_string1 = Array('hola', 'hello', 'saluton', 'ola','ciao', 'salut','czesc','konnichiwa');
    var a_string2 = Array('mundo!', 'world!', 'mondo!','mundo!','mondo!','monde!','swiat!','sekai!');
    var mem=process.memory();
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
        var colorbackg='#111111';//black 
        g.setColor(colorbackg); 
        g.fillRect(0,32,195,150); 
        g.flip();
      }
    
    //function Graphics.setColor(r, g, b) binary
    // banglejs.com/reference#l_Graphics_setColor
    
    function PrintHelloWorld(){     
        ClearActiveArea(); //except widgets and bottom
        
        console.log("drawing a "+a_string1[v_arraypos]+" "+a_string2[v_arraypos]);
        
        g.setColor(a_colors[v_acolorpos]); //dynamic color
        g.setFont("Vector",35); 
        g.drawString(a_string1[v_arraypos],2,55); 
        //line below 2nd string
        g.drawLine(10, 149, 150, 149);
        g.flip();
    
        g.setColor(a_colors[v_acolorpos+1]); //dynamic color
        g.drawString(a_string2[v_arraypos],5,85);   
        g.flip();
    
        g.setFont("Vector",v_font3size);
        g.setColor(0,0,1);  //blue
        g.drawString("Display count: "+contador ,10,115); 
        mem=process.memory();
        //console.log("Mem free/total: "+mem.free+"/"+mem.total);    
        g.drawString("Free mem: "+mem.free+"/"+mem.total,10,135); 
        g.flip();    
    }
    
    function PrintMainStaticArea(){ 
        g.setColor(v_color_statictxt);  
        g.setFont("Vector",v_font3size);    
        g.drawString("#for #bangle.js",10,170); 
        g.drawString("#javascript #espruino",10,185); 
        
        var img_obj_RedHi = {
            width : 40, height : 40, bpp : 4,
            transparent : 0,
            buffer : require("heatshrink").decompress(atob("AFkM7vd4EAhoTNhvQhvcgHdAQIAL5oWCFIPdExo+CEoIZCABI0DhvADIZhJL4IXDHRkMEAQmOCYgmOAAIOBHwImNRQgmPHgYmCUIIXMJobfB3jgCWZJNDEga1JYQQQCMYZoJJAJNDBwgTICQPdCY7lDRQx4DVIwTIHYZzEHZATFBwblDCZRKEO5ITFWAbIJCYrHBAAImICYwEB5raKCYwAMCYXc5gADE5hLDAAgTIBJLkBBJAyKHw5hKBRJJKKJSuII5Q0IhqPKCbjRKCc4AgA=="))
          }
          g.drawImage(img_obj_RedHi,155,160);
          g.flip();
    }
    
    
    //inc var postion for text array
    function ChangeLang(){
        if (v_arraypos<a_string1.length-1) v_arraypos++;
         else v_arraypos=0;
        //console.log("ChangeLang, Langpos: "+v_arraypos);        
        PrintHelloWorld();
    }
    
    //inc var postion for color array
    function ChangeColor(){
        //console.log("ChangeColor, colpos: "+v_acolorpos);
        if (v_acolorpos<a_colors.length-2) v_acolorpos++;
         else v_acolorpos=0;    
        PrintHelloWorld();
    }
    
    function UserInput(){   
        Bangle.on('touch', function(button){ 
            switch(button){
                case 1:       
                    ChangeLang();//left
                         break;
                case 2:
                    ChangeColor();//right
                         break;
                case 3: 
                    ChangeColor();
                  //Bangle.showLauncher();//quit     
                        break;
            }  
        });
            
        setWatch(ChangeLang, BTN1, { repeat: true });//func  to quit
        setWatch(ChangeColor, BTN2, { repeat: true });
        setWatch(Bangle.showLauncher, BTN3, { repeat: true });  
        //touchscreen to quit
        Bangle.on('swipe', dir => {  
          if(dir == 1) ChangeLang(); //func load() to quit
          else ChangeLang();
        });
    }
    
    console.log("**************************");
    console.log("Log: *** hola mundo app");
    g.clear();
      Bangle.loadWidgets();
      Bangle.drawWidgets();   
      g.setColor(0,1,0);  //green
        
       // top or bottom 24px of the screen (reserved for Widgets) 
        g.setFontVector(v_font2size).drawString("BTN1", 202,37);  
        g.setFontVector(v_font2size).drawString("Lang", 202,51); 
        g.setFontVector(v_font2size).drawString("Color<", 197,110);  
        g.setFontVector(v_font2size).drawString("BTN2", 202,124);  
        g.setFontVector(v_font2size).drawString("Swipe <- -> (Lang)", 15,223);  
        g.setFontVector(v_font2size).drawString("Quit<", 200,209);  
        g.setFontVector(v_font2size).drawString("BTN3", 201,223);  
        g.flip();
      UserInput();
      PrintMainStaticArea();
      PrintHelloWorld();
    