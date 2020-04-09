// place your const, vars, functions or classes here

function renderBatteryChart(){
  g.drawString("t", 215, 175);
  g.drawLine(40,190,40,80);
  
  g.drawString("%", 39, 70);
  g.drawString("100", 15, 75);
  g.drawLine(35,80,40,80);
  
  g.drawString("50", 20,125);
  g.drawLine(35,130,40,130);
  
  g.drawString("0", 25, 175);
  g.drawLine(35,180,210,180);
  
  g.drawString("Chart not yet functional", 60, 125);
}

// special function to handle display switch on
Bangle.on('lcdPower', (on) => {
  if (on) {
    // call your app function here
    // If you clear the screen, do Bangle.drawWidgets();
    renderBatteryChart();
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
// call your app function here

renderBatteryChart();
