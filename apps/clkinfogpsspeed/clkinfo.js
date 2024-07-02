(function() {
  var speed;
  function gpsHandler(e) {
    speed = e.speed;
    ci.items[0].emit('redraw');
  }
  var ci = {
    name: "GPS",
    items: [
      { name : "Speed",
        get : function() { return { text : isFinite(speed) ? require("locale").speed(speed) : "--",
                      v : 0, min : isFinite(speed) ? speed : 0, max : 150,
                      img : atob("GBiBAAAAAAAAAAAAAAAAAAD/AAHDgAMYwAbDYAwAMAoA0BgDmBgfGB4ceBgYGBgAGBoAWAwAMAwAMAf/4AP/wAAAAAAAAAAAAAAAAA==") }},
        show : function() {
          Bangle.setGPSPower(1, "clkinfogpsspeed");
          Bangle.on("GPS", gpsHandler);
        },
        hide : function() {
          Bangle.removeListener("GPS", gpsHandler);
          Bangle.setGPSPower(0, "clkinfogpsspeed");
        }
        // run : function() {} optional (called when tapped)
      }
    ]
  };
  return ci;
}) // must not have a semi-colon!