let isMeasuring = false;
let currentHR = null;
let lcdTimeout;
let logData = [];
let bpmValues = [];
let lastLogTime = 0;

function startMeasure() {
    logData = [];
    isMeasuring = true;
    Bangle.setLCDTimeout(0);
    lcdTimeout = setTimeout(() => {
        Bangle.setLCDTimeout(50);
    }, 50000);

    setTimeout(() => {
        Bangle.setHRMPower(1); // starts HRM
        Bangle.on('HRM', handleHeartRate);
        Bangle.buzz(200, 10); // Buzz to indicate measurement start
        drawScreen();
    }, 500);
}

function stopMeasure() {
    isMeasuring = false;
    clearTimeout(lcdTimeout);
    Bangle.setLCDTimeout(10);
    Bangle.setHRMPower(0);
    Bangle.removeAllListeners('HRM'); //stop HRM
    saveDataToCSV(); // Save data to CSV when measurement stops
    Bangle.buzz(200, 10); // Buzz to indicate measurement stop
    drawScreen();
}

function handleHeartRate(hrm) {
    if (isMeasuring && hrm.confidence > 85) {
        let currentTime = Date.now();
        let elaspedTime = currentTime - lastLogTime;
        let nextLog = 3000 - (elaspedTime % 3000); // Calculate time to next log (3 seconds)
        if (elaspedTime >= 3000) { // Check if it's time for the next log
            lastLogTime = currentTime - (elaspedTime % 3000); // Set last log time to the previous 3-second boundary
            let date = new Date(lastLogTime);
            let dateStr = require("locale").date(date);
            let timeStr = require("locale").time(date, 1);
            let seconds = date.getSeconds();
            let timestamp = `${dateStr} ${timeStr}:${seconds}`; // Concatenate date, time, and seconds
            currentHR = hrm.bpm;

            logData.push({ timestamp: timestamp, heartRate: currentHR });
            bpmValues.push(currentHR); // Store heart rate for HRV calculation
            if (bpmValues.length > 30) bpmValues.shift(); // Keep last 30 heart rate values
            // Calculate and add SDNN (standard deviation of NN intervals) to the last log entry
            logData[logData.length - 1].hrv = calcSDNN();
            drawScreen();
        }
        // Schedule next measurement
        setTimeout(() => {
            handleHeartRate(hrm);
        }, nextLog);
    }
}

function calcSDNN() {
    if (bpmValues.length < 5) return 0; // No calculation if insufficient data

    // Calculate differences between adjacent heart rate values
    const differences = [];
    for (let i = 1; i < bpmValues.length; i++) {
        differences.push(Math.abs(bpmValues[i] - bpmValues[i - 1]));
    }

    // Calculate mean difference
    const meanDifference = differences.reduce((acc, val) => acc + val, 0) / differences.length;

    // Calculate squared differences from mean difference
    const squaredDifferences = differences.map(diff => Math.pow(diff - meanDifference, 2));

    // Calculate mean squared difference
    const meanSquaredDifference = squaredDifferences.reduce((acc, val) => acc + val, 0) / squaredDifferences.length;

    // Calculate SDNN (standard deviation of NN intervals)
    const sdnn = Math.sqrt(meanSquaredDifference);

    return sdnn;
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

        // Draw current heart rate if available
        g.setFont('6x8', 4);
        if (currentHR !== null) {
            g.drawString(currentHR.toString(), g.getWidth() / 2, g.getHeight() / 2 + 20);
            g.setFont('6x8', 1.6);
            g.drawString(' BPM', g.getWidth() / 2 + 42, g.getHeight() / 2 + 20);
        }

        // Draw instructions
        g.setFont('6x8', 1.5);
        g.drawString('Press button to stop', g.getWidth() / 2, g.getHeight() / 2 + 42);
    } else {
        // Draw last heart rate
        if (currentHR !== null && currentHR > 0) {
            g.setFont('Vector', 12);
            g.drawString('Last Heart Rate:', g.getWidth() / 2, g.getHeight() / 2 - 20);
            g.setFont('6x8', 4);
            g.drawString(currentHR.toString(), g.getWidth() / 2, g.getHeight() / 2 + 10);
            g.setFont('6x8', 1.6);
            g.drawString(' BPM', g.getWidth() / 2 + 42, g.getHeight() / 2 + 12);
        } else {
            g.setFont('6x8', 2);
            g.drawString('No data', g.getWidth() / 2, g.getHeight() / 2 + 10);
            g.setFont('6x8', 1);
            g.drawString(message || 'Press button to start', g.getWidth() / 2, g.getHeight() / 2 + 30);
        }
    }

    // Update the display
    g.flip();
}

function saveDataToCSV() {
    let csvContent = "Timestamp,Heart Rate(bpm),HRV(ms)\n";
    logData.forEach(entry => {
        // Scale HRV - placeholder
        let scaledHRV = entry.hrv * 13.16; 
        csvContent += `${entry.timestamp},${entry.heartRate},${scaledHRV}\n`;
    });

    // Write data to the CSV file with the desired file name
    let fileName = "heart_rate_data.csv"; 
    require("Storage").write(fileName, csvContent);
}


setWatch(function() {
    if (!isMeasuring) {
        startMeasure();
    } else {
        stopMeasure();
    }
}, BTN1, { repeat: true, edge: 'rising' });

drawScreen();
