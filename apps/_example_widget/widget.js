/* run widgets in their own function scope if they need to define local
variables so they don't interfere with currently-running apps */
(() => {
  // add your widget
  WIDGETS["mywidget"]={
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right), be aware that not all apps support widgets at the bottom of the screen
    width: 28, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:function() {
      g.reset(); // reset the graphics context to defaults (color/font/etc)
      // add your code
      g.drawString("X", this.x, this.y);
    } // called to draw the widget
  };
})()
