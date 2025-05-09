var settings = Object.assign({
  // default values
  ballsPerOver: 6,
  oversPerInnings: 20
}, require('Storage').readJSON("umpire.json", true) || {});

var processing = true; //debounce to inhibit twist events
var wickets = 0;
var counter = 0;
var over = 0;
var ballsPerOver = settings.ballsPerOver;
var oversPerInnings = settings.oversPerInnings;
var ballTimes = [];
var overTimes = [];
var timeTimes = [];
var log = [];
var tossIndex = 0; // default to Cancel until recorded
var tossTimeString = "";
var timeCalled = false;
var ballToCome = '-';
var ballFaced =  '=';

function addLog(timeSig, over, ball, matchEvent, metaData) {
  var csv = [
    formatTimeOfDay(timeSig),
    over, ball, 
    matchEvent, metaData
  ];
  file.write(csv.join(",")+"\n");
  console.log(csv);
  log.unshift({ // in rev. chrono. order
    time: formatTimeOfDay(timeSig),
    over: over,
    ball: ball,
    matchEvent: matchEvent,
    metaData: metaData
  });
}

function showLog() {
  processing = true;
  Bangle.setUI();
  return E.showScroller({
    h : 50, c : log.length,
  draw : (idx, r) => {
    g.setBgColor((idx&1)?"#000":"#112").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
    if(log[idx].matchEvent=="Over Duration"
      || log[idx].matchEvent=="Innings Duration"
      || log[idx].matchEvent=="Toss"
      || log[idx].matchEvent=="Date"){
      g.setFont("Vector", 22).drawString(
      log[idx].matchEvent,r.x+6,r.y+2);
      g.setFont("Vector", 18).drawString(
      log[idx].time + " " +
      log[idx].metaData,r.x+6,r.y+27);
    } else {
      g.setFont("Vector", 22).drawString(
      log[idx].over + "." +
      log[idx].ball + " " +
      log[idx].matchEvent,r.x+6,r.y+2);
      g.setFont("Vector", 18).drawString(
      log[idx].time + " " +
      log[idx].metaData,r.x+6,r.y+27);
    }
  },
  select : (idx) => {
    resumeGame();
  }
  });
}

function formatDuration(timeDate) { 
  return (timeDate.getHours()-1) + ":" + timeDate.getMinutes().toString().padStart(2, "0") + ":" + timeDate.getSeconds().toString().padStart(2, "0") + "";
}

function formatTimeOfDay(timeSig) { return timeSig.getHours() + ":" + timeSig.getMinutes().toString().padStart(2, "0");}


function countDown(dir) {
  processing = true;
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
    if(timeCalled) {
      console.log("Play after Time");
      timeCalled = false;
      var lastTimeTime = timeTimes[timeTimes.length - 1];
      var timeDuration = new Date(timeSig.getTime() - lastTimeTime);
      addLog(timeSig, over, counter, "Play", "Lost: " + formatDuration(timeDuration));    
    }
    if(counter>0) ballTimes.push(timeSig.getTime());
    Bangle.setLCDPower(1);
    if(dir>0) {
      addLog(timeSig, over, counter, "Ball", formatDuration(deadDuration));
    } else {
      addLog(timeSig, over, counter, "Correction", formatDuration(deadDuration));
    }
    if(counter == ballsPerOver - 2) {
      Bangle.buzz().then(()=>{
        return new Promise(resolve=>setTimeout(resolve,500)); // wait 500ms
      }).then(()=>{
        return Bangle.buzz(500);
      })
    } else if(counter == ballsPerOver - 1) {
      Bangle.buzz(800);
    } else {
      Bangle.buzz()
    }
  
    // Over
    if (counter == ballsPerOver) {
      overTimes.push(timeSig.getTime());
      var firstOverTime = overTimes[0];
      var matchDuration = new Date(timeSig.getTime() - firstOverTime);
      var matchMinutesString = formatDuration(matchDuration);
    
      var firstBallTime = ballTimes[0];
      var overDuration = new Date(timeSig.getTime() - firstBallTime);
      var overMinutesString = formatDuration(overDuration) + "";
    
      addLog(timeSig, over, counter, "Over Duration", overMinutesString);
      addLog(timeSig, over, counter, "Innings Duration", matchMinutesString);

      //console.log(overTimes)
      // start new over
      over += 1;
      counter = 0; 
      ballTimes = [];
    }
  }
  
    g.clear(1); // clear screen and reset graphics state
    g.setFont("Vector",24); // vector font, 80px
    g.drawString(wickets, 158, 10);
    g.setFontAlign(0,0); // center font
    g.setFont("Vector",48); // vector font, 80px
    g.drawString(formatTimeOfDay(timeSig), g.getWidth()/1.89, 50);
    g.setFont("Vector",80); // vector font, 80px
    var ballString = over + "." + counter;
    if(over > oversPerInnings) ballString = 'END';
    g.drawString(ballString, g.getWidth()/1.89, 120);
    g.setFont("Vector",18);
    var ballGraph = ballFaced.repeat(counter) + ballToCome.repeat(ballsPerOver-counter);
    if(timeCalled) ballGraph = '-TIME-';
    g.drawString(ballGraph + ' ' + formatDuration(deadDuration), g.getWidth()/1.89, 166);
  
  processing = false;
}

function startPlay(resume) {
  processing = true;
  Bangle.setUI({
      mode : "custom",
      swipe : (directionLR, directionUD)=>{
        if (directionLR==-1) { 
          processing = true;
          menu = showMainMenu();
        } else if (directionLR==1) { 
          processing = true;
          menu = showLog();
        } else if (directionUD==-1) { 
          processing = true;
          countDown(1);
        } else {
          processing = true;
          countDown(-1);
        }
      },
      btn : ()=>{
        processing = true;
        countDown(1);
      }
    });
  var timeSig = new Date();
  if(resume!=true) {
    // start new over
    over += 1;
    counter = 0; 
    ballTimes = [];
    if(over==1) { // set an inital time for camparison
      overTimes.push(timeSig.getTime());
      addLog(timeSig, over, counter, "Play", "");        
      // set up twist refresh once only
      Bangle.on('twist', function() { 
        if(!processing) {
          processing = true;
          console.log("Twist");
          countDown(0);
        }
      });
    } else {
      
    }
  }
  
  // whether resuming or new over, refresh UI
  countDown(0);
}

function resumeGame() {
  Bangle.buzz();
  if(over==0) {
    startPlay();
  } else {
    startPlay(true);
  }
}

function incrementWickets(inc) {
  processing = true;
  E.showPrompt("Amend wickets by " + inc + "?").then(function(confirmed) {
    if (confirmed) {
      Bangle.buzz();
      wickets += inc;
      var timeSig = new Date();
      if(inc>0) {
        countDown(1);
        addLog(timeSig, over, counter, "Wicket", "Wickets: " + wickets);
      } else {
        addLog(timeSig, over, counter, "Recall Batter", "Wickets: " + wickets);
      }
      resumeGame();
    } else {
      E.showPrompt();
      Bangle.buzz();
      menu = showMainMenu();
    }
  });
}

function showTossMenu() {
  processing = true;
  Bangle.setUI();
  var tossMenuItems = [
    "« Back",
    "Home Won: Bat",
    "Home Won: Bowl",
    "Away Won: Bat",
    "Away Won: Bowl"
  ];
  return E.showScroller({
    h : 40, c : tossMenuItems.length,
  draw : (idx, r) => {
    g.setBgColor((idx&1)?"#000":"#112").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
    if(idx==tossIndex) {
      g.setBgColor("#fff").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
      g.setBgColor("#000").clearRect(r.x+2,r.y+2,r.x+r.w-3,r.y+r.h-3);
      g.setFont("Vector", 16).drawString(tossTimeString,r.x+1,r.y+5);
      g.setFont("Vector", 16).drawString(tossMenuItems[idx],r.x+26,r.y+24);
    } else {
      g.setFont("Vector", 20).drawString(tossMenuItems[idx],r.x+6,r.y+10);
    }
  },
  select : (idx) => {
    console.log(tossMenuItems[idx]);
    if(tossMenuItems[idx]=="« Back") {
      menu = showMainMenu();
    } else {
      Bangle.buzz();
      tossIndex = idx;
      var timeSig = new Date();
      addLog(timeSig, "-", "-", "Toss", tossMenuItems[idx]);
      tossTimeString = formatTimeOfDay(timeSig);
      menu = showMainMenu();
    };
  }
  });
}

function showMainMenu() {
  processing = true;
  Bangle.setUI();
  var scrollMenuItems = [];
  if(over==0 || timeCalled) {
    scrollMenuItems.push("Call Play");
  }
  if(over>0 && !timeCalled) {
    scrollMenuItems.push("« Back", "Wicket");
    if(wickets>0) scrollMenuItems.push("Recall");
    scrollMenuItems.push("Call Time");
    scrollMenuItems.push("New Inn.");
  }

  return E.showScroller({
  h : 80, c : scrollMenuItems.length,
  draw : (idx, r) => {
    g.setBgColor((idx&1)?"#000":"#121").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
    g.setFont("Vector", 36).drawString(scrollMenuItems[idx],r.x+10,r.y+26);
  },
  select : (idx) => {
    console.log(scrollMenuItems[idx]);
    if(scrollMenuItems[idx]=="Call Time") {
      timeCalled = true;
      var timeSig = new Date();
      timeTimes.push(timeSig.getTime());
      addLog(timeSig, over, counter, "Time", "");        
      resumeGame();
    }
    if(scrollMenuItems[idx]=="Call Play"
      || scrollMenuItems[idx]=="« Back") resumeGame();
    if(scrollMenuItems[idx]=="Wicket") incrementWickets(1);
    if(scrollMenuItems[idx]=="Recall") incrementWickets(-1);
    if(scrollMenuItems[idx]=="New Inn.") {
      newInnings();
      menu = showMainMenu();
    }
  }
  });
}

// Start the app
var file = require("Storage").open("matchlog.csv","a");

function newInnings() {
  processing = true; //debounce to inhibit twist events
  wickets = 0;
  counter = 0;
  over = 0;
  ballTimes = [];
  overTimes = [];
  timeTimes = [];
  log = [];
  timeCalled = false;
  var timeSig = new Date();
  addLog(timeSig, oversPerInnings, ballsPerOver, "New Innings", timeSig.toUTCString());
}

newInnings();
var menu = showMainMenu();
