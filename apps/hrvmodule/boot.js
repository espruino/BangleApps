var dataSaved = require("Storage").readJSON("hrv.json")||{};
if(!dataSaved.hrv) dataSaved.hrv = [];
if(!dataSaved.hrvDailyAverages) dataSaved.hrvDailyAverages = [];
const startHour=3;
const endHour=4; // inclusive
function trimData(){
  var currentData = require("Storage").readJSON("hrv.json") || {};

  currentData.started = dataSaved.started;

  if (currentData.hrv) {
    currentData.hrv = currentData.hrv.slice(0, 10);
  }

  
  
  dataSaved.hrv=currentData.hrv;
  dataSaved.hrvDailyAverages.slice(0, 30)
}
function writeData(){
    trimData()

    require("Storage").writeJSON("hrv.json", dataSaved);
}

function isTimestampToday(unixTimestamp) {
  const date = new Date(unixTimestamp);
  const today = new Date();
  
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
}


const getAverage = (arr) => arr.reduce((sum, num) => sum + num, 0) / arr.length;

function formatDate(date) {
  var locale = require("locale");

  var timeStr = locale.time(date, 1);
  var meridianStr = locale.meridian(date);

  var monthStr = locale.month(date, 1);
  var dateStr =
      monthStr + " " +
      date.getDate() + ", " +
      date.getFullYear();

  return dateStr + ", " + timeStr + " " + meridianStr;
}
// hrv objects in the .hrv array NEEDS to be in order of most recent on top.
function calculateDailyHrv(){
  trimData()

  let hrvsToday = []
  for (let hrvObj of dataSaved.hrv) {
    if(isTimestampToday(hrvObj.timestamp)){
      if (hrvObj.hrv  ) {
        hrvsToday.push(parseFloat(hrvObj.hrv));
      }
    }else{
      break;
    }
  }
  let avg = getAverage(hrvsToday);
  dataSaved.hrvDailyAverages.unshift({
    timestamp:Date.now(),
    readableTimestamp:formatDate(new Date()),
    avgHrv:avg
  })
 dataSaved.hrvBaseline = Math.round(getAverage(dataSaved.hrvDailyAverages.map(avgObj => avgObj.avgHrv)));

  writeData()
}

function checkForTime(){
 // Bangle.buzz(400);
  if(global.__FILE__ == "hrvmeasure.app.js") return;
  let now = new Date();
  let currentHour = now.getHours();

  // Triggers every time if the hour is 3 (3:00-3:59) or 4 (4:00-4:59)
  if ((currentHour == startHour || currentHour == endHour)) {
  //  dataSaved.started = true;
 //   writeData()
    load("hrvmeasure.app.js"); 
    return;
  }else if (currentHour > endHour){
    let shouldCalculateAverage = !dataSaved.hrvDailyAverages[0] || (currentHour>endHour && !isTimestampToday(dataSaved.hrvDailyAverages[0].timestamp))
    if(shouldCalculateAverage){
      calculateDailyHrv()
    }
  }
}

//checkForTime()
setInterval(checkForTime, 3600000/2.5); // Fires every 24 minutes

