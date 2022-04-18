// clear screen and draw widgets
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

var statusRect = {x: Bangle.appRect.x, y: Bangle.appRect.y, w: Bangle.appRect.w, h: 32};
var settingsRect = {x: Bangle.appRect.x, y: Bangle.appRect.y2 - 16, w: Bangle.appRect.w, h: 16};
var hrmRect = {x: Bangle.appRect.x, y: statusRect.y + statusRect.h, w: Bangle.appRect.w, h: Bangle.appRect.h - statusRect.h - settingsRect.h};

var isPaused = false;
var settings = Object.assign({
  minBpm: 120,
  maxBpm: 160,
  minConfidence: 60,
  minBuzzIntervalSeconds: 5,
  tooLowBuzzDurationMillis: 200,
  tooHighBuzzDurationMillis: 1000,
}, require('Storage').readJSON("heartzone.settings.json", true) || {});

// draw current settings at the bottom
g.setFont6x15(1).setFontAlign(0, -1, 0);
g.drawString(settings.minBpm + "<BPM<" + settings.maxBpm + ", >=" + settings.minConfidence + "% conf.", settingsRect.x + (settingsRect.w / 2), settingsRect.y + 4);

function drawStatus(status) { // draw status bar at the top
  g.setBgColor(g.theme.bg).setColor(g.theme.fg);
  g.clearRect(statusRect);

  g.setFontVector(statusRect.h - 4).setFontAlign(0, -1, 0);
  g.drawString(status, statusRect.x + (statusRect.w / 2), statusRect.y + 2);
}

function drawHRM(hrmInfo) { // draw HRM info display
  g.setBgColor(hrmInfo.confidence > settings.minConfidence ? '#fff' : '#f00').setColor(hrmInfo.confidence > settings.minConfidence ? '#000' : '#fff');
  g.setFontAlign(-1, -1, 0);
  g.clearRect(hrmRect);

  var px = hrmRect.x + 10, py = hrmRect.y + 10;
  g.setFontVector((hrmRect.h / 2) - 20);
  g.drawString(hrmInfo.bpm, px, py);
  g.setFontVector(16);
  g.drawString('BPM', px + g.stringWidth(hrmInfo.bpm.toString()) + 32, py);
  py += hrmRect.h / 2;

  g.setFontVector((hrmRect.h / 2) - 20);
  g.drawString(hrmInfo.confidence, px, py);
  g.setFontVector(16);
  g.drawString('% conf.', px + g.stringWidth(hrmInfo.confidence.toString()) + 32, py);
}

drawHRM({bpm: '?', confidence: '?'});
drawStatus('RUNNING');

var lastBuzz = getTime();
Bangle.on('HRM', function(hrmInfo) {
  if (!isPaused) {
    var currentTime;
    if (hrmInfo.confidence > settings.minConfidence) {
      if (hrmInfo.bpm < settings.minBpm) {
        currentTime = getTime();
        if (currentTime - lastBuzz > settings.minBuzzIntervalSeconds) {
          lastBuzz = currentTime;
          Bangle.buzz(settings.tooLowBuzzDurationMillis);
        }
      } else if (hrmInfo.bpm > settings.maxBpm) {
        currentTime = getTime();
        if (currentTime - lastBuzz > minBuzzIntervalSeconds) {
          lastBuzz = currentTime;
          Bangle.buzz(settings.tooHighBuzzDurationMillis);
        }
      }
    }
  }
  drawHRM(hrmInfo);
});

Bangle.setUI('updown', function(action) {
  if (action == -1) { // up
    isPaused = false;
    drawStatus("RUNNING");
  } else if (action == 1) { // down
    isPaused = true;
    drawStatus("PAUSED");
  }
});
setWatch(function() { Bangle.setHRMPower(false, "heartzone"); load(); }, BTN1);

Bangle.setHRMPower(true, "heartzone");
