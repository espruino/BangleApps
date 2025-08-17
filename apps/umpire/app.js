// settings and environment 
var settings = Object.assign({
  // default values
  ballsPerOver: 6,
  oversPerInnings: 40,
  heartRateLimit: 130
}, require('Storage').readJSON("umpire.json", true) || {});
const BALLS_PER_OVER = settings.ballsPerOver;
const OVERS_PER_INNINGS = settings.oversPerInnings;
const HEART_RATE_LIMIT = settings.heartRateLimit;
delete settings;
const TIMEZONE_OFFSET_HOURS = (new Date()).getTimezoneOffset() / 60;
const STEP_COUNT_OFFSET = Bangle.getStepCount();
const BALL_TO_COME_CHAR = '-';
const BALL_FACED_CHAR = '=';

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
var batteryPercents = [];
var battery = 0;
var heartRate = '';
var heartRateEventSeconds = 0;
var HRM = false;

function toggleHRM() {
  if(HRM) {
    Bangle.setHRMPower(0);
    HRM = false;
    heartRateEventSeconds = 0;
    heartRate = '';
  } else {
    Bangle.setHRMPower(1);
    HRM = true;
  }
}

function getBattery() {
  // calculate last 10 moving average %
  batteryPercents.push(E.getBattery());
  if(batteryPercents.length > 10) batteryPercents.shift();
  return Math.round(batteryPercents.reduce((avg,e,i,arr)=>avg+e/arr.length,0));
}

// process heart rate monitor event 
// each second (approx.)
function updateHeartRate(h) {
  heartRate = h.bpm || 0;
  if(heartRate >= HEART_RATE_LIMIT) {
    heartRateEventSeconds++;
    if(heartRateEventSeconds==10) 
      addLog((new Date()), over, counter, 
        "Heart Rate", ">" + HEART_RATE_LIMIT);
  }
  if(heartRateEventSeconds > 10 
     && heartRate < HEART_RATE_LIMIT) 
      heartRateEventSeconds = -10;
}

// write events to storage (csv, persistent) 
// and memory (can be truncated while running)
function addLog(timeSig, over, ball, matchEvent, metaData) {
  var steps = Bangle.getStepCount() - STEP_COUNT_OFFSET;
  // write to storage
  var csv = [
    formatTimeOfDay(timeSig),
    over-1, ball, 
    matchEvent, metaData, 
    steps, battery, heartRate
  ];
  file.write(csv.join(",")+"\n");
  // write to memory
  log.unshift({ // in rev. chrono. order
    time: formatTimeOfDay(timeSig),
    over: over-1,
    ball: ball,
    matchEvent: matchEvent,
    metaData: metaData,
    steps: steps,
    battery: battery,
    heartRate: heartRate
  });
}

// display log from memory (not csv)
function showLog() {
  processing = true;
  Bangle.setUI();
  return E.showScroller({
    h: 50, c: log.length,
    draw: (idx, r) => {
      g.setBgColor((idx&1)?"#000":"#112").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
      if(log[idx].matchEvent==/*LANG*/"Over Duration"
        || log[idx].matchEvent==/*LANG*/"Innings Duration") {
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
    select: (idx) => {
      resumeGame();
    }
  });
}

// format date (diff) as duration
function formatDuration(timeDate) { 
  return (timeDate.getHours() + TIMEZONE_OFFSET_HOURS) + ":" 
    + timeDate.getMinutes().toString().padStart(2, "0") + ":" 
    + timeDate.getSeconds().toString().padStart(2, "0") + "";
}

// format date as clock
function formatTimeOfDay(timeSig) { 
  return timeSig.getHours() + ":" 
    + timeSig.getMinutes().toString().padStart(2, "0");
}

// main ball counter logic
// and in-play screen
function countDown(dir) {
  processing = true;
  battery = getBattery(); // refresh battery
  counter += dir;
  // suppress correction on first ball of innings
  if(over==1 && counter<0) {
    counter=0;
    processing = false;
    return;
  }
  // Suppress dir when play after time
  if(timeCalled)
    counter -= dir;
  // Correction to last ball of over
  if(counter<0) {
    counter = BALLS_PER_OVER -1;
    over -= 1;
    // use end of over time as last ball time
    ballTimes.push(overTimes.pop());
  }
  // create timestamp for log
  var timeSig = new Date();
  // calculate elapsed since last ball
  var lastBallTime = timeSig.getTime();
  if(ballTimes.length>0) {
    lastBallTime = ballTimes[ballTimes.length - 1];
  } else if(overTimes.length>0) {
    lastBallTime = overTimes[overTimes.length - 1];
  }
  var deadDuration = new Date(
    timeSig.getTime() - lastBallTime);
  // process new (dead) ball
  if(dir!=0) {
    // call play after time?
    if(timeCalled) {
      timeCalled = false;
      // resume heart rate monitoring
      if(HRM) Bangle.setHRMPower(1);
      // calculate time lost and log it
      var lastTimeTime = timeTimes[timeTimes.length - 1];
      var timeDuration = new Date(
        timeSig.getTime() - lastTimeTime);
      addLog(timeSig, over, counter, 
        "Play", /*LANG*/"Lost:" + formatDuration(timeDuration));    
    } else {
      if(counter>0) // reset elapsed time
        ballTimes.push(timeSig.getTime());
      Bangle.setLCDPower(1); //TODO need any more?
    
      if(dir>0) { // fairly delivered ball
        addLog(timeSig, over, counter, 
          "Ball", formatDuration(deadDuration));
      } else { // +1 ball still to come
        addLog(timeSig, over, counter, 
          /*LANG*/"Correction", formatDuration(deadDuration));
      }
    }
    // give haptic feedback
    if(counter == BALLS_PER_OVER - 2) {
      // buzz twice "2 to come"
      Bangle.buzz(400).then(()=>{
        return new Promise(
          resolve=>setTimeout(resolve,500));
      }).then(()=>{
        return Bangle.buzz(500);
      })
    } else if(counter == BALLS_PER_OVER - 1) {
      // long buzz "1 to come"
      Bangle.buzz(800);
    } else {
      // otherwise short buzz
      Bangle.buzz()
    }
    // Process end of over
    if (counter == BALLS_PER_OVER) {
      // calculate match time
      var matchDuration = new Date(
        timeSig.getTime() - overTimes[0]);
      var matchMinutesString = formatDuration(matchDuration);
      // calculate over time
      var overDuration = new Date(
        timeSig.getTime() - overTimes[overTimes.length - 1]);
      var overMinutesString = formatDuration(overDuration);  
      // log end of over
      addLog(timeSig, over + 1, 0, 
        /*LANG*/"Over Duration", overMinutesString);
      addLog(timeSig, over + 1, 0, 
        /*LANG*/"Innings Duration", matchMinutesString);
      overTimes.push(timeSig.getTime());
      // start new over
      over += 1;
      counter = 0; 
      ballTimes = [];
    }
  }
  // refresh in-play screen
  g.clear(1);
  // draw wickets fallen (top-right)
  g.setFontAlign(1,0);
  g.setFont("Vector",26).
   drawString(wickets, 162, 14, true);
  g.setFont("Vector",12).
   drawString('\¦\¦\¦', 173, 15, true);
  // draw battery and heart rate (top-left)
  g.setFontAlign(-1,0);
  var heartRateString = 'HR:' + heartRate;
  if(heartRateEventSeconds <= 0) heartRateString = '';
  g.setFont("Vector",16).
    drawString(battery + '% ' + heartRateString, 5, 11, true);
  // draw clock (upper-centre)
  g.setFontAlign(0,0);
  g.setFont("Vector",48).
    drawString(formatTimeOfDay(timeSig), 93, 55, true);
  // draw over.ball (centre)
  var ballString = (over-1) + "." + counter;
  if(over > OVERS_PER_INNINGS) 
    ballString = 'END';
  g.setFont("Vector",80).
    drawString(ballString, 93, 120, true);
  // draw ball graph and elapsed time
  var ballGraph = 
    BALL_FACED_CHAR.repeat(counter) 
    + BALL_TO_COME_CHAR.repeat(BALLS_PER_OVER - counter);
  if(timeCalled) ballGraph = '-TIME-';
  g.setFont("Vector",18).drawString(
    ballGraph + ' ' + formatDuration(deadDuration), 93, 166, true);
  // return to wait for next input
  processing = false;
}

function resumeGame(play) {
  processing = true;
  Bangle.buzz();
  Bangle.setUI({
      mode: "custom",
      swipe: (directionLR, directionUD)=>{
        if (directionLR==-1) { 
          processing = true;
          showMainMenu();
        } else if (directionLR==1) { 
          processing = true;
          showLog();
        } else if (directionUD==-1) { 
          processing = true;
          countDown(1);
        } else {
          processing = true;
          countDown(-1);
        }
      },
      btn: ()=>{
        processing = true;
        countDown(1);
      }
    });
  if(over==0) { // at start of innings
    over += 1; // N.B. 1-based overs in code
    counter = 0; // balls
    ballTimes = [];
    // set an inital time for comparison  
    var timeSig = new Date();
    overTimes.push(timeSig.getTime());
    addLog(timeSig, over, counter, 
      "Play", "");        
  }
  // load in-play screen
  countDown(play? -1: 0);
}

function incrementWickets(inc) {
  processing = true;
  E.showPrompt(/*LANG*/"Amend wickets by " + inc + "?").
    then(function(confirmed) {
    if (confirmed) {
      Bangle.buzz();
      wickets += inc;
      var timeSig = new Date();
      if(inc>0) {
        countDown(1);
        addLog(timeSig, over, counter, 
          "Wicket", "Wickets: " + wickets);
      } else {
        addLog(timeSig, over, counter, 
          /*LANG*/"Recall Batter", "Wickets: " + wickets);
      }
      resumeGame();
    } else {
      E.showPrompt();
      showMainMenu();
    }
  });
}

function showMainMenu() {
  processing = true;
  Bangle.setUI();
  var scrollMenuItems = [];
  // add menu items
  if(over>0)
    scrollMenuItems.push("« Back");
  if(over==0 || timeCalled) 
    scrollMenuItems.push("Call Play");
  if(over>0 && !timeCalled) {
    scrollMenuItems.push("Wicket");
    if(wickets>0) 
      scrollMenuItems.push(/*LANG*/"Recall Batter");
    scrollMenuItems.push("Call Time");
    scrollMenuItems.push("New Innings");
    if(!HRM) 
      scrollMenuItems.push("Start HRM");
  }
  if(HRM) scrollMenuItems.push("Stop HRM");
  // show menu
  return E.showScroller({
    h: 80, c: scrollMenuItems.length,
    draw: (idx, r) => {
      g.setBgColor((idx&1)?"#000":"#121").clearRect(r.x,r.y,r.x+r.w-1,r.y+r.h-1);
      g.setFont("Vector", 30).drawString(scrollMenuItems[idx],r.x+10,r.y+28);
    },
    select: (idx) => {
      if(scrollMenuItems[idx]=="Call Time") {
        timeCalled = true;
        // power down HRM until play
        Bangle.setHRMPower(0);
        heartRateEventSeconds = 0;
        var timeSig = new Date();
        timeTimes.push(timeSig.getTime());
        addLog(timeSig, over, counter, 
               "Time", (HRM? "HRM Paused" : ""));        
        resumeGame();
      }
      if(scrollMenuItems[idx]=="Call Play") 
        resumeGame(timeCalled);
      if(scrollMenuItems[idx]=="« Back") 
        resumeGame();      
      if(scrollMenuItems[idx]=="Wicket") 
        incrementWickets(1);
      if(scrollMenuItems[idx]==/*LANG*/"Recall Batter") 
        incrementWickets(-1);
      if(scrollMenuItems[idx]=="New Innings") 
        newInnings();
      if(scrollMenuItems[idx]=="Start HRM"
        || scrollMenuItems[idx]=="Stop HRM") {
        toggleHRM();
        resumeGame();
      }
    }
  });
}

function newInnings() {
  var timeSig = new Date();
  if(over!=0) { // new innings
    E.showPrompt(/*LANG*/"Start next innings?").
      then(function(confirmed) {
      if (confirmed) {
        Bangle.buzz();
        processing = true; //debounce to inhibit twist events
        wickets = 0;
        counter = 0;
        over = 0;
        ballTimes = [];
        overTimes = [];
        timeTimes = [];
        log = [];
        timeCalled = false;
        addLog(timeSig, OVERS_PER_INNINGS + 1, BALLS_PER_OVER, 
          "New Innings", require("locale").date(new Date(), 1));
        resumeGame();
      } else {
        E.showPrompt();
        showMainMenu();
      }
    });
  } else { // resume innings or start app
    addLog(timeSig, OVERS_PER_INNINGS + 1, BALLS_PER_OVER, 
      "New Innings", require("locale").date(new Date(), 1));
  }
}
// initialise file in storage
var file = require("Storage").open("matchlog.csv","a");
// save state on exit TODO WIP
E.on("kill", function() {
  console.log("Umpire app closed at " + (over-1) + "." + counter);
});
// set up twist refresh once only 
Bangle.on('twist', function() { 
  if(!processing) {
    processing = true; // debounce
    countDown(0);
  }
});
// set up HRM listener once only
Bangle.on('HRM', function(h) {
  updateHeartRate(h)});
newInnings(); // prepare 1st innings
showMainMenu(); // ready to play
