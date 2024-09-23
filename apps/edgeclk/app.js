{
  /* Configuration
  ------------------------------------------------------------------------------*/

  const settings = Object.assign({
    buzzOnCharge: true,
    monthFirst: true,
    twentyFourH: true,
    showAmPm: false,
    showSeconds: true,
    showWeather: false,
    stepGoal: 10000,
    stepBar: true,
    weekBar: true,
    mondayFirst: true,
    dayBar: true,
    liveSteps: false,
  }, require('Storage').readJSON('edgeclk.settings.json', true) || {});

  /* Runtime Variables
  ------------------------------------------------------------------------------*/

  let startTimeout;
  let drawInterval;

  let lcdPower = true;
  let charging = Bangle.isCharging();

  const font = atob('AA////wDwDwDwD////AAAAAAAAwAwA////AAAAAAAA8/8/wzwzwzwz/z/zAAAA4H4HwDxjxjxj////AAAA/w/wAwAwD/D/AwAwAAAA/j/jxjxjxjxjx/x/AAAA////xjxjxjxjx/x/AAAAwAwAwAwAwA////AAAAAA////xjxjxjxj////AAAA/j/jxjxjxjxj////AAAAAAAAAAMMMMAAAAAAAAAAAAAAABMOMMAAAAAAAAAABgBgDwDwGYGYMMMMAAAAAAGYGYGYGYGYGYAAAAAAMMMMGYGYDwDwBgBgAAAA4A4Ax7x7xgxg/g/gAAAA//gBv9shshv9gF/7AAAA////wwwwwwww////AAAA////xjxjxjxj////AAAA////wDwDwDwD4H4HAAAA////wDwDwD4Hf+P8AAAA////xjxjxjxjwDwDAAAA////xgxgxgxgwAwAAAAA////wDwDwzwz4/4/AAAA////BgBgBgBg////AAAAAAwDwD////wDwDAAAAAAAAwPwPwDwD////AAAAAA////DwH4OccO4HwDAAAA////ADADADADADADAAAA////YAGAGAYA////AAAA////MADAAwAM////AAAA////wDwDwDwD////AAAA////xgxgxgxg/g/gAAAA/+/+wGwOwOwO////AAAA////xgxgxwx8/v/jAAAA/j/jxjxjxjxjx/x/AAAAwAwAwA////wAwAwAAAAA////ADADADAD////AAAA/w/8AOAHAHAO/8/wAAAA////AGAYAYAG////AAAAwD4PecH4H4ec4PwDAAAAwA4AeBH/H/eA4AwAAAAAwPwfw7xzzj3D+D8DAAAAAAAAAAAA////wDAAAAAAAAAABgBgBgBgAAAAAAAAAAwD////AAAAAAAAAAAAAwDwPA8A8APADwAwAAAAAAAAAAAAAAAAAAAAAA');

  const iconSize = [19, 26];
  const plugIcon = atob('ExoBBxwA44AccAOOAHHAf/8P/+H//D//h//w//4P/4H/8B/8Af8ABwAA4AAcAAOAAHAADgABwAA4AAcAAOAAHAA=');
  const stepIcon1 = atob('ExoBAfAAPgAHwAD4AB8AAAAB/wD/8D//Bn9wz+cZ/HM/hmfwAP4AAAAD+AD/gBxwB48A4OA8HgcBwcAcOAOGADA=');
  const stepIcon2 = atob('ExoBAfAAPgMHwfD4dx8ccAcH/8B/8Af8AH8AD+AB/AA/gAfwAP4AAAAD+AD/gBxwB48A4OA8HgcBwcAcOAOGADA=');


  /* Draw Functions
  ------------------------------------------------------------------------------*/

  const drawAll = function () {
    const date = new Date();

    drawDate(date);
    if (settings.showSeconds) drawSecs(date);
    drawTime(date);
    drawLower();
  };

  const drawLower = function (stepsOnlyCount) {
    if (charging) {
      drawCharge();
    } else {
      drawSteps(stepsOnlyCount);
    }

    drawWeather();
  };

  const drawWeather = function () {
    if (!settings.showWeather){
      return;
    }

    g.setFontCustom(font, 48, 10, 512 + 12); // double size (1<<9)
    g.setFontAlign(1, 1); // right bottom
    
    try{
      const weather = require('weather');
      const w = weather.get();
      let temp = parseInt(w.temp-273.15);
      temp = temp < 0 ? '\\' + String(temp*-1) : String(temp);

      g.drawString(temp, g.getWidth()-40, g.getHeight() - 1, true);
      
      // clear icon area in case weather condition changed
      g.clearRect(g.getWidth()-40, g.getHeight()-30, g.getWidth(), g.getHeight());
      weather.drawIcon(w, g.getWidth()-20, g.getHeight()-15, 14);

    } catch(e) {
      g.drawString("???", g.getWidth()-3, g.getHeight() - 1, true);
    }
  };

  const drawDate = function (date) {
    const top = 30;
    g.reset();

    // weekday
    g.setFontCustom(font, 48, 10, 512 + 12); // double size (1<<9)
    g.setFontAlign(-1, -1); // left top
    g.drawString(date.toString().slice(0,3).toUpperCase(), 0, top + 12, true);

    // date
    g.setFontAlign(1, -1); // right top
    // Note: to save space first and last two lines of ASCII are left out.
    //       That is why '-' is assigned to '\' and ' ' (space) to '_'.
    if (settings.monthFirst) {
      g.drawString((date.getMonth()+1).toString().padStart(2, '_')
                    + '\\'
                    + date.getDate().toString().padStart(2, 0),
                    g.getWidth(), top + 12, true);
    } else {
      g.drawString('_'
                    + date.getDate().toString().padStart(2, 0)
                    + '\\'
                    + (date.getMonth()+1).toString(),
                    g.getWidth(), top + 12, true);
    }

    // line/progress bar
    if (settings.weekBar) {
      let weekday = date.getDay();
      if (settings.mondayFirst) {
        if (weekday === 0) { weekday = 7; }
      } else {
        weekday += 1;
      }
      drawBar(top, weekday/7);
    } else {
      drawLine(top);
    }
  };

  const drawTime = function (date) {
    const top = 72;
    g.reset();

    const h = date.getHours();
    g.setFontCustom(font, 48, 10, 1024 + 12); // triple size (2<<9)
    g.setFontAlign(-1, -1); // left top
    g.drawString((settings.twentyFourH ? h : (h % 12 || 12)).toString().padStart(2, 0),
                 0, top+12, true);
    g.setFontAlign(0, -1); // center top
    g.drawString(':', g.getWidth()/2, top+12, false);
    const m = date.getMinutes();
    g.setFontAlign(1, -1); // right top
    g.drawString(m.toString().padStart(2, 0),
                 g.getWidth(), top+12, true);

    if (settings.showAmPm) {
      g.setFontCustom(font, 48, 10, 512 + 12); // double size (1<<9)
      g.setFontAlign(1, 1); // right bottom
      g.drawString(h < 12 ? 'AM' : 'PM', g.getWidth(), g.getHeight() - 1, true);
    }

    if (settings.dayBar) {
      drawBar(top, (h*60+m)/1440);
    } else {
      drawLine(top);
    }
  };

  const drawSecs = function (date) {
    g.reset();
    g.setFontCustom(font, 48, 10, 512 + 12); // double size (1<<9)
    g.setFontAlign(1, 1); // right bottom
    g.drawString(date.getSeconds().toString().padStart(2, 0), g.getWidth(), g.getHeight() - 1, true);
  };

  const drawSteps = function (onlyCount) {
    g.reset();
    g.setFontCustom(font, 48, 10, 512 + 12); // double size (1<<9)
    g.setFontAlign(-1, 1); // left bottom

    const steps = Bangle.getHealthStatus('day').steps;
    const toKSteps = settings.showWeather ? 1000 : 100000;
    g.drawString((steps < toKSteps ? steps.toString() : ((steps / 1000).toFixed(0) + 'K')).padEnd(5, '_'),
                 iconSize[0] + 6, g.getHeight() - 1, true);

    if (onlyCount === true) {
      return;
    }

    const progress = steps / settings.stepGoal;
    if (settings.stepBar) {
      drawBar(g.getHeight() - 38, progress);
    } else {
      drawLine(g.getHeight() - 38);
    }

    // icon
    if (progress < 1) {
      g.drawImage(stepIcon1, 0, g.getHeight() - iconSize[1]);
    } else {
      g.drawImage(stepIcon2, 0, g.getHeight() - iconSize[1]);
    }
  };

  const drawCharge = function () {
    g.reset();
    g.setFontCustom(font, 48, 10, 512 + 12); // double size (1<<9)
    g.setFontAlign(-1, 1); // left bottom

    const charge = E.getBattery();
    g.drawString(charge.toString().padEnd(5, '_'), iconSize[0] + 6, g.getHeight() - 1, true);

    drawBar(g.getHeight() - 38, charge / 100);
    g.drawImage(plugIcon, 0, g.getHeight() - 26);
  };

  const drawBar = function (top, progress) {
    // draw frame
    g.drawRect(0, top,      g.getWidth() - 1, top + 5);
    g.drawRect(1, top + 1,  g.getWidth() - 2, top + 4);
    // clear bar area
    g.clearRect(2, top + 2, g.getWidth() - 3, top + 3);
    // draw bar
    const barLen = progress >= 1 ? g.getWidth() : (g.getWidth() - 4) * progress;
    if (barLen < 1) return;
    g.drawLine(2, top + 2,  barLen + 2,       top + 2);
    g.drawLine(2, top + 3,  barLen + 2,       top + 3);
  };

  const drawLine = function (top) {
    const width = g.getWidth();
    g.drawLine(0, top + 2, width, top + 2);
    g.drawLine(0, top + 3, width, top + 3);
  };


  /* Event Handlers
  ------------------------------------------------------------------------------*/

  const onSecondInterval = function () {
    const date = new Date();
    drawSecs(date);
    if (date.getSeconds() === 0) {
      onMinuteInterval();
    }
  };

  const onMinuteInterval = function () {
    const date = new Date();
    drawTime(date);
    drawLower(true);
  };

  const onMinuteIntervalStarter = function () {
    drawInterval = setInterval(onMinuteInterval, 60000);
    startTimeout = null;
    onMinuteInterval();
  };

  const onLcdPower = function (on) {
    lcdPower = on;
    if (on) {
      drawAll();
      startTimers();
    } else {
      stopTimers();
    }
  };

  const onMidnight = function () {
    if (!lcdPower) return;
    drawDate(new Date());
    // Lower part (steps/charge) will be updated every minute.
    // However, to save power while on battery only step count will get updated.
    // This will update icon and progress bar as well:
    if (!charging) drawSteps();
    drawWeather();
  };

  const onHealth = function () {
    if (!lcdPower || charging) return;
    // This will update progress bar and icon:
    drawSteps();
    drawWeather();
  };

  const onLock = function (locked) {
    if (locked) return;
    drawLower();
  };

  const onCharging = function (isCharging) {
    charging = isCharging;
    if (isCharging && settings.buzzOnCharge) Bangle.buzz();
    if (!lcdPower) return;
    drawLower();
  };

  const onStep = function () {
    drawSteps();
  }

  /* Lifecycle Functions
  ------------------------------------------------------------------------------*/

  const registerEvents = function () {
    // This is for original Bangle.js; version two has always-on display:
    Bangle.on('lcdPower', onLcdPower);

    // Midnight event is triggered when health data is reset and a new day begins:
    Bangle.on('midnight', onMidnight);

    // Health data is published via 10 mins interval:
    Bangle.on('health', onHealth);

    // Lock event signals screen (un)lock:
    Bangle.on('lock', onLock);

    // Charging event signals when charging status changes:
    Bangle.on('charging', onCharging);

    // Continously update step count when they happen:
    if (settings.redrawOnStep) Bangle.on('step', onStep);
  };

  const deregisterEvents = function () {
    Bangle.removeListener('lcdPower', onLcdPower);
    Bangle.removeListener('midnight', onMidnight);
    Bangle.removeListener('health', onHealth);
    Bangle.removeListener('lock', onLock);
    Bangle.removeListener('charging', onCharging);
    if (settings.redrawOnStep) Bangle.removeListener('step', onStep);
  };

  const startTimers = function () {
    if (drawInterval) return;
    if (settings.showSeconds) {
      drawInterval = setInterval( onSecondInterval, 1000);
    } else {
      startTimeout = setTimeout(onMinuteIntervalStarter, (60 - new Date().getSeconds()) * 1000);
    }
  };

  const stopTimers = function () {
    if (startTimeout) clearTimeout(startTimeout);
    if (!drawInterval) return;
    clearInterval(drawInterval);
    drawInterval = null;
  };


  /* Startup Process
  ------------------------------------------------------------------------------*/

  g.clear();
  drawAll();
  startTimers();
  registerEvents();

  Bangle.setUI({mode: 'clock', remove: function() {
    stopTimers();
    deregisterEvents();
  }});
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
