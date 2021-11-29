/** 

Interval Timer

An app for the Bangle.js watch

*/

var Layout = require("Layout");

// Globals
var timerMode; // 'active' || 'rest'
var numSets = 1;
var activeTime = 20;
var restTime = 10;
var counter;
var setsRemaining;
var counterInterval;
var outOfTimeTimeout;
var timerIsPaused;
var timerLayout;

/** Called to initialize the timer layout */
function initTimerLayout() {
  timerLayout = new Layout( {
    type:"v", c: [
      {type:"txt", font:"40%", pad: 10, label:"00:00", id:"time" },
      {type:"txt", font:"6x8:2", label:"0", id:"set" }
      ]
    }, {btns: [
      {label: "Stop", cb: l => {
          if (timerIsPaused){
            timerIsPaused = false;
            resumeTimer();
          }
          else{
            timerIsPaused = true;
            pauseTimer(); 
          }
        }
      }
    ]
  });
}

/** Pauses the timer by clearing the counterInterval */
function pauseTimer() {
  if (counterInterval){
    clearTimeout(counterInterval);
    counterInterval = undefined;
  }
  // update layout to display "Paused"
  timerLayout.clear(timerLayout.time);
  timerLayout.time.label = "||";
  timerLayout.clear(timerLayout.set);
  timerLayout.set.label = "Paused";
  timerLayout.render();
}

/** Reumes the timer by setting the counterInterval again */
function resumeTimer() {
  if (!counterInterval){
    counterInterval = setInterval(countDown, 1000);
  }
  // display the timer values again.
  timerLayout.clear(timerLayout.time);
  timerLayout.time.label = counter;
  timerLayout.clear(timerLayout.set);
  timerLayout.set.label = `Sets: ${setsRemaining}`;
  timerLayout.render();
}

/** Display 'Done' view, called when all sets are completed */
function outOfTime() {
  var stopLayout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"30%", label:"Done!", id:"time" },
  ]
  }, {btns: [
    // menu button allows user to modify times and sets
    {label:"Menu", cb: l=> {
        if (outOfTimeTimeout){
          clearTimeout(outOfTimeTimeout);
          outOfTimeTimeout = undefined;
        }
        //stopLayout.remove();
        setup();
      }
    },
    // restart button runs timer again with the same settings
    {label:"Restart", cb: l=> {
      if (outOfTimeTimeout){
        clearTimeout(outOfTimeTimeout);
        outOfTimeTimeout = undefined;
      }
      //stopLayout.remove();
      timerMode = 'active';
      startTimer();
    }
  }
  ]});

  if (counterInterval) return;
  setsRemaining = numSets;
  g.clear();
  stopLayout.render();
  Bangle.buzz(500);
  Bangle.beep(200, 4000)
    .then(() => new Promise(resolve => setTimeout(resolve,200)))
    .then(() => Bangle.beep(200, 3000));
}

/** Function called by the counterInterval at each second.
  Updates the timer display values.
*/
function countDown() {
  // Out of time
  if (counter<=0) {
    if(timerMode === 'active'){
      timerMode = 'rest';
      startTimer();
      return;
    }
    else{
      --setsRemaining;
      if (setsRemaining === 0){
        clearInterval(counterInterval);
        counterInterval = undefined;
        //setWatch(startTimer, (process.env.HWVERSION==2) ? BTN1 : BTN2);
        outOfTime();
        return;
      }
      timerMode = 'active';
      startTimer();
      return;
    }
  }

  timerLayout.clear(timerLayout.time);
  timerLayout.time.label = counter;
  timerLayout.render();
  counter--;
}

/** Start the interval timer. */
function startTimer() {
  timerIsPaused = false;
  g.clear();
  if(timerMode === 'active'){
    counter = activeTime;
    timerLayout.time.col = '#f00';
  }
  else{
    counter = restTime;
    timerLayout.time.col = '#0f0';
  }

  timerLayout.clear(timerLayout.set);
  timerLayout.set.label = `Sets: ${setsRemaining}`;
  timerLayout.render();
  Bangle.buzz();
  countDown();
  if (!counterInterval){
    counterInterval = setInterval(countDown, 1000);
  }
}

/** Menu step in which user sets the number of sets to be performed. */
function setNumSets(){
  g.clear();
  var menuLayout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"6x8:2", label:"Number Sets", id:"title" },
    {type:"txt", font:"30%", pad: 20, label: numSets, id:"value" },
        {type:"btn", font:"6x8:2", label:"Back", cb: l => {
        setRestTime();
      }
    }
  ]
  }, {btns: [
      {label:"+", cb: l=> {
        incrementNumSets();
      }},
      {label:"Go", cb: l=> {
        setsRemaining = numSets;
        initTimerLayout();
        startTimer();
      }},
      {label:"-", cb: l=>{
        decrementNumSets();
      }}
  ]});
  menuLayout.render();

  const incrementNumSets = () => {
      ++numSets;
      menuLayout.clear(menuLayout.numSets);
      menuLayout.value.label = numSets;
      menuLayout.render();
  };

  const decrementNumSets = () => {
      if(numSets === 1){
        return; 
      }
      --numSets;
      menuLayout.clear(menuLayout.numSets);
      menuLayout.value.label = numSets;
      menuLayout.render();
  };
}

/** Menu step in which user sets the number of seconds of rest time for each set. */
function setRestTime(){
  g.clear();
  var menuLayout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"6x8:2", label:"Rest Time", id:"title" },
    {type:"txt", font:"30%", pad: 20, label: restTime, id:"value" },
    {type:"btn", font:"6x8:2", label:"Back", cb: l => {
        setActiveTime();
      }
    }
  ]
  }, {btns: [
      {label:"+", cb: l=> {
        incrementRestTime();
      }},
      {label:"OK", cb: l=>setNumSets()},
      {label:"-", cb: l=>{
        decrementRestTime();
      }}
  ]});
  menuLayout.render();

  const incrementRestTime = () => {
      restTime += 5;
      menuLayout.clear(menuLayout.restTime);
      menuLayout.value.label = restTime;
      menuLayout.render();
  };

  const decrementRestTime = () => {
      if(restTime === 0){
        return; 
      }
      restTime -= 5;
      menuLayout.clear(menuLayout.restTime);
      menuLayout.value.label = restTime;
      menuLayout.render();
  };
}

/** Menu step in which user sets the number of seconds of active time for each set. */
function setActiveTime(){
  g.clear();
  var menuLayout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"6x8:2", label:"Active Time", id:"title" },
    {type:"txt", font:"30%", pad: 20, label: activeTime, id:"value" }
  ]
  }, {btns: [
      {font:"20%", label:"+", fillx:1, cb: l=> {
        incrementActiveTime();
      }},
      {label:"OK", cb: l => setRestTime()},
      {type:"btn", font:"20%", label:"-", fillx:1, cb: l=> {
        decrementActiveTime();
      }
    }
  ]});
  menuLayout.render();

  const incrementActiveTime = () => {
      activeTime += 5;
      menuLayout.clear(menuLayout.activeTime);
      menuLayout.value.label = activeTime;
      menuLayout.render();
  };

  const decrementActiveTime = () => {
      if(activeTime === 0){
        return; 
      }
      activeTime -= 5;
      menuLayout.clear(menuLayout.activeTime);
      menuLayout.value.label = activeTime;
      menuLayout.render();
  };
}

/** Start the setup menu, walks through setting active time, rest time, and number of sets. */
function setup(){
  if (timerLayout){
    // remove timerLayout, otherwise it's pause button callback will still be registered
    timerLayout.remove(timerLayout);
    timerLayout = undefined;
  }
  Bangle.setUI(); // remove all existing input handlers
  timerMode = 'active';
  setActiveTime();
}

// this keeps the watch LCD lit up
Bangle.setLCDPower(1);
setup();