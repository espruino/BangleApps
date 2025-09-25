{
  function formatTime(hours) {
    let h = Math.floor(hours);             // whole hours
    let m = Math.round((hours - h) * 60);  // leftover minutes

    // handle rounding like 1.9999 → 2h 0m
    if (m === 60) {
      h += 1;
      m = 0;
    }

    if (h > 0 && m > 0) return h + "h " + m + "m";
    if (h > 0) return h + "h";
    return m + "m";
  }


  function logNow() {
    let filename="sleepsummarylog.json";
    let storage = require("Storage");

    // load existing log (or empty array if file doesn't exist)
    let log = storage.readJSON(filename,1) || [];

    // get human-readable time
    let d = new Date();
    let timeStr = d.getFullYear() + "-" +
      ("0"+(d.getMonth()+1)).slice(-2) + "-" +
      ("0"+d.getDate()).slice(-2) + " " +
      ("0"+d.getHours()).slice(-2) + ":" +
      ("0"+d.getMinutes()).slice(-2) + ":" +
      ("0"+d.getSeconds()).slice(-2);

    // push new entry
    log.push(timeStr);

    // keep file from growing forever
    if (log.length > 200) log = log.slice(-200);

    // save back
    storage.writeJSON(filename, log);
  }
  
  let showSummary=function(){
    var sleepData=require("sleepsummary").getSleepData();
    var sleepScore=require("sleepsummary").getSleepScores().overallSleepScore;
    //sleepData.consecSleep
    var message="You slept for "+ formatTime(sleepData.consecSleep/60) +", with a sleep score of "+sleepScore;

    E.showPrompt(message, {
        title: "Good Morning!",
        buttons: { "Dismiss": 1, "Open App":2},

    }).then(function (answer) {
        if(answer==1){
          Bangle.load();
        }else{
          load("sleepsummary.app.js");
        }
    });
  }
  
  function checkIfAwake(){
    let today = new Date().getDay();
    if(require("sleepsummary").getSummaryData().promptLastShownDay!=today){
      var settings=getSettings();
      var awakeSince=global.sleeplog.info.awakeSince;
      if(awakeSince+settings.timeSinceAwake<Date.now()&&awakeSince!=0){
        //show summary
        if(settings.showMessage) showSummary();
        
        logNow()
        require("sleepsummary").recordData();
      }
      
    }
  }

  let getSettings=function() {
    return Object.assign({
      useTrueSleep:true,
      timeSinceAwake: 1800000,
      showMessage:true,
      deepSleepHours:5,
      idealSleepHours:10,

    }, require('Storage').readJSON("sleepsummary.settings.json", true) || {});
  };
  

  setInterval(checkIfAwake,1800000);
}
