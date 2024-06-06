(function(recorders) {
  recorders.blecsc = function() {
    var csc = require("blecsc").getInstance();
    var speed, cadence;
    csc.on("data", e => {
      speed = e.kph; // speed in KPH
      cadence = (e.crps===undefined)?"":Math.round(e.crps*60); // crank rotations per minute
    });
    return {
      name : "CSC",
      fields : ["Speed (kph)","Cadence (rpm)"],
      getValues : () => {
        var r = [speed,cadence];
        speed = "";
        cadence = "";
        return r;
      },
      start : () => {
        csc.start();
      },
      stop : () => {
        csc.stop();
      },
      draw : (x,y) => g.setColor(csc.device?"#0f0":"#8f8").drawImage(atob("Dw+BAAAAAAABgOIA5gHcBxw9fpfTPqYRC8HgAAAAAAAA"),x,y)
    };
  }
})

