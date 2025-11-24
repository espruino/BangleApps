var Layout = require("Layout");
// Load data once when the app starts
var data = require("sleepsummary").getSummaryData();
var score = data.overallSleepScore; // The overall score used for the bar graph
var pageActive = 1; // Start on page 1
var txtInfo="";
// Convert milliseconds → 12-hour time string (H:MMa/p)
function msToTimeStr(ms) {
  ms = Math.round(ms);
  let totalMins = Math.floor(ms / 60000);
  let h = Math.floor(totalMins / 60) % 24;
  let m = totalMins % 60;
  let ampm = h >= 12 ? "p" : "a";

  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;

  let mm = m.toString().padStart(2, "0");

  return `${hour12}:${mm}${ampm}`;
}

// Convert total minutes → H:MM time duration string
function minsToTimeStr(mins) {
  mins = Math.round(mins);
  if (!mins || mins < 0) return "--:--";

  let h = Math.floor(mins / 60);
  let m = mins % 60;
  let mm = m.toString().padStart(2,"0");
  return `${h}:${mm}`;
}

// Custom renderer for the score bar
function drawGraph(l) {
  let w = 160;
  let pad=3;
  let currentScore = score; 
  
  g.setColor(g.theme.fg);
  g.fillRect({x:l.x, y:l.y, w:w, h:12,r:1000}); // Draw background container
  g.setColor("#808080");
  g.fillRect({x:l.x+pad, y:l.y+pad, w:(w-(2*pad)), h:12-(pad*2),r:10000}); 
  
  // Set color based on score (Green > Yellow > Orange > Red)
  g.setColor("#0F0");
  if(currentScore < 75) g.setColor("#FF0");
  if(currentScore < 60) g.setColor("#FF8000");
  if(currentScore < 40) g.setColor("#F00");
  
  // Draw the score bar fill
  g.fillRect({x:l.x+pad, y:l.y+pad, w:currentScore*((w-(2*pad))/100), h:12-(pad*2),r:10000}); 
}


if(data.avgWakeUpTime-data.wakeUpTime>20){
  txtInfo+="You woke up earlier than usual today";
}else if(data.avgWakeUpTime-data.wakeUpTime<-20){
  txtInfo+="You woke up later than usual today";
}else{
  txtInfo+="You woke up around the same time as usual today";
}
if(score>90){
  if(data.avgWakeUpTime-data.wakeUpTime<-20) txtInfo+=",and ";
  else txtInfo+=",but ";
  txtInfo+="Your sleep was likely to be restful and restorative"
}else if(score<60){
  if(data.avgWakeUpTime-data.wakeUpTime>20) txtInfo+=",and ";
  else txtInfo+=",but ";
    //difference in wakeup Time
  txtInfo+="Your sleep was not likely to be restful"
}else{

    //difference in wakeup Time
  txtInfo+=", and you likely had a moderately restorative sleep."
}



// Layout definition for Page 1 (Score)
var page1Layout = new Layout({
  type: "v",valign:1, c: [
    
    {
      type:"v", c: [
        {type:undefined, height:5},
        {type:"txt" ,filly:0, label:"Sleep Summary", font:"Vector:17", halign:0, id:"title",pad:3},
        // Display initial score value
        {type:"txt", label:`Sleep Score: ${score}%`, font:"9%", pad:5, id:"sleepScore"},
        {type:"custom", render:drawGraph, height:15, width:165, id:"scoreBar",pad:7},
        {type:undefined, height:37}, // spacer
        {type:"txt", label:txtInfo, font:"8%", pad:5, id:"infoTxt",wrap:true,width:g.getWidth()-10},
        {type:undefined, filly:1},
      ]
    }
  ]
});

// Layout definition for Page 2 (Stats)
var page2Layout = new Layout({
  type: "v", c: [
    {type:undefined, height:7}, // spacer
    {type:"txt" ,filly:0, label:"Time Stats", font:"Vector:17", halign:0, id:"title",height:14,pad:1},
    {
      type:"v", c: [
        {type:"h", c:[
          {  
            type:"v", pad:3, c:[
              {type:"txt", label:"", font:"8%",halign:1,pad:4},
              {type:"txt", label:"Wk Up:", font:"8%",halign:1},
              {type:"txt", label:"Sleep:", font:"8%",halign:1},
            ]
          },
          {  
            type:"v", pad:3, c:[
              {type:"txt", label:"Today", font:"8%",pad:4},
              {type:"txt", label:"--:--", font:"8%", id:"todayWakeupTime"},
              {type:"txt", label:"--:--", font:"8%", id:"todaySleepTime"},
            ]
          },
          {  
            type:"v", pad:3, c:[
              {type:"txt", label:"Avg", font:"8%",pad:4},
              {type:"txt", label:"--:--", font:"8%", id:"avgWakeupTime"},
              {type:"txt", label:"--:--", font:"8%", id:"avgSleepTime"},
            ]
          }
        ]},
        {type:"txt" ,filly:0, label:"Scores", font:"Vector:17", halign:0, id:"title",height:17,pad:1},
       {type:"h", c:[
          {  
            type:"v", pad:2, c:[
              {type:"txt", label:"Wake Up:", font:"8%",halign:1},
              {type:"txt", label:"Deep Sleep:", font:"8%",halign:1},
              {type:"txt", label:"Duration:", font:"8%",halign:1}
            ]
          },
          {  
            type:"v", pad:2, c:[
              {type:"txt", label:"---", font:"8%",halign:1,id:"wkUpScore"},
              {type:"txt", label:"---", font:"8%",halign:1,id:"deepSleepScore"},
              {type:"txt", label:"---", font:"8%",halign:1,id:"durationScore"},
            ]  
        }]}
      ]
    }
  ]
});


    
    

    


function draw() {
  g.clear(); 
  Bangle.drawWidgets();

  if(pageActive==1){
    // Update the label and render Page 1
    page1Layout.sleepScore.label=`Sleep Score: ${score}`;
    page1Layout.infoTxt=txtInfo;
    
    page1Layout.render(); 
  }
  else{
    // Update all labels for Page 2
    page2Layout.todayWakeupTime.label = msToTimeStr(data.wakeUpTime || 0); 
    page2Layout.avgWakeupTime.label = msToTimeStr(data.avgWakeUpTime || 0);
    page2Layout.todaySleepTime.label = minsToTimeStr(data.sleepDuration || 0);
    
    page2Layout.avgSleepTime.label = minsToTimeStr(data.avgSleepTime || 0); 
    
    page2Layout.wkUpScore.label = data.wkUpSleepScore || "---";
    page2Layout.deepSleepScore.label = data.deepSleepScore || "---";
    page2Layout.durationScore.label = data.durationSleepScore || "---";
    
    page2Layout.render(); 
  }
}

Bangle.on('swipe', (direction) => {
  // direction == -1 is usually swipe right (next page)
  if (direction == -1) { 
    if(pageActive!=2){
      Bangle.buzz(40);
      pageActive=2;
      draw();
    }
  // direction == 1 is usually swipe left (previous page)
  } else if (direction == 1) { 
    if(pageActive!=1){
      Bangle.buzz(40);
      pageActive=1;
      draw();
    }
  }
});

// Initial draw, wrapped in a timeout
setTimeout(draw,200);


// Set up the app to behave like a clock
Bangle.setUI("clock");
delete Bangle.CLOCK; 

Bangle.loadWidgets();
