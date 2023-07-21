(function (recorders) {
    var __assign = Object.assign;
    var pacific = { lat: -4.21, lon: -146.25 };
    var gpsRecorder = recorders.gps;
    if (!gpsRecorder)
        return;
    recorders.gps = function () {
        var gps = gpsRecorder();
        var offset;
        return __assign(__assign({}, gps), { name: "GPS (scramble)", getValues: function () {
                var values = gps.getValues();
                if (!values[0].length) {
                }
                else if (offset) {
                    values[0] = (Number(values[0]) + offset[0]).toFixed(6);
                    values[1] = (Number(values[1]) + offset[1]).toFixed(6);
                }
                else {
                    offset = [
                        pacific.lat - Number(values[0]),
                        pacific.lon - Number(values[1]),
                    ];
                    values[0] = "" + pacific.lat;
                    values[1] = "" + pacific.lon;
                }
                return values;
            } });
    };
});
