{
  // Copied from widbaroalarm
  const LOG_FILE = "zambretti.log.json";
  const history3 = require('Storage').readJSON(LOG_FILE, true) || []; // history of recent 3 hours
  let currentPressures = [];

  const isValidPressureValue = (pressure) => {
    return !(pressure == undefined || pressure <= 0);
  };

  const handlePressureValue = (pressure) => {
    if (pressure == undefined || pressure <= 0) {
      return;
    }

    const ts = Math.round(Date.now() / 1000); // seconds
    const d = {"ts" : ts, "p" : pressure};

    history3.push(d);

    // delete oldest entries until we have max 50
    while (history3.length > 50) {
      history3.shift();
    }

    // delete entries older than 3h
    for (let i = 0; i < history3.length; i++) {
      if (history3[i].ts < ts - (3 * 60 * 60)) {
        history3.shift();
      } else {
        break;
      }
    }

    // write data to storage
    require('Storage').writeJSON(LOG_FILE, history3);
  };

  const barometerPressureHandler = (e) => {
    const MEDIANLENGTH = 20;
    while (currentPressures.length > MEDIANLENGTH)
      currentPressures.pop();

    const pressure = e.pressure;
    if (isValidPressureValue(pressure)) {
      currentPressures.unshift(pressure);
      let median = currentPressures.slice().sort();

      if (median.length > 10) {
        var mid = median.length >> 1;
        let medianPressure = Math.round(E.sum(median.slice(mid - 4, mid + 5)) / 9);
        if (medianPressure > 0) {
          turnOff();
          handlePressureValue(medianPressure);
        }
      }
    }
  };

  /*
  turn on barometer power
  take multiple measurements
  sort the results
  take the middle one (median)
  turn off barometer power
  */
  const getPressureValue = () => {
    Bangle.setBarometerPower(true, "zambretti");
    Bangle.on('pressure', barometerPressureHandler);
    setTimeout(turnOff, 30000);
  };

  const turnOff = () => {
    Bangle.removeListener('pressure', barometerPressureHandler);
    Bangle.setBarometerPower(false, "zambretti");
  };

  // delay pressure measurement by interval-lastrun
  const interval = 15; // minutes
  const lastRun = history3.length > 0 ? history3[history3.length-1].ts : 0;
  const lastRunAgo = Math.round(Date.now() / 1000) - lastRun;
  let diffNextRun = interval*60-lastRunAgo;
  if (diffNextRun < 0) {
    diffNextRun = 0; // run asap
  }
  setTimeout(() => {
    if (interval > 0) {
      setInterval(getPressureValue, interval * 60000);
    }
    getPressureValue();
  }, diffNextRun*1000);
}
