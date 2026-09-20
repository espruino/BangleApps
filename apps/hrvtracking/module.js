var dataSaved = require("Storage").readJSON("hrv.json")||{};
if(!dataSaved.hrv) dataSaved.hrv = [];
if(!dataSaved.hrvDailyAverages) dataSaved.hrvDailyAverages = [];
if(!dataSaved.daysTracked) dataSaved.daysTracked = 0;
function writeData(){
    trimData()

    require("Storage").writeJSON("hrv.json", dataSaved);
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

function trimData(){
  var currentData = require("Storage").readJSON("hrv.json") || {};

  currentData.started = dataSaved.started;

  if (currentData.hrv) {
    currentData.hrv = currentData.hrv.slice(0, 10);
  }

  
  
  dataSaved.hrv=currentData.hrv;
  dataSaved.hrvDailyAverages.slice(0, 20)
}




exports.calculateDailyData = function calculateDailyHrv(){
  trimData()
  let hrvsToday = []
  
  for (let hrvObj of dataSaved.hrv) {
    // Guard against a missing/null hrvObj or missing timestamp
    if (hrvObj && hrvObj.timestamp && isTimestampToday(hrvObj.timestamp)){
      if (hrvObj.hrv) {
        hrvsToday.push(parseFloat(hrvObj.hrv));
      }
    } else {
      break;
    }
  }
  
  let avg = getAverage(hrvsToday).toFixed(2);

  dataSaved.hrvDailyAverages.unshift({
    timestamp: Date.now(),
    readableTimestamp: formatDate(new Date()),
    avgHrv: parseFloat(avg)
  })
  
  dataSaved.daysTracked += 1;
  
  const validHistory = dataSaved.hrvDailyAverages
    .map(avgObj => avgObj ? parseFloat(avgObj.avgHrv || avgObj.hrv) : NaN)
    .filter(val => !isNaN(val));

  dataSaved.hrvBaseline = validHistory.length > 0 
    ? parseFloat(getAverage(validHistory).toFixed(2))
    : 0;

  writeData()
}





exports.getAllData = function(){
  return dataSaved;
}

exports.getData = function(){
  //returns list of 6 previous averages, baseline, and most recent
  return {
    dailyHrvs: dataSaved.hrvDailyAverages.slice(0, 6),
    latestHrv:dataSaved.hrvDailyAverages[0],
    hrvBaseline:dataSaved.hrvBaseline,
    daysTracked:dataSaved.daysTracked
  }
}

  
  
  