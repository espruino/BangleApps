// split out into a separate file to keep bootcode short.
// placeholders are replaced by custom.html before upload
function post(sensor, data) {
    const url = '{url}/api/states/sensor.{id}_' + sensor;
    Bangle.http(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer {token}',
        }
    });
}

exports.sendBattery = function () {
    if (!NRF.getSecurityStatus().connected) return;
    post('battery_level', {
        state: E.getBattery(),
        attributes: {
            friendly_name: "{name} Battery Level",
            unit_of_measurement: "%",
            device_class: "battery",
            state_class: "measurement",
        }
    });
    post('battery_state', {
        state: Bangle.isCharging() ? 'charging' : 'discharging',
        attributes: {
            friendly_name: "{name} Battery State",
        }
    });
}