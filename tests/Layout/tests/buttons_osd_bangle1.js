var BTN2 = 1, BTN3=2;
process.env = process.env;process.env.HWVERSION=1;
g = Graphics.createArrayBuffer(240,240,4);

/* When displaying OSD buttons on Bangle.js 1 we should turn
the side buttons into 'soft' buttons and then use the physical
buttons for up/down selection */

var layout = new Layout({ type: "v", c: [
  {type:"txt", font:"6x8", label:"A test"},
  {type:"btn", label:"Button 1"},
  {type:"btn", label:"Button 2"}
]},{btns:[ // Buttons...
  {label:"A", cb:()=>{}},
  {label:"STOP", cb:()=>{}},
  {label:"B", cb:()=>{}},
]});
