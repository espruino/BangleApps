var file = require("Storage").open("HR_log.csv", "w");
file.write(""); //reset log

file = require("Storage").open("HR_log.csv", "a");

//debugging or analysis files
var cutoff_file = require("Storage").open("cuttoff.csv", "w");
var peaks_file = require("Storage").open("peaks.csv", "w");
var debugging = true;

var first_signals = 0; // ignore the first several signals
var heartrate = [];
var BPM_array = [];
var raw_HR_array = new Float32Array(1024);
var alternate_array = new Float32Array(3072);
var pulse_array = [];
var pulsecount = 0;
var cutoff_threshold = 0.5;
var sample_frequency = 51.6;
var gap_threshold = 0.15;
var hr_min = 40;
var hr_max = 160;

g.setFontAlign(0, 0); // center font
g.setFont("6x8", 2);

function storeMyData(data, file_type) {
    log = raw_HR_array;
    // shift elements backwards - note the 4, because a Float32 is 4 bytes
    log.set(new Float32Array(log.buffer, 4 /*bytes*/));
    // add ad final element
    log[log.length - 1] = data;
}

function average(samples) {
    var sum = 0;
    for (var i = 0; i < samples.length; i++) {
        sum += parseFloat(samples[i]);
    }
    var avg = sum / samples.length;
    return avg;
}

function StandardDeviation(data) {
    var m = average(data);
    return Math.sqrt(data.reduce(function (sq, n) {
        return sq + Math.pow(n - m, 2);
    }, 0) / (data.length - 1));
}

function turn_off() {
    Bangle.setHRMPower(0);

    g.clear();
    g.drawString("processing 1/5", 120, 120);

    rolling_average(raw_HR_array,5);
    g.clear();
    g.drawString("processing 2/5", 120, 120);

    upscale();
    g.clear();
    g.drawString("processing 3/5", 120, 120);

    rolling_average(alternate_array,5);
    g.clear();
    g.drawString("processing 4/5", 120, 120);

    apply_cutoff();
    if(debugging)
        for (let i = 0; i < 256; i++) {
            cutoff_file.write(alternate_array[i] + "," + "\n");
        }

    find_peaks();
    if(debugging)
        for (let i = 0; i < pulse_array.length; i++) {
            peaks_file.write(pulse_array[i] + "," + "\n");
        }
    g.clear();
    g.drawString("processing 5/5", 120, 120);

    calculate_HRV();
}

function bernstein(A, B, C, D, E, t) {
    s = 1 - t;
    x = (A * Math.pow(s, 4)) + (B * 4 * Math.pow(s, 3) * t) + (C * 6 * s * s * t * t)
        + (D * 4 * s * Math.pow(t, 3)) + (E * Math.pow(t, 4));
    return x;
}

function upscale() {
    var index = 0;
    for (let i = raw_HR_array.length - 1; i > 5; i -= 5) {
        p0 = raw_HR_array[i];
        p1 = raw_HR_array[i - 1];
        p2 = raw_HR_array[i - 2];
        p3 = raw_HR_array[i - 3];
        p4 = raw_HR_array[i - 4];
        for (let T = 0; T < 100; T += 10) {
            x = T / 100;
            D = bernstein(p0, p1, p2, p3, p4, x);
            alternate_array[index] = D;
            index++;
        }
    }
}

function rolling_average(values, count) {
    temp_array = [];

    for (let i = 0; i < values.length; i++) {
            temp_array = [];
            for (let x = 0; x < count; x++)
                temp_array.push(values[i + x]);
            
                values[i] = average(temp_array);
    }
}

function apply_cutoff() {
    var x;
    for (let i = 0; i < alternate_array.length; i++) {
        x = alternate_array[i];
        if (x < cutoff_threshold)
            x = cutoff_threshold;
        alternate_array[i] = x;
    }
}

function find_peaks() {
    var previous;
    var previous_slope = 0;
    var slope;
    var gap_size = 0;
    var temp_array = [];

    for (let i = 0; i < alternate_array.length; i++) {
        if (previous == null)
            previous = alternate_array[i];
        slope = alternate_array[i] - previous;
        if (slope * previous_slope < 0) {
            if (gap_size > 30) {
                pulse_array.push(gap_size);
                gap_size = 0;
            }
        }
        else {
            gap_size++;
        }
        previous_slope = slope;
        previous = alternate_array[i];
    }
}

function calculate_HRV() {
    var gap_average = average(pulse_array);
    var temp_array = [];
    var gap_max = (1 + gap_threshold) * gap_average;
    var gap_min = (1 - gap_threshold) * gap_average;
    for (let i = 0; i < pulse_array.length; i++) {
        if (pulse_array[i] > gap_min && pulse_array[i] < gap_max)
            temp_array.push(pulse_array[i]);
    }
    gap_average = average(temp_array);
    var calculatedHR = (sample_frequency*60)/(gap_average/2);
    g.flip();
    g.clear();
    //var display_stdv = StandardDeviation(pulse_array).toFixed(1);
    var HRV = (StandardDeviation(temp_array) * (1 / (sample_frequency * 2) * 1000)).toFixed(0);
    g.drawString("HRV:" + HRV + "\nHR:" + calculatedHR.toFixed(0)
                 +"\nSample Count:" + temp_array.length, 120, 120);
    Bangle.buzz(500,1);
}

g.clear();
g.drawString("preparing", 120, 120);

Bangle.setHRMPower(1);

Bangle.on('HRM', function (hrm) {
        g.flip();
        if (first_signals < 5) {
            g.clear();
            g.drawString("setting up...\nremain still " + first_signals * 20 + "%", 120, 120);
            first_signals++;
        }
        else {
            BPM_array = hrm.raw;
            if(hrm.bpm > hr_min && hrm.bpm < hr_max)
                heartrate.push(hrm.bpm);
            if (pulsecount < 7) {
                for (let i = 0; i < 256; i++) {
                    file.write(BPM_array[i]+","+"\n");
                    storeMyData(BPM_array[i], 0);
                }
            g.clear();
            g.drawString("logging: " + ((pulsecount/6)*100).toFixed(0) + "%", 120, 120);
            }
            if(pulsecount == 6)
                turn_off();
            pulsecount++;
        }
});
