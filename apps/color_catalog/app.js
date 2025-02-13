/* Color show for Bangle.js 
grey
RGB888:#404040 / 0x404040
RGB565:#4208 / 0x4208
grey RGB888:#5c5c5c / 0x5c5c5c
RGB565:#5AEB / 0x5AEB
*/


var v_model=process.env.BOARD;
 console.log("device="+v_model);
  
 var x_max_screen=g.getWidth();//240;
 //var y_max_screen=g.getHeight(); //240; 
 var y_wg_bottom=g.getHeight()-25;
 var y_wg_top=25; 
 if (v_model=='BANGLEJS') {
    var x_btn_area=215;
    var x_max_usable_area=x_btn_area;//Pend! only for bangle.js
    var y_btn2=124; //harcoded for bangle.js  cuz it is not the half of
 } else x_max_usable_area=240;
 
    //var contador=1; 
    var cont_items=0; 
    var cont_row=0;
    var v_boxes_row=4;
    var cont_page=1;
    var v_boxwidth=40;
    var v_boxheight=10; 
    var v_acolorpos=0;
    var v_font1size=11;
    var v_fontsize=13;
    var v_color_b_area='#111111';//black
    //var v_color_b_area2=0x5AEB;//Dark
    var v_color_text='#FB0E01';
    var v_color_statictxt='#e56e06'; //orange RGB format rrggbb 
    //RGB565 requires only 16 (5+6+5) bits/2 bytes
    var a_colors_str= ['White RGB565 0x','Orange','DarkGreen','Yellow',
    'Maroon','Blue','green','Purple',
    'cyan','olive','DarkCyan','DarkGrey',
    'Navy','Red','Magenta','GreenYellow',
    'Blush RGB888','pure red','Orange','Grey green',
    'D. grey','Almond','Amber','Bone',
    'Canary','Aero blue','Camel','Baby pink',
    'Y.Corn','Cultured','Eigengrau','Citrine'];
    var a_colors= [0xFFFF,0xFD20,0x03E0,0xFFE0,
    0x7800,0x001F,0x07E0,0x780F,
    0x07FF,0x7BE0,0x03EF,0x7BEF,
    0x000F,0xF800,0xF81F,0xAFE5,
    '#DE5D83','#FB0E01','#E56E06','#7E795C',
    '#404040','#EFDECD','#FFBF00','#E3DAC9',
    '#FFFF99','#C0E8D5','#C19A6B','#F4C2C2',
    '#FBEC5D','#F5F5F5','#16161D','#E4D00A'];
    var v_color_lines=0xFFFF; //White hex format
    
    
    //the biggest usable area, button area not included
function ClearActiveArea(){
  g.setColor(v_color_b_area); 
  g.fillRect(0,y_wg_top,x_max_usable_area,y_wg_bottom); //fill all screen except widget areas
  g.flip();
}
    
    
    function UserInput(){
    Bangle.on('touch', function(button){ 
        switch(button){
            case 1:
              console.log("Touch 1");//left
                 break;
            case 2:
                console.log("Touch 2");//right
                 break;
            case 3: 
               console.log("Touch 3");//center 1+2
                break;
        }
    });
    
    if (v_model=='BANGLEJS') {
        //only the name of the function        
        setWatch(Bangle.showLauncher, BTN3, { repeat: true });
    }   
    Bangle.on('swipe', dir => {  
      if(dir == 1) {          
           console.log("v_acolorpos"+v_acolorpos+"a_colors.length"+a_colors.length);
          if (v_acolorpos<a_colors.length-1) {
              cont_page++; 
              console.log("swipe page"+cont_page);
              PrintScreen(cont_page);
          }
         }
      else {          
          if (cont_page>0) cont_page--; 
          console.log("swipe page"+cont_page);
         PrintScreen(cont_page);
         }
    });
    console.log("Log: Input conditions loaded");
} //end of UserInput
    
function DrawBangleButtons(){    
        g.setFontVector(v_font1size);
        g.setColor(v_color_lines);//White
        
        //g.drawString("Dwn", x_max_screen-g.stringWidth("Dwn"),y_wg_top+v_font1size+1); 
        //above Btn2 
        //g.setFontVector(v_font1size).drawString("Off", x_max_screen-g.stringWidth("Off"),y_btn2-(2*v_font1size));        
        //g.drawString("Set", x_max_screen-g.stringWidth("Set"),y_btn2-v_font1size);    
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
    
    function PrintScreen(page){
            ClearActiveArea();
            g.setColor(v_color_statictxt);
            g.setFont("Vector",v_fontsize); 
            g.drawString("Page "+page,10,y_wg_top+5);
            g.flip();
            
            v_acolorpos=page*(v_boxes_row*2);
                        
            console.log("page"+cont_page+"arraypos"+v_acolorpos);
        for (cont_row=0;cont_row<2;cont_row++){
            console.log("row"+cont_row);
            for (cont_items=0;cont_items<v_boxes_row;cont_items++){
                
                g.setColor(a_colors[v_acolorpos]); //dynamic color
                //console.log("col"+cont_items);
                var v_x1_box=(v_boxwidth*cont_items)+5;
                var v_x2_box=(v_boxwidth*(cont_items+1))+5;
                //y for second row is v_boxheight+strings
                var v_pos_row=y_wg_top+v_fontsize+5+(cont_row*v_boxheight)+(cont_row*v_boxes_row*(v_fontsize+4));
               // console.log("v_pos_row"+v_pos_row);
                var v_y1_box=(v_pos_row);
                var v_y2_box=(v_pos_row+v_boxheight);
                g.fillRect(v_x1_box,v_y1_box,v_x2_box,v_y2_box); //fill all screen except widget areas
                //identify color format
               var v_string=v_acolorpos+" "+a_colors_str[v_acolorpos]+" "+a_colors[v_acolorpos].toString(16);
               
               
               //Align always inside the display
               if ((v_x1_box+g.stringWidth(v_string))<x_max_usable_area){
                    var v_x_pos_str=v_x1_box;
               }
               else  var v_x_pos_str=x_max_usable_area-g.stringWidth(v_string);  
               //y positions next text line
               var v_y_pos_str=v_y2_box+8+((v_fontsize+2)*cont_items);
                g.setFont("Vector",v_fontsize); 
                g.drawString(v_string,v_x_pos_str,v_y_pos_str); 
                //line below 2nd string
                
                g.flip();
                    
                if (v_acolorpos<a_colors.length-1) v_acolorpos++;
                else break; //no more print until swipe
            }
        
        }
        
   }
    
    
    console.log("**************************");
    console.log("Log: *** Color Catalog app");
    console.log("array length"+a_colors.length);
    
    g.clear();
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    if (v_model=='BANGLEJS') DrawBangleButtons();
    UserInput();
    PrintScreen(0);
    
    