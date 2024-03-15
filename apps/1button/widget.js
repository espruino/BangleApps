(() => {
  var press_time = new Date();

  // set widget text
  function draw() {
    g.reset(); // reset the graphics context to defaults (color/font/etc)
      // add your code
    g.fillCircle(this.x+6,this.y+6,4);
    g.drawString("1BUTTON", this.x+13, this.y+4);
  }

  // listen to button press to get start time
  setWatch(function(e) {
    console.log("Button pressed");
    digitalWrite(LED2,1);
    press_time = new Date();
    Bangle.buzz();
  }, BTN1, { repeat: true, edge: 'rising', debounce: 130 });

  // listen to button go to get end time & write data
  setWatch(function(e) {
    console.log("Button let go");
    digitalWrite(LED2,0);
    var unpress_time = new Date();
    const recFile = require("Storage").open("one_button_presses.csv","a");
    recFile.write([press_time.getTime(),unpress_time.getTime()].join(",")+"\n");
  }, BTN1, { repeat: true, edge: 'falling', debounce: 50 });


  // add your widget
  WIDGETS["1button"]={
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
    width: 100, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
})()
