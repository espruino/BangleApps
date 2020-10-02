
//load fonts
require("Font7x11Numeric7Seg").add(Graphics);
require("FontHaxorNarrow7x17").add(Graphics); 
//screen position
const X = 170; 
const Y = 140; 

function draw() { 
  // Date Variables
  var date = new Date(); 
  var h = date.getHours(); 
  var m = date.getMinutes(); 
  var day = require("locale").dow(date);  
  var month = require("locale").month(date, 1);
  var dateNum = date.getDate(); 
  var year = date.getFullYear(); 
  var half = "AM"; 
   if (h > 12) {
    half = "PM"; 
    h = h - 12; 
  }
  if(h === 12) {
   half = "PM"; 
  }
  var time = (" " + h).substr(-2) + ":" + ("0" + m).substr(-2); 
  
  
  //Make month and date into one string
  var monthDate = month + " " + dateNum; 
      
  //reset graphics
  g.reset(); 
  //draw the time
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(1,1);
  g.drawString(time, X, Y, true /*clear background*/);
  g.setFont("7x11Numeric7Seg", 3);  
  g.drawString(("0"+date.getSeconds()).substr(-2), X+50, Y, true /*clear background*/); 
  g.setFont("HaxorNarrow7x17", 2);
  g.drawString(half, X+45, Y-35, true);
  g.setFont("HaxorNarrow7x17", 3);
  g.drawString(day, X-45, Y+53, true);
  g.drawString(monthDate, X-75, Y+98, true);   
  g.drawString(year, X-72, Y-55, true); 
  
  //draw lightning bolt symbol
  if(Bangle.isCharging() === true) {
    g.drawImage(atob("Hh6EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFVVVVUAAAAAAAAAAAAAAN3d3dUAAAAAAAAAAAAABd3 d3dAAAAAAAAAAAAAABd3d3VAAAAAAAAAAAAAADd3d3VAAAAAAAAAAAAAAXd3d1QAAAAAAAAAAAAAAXd3d1QAAAAAAAAAAAAAAXd3d0AAAAAAAAAAAAAAA3d3dUAAAAAAAAAAAAAAF3d3dUAAAAAAAAAAAAAAF3d3dAAAAAAAAAAAAAAAN3d3d3d3VAAAAAAAAAABd3d3d3d1QAAAAAAAAAABd3d3d3d0AAAAAAAAAAAAAAAXd3dUAAAAAAAAAAAAAAAXd3VAAAAAAAAAAAAAAAA3d3QAAAAAAAAAAAAAAAA3d1QAAAAAAAAAAAAAAAF3dUAAAAAAAAAAAAAAAAF3VAAAAAAAAAAAAAAAAAN3VAAAAAAAAAAAAAAAAAN1QAAAAAAAAAAAAAAAABdUAAAAAAAAAAAAAAAAABdAAAAAAAAAAAAAAAAAABVAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 190, 40);
  }
  
  else {
    g.setColor(0, 0, 0); 
   g.fillRect(190, 40, 220, 70);  
  }

  
}

function drawBat() {
  g.setFontAlign(0,1);
  g.setColor(0, 0, 0); 
  g.fillRect(135, 40, 186, 80); 
  //Battery Variable
  var bat = E.getBattery();
  //Draw the battery info 
  g.setColor(255, 255, 255); 
  g.drawRect(135, 40, 186, 80);
  g.fillRect(135, 55, 130, 65); 
  
  //draw battery fill color
  if(bat > 49) {
    //set color to green
    g.setColor('#00d107');
  } 
  
  else if (bat < 50 && bat > 20) {
    //set color to orange
    g.setColor('#e39000'); 
  }
  
  else {
   //set color to red 
    g.setColor('#e30b00'); 
  }
  g.fillRect(185 - bat/2, 41, 185, 79);  
  g.setFont("HaxorNarrow7x17", 2);
  g.setColor(255, 255, 255); 
  g.drawString(bat + "%", 162, 77);
}

//clear screen at startup
g.clear(); 
//draw immediatly
draw(); 
drawBat(); 

var batInterval = setInterval(drawBat, 15000);
var secondInterval = setInterval(draw, 1000); 

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  batInterval = undefined; 
  if (on) {
    secondInterval = setInterval(draw, 1000);
    batInterval = setInterval(drawBat, 10000);
    draw(); // draw immediately
    drawBat(); 
  }
});

Bangle.loadWidgets();
Bangle.drawWidgets();

setWatch(Bangle.showLauncher, BTN2, {repeat : false, edge: "falling"}); 

