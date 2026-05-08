{
  // Creator: RKBoss6
  // The calculations used are very resource-heavy, so we calculate once, and offload to a cache for the day.

  let getMsPastMidnight = function(unixTimestamp) {
    const dateObject = new Date(unixTimestamp);
    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    const seconds = dateObject.getSeconds();
    const milliseconds = dateObject.getMilliseconds();
    return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
  };

  let averageNumbers = function(runningAvg, totalCycles, newData) {
    return ((runningAvg * totalCycles) + newData) / (totalCycles + 1);
  };

  let getDate = function() {
    let d = new Date();
    return d.getFullYear() + "-" +
      ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
      ("0" + d.getDate()).slice(-2) + " " +
      ("0" + d.getHours()).slice(-2) + ":" +
      ("0" + d.getMinutes()).slice(-2) + ":" +
      ("0" + d.getSeconds()).slice(-2);
  };

  let getAvgData = function() {
    return Object.assign({
      avgSleepTime: 0,
      totalCycles: 0,
      avgWakeUpTime: 0,
    }, require('Storage').readJSON("sleepsummarydata.json", true) || {});
  };

  let getSettings = function() {
    return Object.assign({
      useTrueSleep: true,
      timeSinceAwake: 1800000,
      showMessage: true,
      deepSleepHours: 5,
      idealSleepHours: 10,
      messageDelay: 1200000,
      minConsecSleep: 120,
    }, require('Storage').readJSON("sleepsummary.settings.json", true) || {});
  };

  let writeAvgData = function(data) {
    require("Storage").writeJSON("sleepsummarydata.json", data);
  };

  let deleteAvgData = function() {
    require("Storage").erase("sleepsummarydata.json");
  };

  let getSleepData = function() {
    var data = require("sleeplog").getStats(Date.now(), 24 * 60 * 60 * 1000);
    var totalSleep = data.consecSleep;
    if (getSettings().useTrueSleep) totalSleep = data.deepSleep + data.lightSleep;
    return {
      calculatedAt: data.calculatedAt,
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
      trueSleep: data.deepSleep + data.lightSleep,
      awakeSince: getMsPastMidnight((global.sleeplog || {}).info ? global.sleeplog.info.awakeSince : 0),
    };
  };

  let getWeightedScore = function(components) {
    let totalWeight = 0;
    for (let key in components) totalWeight += components[key].weight;
    if (totalWeight === 0) return 0;
    let score = 0;
    for (let key in components) {
      score += (components[key].score * (components[key].weight / totalWeight));
    }
    return Math.round(score);
  };

  let generateScore = function(value, target) {
    if (target === 0) return 0;
    if (value >= target) {
      let extra = Math.min(1, (value - target) / target);
      return Math.round(95 + extra * 5);
    } else {
      return Math.round((value / target) * 95);
    }
  };

  let getSleepScore = function(sleepData, settings, summaryData) {
    var components = {
      duration:  { score: generateScore(sleepData.consecSleep / 60, settings.idealSleepHours), weight: 0.6 },
      deepSleep: { score: generateScore(sleepData.deepSleep / 60, settings.deepSleepHours),    weight: 0.3 },
    };
    if (summaryData.avgSleepTime > 0) {
      components.averageSleep  = { score: generateScore(sleepData.totalSleep, summaryData.avgSleepTime),  weight: 0.15 };
    }
    if (summaryData.avgWakeUpTime > 0) {
      components.averageWakeup = { score: generateScore(sleepData.awakeSince, summaryData.avgWakeUpTime), weight: 0.1  };
    }
    return getWeightedScore(components);
};

let getAllSleepScores = function() {
    var data     = getAvgData();
    var sleepData = getSleepData();
    var settings  = getSettings();
    // pass already-fetched data in — no redundant nested calls
    return {
      durationScore:     generateScore(sleepData.consecSleep / 60, settings.idealSleepHours),
      deepSleepScore:    generateScore(sleepData.deepSleep / 60, settings.deepSleepHours),
      avgWakeUpScore:    data.avgWakeUpTime > 0 ? generateScore(sleepData.awakeSince,   data.avgWakeUpTime) : 0,
      avgSleepTimeScore: data.avgSleepTime  > 0 ? generateScore(sleepData.totalSleep,   data.avgSleepTime)  : 0,
      overallScore:      getSleepScore(sleepData, settings, data),
    };
};

  let writeCachedData = function(data) {
    require("Storage").writeJSON("sleepsummarydatacache.json", data);
  };

  let getCachedData = function() {
    var data = Object.assign({
      wakeUpTime: 0,
      overallSleepScore: 0,
      deepSleepScore: 0,
      wkUpSleepScore: 0,
      durationSleepScore: 0,
      consecSleep: 0,
      trueSleep: 0,
      dayLastUpdated: 100,
    }, require('Storage').readJSON("sleepsummarydatacache.json", true) || {});
    data.sleepDuration = getSettings().useTrueSleep ? data.trueSleep : data.consecSleep;
    return data;
  };

  let calcAndCache = function() {
    let today = new Date().getDate();
    let scores = getAllSleepScores();
    let slpData = getSleepData();
    let cachedData = getCachedData();
    cachedData.overallSleepScore  = scores.overallScore;
    cachedData.deepSleepScore     = scores.deepSleepScore;
    cachedData.usualDurationScore = scores.avgSleepTimeScore;
    cachedData.wkUpSleepScore     = scores.avgWakeUpScore;
    cachedData.durationSleepScore = scores.durationScore;
    cachedData.consecSleep        = slpData.consecSleep;
    cachedData.trueSleep          = slpData.trueSleep;
    cachedData.dayLastUpdated     = today;
    cachedData.wakeUpTime         = slpData.awakeSince;
    writeCachedData(cachedData);
  };

  let getSummaryData = function(autoCalculate) {
    let avgData = getAvgData();
    let cachedData = getCachedData();
    let bootData = require('Storage').readJSON("sleepsummary.bootdata.json", true) || {};
    let today = new Date().getDate();
    if (cachedData.dayLastUpdated != today&&autoCalculate) {
      calcAndCache();
      cachedData = getCachedData();
    }
    return Object.assign({}, avgData, cachedData, {scoreLastUpdated:bootData.promptDayShown||""});
  };

  let recordSleepStats = function() {
    var sleepData = getSleepData();
    var data = getAvgData();
    data.avgWakeUpTime = averageNumbers(data.avgWakeUpTime, data.totalCycles, sleepData.awakeSince);
    data.avgSleepTime  = averageNumbers(data.avgSleepTime,  data.totalCycles, sleepData.totalSleep);
    data.dateLastRecorded = getDate();
    data.totalCycles += 1;
    writeAvgData(data);
    calcAndCache();
  };

  exports.deleteData     = deleteAvgData;
  exports.recalculate    = calcAndCache;
  exports.getSummaryData = getSummaryData;
  exports.recordData     = recordSleepStats;
  exports.getSettings    = getSettings;
  exports.getSleepScores = getAllSleepScores;
  exports.getSleepData   = getSleepData;
}