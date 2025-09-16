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
  
  let averageNumbers=function(runningAvg,totalCycles,newData){
    return ((runningAvg*totalCycles)+newData)/(totalCycles+1);
    
  };
  
  let getData=function(){
    return Object.assign({

      avgSleepTime: 0,
      totalCycles:0,
      avgWakeUpTime:0,
      promptLastShownDay:"",
      timeSinceAwake: 1800000,

    }, require('Storage').readJSON("sleepsummarydata.json", true) || {});
  };

  let getSettings=function() {
    return Object.assign({
      useTrueSleep:true,
      showMessage:true,
      deepSleepHours:5,
      idealSleepHours:10,

    }, require('Storage').readJSON("sleepsummary.settings.json", true) || {});
  };
  
  let writeData=function(data){
    require("Storage").writeJSON("sleepsummarydata.json", data);

  };
  
  let deleteData=function(){
    require("Storage").erase("sleepsummarydata.json");
  };
  
  let getSleepData=function(){
    var data=require("sleeplog").getStats(Date.now(), 24*60*60*1000);
    var totalSleep=data.consecSleep;
    if(getSettings().useTrueSleep) totalSleep=data.deepSleep+data.lightSleep;
    
    return { calculatedAt: data.calculatedAt, 
            deepSleep: data.deepSleep, 
            lightSleep: data.lightSleep,
            awakeSleep: data.awakeSleep,
            consecSleep: data.consecSleep, 
            awakeTime: data.awakeTime, 
            notWornTime: data.notWornTime, 
            unknownTime: data.unknownTime, 
            logDuration: data.logDuration,
            firstDate: data.firstDate, 
            lastDate: data.lastDate, 
            totalSleep: totalSleep,
            awakeSince:getMsPastMidnight(global.sleeplog.info.awakeSince)
           };
      
    
  }
  
  

  
  let recordSleepStats=function(){
    var today = new Date().getDay();
    var sleepData=getSleepData();
    var data=getData();
    //Wakeup time
    var wakeUpTime=sleepData.awakeSince;
    var avgWakeUpTime=averageNumbers(data.avgWakeUpTime,data.totalCycles,wakeUpTime);
    data.avgWakeUpTime=avgWakeUpTime;
    
    //sleep time in minutes
    var time=sleepData.totalSleep;
    
    
    var avgSleepTime = averageNumbers(data.avgSleepTime, data.totalCycles, time);
    data.avgSleepTime = avgSleepTime;
    
    data.promptLastShownDay=today;
    
    
    data.totalCycles+=1;
    writeData(data);
    
  };
  
  // takes in an object with {score, weight}
  let getWeightedScore=function(components) {
    // sum of weights
    let totalWeight = 0;
    for (let key in components) totalWeight += components[key].weight;

    // avoid division by zero
    if (totalWeight === 0) return 0;

    let score = 0;
    for (let key in components) {
      let s = components[key].score;
      let w = components[key].weight;
      score += (s * (w / totalWeight));
    }

    return Math.round(score);
  }
  let generateScore = function(value, target) {
    if (value >= target) {
      let extra = Math.min(1, (value - target) / target); 
      return Math.round(95 + extra * 5); // perfect = 95, max = 100
    } else {
      return Math.round((value / target) * 95);
    }
  }

  
  let getSleepScore=function(){
    
    var sleepData=getSleepData();
    var settings=getSettings();
    var summaryData=getData();

    //only if enabled in Health
    //var hrmScore;
    
    return getWeightedScore({
      duration: 
        {score: generateScore(sleepData.consecSleep/60,settings.idealSleepHours), weight: 0.6},
      deepSleep: 
        {score: generateScore(sleepData.deepSleep/60,settings.deepSleepHours), weight: 0.3},
      averageSleep:
        {score:generateScore(sleepData.totalSleep,summaryData.avgSleepTime),weight:0.15},
      averageWakeup:
        {score:generateScore(getMsPastMidnight(sleepData.awakeSince),summaryData.avgWakeUpTime),weight:0.1},
    });
  }
  
  
  
  
  
  let getAllSleepScores=function(){
    var data=getData();
    var sleepData=getSleepData();
    var settings=getSettings();
    return {
      durationScore:generateScore(sleepData.consecSleep/60,settings.idealSleepHours),
      deepSleepScore:generateScore(sleepData.deepSleep/60,settings.deepSleepHours),
      avgWakeUpScore: generateScore(getMsPastMidnight(sleepData.awakeSince),data.avgWakeUpTime),
      avgSleepTimeScore:generateScore(sleepData.totalSleep,data.avgSleepTime),
      overallScore:getSleepScore(),
    }
  };
  
  
  
  
  
  
  exports.deleteData = deleteData;
  exports.getSummaryData=getData;
  exports.recordData=recordSleepStats;
  exports.getSleepScores=getAllSleepScores;
  exports.getSleepData=getSleepData; 

      

}
  
