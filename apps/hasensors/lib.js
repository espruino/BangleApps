// split out into a separate file to keep bootcode short.
// placeholders are replaced by custom.html before upload
function post(sensor, data) {
    const url = "{url}/api/states/sensor.{id}_" + sensor;
    Bangle.http(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer {token}",
        }
    });
}

function sendBattery() {
    const b = E.getBattery(),
        c = Bangle.isCharging();
    let i = "mdi:battery";
    if (c) i += "-charging";

    post("battery_state", {
        state: c ? "charging" : "discharging",
        attributes: {
            friendly_name: "{name} Battery State",
            icon: i + (c ? "" : "-minus"),
        }
    });

    if (b<10) i += "-outline"; // there is no battery-0
    else if (b<100 || c) i += "-" + Math.floor(b/10)*10; // no battery-100 either

    post("battery_level", {
        state: b,
        attributes: {
            friendly_name: "{name} Battery Level",
            unit_of_measurement: "%",
            device_class: "battery",
            state_class: "measurement",
            icon: i,
        }
    });
}

function sendSteps() {
    post("steps", {
        state: Bangle.getStepCount(),
        attributes: {
            friendly_name: "{name} Step Count",
            unit_of_measurement: "steps",
            state_class: "total",
            icon: "mdi:shoe-print",
        }
    });
}

exports.sendUpdate = function() {
    if (!NRF.getSecurityStatus().connected) return;
    sendBattery();
    sendSteps();
}


let hrm_last = 0;
const HRM_INTERVAL = 10*60*1000;
exports.sendHRM = function (hrm) {
    if (!NRF.getSecurityStatus().connected) return;
    const now = (new Date).getTime();
    if (hrm_last > now-HRM_INTERVAL) return;
    post("hrm", {
        state: hrm.bpm,
            attributes: {
            confidence: hrm.confidence,
            raw: hrm.raw,
            friendly_name: "{name} Heart Rate",
            icon: "mdi:heart",
            unit_of_measurement: "bpm",
            state_class: "measurement",
        }
    });
    hrm_last = now;
};
