g.clear();
var layout = new Layout({type:"h", filly: 0, c: [
  {type: "txt", font: "50%", label: "A"},
  {type:"v", c: [
    {type: "txt", font: "10%", label: "B"},
    {filly: 1},
    {type: "txt", font: "10%", label: "C"},
  ]},
]});
