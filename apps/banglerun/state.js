var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["Stopped"] = "STOP";
    ActivityStatus["Paused"] = "PAUSE";
    ActivityStatus["Running"] = "RUN";
})(ActivityStatus || (ActivityStatus = {}));
function initState() {
    return {
        fix: NaN,
        lat: NaN,
        lon: NaN,
        alt: NaN,
        vel: NaN,
        dop: NaN,
        gpsValid: false,
        x: NaN,
        y: NaN,
        z: NaN,
        t: NaN,
        timeSinceLog: 0,
        hr: 60,
        hrError: 100,
        fileWritten: false,
        drawing: false,
        status: ActivityStatus.Stopped,
        duration: 0,
        distance: 0,
        speed: 0,
        steps: 0,
        cadence: 0,
    };
}
export { ActivityStatus, initState };
