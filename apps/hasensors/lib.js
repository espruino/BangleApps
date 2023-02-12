// split out into a separate file to keep bootcode short.
function s(key) {
    return (require('Storage').readJSON('hasensors.settings.js', true) || {})[key];
}

function post(sensor, data) {
    const url = s('url') + '/api/states/sensor.' + s('id') + '_' + sensor;
    Bangle.http(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + s('token'),
        }
    });
}

exports.sendBattery = function () {
    if (!NRF.getSecurityStatus().connected) return;
    post('battery_level', {
        state: E.getBattery(),
        attributes: {
            friendly_name: s('name') + " Battery Level",
            unit_of_measurement: "%",
            device_class: "battery",
            state_class: "measurement",
        }
    });
    post('battery_state', {
        state: Bangle.isCharging() ? 'charging' : 'discharging',
        attributes: {
            friendly_name: s('name') + " Battery State",
        }
    });
}