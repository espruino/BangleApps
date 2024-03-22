exports.loadSettings = function () {
  return Object.assign({
    enabled: true,
    startHour: 9,
    endHour: 20,
    maxInnactivityMin: 30,
    dismissDelayMin: 15,
    pauseDelayMin: 120,
    minSteps: 50,
    tempThreshold: 27
  }, require("Storage").readJSON("activityreminder.s.json", true) || {});
};

exports.writeSettings = function (settings) {
  require("Storage").writeJSON("activityreminder.s.json", settings);
};

exports.saveData = function (data) {
  require("Storage").writeJSON("activityreminder.data.json", data);
};

exports.loadData = function () {
  let health = Bangle.getHealthStatus("day");
  let data = Object.assign({
    firstLoad: true,
    stepsDate: new Date(),
    stepsOnDate: health.steps,
    okDate: new Date(1970),
    dismissDate: new Date(1970),
    pauseDate: new Date(1970),
  },
  
  require("Storage").readJSON("activityreminder.data.json") || {});

  data.stepsDate = new Date(typeof data.stepsDate === 'string' ? data.stepsDate : data.stepsDate.ms);
  data.okDate = new Date(typeof data.okDate === 'string' ? data.okDate : data.okDate.ms);
  data.dismissDate = new Date(typeof data.dismissDate === 'string' ? data.dismissDate : data.dismissDate.ms);
  data.pauseDate = new Date(typeof data.pauseDate === 'string' ? data.pauseDate : data.pauseDate.ms);

  return data;
};
