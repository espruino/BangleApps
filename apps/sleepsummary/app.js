var Layout = require("Layout");
var sleepScore = require("sleepsummary").getSleepScores().overallScore;

// Convert unix timestamp (s or ms) → HH:MM
function unixToTime(ts) {
  if (ts < 1e12) ts *= 1000; // seconds → ms
  let d = new Date(ts);
  return d.getHours() + ":" + ("0"+d.getMinutes()).slice(-2);
}

// Custom renderer for the battery bar
function drawGraph(l) {
  let w = 160;
  g.setColor(g.theme.fg);
  g.drawRect(l.x, l.y, l.x+w, l.y+10); // outline
  g.setColor("#00F")
  if(g.theme.dark)g.setColor("#0F0");
  g.fillRect(l.x, l.y, l.x+(sleepScore*1.65), l.y+10); // fill
}

// Layout definition
var pageLayout = new Layout({
  type: "v", c: [
    {type:"txt",filly:0, label:"Sleep Summary", font:"Vector:17", halign:0, id:"title",height:17,pad:3},
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
              {type:"txt", label:"Wake Up:", font:"8%",halign:1},
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
  battery = E.getBattery();
  pageLayout.sleepScore.label = "Sleep score: "+sleepScore;
  pageLayout.render();
}

// Setup custom back handler
Bangle.setUI({
  mode: "custom",
  back: ()=>load()
});

// Initial draw
g.clear();
draw();

Bangle.loadWidgets();
Bangle.drawWidgets();
