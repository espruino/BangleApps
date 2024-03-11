var option = null;

//debugging or analysis files
//var logfile = require("Storage").open("HRV_log.csv", "w");

var logfile = require("Storage").open("HRV_logs.csv", "a");

var csv = [
          "time",
          "sample count",
          "HR",
          "SDNN",
          "RMSSD",
          "Temp",
          "movement"
          ];
logfile.write(csv.join(",")+"\n");

var samples = 0; // how many samples have we connected?
var collectData = false; // are we currently collecting data?

//var BPM_array = [];
var raw_HR_array = new Float32Array(1536);
var alternate_array = new Float32Array(3072);
var pulse_array = [];
var cutoff_threshold = 0.5;
var sample_frequency = 51.6;
var gap_threshold = 0.15;
var movement = 0;

var px = g.getWidth()/2;
var py = g.getHeight()/2;
var accel; // interval for acceleration logging

function storeMyData(data, file_type) { "ram"
    log = raw_HR_array;
    // shift elements backwards - note the 4, because a Float32 is 4 bytes
    log.set(new Float32Array(log.buffer, 4 /*bytes*/));
    // add ad final element
    log[log.length - 1] = data;
}

function average(samples) {
  return E.sum(samples) / samples.length; // faster builtin
   /* var sum = 0;
    for (var i = 0; i < samples.length; i++) {
        sum += parseFloat(samples[i]);
    }
    var avg = sum / samples.length;
    return avg;*/
}

function StandardDeviation (array) {
  const n = array.length;
  const mean = E.sum(array) / n; //array.reduce((a, b) => a + b) / n;
  //return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
  return Math.sqrt(E.variance(array, mean));
}

function turn_off() {
    Bangle.setHRMPower(0);


    g.clear();
    g.drawString("processing 1/5", px, py);

    rolling_average(raw_HR_array,5);
    g.clear();
    g.drawString("processing 2/5", px, py);

    upscale();
    g.clear();
    g.drawString("processing 3/5", px, py);

    rolling_average(alternate_array,5);
    g.clear();
    g.drawString("processing 4/5", px, py);

    apply_cutoff();
    find_peaks();

    g.clear();
    g.drawString("processing 5/5", px, py);

    calculate_HRV();
}

function bernstein(A, B, C, D, E, t) { "ram"
    s = 1 - t;
    x = (A * Math.pow(s, 4)) + (B * 4 * Math.pow(s, 3) * t) + (C * 6 * s * s * t * t)
        + (D * 4 * s * Math.pow(t, 3)) + (E * Math.pow(t, 4));
    return x;
}

function upscale() { "ram"
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

function rolling_average(values, count) { "ram"
    var temp_array = [];

    for (let i = 0; i < values.length; i++) {
            temp_array = [];
            for (let x = 0; x < count; x++)
                temp_array.push(values[i + x]);
                values[i] = average(temp_array);
    }
}

function apply_cutoff() { "ram"
    var x;
    for (let i = 0; i < alternate_array.length; i++) {
        x = alternate_array[i];
        if (x < cutoff_threshold)
            x = cutoff_threshold;
        alternate_array[i] = x;
    }
}

function find_peaks() { "ram"
    var previous;
    var previous_slope = 0;
    var slope;
    var gap_size = 0;

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

function RMSSD(samples){ "ram"
  var sum = 0;
  var square = 0;
  var data = [];
  var value = 0;

    for (let i = 0; i < samples.length-1; i++) {
        value = Math.abs(samples[i]-samples[i+1])*((1 / (sample_frequency * 2)) * 1000);
        data.push(value);
    }

  for (let i = 0; i < data.length; i++) {
        square = data[i] * data[i];
        Math.round(square);
        sum += square;
    }

  var meansquare = sum/data.length;
  var RMS = Math.sqrt(meansquare);
  RMS = parseInt(RMS);
  return RMS;
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
    if(option == 0)
          Bangle.setLCDPower(1);
    g.clear();
    //var display_stdv = StandardDeviation(pulse_array).toFixed(1);
    var SDNN = (StandardDeviation(temp_array) * (1 / (sample_frequency * 2) * 1000)).toFixed(0);
  var RMS_SD = RMSSD(temp_array);
    g.drawString("SDNN:" + SDNN
                 +"\nRMSSD:" + RMS_SD
                + "\nHR:" + calculatedHR.toFixed(0)
                 +"\nSample Count:" + temp_array.length, px, py);
    Bangle.setLCDPower(1);
    if(option == 0) { // single run
      Bangle.buzz(500,1);
      option = null;
      drawButtons();
    } else {
      var csv = [
          0|getTime(),
          temp_array.length,
          calculatedHR.toFixed(0),
          SDNN,
          RMS_SD,
          E.getTemperature(),
          movement.toFixed(5)
          ];
      logfile.write(csv.join(",")+"\n");


      turn_on();
    }
}


function btn3Pressed() {
  if(option === null){
    logfile.write(""); //reset HRV log
    g.clear();
    g.drawString("continuous mode", px, py);
    option = 1;

    turn_on();
  }
}

function turn_on() {
  //BPM_array = [];
  pulse_array = [];
  samples = 0;
  if (accel) clearInterval(accel);
  movement = 0;
  accel = setInterval(function () {
    movement = movement + Bangle.getAccel().diff;
  }, 1000);
  Bangle.setHRMPower(1);
  collectData = true;
}

function drawButtons() {
  g.setColor("#00ff7f");
  g.setFont("6x8", 2);
  g.setFontAlign(-1,1);
  g.drawString("start recording HRV", 120, 210);
  g.setColor("#ffffff");
  g.setFontAlign(0, 0);
}

g.clear();

drawButtons();

g.setFont("6x8", 2);
g.setColor("#ffffff");
g.setFontAlign(0, 0); // center font

setWatch(btn3Pressed, BTN3, {repeat:true});



Bangle.on('HRM-raw', function (e) {
  if (!collectData) return;
  storeMyData(e.raw, 0);
  if (!(samples & 7)) {
    Bangle.setLCDPower(1);
    g.clearRect(0, py-10, g.getWidth(), py+22);
    if (samples < 100)
      g.drawString("setting up...\nremain still " + samples + "%", px, py, true);
    else
      g.drawString("logging: " + (samples*100/raw_HR_array.length).toFixed(0) + "%", px, py, true);
  }
  if (samples > raw_HR_array.length) {
    collectData = false;
    turn_off();
  }
  samples++;
});
