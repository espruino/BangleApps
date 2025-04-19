var wickets = 0
var counter = 0;
var over = 0;
var ballTimes = [];
var overTimes = [];
var gameState = "Ready...";
var countdownDebounce = false;

function addLog(timeSig, over, ball, matchEvent, metaData) {
  // The fields we want to put in out CSV file
  var csv = [
    formatTimeOfDay(timeSig),
    over, ball, 
    matchEvent, metaData
  ];
  // Write data here
  file.write(csv.join(",")+"\n");
  console.log(csv);
}
 
function formatDuration(timeDate) { 
  return (timeDate.getHours()-1) + ":" + timeDate.getMinutes().toString().padStart(2, "0") + ":" + timeDate.getSeconds().toString().padStart(2, "0") + "";
}

function formatTimeOfDay(timeSig) { return timeSig.getHours() + ":" + timeSig.getMinutes().toString().padStart(2, "0");}


function countDown(dir) {
  if(countdownDebounce!=true) {
  countdownDebounce = true;
  counter += dir;
  if(counter<0) counter=0;

  var timeSig = new Date();
  var lastBallTime = timeSig.getTime();
  if(ballTimes.length>0) {
    lastBallTime = ballTimes[ballTimes.length - 1];
    //console.log("Last ball time");
  } else if(overTimes.length>0) {
    lastBallTime = overTimes[overTimes.length - 1];
    //console.log("Last over time");
  }
  
  var deadDuration = new Date(timeSig.getTime() - lastBallTime);
  //console.log(deadDuration);
  if(dir!=0) {
    if(counter>0) ballTimes.push(timeSig.getTime());
    Bangle.setLCDPower(1);
  if(dir>0) {
    addLog(timeSig, over, counter, "Ball", formatDuration(deadDuration));
  } else {
    addLog(timeSig, over, counter, "Correction", formatDuration(deadDuration));
  }
    if(counter==4) {
      Bangle.buzz().then(()=>{
        return new Promise(resolve=>setTimeout(resolve,500)); // wait 500ms
      }).then(()=>{
        return Bangle.buzz(500);
      })
    } else if(counter==5) {
      Bangle.buzz(800);
    } else {
      Bangle.buzz()
    }
  
  // Over
  if (counter>=6) {
    //Bangle.on('twist', function() { });
    overTimes.push(timeSig.getTime());
    var firstOverTime = overTimes[0];
    var matchDuration = new Date(timeSig.getTime() - firstOverTime);
    
    var matchMinutesString = formatDuration(matchDuration);
    
    var firstBallTime = ballTimes[0];
    var overDuration = new Date(timeSig.getTime() - firstBallTime);
    
    var overMinutesString = formatDuration(overDuration) + "";
    
    addLog(timeSig, over, counter, "Over Duration", overMinutesString);
    addLog(timeSig, over, counter, "Innings Duration", matchMinutesString);

    //console.log(overTimes);

    //E.showMessage(overMinutesString + "\n" + matchMinutesString, "END OF OVER");

    g.clear(1); // clear screen and reset graphics state
    g.setFontAlign(0,0); // center font
    g.setFont("Vector",48); 
    g.drawString(formatTimeOfDay(timeSig), g.getWidth()/1.89, g.getHeight()/3.5);
    g.setFont("Vector",24);
    g.drawString(over + " " + overMinutesString + "\nI " + matchMinutesString, g.getWidth()/1.89, g.getHeight()/1.4);

    // Now buzz
    Bangle.buzz();

    Bangle.setUI({
      mode : "custom",
      swipe : (directionLR, directionUD)=>{
        if(!directionUD) {
          Bangle.setUI();
          startOver();
        }
      },
      btn : ()=>{
        // remove old button press handler
        Bangle.setUI();
        startOver();
      }
    });
    countdownDebounce = false;
    return;
  }
  }
  if(counter<6) {
  g.clear(1); // clear screen and reset graphics state
  g.setFont("Vector",24); // vector font, 80px
  g.drawString(wickets, 158, 10);
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",48); // vector font, 80px
  g.drawString(formatTimeOfDay(timeSig), g.getWidth()/1.89, 50);
  g.setFont("Vector",80); // vector font, 80px
  g.drawString(over + "." + counter, g.getWidth()/1.89, 120);
  g.setFont("Vector",18);
  g.drawString("..." + formatDuration(deadDuration), g.getWidth()/1.89, 166);
  }
  countdownDebounce = false;
  }
}

function startOver(resume) {
  Bangle.setUI({
      mode : "custom",
      swipe : (directionLR, directionUD)=>{
        if (!directionUD) { 
          Bangle.setUI();
          countdownDebounce = true;
          E.showMenu(menuItems);
        } else {
          countDown(-directionUD);
        }
      },
      btn : ()=>{
        countDown(1);
      }
    });
  var timeSig = new Date();
  if(resume!=true) {
    if(over==0) {
      overTimes.push(timeSig.getTime());
      Bangle.on('twist', function() { 
        console.log("twist");
        countDown(0);
      });
    }
    over += 1;
    counter = 0;
    ballTimes = [];
    addLog(timeSig, over, counter, "New Over", "");    
    
  }
  countDown(0);
}

function resumeGame() {
  Bangle.buzz();
  menu = E.showMenu();
  countdownDebounce = false;
  if(over==0) {
    startOver();
  } else {
    startOver(true);
  }
}

function incrementWickets(inc) {
  E.showPrompt("Wicket?").then(function(confirmed) {
    if (confirmed) {
      E.showPrompt();
      Bangle.buzz();
      wickets += inc;
      var timeSig = new Date();
      addLog(timeSig, over, counter, "Wicket", wickets);
      resumeGame();
    } else {
      E.showPrompt();
      Bangle.buzz();
      console.log("Load menu");
      menu = E.showMenu(menuItems);
    }
  });
}
// Create the file in append mode
var file = require("Storage").open("matchlog.csv","a");

var timeSig = new Date();
addLog(timeSig, "-", "-", "App Started", timeSig);

var menuItems = {
  "":{title:"Umpire"},
  "Play" : ()=>resumeGame(),
  "-->" : ()=>resumeGame(),
  "Wicket" : ()=>incrementWickets(1),
  "-->" : ()=>incrementWickets(1),
  "Set wickets" : {
    value : wickets,
    min:0,max:10,step:1,wrap:true,
    onchange : v => { incrementWickets(v - wickets); }
  }
};
countdownDebounce = true;
//var menu = E.showMenu(menuItems);

var scrollMenuItems =[
  "Play", "Wicket"
];
var scroller = {
  h : 60, c : 2,
  draw : (idx, r) => {
    g.setBgColor((idx&1)?"#000":"#121").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
    g.setFont("Vector", 36).drawString(scrollMenuItems[idx],r.x+10,r.y+12);
  },
  select : (idx) => {
    console.log("You selected ", scrollMenuItems[idx]);
    if(idx==0) resumeGame();
  }
}
var scrollMenu = E.showScroller(scroller);
