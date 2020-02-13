/* run widgets in their own function scope so they don't interfere with
currently-running apps */
(() => {
  // add the width
  var xpos = WIDGETPOS.tr-24;/*<the widget width>*/;
  WIDGETPOS.tr-= 28;/* the widget width plus some extra pixel to keep distance to others */;

  // draw your widget at xpos
  function draw() {
    g.reset(); // reset the graphics context to defaults (color/font/etc)
  	// add your code
  }

  // add your widget
  WIDGETS["mywidget"]={draw:draw};

})()
