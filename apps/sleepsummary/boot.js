{
  let getMsPastMidnight=function(unixTimestamp) {
    
    const dateObject = new Date(unixTimestamp);

    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    const seconds = dateObject.getSeconds();
    const milliseconds = dateObject.getMilliseconds();

    const msPastMidnight = (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
    return msPastMidnight;
  };
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


  function logNow(msg) {
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
      ("0"+d.getSeconds()).slice(-2)+", MSG: "+msg;

    // push new entry
    log.push(timeStr);

    // keep file from growing forever
    if (log.length > 200) log = log.slice(-200);

    // save back
    storage.writeJSON(filename, log);
  }
  
  let showSummary=function(){
    logNow("shown")
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
  
  
  function checkIfAwake(data,thisTriggerEntry){
    
    logNow("checked, prev status: "+data.prevStatus+", current status: "+data.status+", promptLastShownDay: "+require("sleepsummary").getSummaryData().promptLastShownDay);
    
    let today = new Date().getDay();
    if(require("sleepsummary").getSummaryData().promptLastShownDay!=today){
      //if coming from sleep
      if (data.status==2&&(data.previousStatus==3||data.previousStatus==4)) {
        var settings=require("sleepsummary").getSettings();

        //woke up
        if(settings.showMessage){
          setTimeout(showSummary,settings.messageDelay)
        }
        
        require("sleepsummary").recordData();
      }
      
    }
  }
  
  //Force-load module
  require("sleeplog");

  // first ensure that the sleeplog trigger object is available (sleeplog is enabled)
  if (typeof (global.sleeplog || {}).trigger === "object") {
    // then add your parameters with the function to call as object into the trigger object
    sleeplog.trigger["sleepsummary"] = {
      onChange: true,   // false as default, if true call fn only on a status change
      from: 0,           // 0 as default, in ms, first time fn will be called
      to: 24*60*60*1000, // 24h as default, in ms, last time fn will be called
        // reference time to from & to is rounded to full minutes
      fn: function(data, thisTriggerEntry) { 
      
        checkIfAwake(data,thisTriggerEntry);
      
      
      
      } // function to be executed
    };
  }
  
}
