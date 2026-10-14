let settings;
let getSettings = function () {
  settings = Object.assign(
    require("Storage").readJSON("dailycolor.json", true) || {}
  );
  if (!settings.bgColors) settings.bgColors = ["#0F0", "#FF0", "#F00", "#00F"];
}
let writeSettings = function () {
  require("Storage").writeJSON("dailycolor.json", settings);
}

let shuffleArray = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = array[i]; array[i] = array[j]; array[j] = t;
  }
  return array;
}

let generateQueue = function () {
  settings.colorQueue = [];
  let colors = settings.bgColors.slice();
  shuffleArray(colors);
  colors.forEach(c => settings.colorQueue.push(c));
}

let getDailyColor = function () {
  let dayNow = new Date().getDay();
  let changed = false;

  if (settings.regenerate) {
    settings.regenerate=false;
    exports.regenerateQueue()
    
  }

  if (!settings.colorQueue || settings.colorQueue.length < 1) {
    generateQueue();
    changed = true;
  }

  if (settings.dayChanged === undefined || settings.dayChanged !== dayNow) {
    if (settings.dayChanged !== undefined) {
      settings.colorQueue.shift();
      if (settings.colorQueue.length < 1) generateQueue();
      changed = true;
    }
    settings.dayChanged = dayNow;
    changed = true;
  }

  
  if (changed) {
    writeSettings();
  }
  return settings.colorQueue[0];
}

getSettings();


exports.getDailyColor = getDailyColor;

exports.regenerateQueue = function(){
  generateQueue();
  writeSettings();
};