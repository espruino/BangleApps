(function() {
  let strideLength = (require("Storage").readJSON("myprofile.json",1)||{}).strideLength ?? 0.79,
      lastSteps = 0;
  function stepUpdateHandler() { distance.emit("redraw"); }
  var distance = {
    name : "Distance",
    get : () => { let v = (Bangle.getHealthStatus("day").steps - lastSteps)*strideLength; return {
      text : require("locale").distance(v,1),
      img : atob("GBiBAAMAAAeAAA/AAA/AAA/gAA/gwAfh4AfD4APD4AOH4AAH4ADj4AHjwAHhwADgAAACAAAHgAAPAAAHAAgCEBgAGD///BgAGAgAEA==")
    };},
    run : function() {
      lastSteps = (lastSteps>=Bangle.getHealthStatus("day").steps) ? 0 : Bangle.getHealthStatus("day").steps;
      this.emit("redraw");
    },
    show : function() { Bangle.on("step", stepUpdateHandler); stepUpdateHandler(); },
    hide : function() { Bangle.removeListener("step", stepUpdateHandler); }
  };
  return {
    name: "Bangle",
    items: [ distance ]
  };
})
