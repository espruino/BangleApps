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
  var day = date.getDay(); 
  var month = date.getMonth();
  var dateNum = date.getDate(); 
  var year = date.getFullYear(); 
  var half = "AM"; 
  var time = (" " + h).substr(-2) + ":" + ("0" + m).substr(-2); 
  
  //convert day into string 
  switch (day) {
    case 0:
      day = "Sunday"; 
      break; 
    
    case 1:
      day = "Monday"; 
      break; 
      
    case 2:
      day = "Tuesday"; 
      break; 
      
    case 3:
      day = "Wednesday"; 
      break; 
      
    case 4:
      day = "Thursday"; 
      break; 
      
    case 5:
      day = "Friday"; 
      break; 
      
    case 6:
      day = "Saturday"; 
      break; 
      
    default:
      day = "ERROR"; 
      break; 
  }
  
  //convert month into String
  switch(month) {
    case 0:
      month = "Jan"; 
      break; 
      
    case 1:
      month = "Feb"; 
      break; 
      
    case 2:
      month = "Mar"; 
      break; 
      
    case 3:
      month = "Apr"; 
      break; 
      
    case 4:
      month = "May"; 
      break; 
      
    case 5:
      month = "Jun"; 
      break; 
      
    case 6:
      month = "Jul"; 
      break; 
      
    case 7:
      month = "Aug"; 
      break; 
      
    case 8:
      month = "Sep"; 
      break;
      
    case 9:
      month = "Oct"; 
      break; 
      
    case 10:
      month = "Nov"; 
      break; 
      
    case 11:
      month = "Dec"; 
      break; 
      
    default:
      month = "ERROR"; 
      break; 
      
  }
      
  if (h > 12) {
    half = "PM"; 
    h = h - 12; 
  }
  //reset graphics
  g.reset(); 
  //draw the time
  g.setFont("7x11Numeric7Seg", 5);
  g.setFontAlign(1,1);
  g.drawString(time, X, Y, true /*clear background*/);
  g.setFont("7x11Numeric7Seg", 3);  
  g.drawString(("0"+date.getSeconds()).substr(-2), X+50, Y, true /*clear background*/); 
  g.setFontAlign(0,1);
  g.setFont("HaxorNarrow7x17", 2);
  g.drawString(half, X+30, Y-35, true);
  g.setFont("HaxorNarrow7x17", 3);
  g.drawString(day, X-60, Y+53, true);
  g.drawString(month, X-100, Y+95, true);  
  g.drawString(dateNum, X-40, Y+95, true); 
  g.drawString(year, X-90, Y-55, true); 
  
  
}

//clear screen at startup
g.clear(); 
//draw immediatly
draw(); 

var secondInterval = setInterval(draw, 1000);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 1000);
    draw(); // draw immediately
  }
});

Bangle.loadWidgets();
Bangle.drawWidgets();

setWatch(Bangle.showLauncher, BTN2, {repeat : false, edge: "falling"}); 
