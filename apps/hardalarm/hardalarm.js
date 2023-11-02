// Chances are boot0.js got run already and scheduled *another*
// 'load(hardalarm.js)' - so let's remove it first!
clearInterval();

var okClicked = false;

function formatTime(t) {
  var hrs = 0|t;
  var mins = Math.round((t-hrs)*60);
  return hrs+":"+("0"+mins).substr(-2);
}

function getCurrentHr() {
  var time = new Date();
  return time.getHours()+(time.getMinutes()/60)+(time.getSeconds()/3600);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomFromRange(lowerRangeMin, lowerRangeMax, higherRangeMin, higherRangeMax) {
  var lowerRange = lowerRangeMax - lowerRangeMin;
  var higherRange = higherRangeMax - higherRangeMin;
  var fullRange = lowerRange + higherRange;
  var randomNum = getRandomInt(fullRange);
  if(randomNum <= (lowerRangeMax - lowerRangeMin)) {
    return randomNum + lowerRangeMin;
  } else {
    return randomNum + (higherRangeMin - lowerRangeMax);
  }
}

function showNumberPicker(currentGuess, randomNum) {
  if(currentGuess == randomNum) {
    E.showMessage("" + currentGuess + "\n PRESS ENTER", "Get to " + randomNum);
  } else {
    E.showMessage("" + currentGuess, "Get to " + randomNum);
  }
}

function showPrompt(msg, buzzCount, alarm) {
  E.showPrompt(msg,{
    title:"STAY AWAKE!",
    buttons : {"Sleep":0,"Stop":1} // default is sleep so it'll come back in 10 mins
  }).then(function(choice) {
    buzzCount = 0;
    if (choice==0) {
      if(alarm.ohr===undefined) alarm.ohr = alarm.hr;
      alarm.hr += 10/60; // 10 minutes
      require("Storage").write("hardalarm.json",JSON.stringify(alarms));
      load();
    } else if(choice==1) {
      alarm.last = (new Date()).getDate();
      if (alarm.ohr!==undefined) {
          alarm.hr = alarm.ohr;
          delete alarm.ohr;
      }
      if (!alarm.rp) alarm.on = false;
      require("Storage").write("hardalarm.json",JSON.stringify(alarms));
      load();
    }
  });
}

function buzz() {
  Bangle.buzz(500).then(()=>{
    setTimeout(()=>{
      Bangle.buzz(500).then(function() {
        setTimeout(()=>{
          Bangle.buzz(2000).then(function() {
            if(!okClicked) {
              buzz();
            }
          });
        },100);
      });
    },100);
  });
}

function showAlarm(alarm) {
  if ((require('Storage').readJSON('setting.json',1)||{}).quiet>1) return; // total silence
  var msg = formatTime(alarm.hr);
  var buzzCount = 20;
  if (alarm.msg)
    msg += "\n"+alarm.msg;
  okClicked = false;
  var currentGuess = 10;
  var randomNum = getRandomFromRange(0, 7, 13, 20);
  showNumberPicker(currentGuess, randomNum)

  let onSwipe = (x, y) => {
    if (y == 1) {
      if(!okClicked && currentGuess < 20) {
        currentGuess = currentGuess + 1;
        showNumberPicker(currentGuess, randomNum);
      }
    }
    else if (y == -1) {
      if(!okClicked && currentGuess > 0) {
        currentGuess = currentGuess - 1;
        showNumberPicker(currentGuess, randomNum);
      }
    }
  };
  Bangle.on("swipe", onSwipe);


  setWatch(o => {
    if(currentGuess == randomNum) {
      okClicked = true;
      showPrompt(msg, buzzCount, alarm);
    }
  }, BTN, {repeat: true, edge: 'rising'});


  buzz();
}



// Check for alarms
var day = (new Date()).getDate();
var hr = getCurrentHr()+10000; // get current time - 10s in future to ensure we alarm if we've started the app a tad early
var alarms = require("Storage").readJSON("hardalarm.json",1)||[];
var active = alarms.filter(a=>a.on&&(a.hr<hr)&&(a.last!=day));
if (active.length) {
  // if there's an alarm, show it
  active = active.sort((a,b)=>a.hr-b.hr);
  showAlarm(active[0]);
} else {
  // otherwise just go back to default app
  setTimeout(load, 100);
}
