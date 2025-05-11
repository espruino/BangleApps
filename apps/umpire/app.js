// settings and environment 
// (not checked again while running)
var settings = Object.assign({
  // default values
  ballsPerOver: 6,
  oversPerInnings: 40,
  ballStepLimit: 500,
  heartRateLimit: 80
}, require('Storage').readJSON("umpire.json", true) || {});
const ballsPerOver = settings.ballsPerOver;
const oversPerInnings = settings.oversPerInnings;
const ballStepLimit = settings.ballStepLimit;
const heartRateLimit = settings.heartRateLimit;
delete settings;
const timezoneOffsetHours = (new Date()).getTimezoneOffset() / 60;
const stepCountOffset = Bangle.getStepCount();
const ballToCome = '-';
const ballFaced =  '=';

// globals
var processing = true; //debounce to inhibit twist events
var wickets = 0;
var counter = 0;
var over = 0;
var ballTimes = [];
var overTimes = [];
var timeTimes = [];
var log = [];
var timeCalled = false;
var battery = E.getBattery();
var heartRate = '';
var heartRateEventSeconds = 0;
var HRM = false;
var lastSteps = stepCountOffset;

function toggleHRM() {
  if(HRM) {
    Bangle.setHRMPower(0);
    HRM = false;
    heartRate = '';
 } else {
    Bangle.setHRMPower(1);
    HRM = true;
  }
}

// process heart rate monitor event 
// each second (approx.)
function updateHeartRate(h) {
  heartRate = h.bpm || 0;
  //console.log("HRM", heartRate, (new Date()));
  if(heartRate >= heartRateLimit) {
    heartRateEventSeconds++;
    //console.log("Heart Over", heartRate, heartRateEventSeconds);
    if(heartRateEventSeconds==10) console.log("Heart Event", heartRate, heartRateEventSeconds);
  }
  if(heartRateEventSeconds>10) {
    if(heartRate < heartRateLimit) {
      console.log("Heart Under (+10s allowed)", heartRate, heartRateEventSeconds);
      heartRateEventSeconds = -10;
   }
  }
}

// write events to storage (csv, persistent) 
// and memory (can be truncated while running)
function addLog(timeSig, over, ball, matchEvent, metaData) {
  var steps = Bangle.getStepCount() - stepCountOffset;
  battery = E.getBattery();
  var csv = [
    formatTimeOfDay(timeSig),
    over, ball, 
    matchEvent, metaData, 
    steps, heartRate, battery
  ];
  file.write(csv.join(",")+"\n");
  console.log(csv);
  log.unshift({ // in rev. chrono. order
    time: formatTimeOfDay(timeSig),
    over: over,
    ball: ball,
    matchEvent: matchEvent,
    metaData: metaData,
    steps: steps,
    heartRate: heartRate,
    battery: battery
  });
}

// display log from memory (not csv)
function showLog() {
  processing = true;
  Bangle.setUI();
  return E.showScroller({
    h : 50, c : log.length,
  draw : (idx, r) => {
    g.setBgColor((idx&1)?"#000":"#112").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
    if(log[idx].matchEvent==/*LANG*/"Over Duration"
      || log[idx].matchEvent==/*LANG*/"Innings Duration"){
      g.setFont("Vector", 22).drawString(
      log[idx].matchEvent,r.x+6,r.y+2);
    } else {
      g.setFont("Vector", 22).drawString(
      log[idx].over + "." +
      log[idx].ball + " " +
      log[idx].matchEvent,r.x+6,r.y+2);
    }
    g.setFont("Vector", 18).drawString(
    log[idx].time + " " +
    log[idx].metaData + " " +
    log[idx].heartRate,r.x+6,r.y+27);
  },
  select : (idx) => {
    resumeGame();
  }
  });
}

// format date (diff) as duration
function formatDuration(timeDate) { 
  return (timeDate.getHours() + timezoneOffsetHours) + ":" + timeDate.getMinutes().toString().padStart(2, "0") + ":" + timeDate.getSeconds().toString().padStart(2, "0") + "";
}

// format date as clock
function formatTimeOfDay(timeSig) { 
  return timeSig.getHours() + ":" + timeSig.getMinutes().toString().padStart(2, "0");
}

// main ball counter logic
function countDown(dir) {
  processing = true;
  counter += dir;
  if(counter<0) counter=0;

  var timeSig = new Date();
  var lastBallTime = timeSig.getTime();
  if(ballTimes.length>0) {
    lastBallTime = ballTimes[ballTimes.length - 1];
  } else if(overTimes.length>0) {
    lastBallTime = overTimes[overTimes.length - 1];
  }
  
  var deadDuration = new Date(timeSig.getTime() - lastBallTime);
  //console.log(deadDuration);
  if(dir!=0) {
    if(timeCalled) {
      //console.log("Play after Time");
      timeCalled = false;
      var lastTimeTime = timeTimes[timeTimes.length - 1];
      var timeDuration = new Date(timeSig.getTime() - lastTimeTime);
      addLog(timeSig, over, counter, "Play", /*LANG*/"Lost: " + formatDuration(timeDuration));    
    }
    if(counter>0) ballTimes.push(timeSig.getTime());
    Bangle.setLCDPower(1);
    if(dir>0) {
      addLog(timeSig, over, counter, "Ball", formatDuration(deadDuration));
    } else {
      addLog(timeSig, over, counter, /*LANG*/"Correction", formatDuration(deadDuration));
    }
    if(counter == ballsPerOver - 2) {
      Bangle.buzz(400).then(()=>{
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
      var firstOverTime = overTimes[0];
      var matchDuration = new Date(timeSig.getTime() - firstOverTime);
      var matchMinutesString = formatDuration(matchDuration);
    
      var lastOverTime = overTimes[overTimes.length - 1];
      var overDuration = new Date(timeSig.getTime() - lastOverTime);
      var overMinutesString = formatDuration(overDuration) + "";
    
      addLog(timeSig, over, counter, /*LANG*/"Over Duration", overMinutesString);
      addLog(timeSig, over, counter, /*LANG*/"Innings Duration", matchMinutesString);

      //console.log(overTimes)
      // start new over
      overTimes.push(timeSig.getTime());
      over += 1;
      counter = 0; 
      ballTimes = [];
    }
  }
  
    g.clear(1); // clear screen and reset graphics state
    g.setFontAlign(1,0);
    g.setFont("Vector",26); // vector font, 80px
    g.drawString(wickets, 162, 14);
    g.setFont("Vector",12);
    g.drawString('\¦\¦\¦', 173, 15);
    g.setFontAlign(-1,0);
    g.setFont("Vector",16); // vector font, 80px
    var heartRateString = heartRate + '.';
    if(heartRate==0) heartRateString = '';
    g.drawString(battery + '% ' + heartRateString, 3, 9);
    g.setFontAlign(0,0);
    g.setFont("Vector",48); // vector font, 80px
    g.drawString(formatTimeOfDay(timeSig), g.getWidth()/1.89, 55);
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
    // start app
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
          console.log("Twist", heartRate, battery);
          countDown(0);
        }
      });
      Bangle.on('HRM', function(h) {updateHeartRate(h);});
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
  E.showPrompt(/*LANG*/"Amend wickets by " + inc + "?").then(function(confirmed) {
    if (confirmed) {
      Bangle.buzz();
      wickets += inc;
      var timeSig = new Date();
      if(inc>0) {
        countDown(1);
        addLog(timeSig, over, counter, "Wicket", "Wickets: " + wickets);
      } else {
        addLog(timeSig, over, counter, /*LANG*/"Recall Batter", "Wickets: " + wickets);
      }
      resumeGame();
    } else {
      E.showPrompt();
      Bangle.buzz();
      menu = showMainMenu();
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
    if(wickets>0) scrollMenuItems.push(/*LANG*/"Recall");
    scrollMenuItems.push("Call Time");
    scrollMenuItems.push("New Inn.");
    if(!HRM) scrollMenuItems.push("Start HRM");
  }
  if(HRM) scrollMenuItems.push("Stop HRM");

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
    if(scrollMenuItems[idx]==/*LANG*/"Recall") incrementWickets(-1);
    if(scrollMenuItems[idx]=="New Inn.") {
      newInnings();
      menu = showMainMenu();
    }
    if(scrollMenuItems[idx]=="Start HRM"
      || scrollMenuItems[idx]=="Stop HRM") {
      toggleHRM();
      resumeGame();
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
