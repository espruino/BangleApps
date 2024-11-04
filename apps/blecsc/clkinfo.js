(function() {
  var csc = require("blecsc").getInstance();
  //csc.on("status", txt => { print("CSC",txt); });
  csc.on("data", e => {
    ci.items.forEach(it => { if (it._visible) it.emit('redraw'); });
  });
  csc.on("disconnect", e => {
    // redraw all with no info
    ci.items.forEach(it => { if (it._visible) it.emit('redraw'); });
  });
  var uses = 0;
  var ci = {
    name: "CSC",
    items: [
      { name : "Speed",
        get : () => {
          return {
            text : (csc.kph === undefined) ? "--" : require("locale").speed(csc.kph),
            img : atob("GBiBAAAAAAAAAAAAAAABwAABwAeBgAMBgAH/gAH/wAPDwA/DcD9m/Ge35sW9o8//M8/7E8CBA2GBhn8A/h4AeAAAAAAAAAAAAAAAAA==")
          };
        },
        show : function() {
          uses++;
          if (uses==1) csc.start();
          this._visible = true;
        },
        hide : function() {
          this._visible = false;
          uses--;
          if (uses==0) csc.stop();
        }
      },
      { name : "Distance",
        get : () => {
          return {
            text : (csc.kph === undefined) ? "--" : require("locale").distance(csc.cwr * csc.settings.circum / 1000),
            img : atob("GBiBAAAAAB8AADuAAGDAAGTAAGRAAEBAAGBAAGDAADCAADGAIB8B+A/BjAfjBgAyJgAyIgAyAj/jBnADBmABjGAA2HAA8D//4AAAAA==")
          };
        },
        show : function() {
          uses++;
          if (uses==1) csc.start();
          this._visible = true;
        },
        hide : function() {
          this._visible = false;
          uses--;
          if (uses==0) csc.stop();
        }
      },
      { name : "Cadence",
        get : () => {
          return {
            text : (csc.crps === undefined) ? "--" : Math.round(csc.crps*60),
            img : atob("GBiBAAAAAAAAAAB+EAH/sAeB8A4A8AwB8BgAABgAADAAADAAADAAADAADDAADDAAABgAABgAGAwAEA4AAAeAwAH8gAB8AAAAAAAAAA==")
          };
        },
        show : function() {
          uses++;
          if (uses==1) csc.start();
          this._visible = true;
        },
        hide : function() {
          this._visible = false;
          uses--;
          if (uses==0) csc.stop();
        }
      }
    ]
  };
  return ci;
})
