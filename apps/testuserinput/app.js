/* Test  bangle.js input interface */
 var v_mode_debug=0; //1=yes, 0=no (to disable console msg)
 if (v_mode_debug==1) console.log("Debug mode enabled");
   else console.log("Debug mode disabled");
 var v_model=process.env.BOARD; 
 if (v_mode_debug==1) console.log("device="+v_model);
 
 var v_str_version='v0.06'; //testing purpose
 
 var x_max_screen=g.getWidth();//240;
 //var y_max_screen=g.getHeight(); //240; 
 var y_wg_bottom=g.getHeight()-25;
 var y_wg_top=25; 
 if (v_model=='BANGLEJS') {
    var x_btn_area=215;
    var x_max_usable_area=x_btn_area;//Pend! only for bangle.js
    var y_btn2=124; //harcoded for bangle.js  cuz it is not the half of
 } else x_max_usable_area=240;
 var x_mid_screen=x_max_screen/2; 
 
 var colbackg='#111111';//black 
 var colorange='#e56e06'; //RGB format rrggbb
 var v_color_lines=0xFFFF; //White hex format
 var v_color_b_area=colbackg; //for banner area
 var v_color_text='#FB0E01';
 //var v_font1size=16;
 var v_font1size=11; //out of quotes
 var v_font2size=18;
 var v_font3size=14;
 
 var v_clicks=0;
 var v_selected_row=1; //used by round option
 var v_total_rows=2;//used by round option
 var array_r_option=[];
 
 var v_y_optionrow1=80;
 var v_y_optionrow2=110; 
 var v_y_optionrow3=140;
 
 
 if (v_mode_debug==1) console.log("*** Test input interface ***");
 
//the biggest usable area, button area not included
function ClearActiveArea(x1,y1,x2,y2){
  g.setColor(colbackg); 
  //FOR BANGLE.JS (0,y_wg_top,x_max_usable_area,y_wg_bottom); 
  //fill all screen except widget area
  g.fillRect(x1,y1,x2,y2);
  g.flip();
}

function PrintHelp(){    
  if (v_mode_debug==1) console.log("Log: *** Print help in screen");
  ClearActiveArea(0,y_wg_top,x_max_usable_area,y_wg_bottom);
  g.setColor(colorange);
 /* PRINT FROM widget BOTTOM */  
  g.setFontVector(v_font2size).drawString("To test the UI, try:",5,y_wg_bottom-(10*v_font3size));
  g.flip();
  g.setColor(0,1,0);  //green      
  g.setFontVector(v_font3size);
  g.drawString("Swipe right -->", 30, y_wg_bottom-(8*v_font3size));
  g.drawString("Swipe left <--", 30, y_wg_bottom-(7*v_font3size));
  g.drawString("Click Left area", 30, y_wg_bottom-(6*v_font3size));
  g.drawString("Click Right area", 30,y_wg_bottom-(5*v_font3size));
  g.drawString("Click Middle area", 30,y_wg_bottom-(4*v_font3size));
  g.drawString("Press Button1", 30,y_wg_bottom-(3*v_font3size));
  g.drawString("Press Button2: Colour", 30,y_wg_bottom-(2*v_font3size));
  g.drawString("Press Button3: Quit", 30,y_wg_bottom-v_font3size);  
  g.flip();    
} 


function ChangeColorBannerArea(v_color){
 if (v_color=='#111111') v_color='#f3f3f1';
  else if (v_color=='#f3f3f1') v_color='#51504f';
    else if (v_color=='#51504f') v_color=0x7800;// Maroon
     else if (v_color==0x7800) v_color='#CC3333';//coldarkred
      else if (v_color=='#CC3333') v_color='#111111';
      return (v_color);  
}
//Clean fill top area with a color
function ClearBannerArea(){
  g.setColor(v_color_b_area); 
  g.fillRect(55,32,185,78); 
  g.flip();
}
 //arg input area Touch1=left Touch2=right
 function DrawRoundOption(x_obj1,y_obj1,x_obj2,y_obj2,i_area){
  //draw a img from an Image object
    var img_obj_check = {
      width : 30, height : 30, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,28436,38872,4838,6951,34711,26355,24242,32630,36792,30517,32598,40953,26323,9129,7016]),
      buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADMwiKZmQAAAAAAAAAAAMzMIimZVVUAAAAAAAAADMzCIpmVVViAAAAAAAAAzMwiKZlVVYi7AAAAAAAMzMIimZVVWIu7oAAAAADMzCIpmVVViLu6qgAAAADMwiKZlVVYi7uqoQAAAAzMIimZVVWIu3eqERAAAAzCIpmVVViLtzNxERAAAAwiKZlVVYi7czRxEWAAAAIimZe1WIu3M0cRFmAAAAIpmePqiLtzNHERZmAAAAKZleM+q7czRxEWZtAAAAmZVV4z4XQ0cRFmbdAAAAmVVVjjPjNHERZm3XAAAAlVVYi+MzRxEWZt13AAAAlVWIu640cRFmbdd3AAAABViLu6p3ERZm3XdwAAAABYi7uqoREWZt13dwAAAAAIu7qqERFmbdd3cAAAAAAAu6qhERZm3Xd3AAAAAAAACqoREWZt13dwAAAAAAAAAKERFmbdd3cAAAAAAAAAAAARZm3XdwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"))
    };
   var img_obj_uncheck = {
      width : 30, height : 30, bpp : 4,
      transparent : 0,
      palette : new Uint16Array([65535,63422,9532,13789,59197,57084,34266,28220,63390,65503,61310,61277,57116,55003,61309,40604]),
      buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzMzMzMwAAAAAAAAAAADMzf//3MzMAAAAAAAAAAzPxmZkRrzMwAAAAAAAAM3mZmZmRiKczAAAAAAADP5mZmZmRiKpjMAAAAAAzeZmZmZkRiKq3MwAAAAAzGZmZmZkRiKq8MwAAAAM/mZmZmZkYiKtE8iAAAAMxmZmZmZEYiqtEUiAAAAN5mZmZmRGIiqtExyAAAAPxmZmZkRiIqrRMViAAAAPxEREREYiKq7RMViAAAAP4ERERiIiqq0TFViAAAAP4iIiIiIqqtETFViAAAAN6iIiIiqq7RExV1yAAAAM0qqqqqru0RMVd0iAAAAM/uqqru7RETFXdYiAAAAAzS7u7RERMxV3dIgAAAAAzdEREREzFVd3XIgAAAAADNkREzMVVXd1iIAAAAAAAM3VVVVVd3dciAAAAAAAAAzNtVd3d1iIgAAAAAAAAADMidmZnIiIAAAAAAAAAAAAiIiIiIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"))
    };
     if (i_area=='none') {
        g.drawImage(img_obj_uncheck,x_obj1,y_obj1); 
        g.drawImage(img_obj_uncheck,x_obj2,y_obj2);
     }       
     else if (i_area=='Touch 1') {
         g.drawImage(img_obj_check,x_obj1,y_obj1);
         g.drawImage(img_obj_uncheck,x_obj2,y_obj2);
        if (v_mode_debug==1) console.log("Draw option check left");
        }
     else if (i_area=='Touch 2')  {
        g.drawImage(img_obj_uncheck,x_obj1,y_obj1);
        g.drawImage(img_obj_check,x_obj2,y_obj2);
        if (v_mode_debug==1) console.log("Draw option check right");
       }
        
}

function DrawSwitch(swipedir){
if (swipedir=='  <---') {
    if (v_mode_debug==1) console.log("Draw switch <--");
    var img_off = {
      width : 48, height : 48, bpp : 2,
      transparent : 0,
      palette : new Uint16Array([65535,63968,40283,50781]),
      buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAAAAAAAAAA///9VVVVVVVQAAAD/qq/1VVVVVVVAAAP6qqv9VVVVVVVUAA/qqqv/VVVVVVVVAD+qqq//1VVVVVVVQP6qqq//1VVVVVVVQPqqqr//9VVVVVVVUvqqqr//9VVVVVVVU+qqqv/+uVVVVVVVV+qqqv+quVVVVVVVV+qqq+qqvVVVVVVVV+qqvqqqvVVVVVVVV+qv+qqquVVVVVVVV+r/+qqquVVVVVVVVv//6qqq9VVVVVVVUP//6qqq9VVVVVVVUP//qqqr1VVVVVVVQD//qqqv1VVVVVVVQA/+qqq/VVVVVVVVAAP+qqr9VVVVVVVUAAD/qq/1VVVVVVVAAAA///9VVVVVVVQAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"))
    };
    g.drawImage(img_off,99,33);
  }
    else if (swipedir=='  --->')  {
      if (v_mode_debug==1) console.log("Draw switch -->");   
      var img_on = {
      width : 48, height : 48, bpp : 2,
      transparent : 0,
      palette : new Uint16Array([65535,36361,27879,40283]),
      buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAABVVVVVqqf///AAAAVVVVVWqn////wAAFVVVVVWqf////8AAVVVVVVap//////ABVVVVVVqr//////wBVVVVVVqn//////8FVVVVVVqv//////8FVVVVVWqf///////VVVVVVWq////////VVVVVVWq////////VVVVVVWq////////VVVVVVWq////////VVVVVVWq////////VVVVVVWq////////FVVVVVWqf///////FVVVVVVqv//////8BVVVVVVqn//////8BVVVVVVar//////wAVVVVVVap//////AAFVVVVVWqf////8AAAVVVVVWqn////wAAABVVVVVqqf///AAAAAAAAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"))
    };
    g.drawImage(img_on,99,33);  
  }
} 


function PrintUserInput(boton){
  if (v_mode_debug==1) console.log("Pressed touch/BTN",boton);
  if (v_clicks==0) {
      PrintAreas();
      v_clicks++;
  }
  ClearBannerArea();
  
    if (boton=='  <---') DrawSwitch(boton);
     else if (boton=='  --->') DrawSwitch(boton);
        //all input but not swipe
        else {
            g.setColor(colorange); 
            //Call info banner
            g.setFontVector(30).drawString(boton, 63, 55);
            if ((boton=='Touch 1')||(boton=='Touch 2')){
                let v_y_opt;
                if (v_selected_row==1) v_y_opt=v_y_optionrow1;
                else if (v_selected_row==2) v_y_opt=v_y_optionrow2;         
                DrawRoundOption(20,v_y_opt,190,v_y_opt,boton);
                //set the option value in an array
                array_r_option[v_selected_row]=boton;
                if (v_mode_debug==1) console.log("array["+v_selected_row+"]="+array_r_option[v_selected_row]);
            } 
        }
       
  g.flip();       
}

function Btn1Clkd(boton){ 
 if (v_mode_debug==1) console.log("Pressed BTN1"); 
 if (v_clicks==0){ 
      PrintAreas(); //only 1st time
      //v_selected_row=1;         
      v_clicks++; 
 } 
 

 else if ((v_clicks>0)&&(v_selected_row!=v_total_rows)){        
     v_selected_row++;   
     //Params: row_arrow, row_clear_area  
     if (v_mode_debug==1) console.log("row :"+v_selected_row);  
     DrawRowSelArrow(v_selected_row,v_selected_row-1);   
     v_clicks++; 
 }
 else if ((v_clicks>0)&&(v_selected_row==v_total_rows)){
         
     DrawRowSelArrow(1,v_selected_row);  
     if (v_mode_debug==1) console.log("last row :"+v_selected_row); 
     v_selected_row=1;   
     v_clicks++; 
 }
 PrintUserInput("Button1"); 
}

function Btn2Clkd(boton){ 
 if (v_mode_debug==1) console.log("Pressed BTN2");
 v_color_b_area=ChangeColorBannerArea(v_color_b_area);
 if (v_clicks==0){
     PrintAreas();//only 1st time
     v_clicks++; 
 }
 PrintUserInput("Button2");  
}

function DrawBangleButtons(){    
    
    /*Button name */
    g.setColor(v_color_text);  //green   
    g.setFontVector(v_font3size);
    g.drawString("B1", x_max_screen-g.stringWidth("B1"),y_wg_top);
    g.drawString("B2", x_max_screen-g.stringWidth("B2"),y_btn2);
    //y y_wg_bottom-v_font3size ?
    g.drawString("B3",x_max_screen-g.stringWidth("B3"),y_wg_bottom);
        
    /*Button area description */
    g.setFontVector(v_font1size);
    g.setColor(v_color_lines);
    //y_wg_bottom-(2*v_font1size)
    g.drawString("Quit", x_max_screen-g.stringWidth("Quit"),y_wg_bottom-v_font1size-2);  
    
    
    //Print version
    if (v_mode_debug==1){
         g.setColor(0,1,0); //green
        //y_wg_bottom-(2*v_font1size)
        g.drawString(v_str_version, x_max_screen-g.stringWidth(v_str_version),y_wg_bottom-(v_font1size*3));  
    }
    
    //under btn2, left top 90grades
    g.setFontAlign(-1,-1,1);
    g.drawString("Color", x_max_screen-v_font1size,y_btn2+v_font3size); 
    //g.drawString("Color", x_max_screen-g.stringWidth("Color"),y_btn2+v_font1size); 
   
   
    g.setColor(0,1,0);  //green      
    g.drawString("Up", x_max_screen-v_font1size,y_wg_top+v_font3size);
    g.setColor(v_color_lines);
    g.drawString("Down", x_max_screen-2*v_font1size,y_wg_top+v_font3size);
    g.flip();  
    //back to standard /horizontal
    g.setFontAlign(-1,-1,0);
}

function DrawRowSelArrow(v_drawRow, v_clearRow){   
  //Params: row_arrow, row_clear_area       
  //for clear previous draw arrow 
  if (v_clearRow!== undefined) {     
    g.setColor(colbackg); 
    let v_y_arrow;
    if  (v_clearRow==1) v_y_arrow=v_y_optionrow1+14;
    else if (v_clearRow==2) v_y_arrow=v_y_optionrow2+14;
    else if (v_clearRow==3) v_y_arrow=v_y_optionrow3+14;     
    g.fillRect(5,v_y_arrow-5,13,v_y_arrow+5);    
   g.flip(); 
  }
   //draw an arrow to select a row
  if (v_drawRow!== undefined) {     
    let v_y_arrow;
    if (v_drawRow==1) v_y_arrow=v_y_optionrow1+14;            
    else if (v_drawRow==2) v_y_arrow=v_y_optionrow2+14;
    else if (v_drawRow==3) v_y_arrow=v_y_optionrow3+14;

    g.setColor(v_color_lines);     
    g.drawLine(5, v_y_arrow, 13, v_y_arrow);//horizontal
    g.drawLine(13, v_y_arrow, 10, v_y_arrow-5);//over diag
    g.drawLine(13, v_y_arrow, 10, v_y_arrow+5);//under diag
    g.flip();      
  } 
  else console.log("Error: Param row nbr missing");
}

function PrintAreas(){    
  if (v_mode_debug==1) console.log("Log: *** Print Areas in screen");
  ClearActiveArea(0,y_wg_top,x_max_usable_area,y_wg_bottom);     
  g.setColor(v_color_lines);   
  
  DrawRowSelArrow(1);
  DrawRoundOption(20,v_y_optionrow1,190,v_y_optionrow1,'none');
  DrawRoundOption(20,v_y_optionrow2,190,v_y_optionrow2,'none');
  
    g.drawLine(x_max_screen-1, 50, x_max_screen-1, 65);//vlide right border
  g.drawLine(x_mid_screen, 80, x_mid_screen, 105);//vline middle separation part1 up  
  g.drawLine(x_mid_screen, 140, x_mid_screen, 180);//vline middle separation  part2 down
  
        
  g.setFontVector(v_font3size);
  g.drawString("Middle area", 80,155);
  g.drawString("Left area", 15, 185);
  g.drawString("Right area", 140,185); 
    
   if (v_model=='BANGLEJS') DrawBangleButtons();
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
    //only the name of the function
    setWatch(Btn1Clkd, BTN1, { repeat: true });
    setWatch(Btn2Clkd, BTN2, { repeat: true });
    setWatch(Bangle.showLauncher, BTN3, { repeat: true });
    Bangle.on('swipe', dir => {  
      if(dir == 1) PrintUserInput("  --->");
      else PrintUserInput("  <---");
    });
    if (v_mode_debug==1) console.log("Log: Input conditions loaded");
} //end of UserInput

//Main code
 g.clear();
 Bangle.loadWidgets();
 Bangle.drawWidgets();
 
 g.setColor(v_color_lines);    
 //optional line below widgets area
 //g.drawLine(60, 30, 180, 30); 
 //g.flip(); 
 //end optional
 PrintHelp(); 
 
 UserInput();
