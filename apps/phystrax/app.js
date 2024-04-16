var isMeasuring = false;
var currentHeartRate = null;
var lcdTimeout;
var bpmValues = [];
var logData = [];
var lastHeartRateLogTimestamp = 0;

// HRV calculation variables
var hrvSlots = [10, 20, 30, 60, 120, 300];
var hrvValues = {};

// Heart rate monitor functions
function startMeasure() {
    isMeasuring = true;
    Bangle.setLCDTimeout(0);
    lcdTimeout = setTimeout(() => {
        Bangle.setLCDTimeout(50);
    }, 50000);

    setTimeout(() => {
        Bangle.setHRMPower(1);
        Bangle.on('HRM', handleHeartRate);
        Bangle.buzz(500, 20);
        drawScreen();
    }, 500);
}

function stopMeasure() {
    isMeasuring = false;
    clearTimeout(lcdTimeout);
    Bangle.setLCDTimeout(10);
    Bangle.setHRMPower(0);
    Bangle.removeAllListeners('HRM');
    Bangle.buzz(500, 20);
    drawScreen();
}

function drawScreen(message) {
    g.clear(); // Clear the display

    // Set the background color
    g.setColor('#95E7FF');

    // Fill the entire display with the background color
    g.fillRect(0, 0, g.getWidth(), g.getHeight());

    // Set font and alignment for drawing text
    g.setFontAlign(0, 0);
    g.setFont('Vector', 15);

    // Draw the title
    g.setColor('#000000'); // Set text color to black
    g.drawString('Heart Rate Monitor', g.getWidth() / 2, 10);

    if (isMeasuring) {
        // Draw measuring status
        g.setFont('6x8', 2);
        g.drawString('Measuring...', g.getWidth() / 2, g.getHeight() / 2 - 10);

        // Draw current heart rate if available and not zero
        if (currentHeartRate !== null && currentHeartRate > 0) {
            g.setFont('6x8', 4);
            g.drawString(currentHeartRate.toString(), g.getWidth() / 2, g.getHeight() / 2 + 20);
            g.setFont('6x8', 1.6);
            g.drawString(' BPM', g.getWidth() / 2 + 42, g.getHeight() / 2 + 20);
        }

        // Draw instructions
        g.setFont('6x8', 1.5);
        g.drawString('Press button to stop', g.getWidth() / 2, g.getHeight() / 2 + 42);
    } else {
        // Draw last heart rate
        g.setFont('Vector', 12);
        g.drawString('Last Heart Rate:', g.getWidth() / 2, g.getHeight() / 2 - 20);
        if (currentHeartRate !== null && currentHeartRate > 0) {
            g.setFont('6x8', 4);
            g.drawString(currentHeartRate.toString(), g.getWidth() / 2, g.getHeight() / 2 + 10);
            g.setFont('6x8', 1.6);
            g.drawString(' BPM', g.getWidth() / 2 + 42, g.getHeight() / 2 + 12);
        } else {
            g.setFont('6x8', 2);
            g.drawString('No data', g.getWidth() / 2, g.getHeight() / 2 + 10);
            g.setFont('6x8', 1);
            g.drawString(message || 'Press button to start!', g.getWidth() / 2, g.getHeight() / 2 + 30);
        }
    }

    // Update the display
    g.flip();
}

function saveDataToCSV() {
    let date = new Date();
    let dateStr = require("locale").date(date);
    let timeStr = require("locale").time(date, 1);
    let seconds = date.getSeconds();
    let timestamp = `${dateStr} ${timeStr}:${seconds}`;

    // Check if 10 seconds have passed since the last heart rate log
    if (date.getTime() - lastHeartRateLogTimestamp >= 10 * 1000) {
        logData.push({ timestamp: timestamp, heartRate: currentHeartRate });
        lastHeartRateLogTimestamp = date.getTime(); // Update the last heart rate log timestamp

        // Log data to CSV
        let csvContent = "Timestamp,Heart Rate,HRV (ms)\n";
        logData.forEach(entry => {
            if (entry.heartRate > 0) {
                let hrv = hrvValues[entry.timestamp] || ""; // Get HRV value for the timestamp
                csvContent += `${entry.timestamp},${entry.heartRate},${hrv}\n`;
            }
        });
        require("Storage").write("heart_rate_data.csv", csvContent);
    }
}

function handleHeartRate(hrm) {
    if (isMeasuring) {
        currentHeartRate = hrm.bpm;
        drawScreen();

        // Log data to CSV
        saveDataToCSV();

        // Estimate RR intervals
        let rrIntervals = estimateRRIntervals(bpmValues);

        // Calculate HRV
        calculateHRV(rrIntervals);
    }
}

function estimateRRIntervals(rawData) {
    let rrIntervals = [];
    for (let i = 1; i < rawData.length; i++) {
        let rrInterval = rawData[i] - rawData[i - 1];
        rrIntervals.push(rrInterval);
    }
    return rrIntervals;
}

function calculateHRV(rawData) {
    // Calculate HRV with SDNN method for each slot in hrvSlots
    let sdnn = calcSDNN(rawData);
    hrvValues[Date.now()] = sdnn; // Store HRV value with current timestamp

    // Log HRV data if 5 minutes have elapsed
    if (Date.now() - lastHeartRateLogTimestamp >= 5 * 60 * 1000) {
        console.log("Recalculating HRV...");
        saveDataToCSV(); // Save both heart rate and HRV data to the CSV file
        lastHeartRateLogTimestamp = Date.now(); // Update the timestamp
    }
}

function calcSDNN(rrIntervals) {
    let sumOfDifferencesSquared = 0;
    let meanRRInterval = rrIntervals.reduce((acc, val) => acc + val, 0) / rrIntervals.length;
    rrIntervals.forEach(rr => {
        sumOfDifferencesSquared += Math.pow(rr - meanRRInterval, 2);
    });
    let meanOfDifferencesSquared = sumOfDifferencesSquared / (rrIntervals.length - 1);
    return Math.sqrt(meanOfDifferencesSquared);
}

setWatch(function () {
    if (!isMeasuring) {
        startMeasure();
    } else {
        stopMeasure();
    }
}, BTN1, { repeat: true, edge: 'rising' });

drawScreen();
