(function() {
  let interval;
  return {
    name: "Bangle",
    items: [
      { name : "Tide",
        get : function() {
          let tide = require("tidetimes").getNext(Date.now());
          return {
            text : require("locale").time(new Date(tide.t),1),
            img : (tide.v > 0.5) ?
              atob("GBiBAAAAAAAAAAYGBg8PDhmZmHDw8GBgYAAAAAAQAAA4AAB8AAD+AAH/AAP/gAA4AAA4AAA4AAA4AAA4AAA4AAA4AAAAAAAAAAAAAA==") :
              atob("GBiBAAAAAAAAAAAAAAAcAAAcAAAcAAAcAAAcAAAcAAAcAAH/wAD/gAB/AAA+AAAcAAAIAAAAAAYGBg8PDhmZmHDw8GBgYAAAAAAAAA==")
          };
        },
        show : function() {
          interval = setInterval(() => { this.emit("redraw"); }, 600000); // 10 minutes
        },
        hide : function() { clearInterval(interval); interval = undefined; },
        run : function() { load("tidetimes.app.js"); }
      },
      { name : "Tide Height",
        get : function() {
          let t = Date.now(), scale = 1600000;// ms per pixel
          let tides = require("tidetimes");
          let b = Graphics.createArrayBuffer(24,24,1);
          b.transparent = 0;
          for (let x=0;x<24;x+=2) {
            b.fillRect(x, 16-tides.getLevelAt(t-scale*(x-12))*12, x+1,17);
          }
          b.fillPoly([12,17, 9,23, 15,23])
          return {
            text : Math.round(tides.getLevelAt(t)*100)+"%",
            img : b.asImage("string")
          };
        },
        show : function() {
          interval = setInterval(() => { this.emit("redraw"); }, 600000); // 10 minutes
        },
        hide : function() { clearInterval(interval); interval = undefined; },
        run : function() { load("tidetimes.app.js"); }
      }
    ]
  };
}) // must not have a semi-colon!
