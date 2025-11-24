
{
  //Creator: RKBoss6
  //The calculations used are very resource-heavy, so we calculate once, and offload to a cache for the day.
  
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
  let getDate=function(){
    let d = new Date();
      let timeStr = d.getFullYear() + "-" +
        ("0"+(d.getMonth()+1)).slice(-2) + "-" +
        ("0"+d.getDate()).slice(-2) + " " +
        ("0"+d.getHours()).slice(-2) + ":" +
        ("0"+d.getMinutes()).slice(-2) + ":" +
        ("0"+d.getSeconds()).slice(-2);
  }
  
  let getAvgData=function(){
    return Object.assign({

      avgSleepTime: 0,
      totalCycles:0,
      avgWakeUpTime:0,
      promptLastShownDay:"",

    }, require('Storage').readJSON("sleepsummarydata.json", true) || {});
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
  //l
  let writeAvgData=function(data){
    require("Storage").writeJSON("sleepsummarydata.json", data);

  };
  
  let deleteAvgData=function(){
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
            trueSleep:data.deepSleep+data.lightSleep,
            awakeSince:getMsPastMidnight(global.sleeplog.info.awakeSince)
           };
      
    
  }
  
  

  
  
  
  // takes in an object with {score, weight}
  function getWeightedScore(components) {
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
    var summaryData=getAvgData();

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
    var data=getAvgData();
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
  let writeCachedData=function(data){
    require("Storage").writeJSON("sleepsummarydatacache.json",data);
  }
  let getCachedData=function(){
    var data=Object.assign({

      wakeUpTime:0,
      overallSleepScore:0,
      deepSleepScore:0,
      wkUpSleepScore:0,
      durationSleepScore:0,
      consecSleep:0,
      trueSleep:0,
      dayLastUpdated:100,

    }, require('Storage').readJSON("sleepsummarydatacache.json", true) || {});
    data.sleepDuration=getSettings().useTrueSleep?data.trueSleep:data.consecSleep;
    return data;
  }
  
  let calcAndCache=function(){
    let today=new Date().getDate();
    let scores=getAllSleepScores();
    let slpData=getSleepData();
    let cachedData=getCachedData();
    //cache data
    cachedData.overallSleepScore=scores.overallScore;
    cachedData.deepSleepScore=scores.deepSleepScore;
    cachedData.wkUpSleepScore=scores.avgWakeUpScore;
    cachedData.durationSleepScore=scores.avgSleepTimeScore;
    cachedData.consecSleep=slpData.consecSleep;
    cachedData.trueSleep=slpData.trueSleep;
    cachedData.dayLastUpdated=today;
    cachedData.wakeUpTime=slpData.awakeSince;
    writeCachedData(cachedData);


    
  }
  
  
  let getSummaryData=function(){
    
    
    let avgData=getAvgData();
    let cachedData=getCachedData()
    let today=new Date().getDate();
    // Check if data is up to date for today
    if(cachedData.dayLastUpdated!=today){
      //has not cached for today, do it now
      calcAndCache();
      //re-run this function to get the new data
      cachedData= getCachedData();
      
    }
      
    // we now have up-to-date cache data, return merged cachedData and avgData to user

    return Object.assign({}, avgData, cachedData);
    
    
  }
  
  function recordSleepStats(){
    var today = new Date().getDate();    
    var sleepData=getSleepData();
    var data=getAvgData();
    //Wakeup time
    var wakeUpTime=sleepData.awakeSince;
    var avgWakeUpTime=averageNumbers(data.avgWakeUpTime,data.totalCycles,wakeUpTime);
    data.avgWakeUpTime=avgWakeUpTime;
    var timeRecorded=getDate();
    //sleep time in minutes
    var time=sleepData.totalSleep;
    
    
    var avgSleepTime = averageNumbers(data.avgSleepTime, data.totalCycles, time);
    data.avgSleepTime = avgSleepTime;
    
    data.promptLastShownDay=today;
    data.dateLastRecorded=timeRecorded;
    
    data.totalCycles+=1;
    writeAvgData(data);
    // recalculate new data for cache
    calcAndCache();
  };
  
  exports.deleteData = deleteAvgData;
  exports.recalculate=calcAndCache;
  exports.getSummaryData=getSummaryData;
  exports.recordData=recordSleepStats;
  exports.getSettings=getSettings;
  exports.getSleepData=getSleepData;
  

      

}
  
