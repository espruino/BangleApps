// HRV detection algorithms sourced from 'https://github.com/jabituyaben/Espruino-HRV'


var first_signals = 0;
var heartrate = [];
var BPM_array = [];

var onHRMRaw = function (hrm) {
    if (first_signals < 5) {
        first_signals++;
        return;
    }
    if (hasLock == false) {
        E.showMessage("Measuring...\nRemain Still", { uploadProgress: raw_HR_array.length });
        hasLock = true;
    }
    var raw = hrm.raw;
    if (raw !== undefined && raw !== null) {
        if (hrm.bpm > hr_min && hrm.bpm < hr_max) {
            heartrate.push(hrm.bpm);
        }
        if (pulsecount < raw_HR_array.length) {
            storeMyData(raw);
            pulsecount++;
            E.emit("packetUpload", {
                l: 1
            });
            if (pulsecount == raw_HR_array.length) {
                turn_off();
            }
        }
    }
}

var raw_HR_array = new Float32Array(2304);
var alternate_array = new Float32Array(4608);
var pulse_array = [];
var pulsecount = 0;
var cutoff_threshold = 0.5;
var sample_frequency = 51.6;
var gap_threshold = 0.25;
var hr_min = 40;
var hr_max = 160;
const Storage = require("Storage");
g.setFontAlign(0, 0);
g.setFont("6x8", 2);

function storeMyData(data) {
    var log = raw_HR_array;
    log.set(new Float32Array(log.buffer, 4));
    log[log.length - 1] = data;
}

function StandardDeviation(data) {
    if (data.length < 2) return 0;
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
        sum += data[i];
    }
    var m = sum / data.length;
    var squaredSum = 0;
    for (var j = 0; j < data.length; j++) {
        var difference = data[j] - m;
        squaredSum += difference * difference;
    }
    return Math.sqrt(squaredSum / (data.length - 1));
}

function turn_off() {
    Bangle.setHRMPower(0);
    E.showMessage("Processing...\nThis may take a while", {
        uploadProgress: 6
    });
    E.emit("packetUpload", {
        l: 1
    });
    g.flip();
    rolling_average(raw_HR_array, 5);
    E.emit("packetUpload", {
        l: 1
    });
    g.flip();
    upscale();
    E.emit("packetUpload", {
        l: 1
    });
    g.flip();
    rolling_average(alternate_array, 5);
    E.emit("packetUpload", {
        l: 1
    });
    g.flip();
    apply_cutoff();
    find_peaks();
    E.emit("packetUpload", {
        l: 1
    });
    g.flip();
    calculate_HRV();
}

var bernsteinCoefficients = [
    [1, 0, 0, 0, 0],
    [0.6561, 0.2916, 0.0486, 0.0036, 0.0001],
    [0.4096, 0.4096, 0.1536, 0.0256, 0.0016],
    [0.2401, 0.4116, 0.2646, 0.0756, 0.0081],
    [0.1296, 0.3456, 0.3456, 0.1536, 0.0256],
    [0.0625, 0.25, 0.375, 0.25, 0.0625],
    [0.0256, 0.1536, 0.3456, 0.3456, 0.1296],
    [0.0081, 0.0756, 0.2646, 0.4116, 0.2401],
    [0.0016, 0.0256, 0.1536, 0.4096, 0.4096],
    [0.0001, 0.0036, 0.0486, 0.2916, 0.6561]
];

function upscale() {
    var index = 0;
    for (var i = raw_HR_array.length - 1; i > 5; i -= 5) {
        var p0 = raw_HR_array[i];
        var p1 = raw_HR_array[i - 1];
        var p2 = raw_HR_array[i - 2];
        var p3 = raw_HR_array[i - 3];
        var p4 = raw_HR_array[i - 4];
        for (var t = 0; t < 10; t++) {
            var c = bernsteinCoefficients[t];
            alternate_array[index] =
                p0 * c[0] +
                p1 * c[1] +
                p2 * c[2] +
                p3 * c[3] +
                p4 * c[4];
            index++;
        }
    }
    while (index < alternate_array.length) {
        alternate_array[index] = 0;
        index++;
    }
}

function rolling_average(values, count) {
    var length = values.length;
    if (length < count)
        return;
    var sum = 0;
    for (var x = 0; x < count; x++) {
        sum += values[x];
    }
    for (var i = 0; i <= length - count; i++) {
        values[i] = sum / count;
        if (i + count < length) {
            sum -= values[i + 1];
            sum += values[i + count];
        }
    }
}

function apply_cutoff() {
    var x;
    for (var i = 0; i < alternate_array.length; i++) {
        x = alternate_array[i];
        if (x < cutoff_threshold)
            x = cutoff_threshold;
        alternate_array[i] = x;
    }
}

function find_peaks() {
    pulse_array = [];
    var minPeakDistance = Math.floor((sample_frequency * 2) * 60 / hr_max * 0.70);
    var maxPeakDistance = Math.floor((sample_frequency * 2) * 60 / hr_min * 1.40);
    var lastPeak = -10000;
    var lastPeakValue = 0;
    var window = 8;
    var length = alternate_array.length;
    for (var i = window; i < length - window; i++) {
        var value = alternate_array[i];
        if (value <= alternate_array[i - 1])
            continue;
        if (value < alternate_array[i + 1])
            continue;
        var localMin = value;
        for (var j = 1; j <= window; j++) {
            var left = alternate_array[i - j];
            var right = alternate_array[i + j];
            if (left < localMin)
                localMin = left;
            if (right < localMin)
                localMin = right;
        }
        var prominence = value - localMin;
        if (prominence <= 0)
            continue;
        if (lastPeak < 0) {
            lastPeak = i;
            lastPeakValue = value;
            continue;
        }
        var gap = i - lastPeak;
        if (gap < minPeakDistance) {
            if (value > lastPeakValue) {
                lastPeak = i;
                lastPeakValue = value;
            }
            continue;
        }
        if (gap > maxPeakDistance) {
            lastPeak = i;
            lastPeakValue = value;
            continue;
        }
        pulse_array.push(gap);
        lastPeak = i;
        lastPeakValue = value;
    }
}

function formatDate(date) {
    var locale = require("locale");
    var timeStr = locale.time(date, 1);
    var meridianStr = locale.meridian(date);
    var monthStr = locale.month(date, 1);
    var dateStr =
        monthStr + " " +
        date.getDate() + ", " +
        date.getFullYear();
    return dateStr + ", " + timeStr + " " + meridianStr;
}

function calculate_HRV() {
    if (pulse_array.length < 2) {
        E.showMessage("Not enough valid beats");
        //   Bangle.buzz(200, 1);
        return;
    }
    var intervals = [];
    var sampleRate2 = sample_frequency * 2;
    var intervalMultiplier = 1000 / sampleRate2;
    for (var i = 0; i < pulse_array.length; i++) {
        var intervalMs =
            pulse_array[i] * intervalMultiplier;
        var bpm = 60000 / intervalMs;
        if (bpm >= hr_min && bpm <= hr_max) {
            intervals.push(intervalMs);
        }
    }
    if (intervals.length < 2) {
        E.showMessage("Not enough valid beats");
        //Bangle.buzz(200, 1);
        return;
    }
    var sum = 0;
    for (var j = 0; j < intervals.length; j++) {
        sum += intervals[j];
    }
    var intervalAverage = sum / intervals.length;
    var gap_max = (1 + gap_threshold) * intervalAverage;
    var gap_min = (1 - gap_threshold) * intervalAverage;
    var temp_array = [];
    for (var k = 0; k < intervals.length; k++) {
        var interval = intervals[k];
        if (interval >= gap_min && interval <= gap_max) {
            temp_array.push(interval);
        }
    }
    if (temp_array.length < 2) {
        E.showMessage("Not enough valid beats");
        //     Bangle.buzz(200, 1);
        return;
    }
    var sorted = temp_array.slice().sort(function (a, b) {
        return a - b;
    });
    var middle = Math.floor(sorted.length / 2);
    var medianRR;
    if (sorted.length % 2)
        medianRR = sorted[middle];
    else
        medianRR = (sorted[middle - 1] + sorted[middle]) / 2;
    var calculatedHR = 60000 / medianRR;
    var SDNN = StandardDeviation(temp_array);
    var squaredDifferences = 0;
    for (var n = 1; n < temp_array.length; n++) {
        var difference =
            temp_array[n] - temp_array[n - 1];
        squaredDifferences += difference * difference;
    }
    var RMSSD = Math.sqrt(squaredDifferences / (temp_array.length - 1));
    E.showMessage("HRV:" + RMSSD.toFixed(0) + "\nHR:" + calculatedHR.toFixed(0) + "\nSample Count:" + temp_array.length, { title: "Complete" });
    var obj = {
        timestamp: Date.now(),
        readableTime: formatDate(new Date()),
        hr: parseFloat(calculatedHR.toFixed(2)),
        hrv: parseFloat(RMSSD.toFixed(0)),
        sdnn: parseFloat(SDNN.toFixed(0)),
        sampleCt: temp_array.length
    };
    var savedData = Storage.readJSON("hrv.json") || {};
    if (!savedData.hrv)
        savedData.hrv = [];
    savedData.started = false;
    savedData.hrv.unshift(obj);
    Storage.writeJSON("hrv.json", savedData);
    Bangle.removeListener("HRM-raw", onHRMRaw);
    Bangle.setHRMPower(0);
    // save memory
    delete raw_HR_array
    delete alternate_array
    delete pulse_array
    delete BPM_array
    //  Bangle.buzz(100, 1);
    setTimeout(load, 60000 / 4);
}

Bangle.setHRMPower(1);
E.showMessage("Setting up...\nRemain Still ");
var hasLock = false;
Bangle.on("HRM-raw", onHRMRaw);

E.on("kill", function () {
    let sd = Storage.readJSON("hrv.json") || {};
    sd.started = false;
    Storage.writeJSON("hrv.json", sd);
})
