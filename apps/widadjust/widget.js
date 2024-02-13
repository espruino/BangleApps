(() => {
  // ======================================================================
  // CONST

  const DEBUG_LOG_FILE = 'widadjust.log';
  const SETTINGS_FILE  = 'widadjust.json';
  const STATE_FILE     = 'widadjust.state';

  const DEFAULT_ADJUST_THRESHOLD = 100;
  const DEFAULT_UPDATE_INTERVAL  = 60 * 1000;
  const MIN_INTERVAL             = 10 * 1000;

  const MAX_CLOCK_ERROR_FROM_SAVED_STATE  = 2000;

  const SAVE_STATE_CLOCK_ERROR_DELTA_THRESHOLD        = 1;
  const SAVE_STATE_CLOCK_ERROR_DELTA_IN_PPM_THRESHOLD = 1;
  const SAVE_STATE_PPM_DELTA_THRESHOLD                = 1;

  // Widget width.
  const WIDTH = 22;

  // ======================================================================
  // VARIABLES

  let settings;
  let saved;

  let lastClockCheckTime = Date.now();
  let lastClockErrorUpdateTime;

  let clockError;
  let currentUpdateInterval;
  let lastPpm = null;

  let debugLogFile = null;

  // ======================================================================
  // FUNCTIONS

  function clockCheck() {
    let now = Date.now();
    let elapsed = now - lastClockCheckTime;
    lastClockCheckTime = now;

    let prevUpdateInterval = currentUpdateInterval;
    currentUpdateInterval = settings.updateInterval;
    setTimeout(clockCheck, lastClockCheckTime + currentUpdateInterval - Date.now());

    // If elapsed time differs a lot from expected,
    // some other app probably used setTime to change clock significantly.
    // -> reset clock error since elapsed time can't be trusted
    if (Math.abs(elapsed - prevUpdateInterval) > 10 * 1000) {
      // RESET CLOCK ERROR

      clockError = 0;
      lastClockErrorUpdateTime = now;

      debug(
        'Looks like some other app used setTime, so reset clockError. (elapsed = ' +
        elapsed.toFixed(0) + ')'
      );
      WIDGETS.adjust.draw();

    } else if (!settings.advanced) {
      // UPDATE CLOCK ERROR WITHOUT TEMPERATURE COMPENSATION

      updateClockError(settings.ppm);
    } else {
      // UPDATE CLOCK ERROR WITH TEMPERATURE COMPENSATION

      Bangle.getPressure().then(d => {
        let temp = d.temperature;
        updateClockError(settings.ppm0 + settings.ppm1 * temp + settings.ppm2 * temp * temp);
      }).catch(e => {
        WIDGETS.adjust.draw();
      });
    }
  }

  function debug(line) {
    //console.log(line);
    if (debugLogFile !== null) {
      debugLogFile.write(line + '\n');
    }
  }

  function draw() {
    if (settings.hide === true) {
      return;
    }
    g.reset().setFont('6x8').setFontAlign(0, 0);
    g.clearRect(this.x, this.y, this.x + WIDTH - 1, this.y + 23);
    g.drawString(Math.round(clockError), this.x + WIDTH/2, this.y + 9);

    if (lastPpm !== null) {
      g.setFont('4x6').setFontAlign(0, 1);
      g.drawString(lastPpm.toFixed(1), this.x + WIDTH/2, this.y + 23);
    }
  }

  function loadSettings() {
    settings = Object.assign({
      advanced: false,
      saveState: true,
      debugLog: false,
      ppm: 0,
      ppm0: 0,
      ppm1: 0,
      ppm2: 0,
      adjustThreshold: DEFAULT_ADJUST_THRESHOLD,
      updateInterval: DEFAULT_UPDATE_INTERVAL,
    }, require('Storage').readJSON(SETTINGS_FILE, true) || {});

    if (settings.debugLog) {
      if (debugLogFile === null) {
        debugLogFile = require('Storage').open(DEBUG_LOG_FILE, 'a');
      }
    } else {
      debugLogFile = null;
    }

    settings.updateInterval = Math.max(settings.updateInterval, MIN_INTERVAL);
  }

  function onQuit() {
    let now = Date.now();
    // WIP
    let ppm = (lastPpm !== null) ? lastPpm : settings.ppm;
    let updatedClockError = clockError + (now - lastClockErrorUpdateTime) * ppm / 1000000;
    let save = false;

    if (! settings.saveState) {
      debug(new Date(now).toISOString() + ' QUIT');

    } else if (saved === undefined) {
      save = true;
      debug(new Date(now).toISOString() + ' QUIT & SAVE STATE');

    } else {
      let elapsedSaved = now - saved.time;
      let estimatedClockError = saved.clockError + elapsedSaved * saved.ppm / 1000000;

      let clockErrorDelta = updatedClockError - estimatedClockError;
      let clockErrorDeltaInPpm = clockErrorDelta / elapsedSaved * 1000000;
      let ppmDelta = ppm - saved.ppm;

      let debugA = new Date(now).toISOString() + ' QUIT';
      let debugB =
        '\n> ' + updatedClockError.toFixed(2) + ' - ' + estimatedClockError.toFixed(2) + ' = ' +
        clockErrorDelta.toFixed(2) + ' (' +
        clockErrorDeltaInPpm.toFixed(1) + ' PPM) ; ' +
        ppm.toFixed(1) + ' - ' + saved.ppm.toFixed(1) + ' = ' + ppmDelta.toFixed(1);

      if ((Math.abs(clockErrorDelta) >= SAVE_STATE_CLOCK_ERROR_DELTA_THRESHOLD
           && Math.abs(clockErrorDeltaInPpm) >= SAVE_STATE_CLOCK_ERROR_DELTA_IN_PPM_THRESHOLD
          ) || Math.abs(ppmDelta) >= SAVE_STATE_PPM_DELTA_THRESHOLD
         )
      {
        save = true;
        debug(debugA + ' & SAVE STATE' + debugB);
      } else {
        debug(debugA + debugB);
      }
    }

    if (save) {
      require('Storage').writeJSON(STATE_FILE, {
        counter: (saved === undefined) ? 1 : saved.counter + 1,
        time: Math.round(now),
        clockError: Math.round(updatedClockError * 1000) / 1000,
        ppm: Math.round(ppm * 1000) / 1000,
      });
    }
  }

  function updateClockError(ppm) {
    let now = Date.now();
    let elapsed = now - lastClockErrorUpdateTime;
    let drift = elapsed * ppm / 1000000;
    clockError += drift;
    lastClockErrorUpdateTime = now;
    lastPpm = ppm;

    if (Math.abs(clockError) >= settings.adjustThreshold) {
      let now = Date.now();
      // Shorter variables are faster to look up and this part is time sensitive.
      let e = clockError / 1000;
      setTime(getTime() - e);
      debug(
        new Date(now).toISOString() + ' -> ' + ((now / 1000 - e) % 60).toFixed(3) +
        ' SET TIME (' + clockError.toFixed(2) + ')'
      );
      clockError = 0;
    }

    WIDGETS.adjust.draw();
  }

  // ======================================================================
  // MAIN

  loadSettings();

  WIDGETS.adjust = {
    area: 'tr',
    draw: draw,
    now: () => {
      let now = Date.now();
      // WIP
      let ppm = (lastPpm !== null) ? lastPpm : settings.ppm;
      let updatedClockError = clockError + (now - lastClockErrorUpdateTime) * ppm / 1000000;
      return now - updatedClockError;
    },
    width: settings.hide === true ? 0 : WIDTH,
  };

  if (settings.saveState) {
    saved = require('Storage').readJSON(STATE_FILE, true);
  }

  let now = Date.now();
  lastClockErrorUpdateTime = now;
  if (saved === undefined) {
    clockError = 0;
    debug(new Date().toISOString() + ' START');
  } else {
    clockError = saved.clockError + (now - saved.time) * saved.ppm / 1000000;

    if (Math.abs(clockError) <= MAX_CLOCK_ERROR_FROM_SAVED_STATE) {
      debug(
        new Date().toISOString() + ' START & LOAD STATE (' +
        clockError.toFixed(2) + ')'
      );
    } else {
      debug(
        new Date().toISOString() + ' START & IGNORE STATE (' +
        clockError.toFixed(2) + ')'
      );
      clockError = 0;
    }
  }

  clockCheck();

  E.on('kill', onQuit);

})()
