var SETTINGS_FILE = "coretemp.json";
var LOG_FILE = "coretemp.log";
var LOG_MAX_LINES = 200;

var settings;
var logEnabled = false;
var logPartial = false;
var logBuffer = [];
var logFlushInterval;

function readSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE, 1) || {};
  return settings;
}

function flushLog() {
  if (!logBuffer.length) return;
  while (logBuffer.length > LOG_MAX_LINES) logBuffer.shift();
  try {
    // Append in batches to reduce flash writes during frequent BLE notifications.
    require("Storage").open(LOG_FILE, "a").write(logBuffer.join("\n") + "\n");
  } catch (e) {
    // ignore storage write failures
  }
  logBuffer = [];
}

function setDebug(enabled, partial) {
  logEnabled = !!enabled;
  logPartial = !!partial && logEnabled;
  if (logEnabled) {
    if (!logFlushInterval) logFlushInterval = setInterval(flushLog, 30000);
  } else if (logFlushInterval) {
    clearInterval(logFlushInterval);
    logFlushInterval = undefined;
    flushLog();
  }
}

function log(text, param) {
  if (!logEnabled) return;
  // Partial logging keeps lifecycle/control-point diagnostics but omits the
  // high-rate measurement stream.
  if (logPartial && text === "data") return;
  var line = new Date().toISOString() + " - " + text;
  if (param !== undefined) line += ": " + JSON.stringify(param);
  print(line);
  logBuffer.push(line);
}

exports.init = function () {
  var currentSettings = readSettings();
  setDebug(!!(currentSettings.debuglog || currentSettings.debugpartiallog), !currentSettings.debuglog && !!currentSettings.debugpartiallog);
};

exports.read = function () {
  return readSettings();
};

exports.get = function () {
  return settings || readSettings();
};

exports.write = function (mutator) {
  var nextSettings = require("Storage").readJSON(SETTINGS_FILE, 1) || {};
  mutator(nextSettings);
  require("Storage").writeJSON(SETTINGS_FILE, nextSettings);
  settings = nextSettings;
  return nextSettings;
};

exports.setDebug = setDebug;
exports.log = log;
exports.flush = flushLog;

exports.shutdown = function () {
  if (logFlushInterval) {
    clearInterval(logFlushInterval);
    logFlushInterval = undefined;
  }
  flushLog();
};
