var Layout = require("Layout");
g.clear();
var calData=global.calories;
var goal=2000;
function renderActive(l){
  g.setFont("Vector",25).
  setFontAlign(0,0).
  drawString(calData.activeCaloriesBurned,l.x+(l.w/2),l.y+(l.h/2)-10).
  drawLine(l.x+20,l.y+(l.h/2)+4,l.x+l.w-25,l.y+(l.h/2)+4).
  drawString(goal,l.x+(l.w/2),l.y+(l.h/2)+21)
}

function drawRingMeter(x, y, radius, progress, thickness, color) {
  let startAngle = -Math.PI / 2; // Start at 12 o'clock
  let endAngle = startAngle + (progress * Math.PI * 2);
  let innerRadius = radius - thickness;

  g.setColor(color);

  // We draw the ring in small chunks (steps) to keep it smooth
  let step = Math.PI / 20; 
  for (let a = startAngle; a < endAngle; a += step) {
    let nextA = Math.min(a + step, endAngle);
    
    // Calculate the 4 corners of a segment polygon
    let poly = [
      x + radius * Math.cos(a),      y + radius * Math.sin(a),
      x + radius * Math.cos(nextA),  y + radius * Math.sin(nextA),
      x + innerRadius * Math.cos(nextA), y + innerRadius * Math.sin(nextA),
      x + innerRadius * Math.cos(a), y + innerRadius * Math.sin(a)
    ];
    
    g.fillPoly(poly);
  }
}

function drawCalIconMeter(l){
  var col="#f00";
  var prog=calData.activeCaloriesBurned/goal;
  if(prog>0.6)col="#FFA500";
  if(prog>0.9)col="#0f0";
  drawRingMeter(l.x+(l.w/2)-8,l.y+(l.h/2),30,1,5,"#fff")
  drawRingMeter(l.x+(l.w/2)-8,l.y+(l.h/2),30,prog,5,col);
    g.drawImage(require("heatshrink").decompress(atob("mEw4MA///4H0CpsD+AFDh4FEj/gAoc/4AFDv4FKGgIFEDogFGF4n//AjE/gFE/wFIg5lBJgYFBwBYCOIQREGwQFIHgQFCHgUH/1/AoUP/0/IQQFFj/8j5CCBIINBAoX4AoYhBAongJIKODAoZRBAomAj1/AoUAngFEgE+AQImCAoV+Ao88BAgFFvACBjwCBuBlCAQKDDAQKVCgOAgKzDAB4=")),l.x+(l.w/2)-(48*0.7/2)-8,l.y+(l.h/2)-(48*0.7/2),{scale:0.7})
}
Bangle.loadWidgets()
Bangle.drawWidgets()
var layout = new Layout( {
  type:"v", c: [
    {type:"h", c:[
      {type:"v", c:[
        {type:"custom", render:renderActive, id:"active", bgCol:g.theme.bg, fillx:1, filly:1},
        {type:"", pad:3 },
        {type:"txt", font:"9%", label:"Active", id:"date" },
      ]},
      {type:"custom", render:drawCalIconMeter, id:"active", bgCol:g.theme.bg, fillx:1, filly:1},

      
      
    ]},
    {type:"h", c:[
      {type:"v", pad:10,  c:[
        {type:"txt", font:"12%", label:"1328", id:"bmrCal" },
        {type:"txt", font:"7%", label:"BMR" },
      ]},
      {type:"v", pad:10,c:[
        {type:"txt", font:"12%", label:"3002", id:"totalCal" },
        {type:"txt", font:"7%", label:"Total" },
      ]},
      
      
      
    ]},
    {type:"", pad:2},
    {type:"h", c:[
        {type:"txt", font:"7%", label:"Since Midnight", id:"date",halign:-1,fillx:1 },
        
        {type:"txt", font:"7%", label:"1 of 2", id:"date",halign:1,fillx:1 },
      
    ]},
    
  ]
}, {lazy:true});
layout.update(); // work out positions


// update the screen
function draw() {
  layout.bmrCal.label=calData.bmrCaloriesBurned;
  layout.totalCal.label=calData.totalCaloriesBurned;
  layout.render();
  
}

Bangle.on("calories",draw);

draw();
