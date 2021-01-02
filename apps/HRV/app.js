var option = null;

//debugging or analysis files
var logfile = require("Storage").open("HRV_log.csv", "w");

logfile = require("Storage").open("HRV_log.csv", "a");

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

var debugging = true;

var first_signals = 0; // ignore the first several signals
var heartrate = [];
var BPM_array = [];
var raw_HR_array = new Float32Array(1536);
var alternate_array = new Float32Array(3072);
var pulse_array = [];
var pulsecount = 0;
var cutoff_threshold = 0.5;
var sample_frequency = 51.6;
var gap_threshold = 0.15;
var hr_min = 40;
var hr_max = 160;
var movement = 0;

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

function StandardDeviation (array) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function turn_off() {
    Bangle.setHRMPower(0);
 
    var accel = setInterval(function () {
    movement = movement + Bangle.getAccel().diff;
    }, 1000);
 
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
    find_peaks();
 
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
    var temp_array = [];

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

function RMSSD(samples){
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
          g.flip();
    g.clear();
    //var display_stdv = StandardDeviation(pulse_array).toFixed(1);
    var SDNN = (StandardDeviation(temp_array) * (1 / (sample_frequency * 2) * 1000)).toFixed(0);
  var RMS_SD = RMSSD(temp_array);
    g.drawString("SDNN:" + SDNN
                 +"\nRMSSD:" + RMS_SD
                + "\nHR:" + calculatedHR.toFixed(0)
                 +"\nSample Count:" + temp_array.length, 120, 120);
   
    if(option == 0){
      Bangle.buzz(500,1);
      clearInterval(routine);
    }
 
    else{
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

      movement = 0;
   //   for (let i = 0; i < raw_HR_array.length; i++) {
     //     raw_HR_array[i] = null;
      //}  
    }
}

function btn1Pressed() {
  if(option === null){
    clearInterval(accel);
    g.clear();
    g.drawString("one-off assessment", 120, 120);
    option = 0;
    Bangle.setHRMPower(1);
  }
}

function btn3Pressed() {
  if(option === null){
    logfile.write(""); //reset HRV log
    clearInterval(accel);
    g.clear();
    g.drawString("continuous mode", 120, 120);
    option = 1;
    Bangle.setHRMPower(1);
    }
}

var routine = setInterval(function () {
  clearInterval(accel);
  first_signals = 0; // ignore the first several signals
  pulsecount = 0;
  BPM_array = [];
  heartrate = [];
  pulse_array = [];
  Bangle.setHRMPower(1);
}, 180000);

var accel = setInterval(function () {
  movement = movement + Bangle.getAccel().diff;
}, 1000);

g.clear();
g.setColor("#00ff7f");
g.setFont("6x8", 2);
g.setFontAlign(-1,1);
g.drawString("continuous", 120, 210);
g.setFontAlign(-1,1);
g.drawString("one-time", 140, 50);

g.setColor("#ffffff");
g.setFontAlign(0, 0); // center font
g.drawString("check app README", 120, 120);
g.drawString("for more info", 120, 140);

setWatch(btn1Pressed, BTN1, {repeat:true});
setWatch(btn3Pressed, BTN3, {repeat:true});

Bangle.on('HRM', function (hrm) {
        if(option == 0)
          g.flip();
        if (first_signals < 3) {
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
