(() => {
  var width = 32; // width of the widget

  function draw() {
    var date = new Date();
    g.reset(); // reset the graphics context to defaults (color/font/etc)
    g.setFontAlign(0,1); // center fonts    
    //g.drawRect(this.x, this.y, this.x+width-1, this.y+23);  // check the bounds!    

    var text = date.getDate();
    g.setFont("Vector", 24);
    g.drawString(text, this.x+width/2+1, this.y + 28);
    //g.setColor(0, 0, 1);
    //g.drawRect(this.x, this.y, this.x+width-2, this.y+1);
  }

  setInterval(function() {
    WIDGETS["widday"].draw(WIDGETS["widdateday"]);
  }, 10*60000); // update every 10 minutes

  // add your widget
  WIDGETS["widday"]={
    area:"bl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
    width: width, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
})()
