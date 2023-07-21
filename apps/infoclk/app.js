{
  const FONT = require('infoclk-font.js');

  const storage = require("Storage");
  const locale = require("locale");
  const weather = require('weather');

  let config = require('infoclk-config.js').getConfig();

  // Return whether the given time (as a date object) is between start and end (as a number where the first 2 digits are hours on a 24 hour clock and the last 2 are minutes), with end time wrapping to next day if necessary
  let timeInRange = function (start, time, end) {

    // Convert the given date object to a time number
    let timeNumber = time.getHours() * 100 + time.getMinutes();

    // Normalize to prevent the numbers from wrapping around at midnight
    if (end <= start) {
      end += 2400;
      if (timeNumber < start) timeNumber += 2400;
    }

    return start <= timeNumber && timeNumber <= end;
  }

  // Return whether settings should be displayed based on the user's configuration
  let shouldDisplaySeconds = function (now) {
    return (config.seconds.forceWhenUnlocked > 0 && getUnlockStage() >= config.seconds.forceWhenUnlocked) || !(
      (config.seconds.hideAlways) ||
      (config.seconds.hideLocked && getUnlockStage() < 2) ||
      (E.getBattery() <= config.seconds.hideBattery) ||
      (config.seconds.hideTime && timeInRange(config.seconds.hideStart, now, config.seconds.hideEnd))
    );
  }

  // Determine the font size needed to fit a string of the given length widthin maxWidth number of pixels, clamped between minSize and maxSize
  let getFontSize = function (length, maxWidth, minSize, maxSize) {
    let size = Math.floor(maxWidth / length);  //Number of pixels of width available to character
    size *= (20 / 12);  //Convert to height, assuming 20 pixels of height for every 12 of width

    // Clamp to within range
    if (size < minSize) return minSize;
    else if (size > maxSize) return maxSize;
    else return Math.floor(size);
  }

  // Get the current day of the week according to user settings
  let getDayString = function (now) {
    if (config.date.dayFullName) return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    else return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
  }

  // Pad a number with zeros to be the given number of digits
  let pad = function (number, digits) {
    let result = '' + number;
    while (result.length < digits) result = '0' + result;
    return result;
  }

  // Get the current date formatted according to the user settings
  let getDateString = function (now) {
    let month;
    if (!config.date.monthName) month = pad(now.getMonth() + 1, 2);
    else if (config.date.monthFullName) month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][now.getMonth()];
    else month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()];

    if (config.date.mmdd) return `${month}${config.date.separator}${pad(now.getDate(), 2)}`;
    else return `${pad(now.getDate(), 2)}${config.date.separator}${month}`;
  }

  // Get a Gadgetbridge weather string
  let getWeatherString = function () {
    let current = weather.get();
    if (current) return locale.temp(current.temp - 273.15) + ', ' + current.txt;
    else return 'Weather unknown!';
  }

  // Get a second weather row showing humidity, wind speed, and wind direction
  let getWeatherRow2 = function () {
    let current = weather.get();
    if (current) return `${current.hum}%, ${locale.speed(current.wind)} ${current.wrose}`;
    else return 'Check Gadgetbridge';
  }

  // Get a step string
  let getStepsString = function () {
    return '' + Bangle.getHealthStatus('day').steps + ' steps';
  }

  // Get a health string including daily steps and recent bpm
  let getHealthString = function () {
    return `${Bangle.getHealthStatus('day').steps} steps ${Bangle.getHealthStatus('last').bpm} bpm`;
  }

  // Set the next timeout to draw the screen
  let drawTimeout;
  let setNextDrawTimeout = function () {
    if (drawTimeout !== undefined) {
      clearTimeout(drawTimeout);
      drawTimeout = undefined;
    }

    let time;
    let now = new Date();
    if (shouldDisplaySeconds(now)) time = 1000 - (now.getTime() % 1000);
    else time = 60000 - (now.getTime() % 60000);

    drawTimeout = setTimeout(drawLockedSeconds, time);
  }

  /** Return one of the following values:
   *  0: Watch is locked
   *  1: Watch is unlocked, but should still be displaying the large clock (first stage unlock)
   *  2: Watch is unlocked and should be displaying the extra info and icons (second stage unlock)
   */
  let getUnlockStage = function () {
    if (Bangle.isLocked()) return 0;
    else if (dualStageTaps < config.dualStageUnlock) return 1;
    else return 2;
  }


  const DIGIT_WIDTH = 40; // How much width is allocated for each digit, 37 pixels + 3 pixels of space (which will go off of the screen on the right edge)
  const COLON_WIDTH = 19; // How much width is allocated for the colon, 16 pixels + 3 pixels of space
  const HHMM_TOP = 27;    // 24 pixels for widgets + 3 pixels of space
  const DIGIT_HEIGHT = 64; // How tall the digits are

  const SECONDS_TOP = HHMM_TOP + DIGIT_HEIGHT + 3;    // The top edge of the seconds, top of hours and minutes + digit height + space
  const SECONDS_LEFT = 2 * DIGIT_WIDTH + COLON_WIDTH; // The left edge of the seconds: displayed after 2 digits and the colon
  const DATE_LETTER_HEIGHT = DIGIT_HEIGHT / 2;        // Each letter of the day of week and date will be half the height of the time digits

  const DATE_CENTER_X = SECONDS_LEFT / 2;                       // Day of week and date will be centered between left edge of screen and where seconds start
  const DOW_CENTER_Y = SECONDS_TOP + (DATE_LETTER_HEIGHT / 2);  // Day of week will be the top row
  const DATE_CENTER_Y = DOW_CENTER_Y + DATE_LETTER_HEIGHT;      // Date will be the bottom row
  const DOW_DATE_CENTER_Y = SECONDS_TOP + (DIGIT_HEIGHT / 2);   // When displaying both on one row, center it
  const BOTTOM_CENTER_Y = ((SECONDS_TOP + DIGIT_HEIGHT + 3) + g.getHeight()) / 2;

  // Draw a bar with the given top and bottom position
  let drawBar = function (x1, y1, x2, y2) {
    // Draw a day progress bar at the given position with given width and height
    let drawDayProgress = function (x1, y1, x2, y2) {
      // Get a floating point number from 0 to 1 representing how far between the user-defined start and end points we are
      let getDayProgress = function (now) {
        let start = config.bar.dayProgress.start;
        let current = now.getHours() * 100 + now.getMinutes();
        let end = config.bar.dayProgress.end;
        let reset = config.bar.dayProgress.reset;

        // Normalize
        if (end <= start) end += 2400;
        if (current < start) current += 2400;
        if (reset < start) reset += 2400;

        // Convert an hhmm number into a floating-point hours
        let toDecimalHours = function (time) {
          let hours = Math.floor(time / 100);
          let minutes = time % 100;

          return hours + (minutes / 60);
        }

        start = toDecimalHours(start);
        current = toDecimalHours(current);
        end = toDecimalHours(end);
        reset = toDecimalHours(reset);

        let progress = (current - start) / (end - start);

        if (progress < 0 || progress > 1) {
          if (current < reset) return 1;
          else return 0;
        } else {
          return progress;
        }
      }

      let color = config.bar.dayProgress.color;
      g.setColor(color[0], color[1], color[2])
        .fillRect(x1, y1, x1 + (x2 - x1) * getDayProgress(now), y2);
    }

    // Draw a calendar bar at the given position with given width and height
    let drawCalendar = function (x1, y1, x2, y2) {
      let calendar = storage.readJSON('android.calendar.json', true) || [];
      let now = (new Date()).getTime();
      let endTime = now + config.bar.calendar.duration * 1000;
      // Events must end in the future. Requirement to end in the future rather than start is so ongoing events display partially at the left
      // Events must start before the end of the lookahead window
      // Sort longer events first, so shorter events get placed on top. Tries to prevent the situation where an event entirely within the timespan of another gets completely covered
      calendar = calendar.filter(event => ((now < 1000 * (event.timestamp + event.durationInSeconds)) && (event.timestamp * 1000 < endTime)))
        .sort((a, b) => { return b.durationInSeconds - a.durationInSeconds; });

      pipes = []; // Cache the pipes and draw them all at once, on top of the bar

      for (let event of calendar) {
        // left = boundary + how far event is in the future mapped from our allowed duration to a distance in pixels, clamped to x1
        let leftUnclamped = x1 + (event.timestamp * 1000 - now) * (x2 - x1) / (config.bar.calendar.duration * 1000);
        let left = Math.max(leftUnclamped, x1);
        // right = unclamped left + how long the event is mapped from seconds to a distance in pixels, clamped to x2
        let rightUnclamped = leftUnclamped + event.durationInSeconds * (x2 - x1) / (config.bar.calendar.duration)
        let right = Math.min(rightUnclamped, x2);

        //Draw the actual bar
        if (event.color) g.setColor("#" + (0x1000000 + Number(event.color)).toString(16).padStart(6, "0")); // Line plagiarized from the agenda app
        else {
          let color = config.bar.calendar.defaultColor;
          g.setColor(color[0], color[1], color[2]);
        }
        g.fillRect(left, y1, right, y2);

        // Cache the pipes if necessary
        if (leftUnclamped == left) pipes.push(left);
        if (rightUnclamped == right) pipes.push(right);
      }

      // Draw the pipes
      let color = config.bar.calendar.pipeColor;
      g.setColor(color[0], color[1], color[2]);
      for (let pipe of pipes) {
        g.fillRect(pipe - 1, y1, pipe + 1, y2);
      }
    }

    if (config.bar.type == 'dayProgress') {
      drawDayProgress(x1, y1, x2, y2);
    } else if (config.bar.type == 'calendar') {
      drawCalendar(x1, y1, x2, y2);
    } else if (config.bar.type == 'split') {
      let xavg = (x1 + x2) / 2;
      drawDayProgress(x1, y1, xavg, y2);
      drawCalendar(xavg, y1, x2, y2);
      g.setColor(g.theme.fg).fillRect(xavg - 1, y1, xavg + 1, y2);
    }
  }

  // Return whether low battery behavior should be used.
  //  - If the watch isn't charging and the battery is low, mark it low. Once the battery is marked low, it stays marked low for subsequent calls.
  //  - When the watch sees external power, unmark the low battery.
  // This allows us to redraw the full time in the low battery color to avoid only the seconds changing, but still do it once. And it avoids alternating.
  let lowBattery = false;
  let checkLowBattery = function () {
    if (!Bangle.isCharging() && E.getBattery() <= config.lowBattColor.level) lowBattery = true;
    else if (Bangle.isCharging()) lowBattery = false;
    return lowBattery;
  }

  let onCharging = charging => {
    checkLowBattery();
    drawLockedSeconds(true);
  }
  Bangle.on('charging', onCharging);

  // Draw the big seconds that are displayed when the screen is locked. Call drawClock if anything else needs to be updated
  let drawLockedSeconds = function (forceDrawClock) {
    // If the watch is in the second stage of unlock, call drawClock()
    if (getUnlockStage() == 2) {
      drawClock();
      setNextDrawTimeout();
      return
    }

    now = new Date();

    // If we should not be displaying the seconds right now, call drawClock()
    if (!shouldDisplaySeconds(now)) {
      drawClock();
      setNextDrawTimeout();
      return;
    }

    // If the seconds are zero, or we are forced to raw the clock, call drawClock() but also display the seconds
    else if (now.getSeconds() == 0 || forceDrawClock) {
      drawClock();
    }

    // If none of the prior conditions are met, draw the seconds only and do not call drawClock()
    g.reset()
      .setFontAlign(0, 0)
      .clearRect(SECONDS_LEFT, SECONDS_TOP, g.getWidth(), SECONDS_TOP + DIGIT_HEIGHT);

    // If the battery is low, redraw the clock so it can change color
    if (checkLowBattery()) {
      let color = config.lowBattColor.color;
      g.setColor(color[0], color[1], color[2]);
    }

    let tens = Math.floor(now.getSeconds() / 10);
    let ones = now.getSeconds() % 10;
    g.drawImage(FONT[tens], SECONDS_LEFT, SECONDS_TOP)
      .drawImage(FONT[ones], SECONDS_LEFT + DIGIT_WIDTH, SECONDS_TOP);

    setNextDrawTimeout();
  }

  // Draw the bottom text area
  let drawBottomText = function () {
    g.clearRect(0, SECONDS_TOP + DIGIT_HEIGHT, g.getWidth(), g.getHeight());

    if (config.bottomLocked.display == 'progress') drawBar(0, SECONDS_TOP + DIGIT_HEIGHT + 3, g.getWidth(), g.getHeight());
    else {
      let bottomString;

      if (config.bottomLocked.display == 'weather') bottomString = getWeatherString();
      else if (config.bottomLocked.display == 'steps') bottomString = getStepsString();
      else if (config.bottomLocked.display == 'health') bottomString = getHealthString();
      else bottomString = ' ';

      g.reset()
        .setFontAlign(0, 0)
        .setFont('Vector', getFontSize(bottomString.length, 176, 6, g.getHeight() - (SECONDS_TOP + DIGIT_HEIGHT + 3)))
        .drawString(bottomString, g.getWidth() / 2, BOTTOM_CENTER_Y);
    }
  }

  // Draw the clock
  let drawClock = function (now) {
    //Prepare to draw
    g.reset()
      .setFontAlign(0, 0);

    if (checkLowBattery()) {
      let color = config.lowBattColor.color;
      g.setColor(color[0], color[1], color[2]);
    }
    if (now == undefined) now = new Date();

    //When the watch is locked or in first stage
    if (getUnlockStage() < 2) {

      //Draw the hours and minutes
      g.clearRect(0, 24, g.getWidth(), SECONDS_TOP);
      let x = 0;

      for (let digit of locale.time(now, 1)) {  //apparently this is how you get an hh:mm time string adjusting for the user's 12/24 hour preference
        if (digit != ' ') g.drawImage(FONT[digit], x, HHMM_TOP);
        if (digit == ':') x += COLON_WIDTH;
        else x += DIGIT_WIDTH;
      }
      if (storage.readJSON('setting.json')['12hour']) g.drawImage(FONT[(now.getHours() < 12) ? 'am' : 'pm'], 0, HHMM_TOP);

      // If the seconds should be displayed, don't use the area when drawing the date
      if (shouldDisplaySeconds(now)) {
        g.clearRect(0, SECONDS_TOP, SECONDS_LEFT, SECONDS_TOP + DIGIT_HEIGHT)
          .setFont('Vector', getFontSize(getDayString(now).length, SECONDS_LEFT, 6, DATE_LETTER_HEIGHT))
          .drawString(getDayString(now), DATE_CENTER_X, DOW_CENTER_Y)
          .setFont('Vector', getFontSize(getDateString(now).length, SECONDS_LEFT, 6, DATE_LETTER_HEIGHT))
          .drawString(getDateString(now), DATE_CENTER_X, DATE_CENTER_Y);
      }
      // Otherwise, use the seconds area
      else {
        let string = getDayString(now) + ' ' + getDateString(now);
        g.clearRect(0, SECONDS_TOP, g.getWidth(), SECONDS_TOP + DIGIT_HEIGHT)
          .setFont('Vector', getFontSize(string.length, g.getWidth(), 6, DATE_LETTER_HEIGHT))
          .drawString(string, g.getWidth() / 2, DOW_DATE_CENTER_Y);
      }

      drawBottomText();

      // Draw the bar between the rows if necessary
      if (config.bar.enabledLocked && config.bottomLocked.display != 'progress') drawBar(0, HHMM_TOP + DIGIT_HEIGHT, g.getWidth(), SECONDS_TOP);
    }
    // When watch in second stage
    else {
      g.clearRect(0, 24, g.getWidth(), g.getHeight() / 2);
      rows = [
        `${getDayString(now)} ${getDateString(now)} ${locale.time(now, 1)}`,
        getHealthString(),
        getWeatherString(),
        getWeatherRow2()
      ];
      if (shouldDisplaySeconds(now)) rows[0] += ':' + pad(now.getSeconds(), 2);
      if (storage.readJSON('setting.json')['12hour']) rows[0] += ((now.getHours() < 12) ? ' AM' : ' PM');

      let maxHeight = ((g.getHeight() / 2) - HHMM_TOP) / (config.bar.enabledUnlocked ? (rows.length + 1) : rows.length);

      let y = HHMM_TOP + maxHeight / 2;
      for (let row of rows) {
        let size = getFontSize(row.length, g.getWidth(), 6, maxHeight);
        g.setFont('Vector', size)
          .drawString(row, g.getWidth() / 2, y);
        y += maxHeight;
      }

      if (config.bar.enabledUnlocked) drawBar(0, y - maxHeight / 2, g.getWidth(), y + maxHeight / 2);
    }
  }

  // Draw the icons. This is done separately from the main draw routine to avoid having to scale and draw a bunch of images repeatedly.
  let drawIcons = function () {
    g.reset().clearRect(0, 24, g.getWidth(), g.getHeight());
    for (let i = 0; i < 8; i++) {
      let x = [0, 44, 88, 132, 0, 44, 88, 132][i];
      let y = [88, 88, 88, 88, 132, 132, 132, 132][i];
      let appId = config.shortcuts[i];
      let appInfo = storage.readJSON(appId + '.info', 1);
      if (!appInfo) continue;
      icon = storage.read(appInfo.icon);
      g.drawImage(icon, x, y, {
        scale: 0.916666666667
      });
    }
  }

  // Draw only the bottom row if we are in first or second stage unlock, otherwise call drawClock()
  let drawBottomRowOrClock = function () {
    if (getUnlockStage() < 2) drawBottomText();
    else drawClock();
  }

  weather.on("update", drawBottomRowOrClock);
  Bangle.on("step", drawBottomRowOrClock);
  let onLock = locked => {
    //If the watch is unlocked and the necessary number of dual stage taps have been performed, draw the shortcuts
    if (!locked && dualStageTaps >= config.dualStageUnlock) drawIcons();

    // If locked, reset dual stage taps to zero
    else if (locked) dualStageTaps = 0;

    drawLockedSeconds(true);
  };
  Bangle.on('lock', onLock);

  // Launch an app given the current ID. Handles special cases:
  //    false: Do nothing
  //    '#LAUNCHER': Open the launcher
  //    nonexistent app: Do nothing
  let launch = function (appId, fast) {
    if (appId == false) return;
    else if (appId == '#LAUNCHER') {
      Bangle.buzz();
      Bangle.showLauncher();
    } else {
      let appInfo = storage.readJSON(appId + '.info', 1);
      if (appInfo) {
        Bangle.buzz();
        if (fast) Bangle.load(appInfo.src);
        else load(appInfo.src);
      }
    }
  }

  //Set up touch to launch the selected app, and to handle dual stage unlock
  let dualStageTaps = 0;

  let onTouch = function (button, xy) {
    // If only the first stage has been unlocked, increase the counter
    if (dualStageTaps < config.dualStageUnlock) {
      dualStageTaps++;
      Bangle.buzz();

      // If we reach the unlock threshold, redraw the screen because we have now done the second unlock stage
      if (dualStageTaps == config.dualStageUnlock) {
        drawIcons();
        drawClock();
        setNextDrawTimeout(); // In case we need to replace an every minute timeout with an every second timeout
      }

      // If we have unlocked both stages, handle a shortcut tap
    } else {
      let x = Math.floor(xy.x / 44);
      if (x < 0) x = 0;
      else if (x > 3) x = 3;

      let y = Math.floor(xy.y / 44);
      if (y < 0) y = -1;
      else if (y > 3) y = 1;
      else y -= 2;

      if (y < 0) {
        Bangle.buzz();
        Bangle.showLauncher();
      } else {
        let i = 4 * y + x;
        launch(config.shortcuts[i], config.fastLoad.shortcuts[i]);
      }
    }
  };
  Bangle.on('touch', onTouch);

  //Set up swipe handler
  let onSwipe = function (lr, ud) {
    if (lr == -1) launch(config.swipe.left, config.fastLoad.swipe.left);
    else if (lr == 1) launch(config.swipe.right, config.fastLoad.swipe.right);
    else if (ud == -1) launch(config.swipe.up, config.fastLoad.swipe.up);
    else if (ud == 1) launch(config.swipe.down, config.fastLoad.swipe.down);
  };
  Bangle.on('swipe', onSwipe);

  // If the clock starts with the watch unlocked, the first stage of unlocking is skipped
  if (!Bangle.isLocked()) {
    dualStageTaps = config.dualStageUnlock;
    drawIcons();
  }

  // Show launcher when middle button pressed, and enable fast loading
  Bangle.setUI({
    mode: "clock", remove: () => {
      if (drawTimeout !== undefined) {
        clearTimeout(drawTimeout);
        drawTimeout = undefined;
      }
      Bangle.removeListener('charging', onCharging);
      weather.removeListener('update', drawBottomRowOrClock);
      Bangle.removeListener('step', drawBottomRowOrClock);
      Bangle.removeListener('lock', onLock);
      Bangle.removeListener('touch', onTouch);
      Bangle.removeListener('swipe', onSwipe);
      g.reset();
    }
  });

  // Load widgets
  Bangle.loadWidgets();
  Bangle.drawWidgets();

  drawLockedSeconds(true);

}