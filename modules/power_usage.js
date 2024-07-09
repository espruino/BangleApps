exports.get = function () {
    var pwr = E.getPowerUsage();
    var batt = E.getBattery();
    var usage = 0;
    for (var key in pwr.device) {
        if (!/^(LCD|LED)/.test(key))
            usage += pwr.device[key];
    }
    var hrsLeft = 175000 * batt / (100 * usage);
    return {
        usage: usage,
        hrsLeft: hrsLeft,
        batt: batt,
    };
};
