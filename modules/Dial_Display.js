let dialDisplayGenerator = function(options) {
  
  let dialDisplay = function(step, previousValue) {
    if (!previousValue) previousValue = 0;
    let currentValue = previousValue + step;
    g.clear().reset().setFont("Vector:30");
    g.drawString(currentValue);
    
    return currentValue;
  }
  return dialDisplay;
}

let options = {};
let dialDisplay = dialDisplayGenerator(options);
let value = 0;

let cb = (step)=>{
  print(step);
  value = dialDisplay(step, value);
};

let dial = require("Dial")(cb);
Bangle.on("drag", dial);
