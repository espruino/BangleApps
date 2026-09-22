var dataSaved = require("hrvtracking").getAllData()
let settings = require("Storage").readJSON("hrvtracking.settings.json",1)||{
    startTime:3*60, //minutes
    endTime:5*60, 
    enabled:true
  };
var d_startMins=settings.startTime;
var d_endMins=settings.endTime; // inclusive


function isTimestampToday(unixTimestamp) {
  const date = new Date(unixTimestamp);
  const today = new Date();
  
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
}



// hrv objects in the .hrv array NEEDS to be in order of most recent on top.

function checkForTime(){
  // Bangle.buzz(1000);
  if(global.__FILE__ == "hrvmeasure.app.js") return;
  let now = new Date();
  const currentMinute = (now.getHours() * 60) + now.getMinutes();

  
  // Triggers every time if between set times
  if ((currentMinute >= d_startMins && currentMinute <= d_endMins)&&settings.enabled==true) {

    load("hrvmeasure.app.js"); 
    return;
  }else if (currentMinute > d_endMins){
    let shouldCalculateAverage = !dataSaved.hrvDailyAverages[0] || (currentMinute>d_endMins && !isTimestampToday(dataSaved.hrvDailyAverages[0].timestamp))
    if(shouldCalculateAverage){
      require("hrvtracking").calculateDailyData()
    }
  }
}

//checkForTime()
setInterval(checkForTime, 3600000/2.5); // Fires every 24 minutes

