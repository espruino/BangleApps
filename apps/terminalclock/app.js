{
  const locale = require("locale");
  let heartRate = 0;
  let altitude = -9001;

  const fontColor = g.theme.dark ? "#0f0" : "#000";
  // handling the differents versions of the Banglejs smartwatch screen sizes
  // default BJS2
  let paddingY = 2;
  let font6x8At4Size = 32;
  let font6x8At2Size = 18;
  let font6x8FirstTextSize = 4;
  let font6x8DefaultTextSize = 2;
  if (process.env.HWVERSION == 1) {
    paddingY = 3;
    font6x8At4Size = 48;
    font6x8At2Size = 27;
    font6x8FirstTextSize = 6;
    font6x8DefaultTextSize = 3;
  }
  // initialising the clockface
  const ClockFace = require("ClockFace");
  const clock = new ClockFace({
    precision: 60,
    settingsFile: "terminalclock.json",

    init: function () {
      // check settings and set default if needed
      this.showHRM = false;
      this.showAltitude = false;
      this.lock_precision = this.precision;
      this.unlock_precision = 1;
      if (this.HRMinConfidence === undefined) this.HRMinConfidence = 50;
      if (this.PowerOnInterval === undefined) this.PowerOnInterval = 15;
      if (this.powerSave === undefined) this.powerSave = this.powerSaving; // migrate old setting
      if (this.powerSave === undefined) this.powerSave = true;

      ["L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9"].forEach((k) => {
        if (this[k] === undefined) {
          if (k == "L2") this[k] = "Date";
          else if (k == "L3") {
            this[k] = "HR";
            this.showHRM = true;
          } else if (k == "L4") this[k] = "Motion";
          else if (k == "L5") this[k] = "Steps";
          else if (k == "L6") this[k] = ">";
          else this[k] = "Empty";
        } else if (this[k] === "HR") this.showHRM = true;
        else if (this[k] === "Alt")
          this.showAltitude = true && process.env.HWVERSION == 2;
      });

      // set the services (HRM, pressure sensor, etc....)
      if (!this.powerSave) {
        turnOnServices();
      } else {
        this.turnOnInterval = setInterval(
          turnOnServices,
          this.PowerOnInterval * 60000,
        ); // every PowerOnInterval min
      }
      // start the clock unlocked
      unlock();
    },

    draw: function (date) {
      let curPos = 1;
      g.setFontAlign(-1, -1);
      g.setColor(fontColor);
      drawTime(date, curPos);
      curPos++;

      ["L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9"].forEach((line) => {
        if (this[line] === "Date") drawDate(date, curPos);
        else if (this[line] === "DOW") drawDOW(date, curPos);
        else if (this[line] === "HR") drawHRM(curPos);
        else if (this[line] === "Motion") drawMotion(curPos);
        else if (this[line] === "Alt") drawAltitude(curPos);
        else if (this[line] === "Steps") drawStepCount(curPos);
        else if (this[line] === ">") drawInput(curPos);
        curPos++;
      });
    },

    remove: function () {
      if (this.turnOnInterval) {
        clearInterval(this.turnOnInterval);
        delete this.turnOnInterval;
      }
      if (this.turnOffServiceTimeout) {
        clearTimeout(this.turnOffServiceTimeout);
        delete this.turnOffServiceTimeout;
      }
      turnOffServices();
      if (this.onLock) Bangle.removeListener("lock", this.onLock);
      if (this.onHRM) Bangle.removeListener("HRM", this.onHRM);
      if (this.onPressure) Bangle.removeListener("pressure", this.onPressure);
    },
  });

  /* ----------------------------
  Draw related of specific lines
  -------------------------------- */

  let drawLine = function (line, pos) {
    if (pos == 1) {
      g.setFont("6x8", font6x8FirstTextSize);
    } else {
      g.setFont("6x8", font6x8DefaultTextSize);
    }

    let yPos =
      Bangle.appRect.y +
      paddingY * (pos - 1) +
      font6x8At4Size * Math.min(1, pos - 1) +
      font6x8At2Size * Math.max(0, pos - 2);
    g.drawString(line, 5, yPos, true);
  };

  let drawTime = function (now, pos) {
    let h = now.getHours();
    let m = now.getMinutes();
    let time = ">" + ("" + h).substr(-2) + ":" + ("0" + m).substr(-2);
    drawLine(time, pos);
  };

  let drawDate = function (now, pos) {
    let date;
    if (clock.isoDate) {
      let year = now.getFullYear();
      let month = now.getMonth() + 1; // Months are 0-11
      let day = now.getDate();
      date = ">" + year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    } else {
      let dow = locale.dow(now, 1);
      date = locale.date(now, 1).substr(0, 6); // day and month e.g. 01/02/ from 01/02/2003
      date += locale.date(now, 1).substr(-2); // short year e.g. 03 from 01/02/2003
      date = ">" + dow + " " + date;
    }
    drawLine(date, pos);
  };

  let drawInput = function (pos) {
    drawLine(">", pos);
  };

  let drawDOW = function (now, pos) {
    drawLine(">" + locale.dow(now, 0), pos);
  };

  let drawStepCount = function (pos) {
    let health = Bangle.getHealthStatus("day");
    let steps_formated = ">Steps: " + health.steps;
    drawLine(steps_formated, pos);
  };

  let drawHRM = function (pos) {
    if (heartRate != 0) {
      drawLine(">HR: " + parseInt(heartRate), pos);
    } else {
      drawLine(
        ">HR: " +
          parseInt(
            Math.round(
              Bangle.getHealthStatus().bpm ||
                Bangle.getHealthStatus("last").bpm,
            ),
          ),
        pos,
      );
    }
  };

  let drawAltitude = function (pos) {
    if (altitude > 0) {
      drawLine(">Alt: " + altitude.toFixed(1) + "m", pos);
    } else {
      drawLine(">Alt: unknown", pos);
    }
  };

  let drawMotion = function (pos) {
    let health = Bangle.getHealthStatus("last");
    let steps_formated = ">Motion: " + parseInt(health.movement);
    drawLine(steps_formated, pos);
  };

  /* -----------------------------------------------
  Services functions (HRM, pressure, etc...)
  -------------------------------------------------- */

  let turnOnServices = function () {
    if (clock.showHRM) {
      Bangle.setHRMPower(true, "terminalclock");
    }
    if (clock.showAltitude) {
      Bangle.setBarometerPower(true, "terminalclock");
    }
    if (clock.powerSave) {
      if (clock.turnOffServiceTimeout)
        clearTimeout(clock.turnOffServiceTimeout);
      clock.turnOffServiceTimeout = setTimeout(function () {
        turnOffServices();
      }, 45000);
    }
  };

  let turnOffServices = function () {
    if (clock.showHRM) {
      Bangle.setHRMPower(false, "terminalclock");
    }
    if (clock.showAltitude) {
      Bangle.setBarometerPower(false, "terminalclock");
    }
  };

  // set the lock and unlock actions
  clock.onLock = (lock_event) => {
    if (lock_event) lock();
    else unlock();
  };
  Bangle.on("lock", clock.onLock);

  clock.onHRM = (hrmInfo) => {
    if (hrmInfo.confidence >= clock.HRMinConfidence) heartRate = hrmInfo.bpm;
  };
  Bangle.on("HRM", clock.onHRM);

  const MEDIANLENGTH = 20; // technical
  let avr = [],
    median; // technical
  clock.onPressure = (pressureInfo) => {
    while (avr.length > MEDIANLENGTH) avr.pop();
    avr.unshift(pressureInfo.altitude);
    median = avr.slice().sort();
    if (median.length > 10) {
      let mid = median.length >> 1;
      altitude = E.sum(median.slice(mid - 4, mid + 5)) / 9;
    } else altitude = pressureInfo.altitude;
  };
  Bangle.on("pressure", clock.onPressure);

  /* -------------------------------------------------
  Clock related functions but not in the ClockFace module
  ---------------------------------------------------- */

  let unlock = function () {
    if (clock.powerSave) {
      turnOnServices();
    }
    clock.precision = clock.unlock_precision;
    clock.tick();
  };

  let lock = function () {
    clock.precision = clock.lock_precision;
    clock.tick();
  };

  // starting the clock
  clock.start();
}
