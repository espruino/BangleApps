var Layout = require("Layout");
g.clear();
var calData=global.calories;
var storedData=require("Storage").readJSON("calories.json",1);
var settings=require("Storage").readJSON("calories.settings.json",1)||{calGoal:500};
var goal=settings.calGoal;
var pageActive=1;
//0=total, 1=active,2=bmr
var dataOnDayDisp=0;
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

  // We draw the ring in chunks (steps) to keep it smooth
  let step = Math.PI / 8; 
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
function getDateStr(date){
  let locale = require("locale");
  let d = date; // Jan 6, 2020

  // locale.month(date, shorthand)
  let month = locale.month(d, true); 
  let day = d.getDate();
  let year = d.getFullYear();

  return `${month} ${day} ${year}`;
}
function drawCalIconMeter(l){
  var col="#f00";
  // Ensure goal is a positive, non-zero value to avoid division by zero / Infinity
  var safeGoal = (goal && goal > 0) ? goal : 1;
  var prog=calData.activeCaloriesBurned/safeGoal;
  if(prog>0.6)col="#FC6A03";
  if(prog>0.8)col="#ff0";
  if(prog>0.95)col="#0f0";
  drawRingMeter(l.x+(l.w/2)-8,l.y+(l.h/2),30,1,5,"#808080")
  drawRingMeter(l.x+(l.w/2)-8,l.y+(l.h/2),30,prog,5,col);
    g.drawImage(require("heatshrink").decompress(atob("mEw4MA///4H0CpsD+AFDh4FEj/gAoc/4AFDv4FKGgIFEDogFGF4n//AjE/gFE/wFIg5lBJgYFBwBYCOIQREGwQFIHgQFCHgUH/1/AoUP/0/IQQFFj/8j5CCBIINBAoX4AoYhBAongJIKODAoZRBAomAj1/AoUAngFEgE+AQImCAoV+Ao88BAgFFvACBjwCBuBlCAQKDDAQKVCgOAgKzDAB4=")),l.x+(l.w/2)-(48*0.7/2)-8,l.y+(l.h/2)-(48*0.7/2),{scale:0.7})
}
Bangle.loadWidgets()
Bangle.drawWidgets()

var pg1Layout = new Layout( {
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
pg1Layout.update(); // work out positions


var pg2Layout = new Layout( {
  type:"v", c: [
    {type:"",pad:4},
    {type:"txt", font:"9%", label:"Total Calories", id:"dataTitle",fillx:1 },
    {type:"h", id:"dayDisp",c:[
      {type:"v",pad:5, c:[
        {type:"txt", font:"7%", label:"--", id:"day1Ago" },
        {type:"txt", font:"10%", label:"---", id:"day1AgoVal",pad:2,fillx:1 },
      ]},
      {type:"v", pad:5,c:[
        {type:"txt", font:"7%", label:"--", id:"day2Ago" },
        {type:"txt", font:"10%", label:"---", id:"day2AgoVal",pad:2 ,fillx:1},
      ]},
      {type:"v",pad:5, c:[
        {type:"txt", font:"7%", label:"--", id:"day3Ago" },
        {type:"txt", font:"10%", label:"---", id:"day3AgoVal",pad:2,fillx:1 },
      ]},
    ]},
    {type:"h", c:[
      {type:"v",pad:5, c:[
        {type:"txt", font:"6.5%", label:"Most Active",pad:5},
        {type:"txt", font:"10%", label:"1320", id:"mostActiveVal"},
        {type:"txt", font:"7%", label:"Jan 6, 2021", id:"mostActiveDate",pad:5 },
      ]},
      {type:"v", pad:5,c:[
        {type:"txt", font:"6.5%", label:"Highest Total",pad:5},
        {type:"txt", font:"10%", label:"3234", id:"highestEverVal" },
        {type:"txt", font:"7%", label:"Feb 8, 2023", id:"highestEverDate",pad:5 },
      ]},
    ]},
    {type:"",filly:1},
    {type:"h", c:[
        {type:"txt", font:"7%", label:"Since Midnight", id:"ts",halign:-1,fillx:1 },
        
        {type:"txt", font:"7%", label:"2 of 2", id:"pg",halign:1,fillx:1 },
      
    ]},
    
  ]
}, {lazy:true});
pg2Layout.update(); // work out positions
function updateDayDisp(){
  const titles = ["Total Calories", "Active Calories", "BMR Calories"];
  pg2Layout.dataTitle.label = titles[dataOnDayDisp];

  for (let i = 0; i < 3; i++) {
    let day = storedData.prevData[i];
    let labelId = `day${i+1}AgoVal`;
    
    if (day) { // Check if the day actually exists in history
      if (dataOnDayDisp === 0) pg2Layout[labelId].label = Math.round(day.activeCals + day.bmrCals);
      if (dataOnDayDisp === 1) pg2Layout[labelId].label = Math.round(day.activeCals);
      if (dataOnDayDisp === 2) pg2Layout[labelId].label = Math.round(day.bmrCals);
    } else {
      pg2Layout[labelId].label = "---"; // Fallback if no history yet
    }
  }
}
function updateLabels(){
  var locale=require("locale");
  pg2Layout.day1Ago.label=locale.dow(new Date(Date.now() - (86400000*1)), 1);
  pg2Layout.day2Ago.label=locale.dow(new Date(Date.now() - (86400000*2)), 1);
  pg2Layout.day3Ago.label=locale.dow(new Date(Date.now() - (86400000*3)), 1);
  pg1Layout.bmrCal.label=calData.bmrCaloriesBurned;
  pg1Layout.totalCal.label=calData.totalCaloriesBurned;
  pg2Layout.mostActiveDate.label=storedData.mostActiveDay.date==undefined||storedData.mostActiveDay.date==0?
    "--- -- ----":getDateStr(new Date(storedData.mostActiveDay.date*1000));
  pg2Layout.highestEverDate.label=storedData.mostCalorieDay.date==undefined||storedData.mostCalorieDay.date==0?
    "--- -- ----":getDateStr(new Date(storedData.mostCalorieDay.date*1000));
  
  pg2Layout.mostActiveVal.label=storedData.mostActiveDay.cals||"---";
  pg2Layout.highestEverVal.label=storedData.mostCalorieDay.cals||"---";

  
}
updateDayDisp();
// update the screen
function draw() {
  g.clearRect(Bangle.appRect)
  if(pageActive==1){
    pg1Layout.forgetLazyState()
    pg1Layout.render();
  }
  else if(pageActive==2){
    pg2Layout.forgetLazyState()
    pg2Layout.render();
  }
  
}
Bangle.on('swipe', (direction) => {
  // direction == -1 is usually swipe right (next page)
  
  if (direction === -1) { 
    if(pageActive!=2){
      Bangle.buzz(40);
      pageActive=2;
      draw();
    }
  // direction == 1 is usually swipe left (previous page)
  } else if (direction === 1) { 
    if(pageActive!=1){
      Bangle.buzz(40);
      pageActive=1;
      draw();
    }
  }
  print("pg: "+pageActive)
  print("dir: "+direction)
});

Bangle.on('touch', function(button, xy) {
  if(pageActive===2){
     if(xy.y<pg2Layout.dayDisp.y+pg2Layout.dayDisp.h&&xy.y>pg2Layout.dayDisp.y){
       dataOnDayDisp=(dataOnDayDisp + 1) % 3
       print(dataOnDayDisp);
       Bangle.buzz(40)
       updateDayDisp();
       pg2Layout.render()
     }
  }
});


Bangle.on("calories",draw);

setTimeout(function(){
  updateLabels()
  draw()
},200)