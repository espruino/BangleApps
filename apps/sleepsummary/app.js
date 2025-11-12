var Layout = require("Layout");
var data=require("sleepsummary").getSummaryData();
var score=data.overallSleepScore;
// Convert unix timestamp (s or ms) → HH:MM
function msToTimeStr(ms) {
  // convert ms → minutes
  let totalMins = Math.floor(ms / 60000);
  let h = Math.floor(totalMins / 60) % 24;  // hours in 0–23
  let m = totalMins % 60;                   // minutes
  let ampm = h >= 12 ? "p" : "a";

  // convert to 12-hour clock, where 0 → 12
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;

  // pad minutes
  let mm = m.toString().padStart(2, "0");

  return `${hour12}:${mm}${ampm}`;
}

function minsToTimeStr(mins) {
  let h = Math.floor(mins / 60) % 24; // hours 0–23
  let m = mins % 60;                  // minutes 0–59
  let mm = m.toString().padStart(2,"0");
  return `${h}:${mm}`;
}



// Custom renderer for the score bar
function drawGraph(l) {
  let w = 160;
  let pad=3;
  
  g.setColor(g.theme.fg);
  g.fillRect({x:l.x, y:l.y, w:w, h:12,r:1000}); //bg
  g.setColor("#808080")
  g.fillRect({x:l.x+pad, y:l.y+pad, w:(w-(2*pad)), h:12-(pad*2),r:10000}); 
  g.setColor("#0F0");
  if(score<75)g.setColor("#FF0");
  if(score<60)g.setColor("#FF8000");
  if(score<40)g.setColor("#F00")
  g.fillRect({x:l.x+pad, y:l.y+pad, w:score*((w-(2*pad))/100), h:12-(pad*2),r:10000}); 
}

// Layout definition
var pageLayout = new Layout({
  type: "v", c: [
    {type:undefined, height:7}, // spacer
    {type:"txt"  ,filly:0, label:"Sleep Summary", font:"Vector:17", halign:0, id:"title",height:17,pad:3},
    {
      type:"v", c: [
        {type:"txt", label:"Sleep Score: --", font:"8%", pad:5, id:"sleepScore"},
        {type:"custom", render:drawGraph, height:15, width:165, id:"scoreBar"},
        
        {type:undefined, height:4}, // spacer
        {type:"txt", label:"Time Stats", font:"9%"},
        {type:"h", c:[
          {  
            type:"v", pad:3, c:[
              {type:"txt", label:"", font:"9%",halign:1,pad:4},
              {type:"txt", label:"Wk Up:", font:"8%",halign:1},
              {type:"txt", label:"Sleep:", font:"8%",halign:1},
            ]
          },
          {  
            type:"v", pad:3, c:[
              {type:"txt", label:"Today", font:"9%",pad:4},
              {type:"txt", label:"3:40a", font:"8%", id:"todayWakeupTime"},
              {type:"txt", label:"7:40", font:"8%", id:"todaySleepTime"},
            ]
          },
          {  
            type:"v", pad:3, c:[
              {type:"txt", label:"Avg", font:"9%",pad:4},
              {type:"txt", label:"6:33a", font:"8%", id:"avgWakeupTime"},
              {type:"txt", label:"7:54", font:"8%", id:"avgSleepTime"},
            ]
          }
        ]}
      ]
    }
    
  ]
}, {lazy:true});

// Update function
function draw() {
  pageLayout.sleepScore.label = "Sleep score: "+score;
  pageLayout.todayWakeupTime.label = msToTimeStr(data.wakeUpTime);
  pageLayout.avgWakeupTime.label = msToTimeStr(data.avgWakeUpTime);
  pageLayout.todaySleepTime.label = minsToTimeStr(data.sleepDuration);
  pageLayout.avgSleepTime.label = minsToTimeStr(data.avgSleepTime);
  pageLayout.render();
}


// Initial draw
g.clear();
setTimeout(draw,200);


// We want this app to behave like a clock:
// i.e. show launcher when middle button pressed
Bangle.setUI("clock");
// But the app is not actually a clock
// This matters for widgets that hide themselves for clocks, like widclk or widclose
delete Bangle.CLOCK;

Bangle.loadWidgets();
Bangle.drawWidgets();
