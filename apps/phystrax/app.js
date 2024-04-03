let isMeasuring = false;
let currentHeartRate = null;
let lcdTimeout;
let logData = [];

function startMeasure() {
    isMeasuring = true;
    Bangle.setLCDTimeout(0);
    lcdTimeout = setTimeout(() => {
        Bangle.setLCDTimeout(50);
    }, 50000);

    setTimeout(() => {
        Bangle.setHRMPower(1);
        Bangle.on('HRM', handleHeartRate);
        Bangle.beep(400, 1000); // Buzz to indicate measurement start
        drawScreen();
    }, 500);
}

function stopMeasure() {
    isMeasuring = false;
    clearTimeout(lcdTimeout);
    Bangle.setLCDTimeout(10);
    Bangle.setHRMPower(0);
    Bangle.removeAllListeners('HRM');
    saveDataToCSV(); // Save data to CSV when measurement stops
    Bangle.beep(400, 800); // Buzz to indicate measurement stop
    drawScreen();
}

function handleHeartRate(hrm) {
    if (hrm.confidence > 90) {
        currentHeartRate = hrm.bpm;
        var date = new Date();
        var dateStr = require("locale").date(date);
        var timeStr = require("locale").time(date, 1);
        var timestamp = dateStr + " " + timeStr; // Concatenate date and time
        logData.push({ timestamp: timestamp, heartRate: currentHeartRate });
        drawScreen();
    }
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
        if (currentHeartRate !== null) {
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
    let csvContent = "Timestamp,Heart Rate\n";
    logData.forEach(entry => {
        csvContent += `${entry.timestamp},${entry.heartRate}\n`;
    });
    require("Storage").write("heart_rate_data.csv", csvContent);
}

setWatch(function() {
    if (!isMeasuring) {
        startMeasure();
    } else {
        stopMeasure();
    }
}, BTN1, { repeat: true, edge: 'rising' });

drawScreen();
