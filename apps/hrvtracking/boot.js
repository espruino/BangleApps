var dataSaved = require("hrvtracking").getAllData()
var d_startHour=3;
var d_endHour=4; // inclusive


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
  let currentHour = now.getHours();
  
  // Triggers every time if the hour is 3 (3:00-3:59) or 4 (4:00-4:59)
  if ((currentHour == d_startHour || currentHour == d_endHour)) {

    load("hrvmeasure.app.js"); 
    return;
  }else if (currentHour > d_endHour){
    let shouldCalculateAverage = !dataSaved.hrvDailyAverages[0] || (currentHour>d_endHour && !isTimestampToday(dataSaved.hrvDailyAverages[0].timestamp))
    if(shouldCalculateAverage){
      require("hrvtracking").calculateDailyData()
    }
  }
}

//checkForTime()
setInterval(checkForTime, 3600000/2.5); // Fires every 24 minutes

