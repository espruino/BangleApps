// place your const, vars, functions or classes here
const colWidth = g.getWidth()/2;
const rowHeight = g.getHeight()/3;


function draw(){
  var date = new Date();
  var dateString = date.toString();
  var dateArray = dateString.split(" ");
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var time =  ((hours>9) ? hours : "0" + hours) +":";
  time += ((minutes>9) ? minutes : "0" + minutes);

  g.setFontAlign(0,0);
  g.setFont("6x8",5);
  g.drawString(time,colWidth,rowHeight,true);
  g.setFont("6x8",3);
  g.drawString(dateArray[2]+"-"+dateArray[1]+"-"+dateArray[3],colWidth,rowHeight*2);
}
// special function to handle display switch on
Bangle.on('lcdPower', (on) => {
  if(interval) clearInterval(interval);
  interval = undefined;
  if (on) {
    interval = setInterval(draw,5*1000);
    draw();
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

// call your app function here
var interval = setInterval(draw, 5*1000);
draw();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});