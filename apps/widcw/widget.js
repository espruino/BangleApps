(function() {
  var width = 22; // width of the widget

  function draw() {
    const x = this.x, y = this.y, x2 = x+21, y2 = y+23;
    
    var date = new Date();

    // Calculate calendar week (https://stackoverflow.com/a/6117889)
    const getCW = function(date){
      var d=new Date(date.getFullYear(), date.getMonth(), date.getDate());
      var dayNum = d.getDay() || 7;
      d.setDate(d.getDate() + 4 - dayNum);
      var yearStart = new Date(d.getFullYear(),0,1);
      return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    };

    g.reset().setFontAlign(0, 0) // center all text
      // header
      .setBgColor("#f00").setColor("#fff")
      .clearRect(x, y, x2, y+8).setFont("4x6").drawString("CW", (x+x2)/2+1, y+5)
       // date
      .setBgColor("#fff").setColor("#000")
      .clearRect(x, y+9, x2, y2).setFont("Vector:16").drawString(getCW(date), (x+x2)/2+2, y+17);

    if (!g.theme.dark) {
        // black border around date for light themes
        g.setColor("#000").drawPoly([
          x, y+9,
          x, y2,
          x2, y2,
          x2, y+9
        ]);
    }
    
    // redraw when date changes
    if (WIDGETS["widcw"].to) clearTimeout(WIDGETS["widcw"].to);
    WIDGETS["widcw"].to = setTimeout(()=>WIDGETS["widcw"].draw(), (86401 - Math.floor(date/1000) % 86400)*1000);
  }

  // add your widget
  WIDGETS["widcw"]={
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
    width: width, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
  
})();
