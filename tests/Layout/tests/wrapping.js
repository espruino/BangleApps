var layout = new Layout({type:"v", c: [
  {type:"h", c: [
    {type:"txt", font:"10%", wrap: true, fillx: true, filly: true, label:"This is wrapping text that fills remaining space"},
    {type:"txt", font:"6x8", wrap: true, width: 60, filly: true, label:"This is wrapping text in a narrow column"},
  ]},
  {type:"txt", font:"6x8", wrap: true, fillx: true, height: 20, label:"This doesn't need to wrap"},
]});