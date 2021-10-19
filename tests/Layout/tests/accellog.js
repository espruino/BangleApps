// Based on accellog usage
var layout = new Layout({ type: "v", c: [
    {type:"txt", font:"6x8", label:"Samples", pad:2},
    {type:"txt", id:"samples", font:"6x8:2", label:"  -  ", pad:5},
    {type:"txt", font:"6x8", label:"Time", pad:2},
    {type:"txt", id:"time", font:"6x8:2", label:"  -  ", pad:5},
    {type:"txt", font:"6x8:2", label:"RECORDING", bgCol:"#f00", pad:5, fillx:1},
  ]
}{btns:[ // Buttons...
  {label:"STOP", cb:()=>{}}
]});
layout.samples.label = "123";
layout.time.label = "123s";
