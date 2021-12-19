// Widget to show sensor status
(() => {
  var settings = {};
  var count=0;

  // draw your widget
  function draw() {
    if (!settings.enabled) return;
    g.reset();
    g.setFontAlign(0,0);
    g.clearRect(this.x,this.y,this.x+23,this.y+23);
    g.setColor((count&1)?"#00ff00":"#80ff00");
    g.fillCircle(this.x+6,this.y+6,4);
    g.fillCircle(this.x+16,this.y+16,4);
    g.setColor(-1); // change color back to be nice to other apps
  }

// Set a listener to 'twinkle'
  function onTemp(temp) {
      count=count+1;
    WIDGETS["sensors"].draw();
  }

  // Called by sensor app to update status
  function reload() {
    settings = require("Storage").readJSON("coretemp.json",1)||{};
//    settings.fileNbr |= 0;

    Bangle.removeListener('CoreTemp',onTemp);

    if (settings.enabled) {
      WIDGETS["sensors"].width = 24;
      Bangle.on('CoreTemp', onTemp);
    } else {
      WIDGETS["sensors"].width = 0;
    }
    
  }
  // add the widget
  WIDGETS["sensors"]={area:"tl",width:24,draw:draw,reload:function() {
    reload();
    Bangle.drawWidgets(); // relayout all widgets
  }};
  // load settings, set correct widget width
  reload();
  
})()
