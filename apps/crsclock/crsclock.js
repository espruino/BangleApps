
// --- Circadian Wellness Clock for Bangle.js 2 ---
// File: crsclock.js

const STORE_KEY  = "crswellness";
const STEPS_KEY  = "w_steps";
const HR_KEY     = "w_hr";
const LIGHT_KEY  = "w_light";
const SLEEP_START_KEY = "w_sleepstart";
const VERSION    = "1.2";
const storage    = require("Storage");
const MAX_HISTORY_ENTRIES = 200;
const TREND_HOURS = 12;
const WRITE_DELAY = 5 * 60 * 1000; // delay before persisting history
let writeTimers = {};

function scheduleHistoryWrite(key, data) {
  if (writeTimers[key]) clearTimeout(writeTimers[key]);
  writeTimers[key] = setTimeout(() => {
    storage.writeJSON(key, data);
    writeTimers[key] = undefined;
  }, WRITE_DELAY);
}

// 1. PERSISTENT SETTINGS & HISTORICAL DATA

let S = storage.readJSON(STORE_KEY, 1) || {
  phaseOffset:        0,
  hydrationInterval:  2 * 3600*1000,
  lastHydration:      Date.now(),
  sleepStart:         23,
  sleepEnd:           7,
  colorTheme:         0,
  notifications: {
    hydration:       true,
    sleepDetection:  true,
    hrLogging:      true,
    hrPower:         true
  },
  bioTimeRefType:    "DLMO",
  bioTimeRefHour:    21,
  bioTimeRefMinute:  0
};

function pruneHistory(arr, maxHours) {
  let cutoff = Date.now() - maxHours * 3600*1000;
  while (arr.length && arr[0].t < cutoff) arr.shift();
  while (arr.length > MAX_HISTORY_ENTRIES) arr.shift();
}

let stepsHist       = storage.readJSON(STEPS_KEY, 1)       || [];
let prevStepCount   = 0;
let stepResetOffset = 0;

for (let e of stepsHist) {
  if (e.s < prevStepCount) stepResetOffset += prevStepCount;
  e.c = e.s + stepResetOffset;
  prevStepCount = e.s;
}
let hrHist          = storage.readJSON(HR_KEY, 1)          || [];
let lightHist       = storage.readJSON(LIGHT_KEY, 1)       || [];
let sleepStartHist  = storage.readJSON(SLEEP_START_KEY, 1) || [];
pruneHistory(stepsHist, 24);
pruneHistory(hrHist, 24);
pruneHistory(lightHist, 24);
pruneHistory(sleepStartHist, 24*7);

// 2. COLOR THEMES

const themes = [
  { bg:"#004080", fg:"#ffffff", accent:"#00e0e0" },
  { bg:"#105c30", fg:"#ffffff", accent:"#a0ff00" },
  { bg:"#20222a", fg:"#f5f5f5", accent:"#76d6ff" }
];
let t = themes[S.colorTheme];

// Default font for stats displayed on the clock
const STATS_FONT_NAME = "Vector";
const STATS_FONT_SIZE = 16;

// 3. HELPERS & CALCULATIONS

function getSleepWindowStr() {
  let a = ("0"+S.sleepStart).substr(-2) + ":00";
  let b = ("0"+S.sleepEnd).substr(-2)   + ":00";
  return a + "-" + b;
}

function stability(arr, key, hours) {
  let cutoff = Date.now() - hours * 3600*1000;
  let vals = arr.filter(e => e.t > cutoff && typeof e[key] === "number")
               .map(e => e[key]);
  if (!vals.length) return 0;
  let sum = vals.reduce((a,b)=>a+b, 0);
  let mean = sum / vals.length;
  let sd = Math.sqrt(vals.reduce((a,b)=>a + (b-mean)*(b-mean), 0) / vals.length);
  let cv = mean ? sd/mean : 1;
  let idx = 100 - cv*100;
  return Math.max(0, Math.min(100, idx));
}

function computeCrs(offsetMs) {
  let now   = Date.now() - (offsetMs || 0);
  let sArr  = stepsHist.filter(e => e.t <= now && e.t > now - 24*3600*1000);
  let hArr  = hrHist.filter(e => e.t <= now && e.t > now - 24*3600*1000);
  let parts = [];

  if (sArr.length) parts.push(stability(sArr, "c", 24));
  if (hArr.length) parts.push(stability(hArr, "bpm", 24));
  if (sleepStartHist.length >= 2) parts.push(sleepTimingScore());

  let lh = estimateLightHours();
  if (typeof lh === "number" && !isNaN(lh)) {
    let lhScore = Math.min(100, Math.max(0, (lh / 12) * 100));
    parts.push(lhScore);
  }

  if (!parts.length) return 0;
  let avg = parts.reduce((a,b)=>a+b,0) / parts.length;
  return Math.round(avg);
}

let crsByHour = [];
let lastCrsUpdateTime = 0;
function updateCrsCache() {
  if (Date.now() - lastCrsUpdateTime < 5*60*1000 && crsByHour.length === TREND_HOURS) return;
  crsByHour = [];
  for (let i=0; i<TREND_HOURS; i++) {
    let off = i * 3600*1000;
    crsByHour.unshift( computeCrs(off) );
  }
  lastCrsUpdateTime = Date.now();
}

function computeBioTime() {
  let d  = new Date();
  let m  = d.getHours()*60 + d.getMinutes() + S.phaseOffset*60;
  m = ((m % 1440) + 1440) % 1440;
  let hh = Math.floor(m/60), mm = m % 60;
  return ("0"+hh).substr(-2) + ":" + ("0"+mm).substr(-2);
}

function detectEmotion() {
  let cutoff = Date.now() - 60*60*1000;
  let vals = hrHist.filter(e => e.t > cutoff).map(e => e.bpm);
  if (!vals.length) return 3; // No Data
  let mean = vals.reduce((a,b) => a+b, 0) / vals.length;
  let sd = Math.sqrt(vals.reduce((a,b) => a + (b-mean)*(b-mean), 0) / vals.length);
  if (sd < 2.5)   return 0; // Calm
  if (sd < 5)     return 1; // Neutral
  if (sd < 12)    return 2; // Stressed
  return 3; // No Data/undefined
}

// Estimate daylight exposure in hours based solely on step data
function estimateLightHours() {
  let now = Date.now();
  let start = now - 24*3600*1000;
  function inSleepWindow(h) {
    if (S.sleepStart < S.sleepEnd)
      return h >= S.sleepStart && h < S.sleepEnd;
    return h >= S.sleepStart || h < S.sleepEnd;
  }
  let hourMap = {};
  let count = 0;
  for (let e of stepsHist) {
    if (e.t < start) continue;
    let d = new Date(e.t);
    let hr = d.getHours();
    if (hr < 7 || hr > 19) continue;
    if (inSleepWindow(hr)) continue;
    let key = Math.floor(e.t / 3600000);
    if (!hourMap[key]) {
      hourMap[key] = true;
      count++;
    }
  }
  return count;
}

function getStepsLast24h() {
  let cutoff = Date.now() - 24*3600*1000;
  let arr = stepsHist.filter(e => e.t > cutoff).map(e=>e.c);
  return arr.length>1 ? (arr[arr.length-1] - arr[0]) : 0;
}

function sleepTimingScore() {
  return stability(sleepStartHist, "h", 7);
}

let saveTimeout = null;
function saveSettings() {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    storage.writeJSON(STORE_KEY, S);
  }, 2000);
}

// 4. SENSORS & LOGGING (BATTERY-SAFE)

let hrmEnabled = false;
function onHrmSample(hrm) {
  if (typeof hrm.bpm === "number" && hrm.bpm > 0 && S.notifications.hrLogging) {
    hrHist.push({ t: Date.now(), bpm: hrm.bpm });
    pruneHistory(hrHist, 24);
    scheduleHistoryWrite(HR_KEY, hrHist);
  }
}
function enableHrmIfNeeded() {
  if (!hrmEnabled && S.notifications.hrPower && S.notifications.hrLogging) {
    hrmEnabled = true;
    Bangle.setHRMPower(1);
    Bangle.on("HRM", onHrmSample);
  }
}
function disableHrm() {
  if (hrmEnabled) {
    hrmEnabled = false;
    Bangle.removeListener("HRM", onHrmSample);
    Bangle.setHRMPower(0);
  }
}

// Steps
Bangle.on("step",(s) => {
  if (s < prevStepCount) stepResetOffset += prevStepCount;
  prevStepCount = s;
  let c = s + stepResetOffset;
  stepsHist.push({ t: Date.now(), s, c });
  pruneHistory(stepsHist, 24);
  scheduleHistoryWrite(STEPS_KEY, stepsHist);
});

// Light sensor
function sampleLight() {
  let env = Bangle.getHealthStatus().light;
  if (env !== undefined) {
    lightHist.push({ t: Date.now(), light: env });
    pruneHistory(lightHist, 24);
    scheduleHistoryWrite(LIGHT_KEY, lightHist);
  }
}
setInterval(sampleLight, 300*1000);
if (Bangle.isLCDOn()) sampleLight();

// Sleep/Wake Detection
let isSleeping = false, pendingSleepAlert = false, pendingWakeAlert = false;
function checkSleepWake() {
  if (!S.notifications.sleepDetection) return;
  let now = Date.now();
  let windowStart = now - 30*60*1000; // 30 min ago
  let arr = stepsHist.filter(e => e.t >= windowStart).map(e => e.c);
  let delta = arr.length>1 ? (arr[arr.length-1] - arr[0]) : 0;
  let moving = Bangle.isMoving ? Bangle.isMoving() : true;
  let asleep  = (delta < 5) && !moving;
  if (!isSleeping && asleep) {
    isSleeping = true;
    S.sleepStart = (new Date()).getHours();
    sleepStartHist.push({ t: now, h: S.sleepStart });
    pruneHistory(sleepStartHist, 24*7);
    scheduleHistoryWrite(SLEEP_START_KEY, sleepStartHist);
    pendingSleepAlert = true;
    saveSettings();
  } else if (isSleeping && !asleep) {
    isSleeping = false;
    S.sleepEnd = (new Date()).getHours();
    pendingWakeAlert = true;
    saveSettings();
  }
}
setInterval(() => {
  if (Bangle.isLCDOn()) checkSleepWake();
}, 15*60*1000);

// Hydration Reminder
let pendingHydrationAlert = false;
function remindHydration() {
  if (!S.notifications.hydration) return;
  Bangle.buzz();
  pendingHydrationAlert = true;
  S.lastHydration = Date.now();
  saveSettings();
}
setInterval(() => {
  if (Date.now() - S.lastHydration >= S.hydrationInterval) {
    remindHydration();
  }
}, 60*1000);

// LCD events
Bangle.on("lcdPower",(on) => {
  if (on) {
    enableHrmIfNeeded();
    drawClock();
  } else {
    disableHrm();
  }
});
if (Bangle.isLCDOn()) enableHrmIfNeeded();

// ----- DISPLAY HELPERS -----
function drawStat(text, y, g) {
  const left = 5;
  g.drawString(text, left, y);
}

// 5. DRAW CLOCK SCREEN

function drawClock() {
  g.clear();
  Bangle.drawWidgets();
  let w = g.getWidth(), h = g.getHeight();

  // Alerts
  if (pendingHydrationAlert) {
    pendingHydrationAlert = false;
    E.showAlert("Time to hydrate!").then(() => {
      drawClock(); Bangle.setUI(uiOpts);
    }); return;
  }
  if (pendingSleepAlert) {
    pendingSleepAlert = false;
    E.showAlert("Sleep detected at " + computeBioTime()).then(() => {
      drawClock(); Bangle.setUI(uiOpts);
    }); return;
  }
  if (pendingWakeAlert) {
    pendingWakeAlert = false;
    E.showAlert("Wake detected at " + computeBioTime()).then(() => {
      drawClock(); Bangle.setUI(uiOpts);
    }); return;
  }

  // ----- HEADER STRIP -----
  let headerH = 44;
  g.setColor(t.bg);
  g.fillRect(0, 24, w, 24 + headerH);

  // ----- TIME -----
  g.setFont("Vector", 32);
  let bt = computeBioTime();
  let tw = g.stringWidth(bt);
  let xPos = (w - tw) / 2;
  let yPos = 24 + (headerH - g.getFontHeight()) / 2;
  // Shadow (black, offset)
  g.setColor("#000");
  g.drawString(bt, xPos + 2, yPos + 2);
  // Main time
  g.setColor(t.fg);
  g.drawString(bt, xPos, yPos);

  // ----- STATS -----
  let statsY = 24 + headerH + 8;
  let crVal = computeCrs(0);
  let cr    = (isNaN(crVal) || crVal === null || typeof crVal === "undefined") ? "N/A" : crVal;
  let stVal = getStepsLast24h();
  if (stVal <= 0 || isNaN(stVal)) stVal = null;
  let emo = detectEmotion();
  let lightHoursVal = estimateLightHours();
  let lightHours = (isNaN(lightHoursVal) ? "N/A" : lightHoursVal + "h");
  let moodText = ["Calm","Neutral","Stressed","N/A"];

  g.setFont(STATS_FONT_NAME, STATS_FONT_SIZE);
  g.setColor("#000");
  let y = statsY;
  drawStat("CRS: " + cr, y, g);        y += 18;
  if (stVal !== null) { drawStat("Steps: " + stVal, y, g); y += 18; }
  drawStat("Mood: " + moodText[emo], y, g); y += 18;
  drawStat("Light: " + lightHours, y, g);

  // ----- Footer & menu hint -----
  g.drawLine(0, h-20, w, h-20);
  g.setFont("6x8", 1);
  g.setColor("#000");
  g.drawString("Menu: btn1/tap/swipe", 10, h-18);
}

// 6. VIEW TREND CHART

function showTrend() {
  let w = g.getWidth(), h = g.getHeight();
  g.setColor(t.bg); g.fillRect(0, 24, w, h);
  g.setFont("Vector", 20);
  let title = "CRS Trend (" + TREND_HOURS + "h)";
  let tw = g.stringWidth(title);
  g.setColor(t.fg);
  g.drawString(title, (w - tw)/2, 28);
  if (!stepsHist.length && !hrHist.length) {
    g.setFont("6x8", 2);
    let msg = "No data to show";
    let mw  = g.stringWidth(msg);
    g.drawString(msg, (w - mw)/2, h/2);
    g.setFont("6x8", 1);
    g.drawString("Tap to return", 10, h-12);
    Bangle.setUI(uiOpts);
    Bangle.on('touch', function tapCB() {
      Bangle.removeListener('touch', tapCB);
      drawClock();
      Bangle.setUI(uiOpts);
    });
    return;
  }
  updateCrsCache();
  let i = 0;
  function drawNextBar() {
    if (i >= TREND_HOURS) {
      g.setColor(t.fg);
      g.setFont("6x8", 1);
      g.drawString("Tap to return", 10, h-12);
      Bangle.setUI(uiOpts);
      Bangle.on('touch', function tapCB() {
        Bangle.removeListener('touch', tapCB);
        drawClock();
        Bangle.setUI(uiOpts);
      });
      return;
    }
    let barW = Math.floor(w / TREND_HOURS);
    let val  = crsByHour[i];
    let barH = Math.round((val/100) * (h - 60));
    let x = i * barW;
    let y = h - barH - 24;
    g.setColor(t.accent);
    g.fillRect(x, y, x + barW - 2, h - 24);
    i++;
    setTimeout(drawNextBar, 0);
  }
  drawNextBar();
}

// 7. MENU & SETTINGS (no change to your logic)

function showStats() {
  let bt     = computeBioTime(),
      cr     = computeCrs(0),
      st     = getStepsLast24h(),
      emo    = detectEmotion(),
      lightH = estimateLightHours(),
      moodText = ["Calm","Neutral","Stressed","N/A"];
  E.showAlert(
    "BioTime: "   + bt   + "\n" +
    "CRS: "       + cr   + "\n" +
    "Steps: "     + st   + "\n" +
    "Mood: "      + moodText[emo] + "\n" +
    "Light: "     + lightH + "h",
    "Today's Stats"
  ).then(() => {
    drawClock();
    Bangle.setUI(uiOpts);
  });
}

function exportData() {
  let exportObj = {
    timestamp:       new Date().toISOString(),
    steps:           stepsHist,
    hr:              hrHist,
    light:           lightHist,
    sleepStart:      sleepStartHist,
    sleepWindow:     { start: S.sleepStart, end: S.sleepEnd },
    phaseOffset:     S.phaseOffset,
    colorTheme:      S.colorTheme,
    notifications:   S.notifications,
    bioTimeRefType:  S.bioTimeRefType,
    bioTimeRefHour:  S.bioTimeRefHour,
    bioTimeRefMinute:S.bioTimeRefMinute
  };
  let json     = JSON.stringify(exportObj, null, 2);
  let filename = "crs_export.json";
  storage.write(filename, json);
  E.showAlert(`Exported to\n"${filename}"\n(${json.length} bytes)`).then(() => {
    drawClock();
    Bangle.setUI(uiOpts);
  });
}

function confirmResetAllData() {
  E.showPrompt("Reset all data?").then(res => {
    if (!res) {
      drawClock();
      Bangle.setUI(uiOpts);
      return;
    }
    storage.erase(STORE_KEY);
    storage.erase(STEPS_KEY);
    storage.erase(HR_KEY);
    storage.erase(LIGHT_KEY);
    storage.erase(SLEEP_START_KEY);
    S = {
      phaseOffset:        0,
      hydrationInterval:  2 * 3600*1000,
      lastHydration:      Date.now(),
      sleepStart:         23,
      sleepEnd:           7,
      colorTheme:         0,
      notifications: {
        hydration:       true,
        sleepDetection:  true,
        hrLogging:      true,
        hrPower:         true
      },
      bioTimeRefType:    "DLMO",
      bioTimeRefHour:    21,
      bioTimeRefMinute:  0
    };
    // Persist defaults so they survive a restart
    saveSettings();
    // Optionally bypass the delayed save
    storage.writeJSON(STORE_KEY, S);
    stepsHist = []; hrHist = []; lightHist = []; sleepStartHist = [];
    prevStepCount = 0; stepResetOffset = 0;
    t = themes[S.colorTheme];
    E.showAlert("All app data cleared").then(() => {
      drawClock();
      Bangle.setUI(uiOpts);
    });
  });
}

// Menu logic: Sleep window, hydration, BT calibration, theme, notifications, bio ref, about - unchanged, use as before

function setSleepWindow() {
  let menu = { "": { title: "Select Start Hour" } };
  for (let hr = 0; hr < 24; hr++) {
    let label = (hr<10?"0":"") + hr;
    menu[label] = ((h) => () => {
      S.sleepStart = h;
      saveSettings();
      showEndHourSelector();
    })(hr);
  }
  menu.Back = () => {
    drawClock();
    Bangle.setUI(uiOpts);
  };
  E.showMenu(menu);

  function showEndHourSelector() {
    let em = { "": { title: "Select End Hour" } };
    for (let eh = 0; eh < 24; eh++) {
      let lab2 = (eh<10?"0":"") + eh;
      em[lab2] = ((e) => () => {
        S.sleepEnd = e;
        saveSettings();
        E.showAlert("Sleep window set: " + getSleepWindowStr()).then(() => {
          drawClock();
          Bangle.setUI(uiOpts);
        });
      })(eh);
    }
    em.Back = () => {
      drawClock();
      Bangle.setUI(uiOpts);
    };
    E.showMenu(em);
  }
}

function setHydrationMenu() {
  let m = { "": { title: "Hydration" } };
  m["Remind Now"] = () => {
    remindHydration();
    drawClock();
    Bangle.setUI(uiOpts);
  };
  m["Set Interval"] = setHydrationInterval;
  m.Back = () => {
    drawClock();
    Bangle.setUI(uiOpts);
  };
  E.showMenu(m);
}
function setHydrationInterval() {
  let m = { "": { title: "Set Hydration Interval" } };
  for (let h = 1; h <= 12; h++) {
    let label = h + "h";
    m[label] = ((hours) => () => {
      S.hydrationInterval = hours * 3600*1000;
      S.lastHydration      = Date.now();
      saveSettings();
      E.showAlert("Interval set: " + label).then(() => {
        drawClock();
        Bangle.setUI(uiOpts);
      });
    })(h);
  }
  m.Off = () => {
    S.hydrationInterval = Infinity;
    saveSettings();
    E.showAlert("Hydration off").then(() => {
      drawClock();
      Bangle.setUI(uiOpts);
    });
  };
  m.Back = () => {
    drawClock();
    Bangle.setUI(uiOpts);
  };
  E.showMenu(m);
}
function calibrateBT() {
  let m = { "": { title: "Calibrate BT" } };
  for (let d = 1; d <= 8; d++) {
    m["+" + d + "h"] = (() => () => {
      S.phaseOffset += d;
      saveSettings();
      E.showAlert("Offset now: " + (S.phaseOffset>=0? "+"+S.phaseOffset : S.phaseOffset) + "h").then(() => {
        drawClock();
        Bangle.setUI(uiOpts);
      });
    })(d);
    m["-" + d + "h"] = (() => () => {
      S.phaseOffset -= d;
      saveSettings();
      E.showAlert("Offset now: " + (S.phaseOffset>=0? "+"+S.phaseOffset : S.phaseOffset) + "h").then(() => {
        drawClock();
        Bangle.setUI(uiOpts);
      });
    })(d);
  }
  m["Reset Offset"] = () => {
    S.phaseOffset = 0;
    saveSettings();
    E.showAlert("Offset reset to 0h").then(() => {
      drawClock();
      Bangle.setUI(uiOpts);
    });
  };
  m.Back = () => {
    drawClock();
    Bangle.setUI(uiOpts);
  };
  E.showMenu(m);
}
function setTheme() {
  let m = { "": { title: "Select Theme" } };
  m.Blue  = () => { S.colorTheme = 0; applyTheme(); };
  m.Green = () => { S.colorTheme = 1; applyTheme(); };
  m.Dark  = () => { S.colorTheme = 2; applyTheme(); };
  m.Back  = () => {
    drawClock();
    Bangle.setUI(uiOpts);
  };
  E.showMenu(m);

  function applyTheme() {
    t = themes[S.colorTheme];
    saveSettings();
    drawClock();
    Bangle.setUI(uiOpts);
  }
}
function showNotificationSettings() {
  let m = { "": { title: "Notifications" } };
  m["Hydration"] = {
    value:  S.notifications.hydration,
    format: v => v ? "On" : "Off",
    onchange: v => {
      S.notifications.hydration = v;
      saveSettings();
    }
  };
  m["Sleep Detection"] = {
    value:  S.notifications.sleepDetection,
    format: v => v ? "On" : "Off",
    onchange: v => {
      S.notifications.sleepDetection = v;
      saveSettings();
    }
  };
  m["HR Logging"] = {
    value:  S.notifications.hrLogging,
    format: v => v ? "On" : "Off",
    onchange: v => {
      S.notifications.hrLogging = v;
      if (!v) disableHrm();
      saveSettings();
    }
  };
  m["HR Monitoring"] = {
    value:  S.notifications.hrPower,
    format: v => v ? "On" : "Off",
    onchange: v => {
      S.notifications.hrPower = v;
      if (v) enableHrmIfNeeded();
      else disableHrm();
      saveSettings();
    }
  };
  m.Back = () => {
    showSettings();
  };
  E.showMenu(m);
}
function setBioTimeReference() {
  let m = { "": { title: "BioTime Reference" } };
  m.DLMO = () => {
    S.bioTimeRefType = "DLMO";
    saveSettings();
    promptRefTime();
  };
  m.CBTmin = () => {
    S.bioTimeRefType = "CBTmin";
    saveSettings();
    promptRefTime();
  };
  m.Back = () => {
    showSettings();
  };
  E.showMenu(m);

  function promptRefTime() {
    E.showPrompt("Hour (0-23)?").then(h => {
      if (h===undefined || h<0 || h>23) {
        E.showAlert("Invalid hour").then(() => {
          drawClock();
          Bangle.setUI(uiOpts);
        });
        return;
      }
      S.bioTimeRefHour = h;
      E.showPrompt("Minute (0-59)?").then(m => {
        if (m===undefined || m<0 || m>59) {
          E.showAlert("Invalid minute").then(() => {
            drawClock();
            Bangle.setUI(uiOpts);
          });
          return;
        }
        S.bioTimeRefMinute = m;
        saveSettings();
        E.showAlert(`Reference set: ${S.bioTimeRefType} @ ${("0"+h).substr(-2)}:${("0"+m).substr(-2)}`)
          .then(() => {
            drawClock();
            Bangle.setUI(uiOpts);
          });
      });
    });
  }
}
function showAbout() {
  E.showAlert(
    "Circadian Wellness Clock v" + VERSION + "\n" +
    "Displays your CRS and BioTime.\n" +
    "Copyright 2025"
  ).then(()=>{
    drawClock();
    Bangle.setUI(uiOpts);
  });
}
function showSettings() {
  const menu = {
    "": { title: "Settings" },
    "Sleep Window":     setSleepWindow,
    "Hydration":        setHydrationMenu,
    "Calibrate BT":     calibrateBT,
    "Theme":            setTheme,
    "Notifications":    showNotificationSettings,
    "BioTime Ref":      setBioTimeReference,
    "About / Version":  showAbout,
    "Back": () => {
      drawClock();
      Bangle.setUI(uiOpts);
    }
  };
  E.showMenu(menu);
}

// MAIN MENU & UI HOOKUP
const menuOpts = {
  "":              { title: "Main Menu" },
  "Show Stats":    showStats,
  "View Trend":    showTrend,
  "Sleep Window":  setSleepWindow,
  "Hydration":     setHydrationMenu,
  "Calibrate BT":  calibrateBT,
  "Export Data":   exportData,
  "Theme":         setTheme,
  "About":         showAbout,
  "Go to Launcher": () => Bangle.showLauncher(),
  "Reset All Data": confirmResetAllData,
  "Exit":          () => Bangle.showClock()
};

const uiOpts = {
  mode:  "custom",
  clock: false,
  btn:   () => E.showMenu(menuOpts),
  touch: () => E.showMenu(menuOpts),
  swipe: () => E.showMenu(menuOpts)
};

// 9. INITIALIZE

Bangle.setUI(uiOpts);
Bangle.loadWidgets();
drawClock();

setInterval(() => {
  if (Bangle.isLCDOn()) drawClock();
}, 60*1000);

// END
