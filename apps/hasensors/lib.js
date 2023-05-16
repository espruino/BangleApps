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

exports.sendBattery = function () {
    if (!NRF.getSecurityStatus().connected) return;
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