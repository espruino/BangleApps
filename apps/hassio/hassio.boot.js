var HASSIO;
let hassioRunning = false;

function validateHassio(settings) {
  const STR_FIELDS = ["api_key", "host", "id", "friendly_name"];
  const INT_FIELDS = ["interval"];
  const TEMPLATES = "templates";

  if (typeof settings !== "object") {
    return false;
  }

  for (const field of STR_FIELDS) {
    if (settings[field] === undefined || typeof settings[field] !== "string") {
      return false;
    }
  }

  for (const field of INT_FIELDS) {
    if (settings[field] === undefined || typeof settings[field] !== "number") {
      return false;
    }
  }
  if (settings[TEMPLATES] === undefined || !(settings[TEMPLATES] instanceof Array)) {
    return false;
  }
  for (const template of settings[TEMPLATES]) {
    if (template.name === undefined || typeof template.name !== "string") {
      return false;
    }
    if (template.temp === undefined || typeof template.temp !== "string") {
      return false;
    }
  }
  return true;
}

const loadHassio = () => {
  let hassioSettings = require("Storage").read("hassio.json");
  let tmp = HASSIO;
  HASSIO = undefined;
  if (hassioSettings !== undefined) {
    try {
      HASSIO = JSON.parse(hassioSettings);
    } catch(e) {
    }

    if (HASSIO !== undefined && !validateHassio(HASSIO)) {
      HASSIO = undefined;
    }
  }
  if (HASSIO === undefined) {
    HASSIO = tmp;
  }
};

loadHassio();

const runHassio = () => {
  if (HASSIO !== undefined) {
    let hassioAttributes = {
      state_class: "measurement",
      friendly_name: HASSIO.friendly_name,
      unit_of_measurement: "%"
    };

    const postSensor = (data) => {
        const url = `${HASSIO.host}/api/states/sensor.${HASSIO.id}`;
        Bangle.http(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${HASSIO.api_key}`,
            }
        });
    };

    const getBattery = () => {
      const b = E.getBattery(), 
          c = Bangle.isCharging();

      return {
        state: c ? "charging" : "discharging",
        level: b
      };
    };

    Bangle.on("GPS", (fix) => {
      hassioAttributes.gps = fix;
    });

    const updateSensor = () => {
      hassioAttributes.health = Bangle.getHealthStatus("day");
      hassioAttributes.accel = Bangle.getAccel();
      hassioAttributes.battery = getBattery();
      hassioAttributes.compass = Bangle.getCompass();

      postSensor({
        state: hassioAttributes.battery.level,
        attributes: hassioAttributes
      });
    };

    const log = () => {
      Bangle.setCompassPower(true, "hassio");
      Bangle.setHRMPower(true, "hassio");

      setTimeout(() => {
        updateSensor();
        Bangle.setCompassPower(false, "hassio");
        Bangle.setHRMPower(false, "hassio");
      }, 30 * 1000);
    };

    log();
  }
};

(function () {
  if (!hassioRunning) {
    hassioRunning = true;
    setTimeout(() => {
      runHassio();
      setInterval(runHassio, HASSIO.interval);
    }, 5000);
  }
})();
