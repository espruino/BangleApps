(function() {
  var heading, cnt;
  function magHandler(m) {
    var h = m.heading;
    if (isNaN(heading) || isNaN(h))
      heading = h;
    else {
      // Average
      if (Math.abs(heading-h)>180) {
        if (h<180 && heading>180) h+=360;
        if (h>180 && heading<180) h-=360;
      }
      heading = heading*0.8 + h*0.2;
      if (heading<0) heading+=360;
      if (heading>=360) heading-=360;
    }
    // only draw 1 in 2 to try and save some power!
    if (!(1&cnt++)) ci.items[0].emit('redraw');
  }
  var ci = {
    name: "Bangle",
    items: [
      { name : "Compass",
        get : function() {
          var g = Graphics.createArrayBuffer(24,24,1,{msb:true});
          if (isNaN(heading))
            g.drawLine(8,12,16,12);
          else
            g.fillPoly(g.transformVertices([0,-10,4,10,-4,10],{x:12,y:12,rotate:-heading/57}));
          g.transparent=0; // only works on 2v18+, ignored otherwise (makes image background transparent)
          return { text : isNaN(heading)?"--":Math.round(heading),
                      v : 0|heading, min : 0, max : 360,
                      img : g.asImage("string") }},
        show : function() {
          Bangle.setCompassPower(1,"clkinfomag");
          Bangle.on('mag',magHandler);
          cnt=0;
          heading = undefined;
        },
        hide : function() {
          Bangle.removeListener('mag', magHandler);
          Bangle.setCompassPower(0,"clkinfomag");
        },
        run : function() { Bangle.resetCompass(); }
      }
    ]
  };
  return ci;
})
