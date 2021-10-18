var BTN2 = 1, BTN3=2;
process.env = process.env;process.env.HWVERSION=1;
g = Graphics.createArrayBuffer(240,240,4);

var layout = new Layout({ type: "v", c: [
  {type:"txt", font:"6x8", label:"A test"},
]},{btns:[ // Buttons...
  {label:"STOP", cb:()=>{}},
]});
