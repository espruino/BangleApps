/* Test  bangle.js input interface */
 var colbackg='#111111';//black 
 var colorange='#e56e06'; //RGB format rrggbb
 var v_color_lines=0xFFFF; //White hex format
 var v_color_b_area=colbackg;
 var v_font1size='16';
 var v_clicks='0';
 console.log("*** Test input interface ***");
 
 
function ClearActiveArea(){
  g.setColor(colbackg); 
  g.fillRect(0,32,239,239); //fill all screen except widget area
  g.flip();
}

function PrintHelp(){  
  console.log("********************************");
  console.log("Log: *** Print help in screen");
  ClearActiveArea();     
  g.setColor(colorange); 
  g.setFontVector(18).drawString("To test the input, try :",25,90);
  g.flip();
  g.setColor(0,1,0);  //green      
  g.setFontVector(v_font1size).drawString("Swipe right -->", 30, 115);
  g.setFontVector(v_font1size).drawString("Swipe left <--", 30, 130);
  g.setFontVector(v_font1size).drawString("Click Left area", 30, 145);
  g.setFontVector(v_font1size).drawString("Click Right area", 30,160);
  g.setFontVector(v_font1size).drawString("Click Middle area", 30,175);
  g.setFontVector(v_font1size).drawString("Press Button1 ", 30,190);
  g.setFontVector(v_font1size).drawString("Press Button2 for colors", 30,205);
  g.setFontVector(v_font1size).drawString("Press Button3 to Quit", 30,220);  
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
 
 function DrawRoundOption(area){
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
     if (area=='Touch 1') {
         g.drawImage(img_obj_check,20,80);
         console.log("Draw option check left");
        }
         else g.drawImage(img_obj_uncheck,20,80);
    if (area=='Touch 2')  {
        g.drawImage(img_obj_check,190,80);
        console.log("Draw option check right");
       }
        else g.drawImage(img_obj_uncheck,190,80);
}

function DrawSwitch(swipedir){
if (swipedir=='  <---') {
    console.log("Draw switch <--");
    var img_off = {
      width : 48, height : 48, bpp : 2,
      transparent : 0,
      palette : new Uint16Array([65535,63968,40283,50781]),
      buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAAAAAAAAAA///9VVVVVVVQAAAD/qq/1VVVVVVVAAAP6qqv9VVVVVVVUAA/qqqv/VVVVVVVVAD+qqq//1VVVVVVVQP6qqq//1VVVVVVVQPqqqr//9VVVVVVVUvqqqr//9VVVVVVVU+qqqv/+uVVVVVVVV+qqqv+quVVVVVVVV+qqq+qqvVVVVVVVV+qqvqqqvVVVVVVVV+qv+qqquVVVVVVVV+r/+qqquVVVVVVVVv//6qqq9VVVVVVVUP//6qqq9VVVVVVVUP//qqqr1VVVVVVVQD//qqqv1VVVVVVVQA/+qqq/VVVVVVVVAAP+qqr9VVVVVVVUAAD/qq/1VVVVVVVAAAA///9VVVVVVVQAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"))
    };
    g.drawImage(img_off,99,33);
  }
    else if (swipedir=='  --->')  {
      console.log("Draw switch -->");   
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
  console.log("Pressed touch/BTN",boton);
  if (v_clicks=='0') {
      PrintAreas();
      v_clicks=1;
  }
  ClearBannerArea();
  
    if (boton=='  <---') DrawSwitch(boton);
     else if (boton=='  --->') DrawSwitch(boton);
      else  
       {   //a BUTTON or AREA  AND NO swipe /slide
         if (boton=='Touch 1'||boton=='Touch 2') DrawRoundOption(boton);
         g.setColor(colorange); 
         g.setFontVector(30).drawString(boton, 63, 55);
       }
  g.flip();       
}

function PrintBtn1(boton){ 
 console.log("Pressed BTN1");
 if (v_clicks=='0'){ 
      PrintAreas();
      v_clicks=1; 
 }
 PrintUserInput("Button1"); 
 
}

function PrintBtn2(boton){ 
 console.log("Pressed BTN2");
 v_color_b_area=ChangeColorBannerArea(v_color_b_area);
 if (v_clicks=='0'){
     PrintAreas();
     v_clicks=1; 
 }
 PrintUserInput("Button2");  
}


function PrintAreas(){  
  console.log("********************************");
  console.log("Log: *** Print Areas in screen");
  ClearActiveArea();     
  g.setColor(v_color_lines);
  g.drawLine(1, 140, 1, 200);//vline left border
  g.drawLine(239, 140, 239, 200);//vlide right border
  g.drawLine(120, 100, 120, 135);//vline middle separation  top
  g.drawLine(120, 170, 120, 200);//vline middle separation  bottom
  
  //BTN1 
  g.setFontVector(v_font1size).drawString("Color<-", 130,125);  
  //BTN13
  g.setFontVector(v_font1size).drawString("Quit<-", 135,225);  
  g.flip();  
  g.setColor(0,1,0);  //green    
  g.setFontVector(v_font1size).drawString("BTN1", 195,45);  
  
  g.setFontVector(v_font1size).drawString("BTN2", 195,125);  
  
  g.setFontVector(v_font1size).drawString("BTN3", 195,225);  
  g.setFontVector(v_font1size).drawString("Middle area", 80,155);
  g.setFontVector(v_font1size).drawString("Left area", 15, 185);
  g.setFontVector(v_font1size).drawString("Right area", 140,185);    
  g.flip();    
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
    setWatch(PrintBtn1, BTN1, { repeat: true });
    setWatch(PrintBtn2, BTN2, { repeat: true });
    setWatch(Bangle.showLauncher, BTN3, { repeat: true });
    Bangle.on('swipe', dir => {  
      if(dir == 1) PrintUserInput("  --->");
      else PrintUserInput("  <---");
    });
    console.log("Log: Input conditions loaded");
} //end of UserInput

//Main code
 Bangle.loadWidgets();
 Bangle.drawWidgets();
 //optional line below widgets area
 g.setColor(v_color_lines);    
 g.drawLine(60, 30, 180, 30); 
 g.flip(); 
 //end optional
 PrintHelp();
 UserInput();