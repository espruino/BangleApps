// Import required libraries
require("Storage");

// Global variables to store phone's latitude and longitude
var phoneLat = 0.0;
var phoneLon = 0.0;
var preferredDistance = 100; // Preferred distance in meters

// Function to draw a shield icon
function drawShield() {
  g.clear();
  g.setColor(1, 1, 1); // Set color to white
  g.fillCircle(90, 100, 40); // Outer circle for the shield
  g.setColor(0, 0, 1); // Set color to blue
  g.fillCircle(90, 100, 35); // Inner circle to create a border effect
  g.setColor(1, 1, 1); // Set color back to white for the shield design
  g.fillRect(80, 80, 100, 120); // Rectangular part of the shield
  g.setFont("6x8", 2);
  g.setColor(0, 0, 0); // Set text color to black
  g.drawString("S", 85, 95); // Draw 'S' to symbolize 'Safe' or 'Shield'
  g.flip();
}

// Conversion of degrees to radians
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Haversine formula to calculate the distance between two GPS points
function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371e3; // Radius of the Earth in meters
  var phi1 = toRadians(lat1);
  var phi2 = toRadians(lat2);
  var deltaPhi = toRadians(lat2 - lat1);
  var deltaLambda = toRadians(lon2 - lon1);

  var a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
          Math.cos(phi1) * Math.cos(phi2) *
          Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// GPS monitoring and alerts
Bangle.on('GPS', function(fix) {
  if (!fix.fix) {
    g.drawString("No GPS available", 20, 40);
    Bangle.buzz(); // Vibrate the watch
    drawShield(); // Draw the shield when GPS is not fixed
  } else {
    var dist = calculateDistance(fix.lat, fix.lon, phoneLat, phoneLon);
    var safe = dist < preferredDistance;
    g.drawString("GPS: " + (safe ? "Safe Zone" : "Unsafe Zone"), 20, 40);
    if (!safe) {
      Bangle.beep(200, 4000); // Beep for 200 ms at 4000 Hz
      Bangle.buzz(500); // Vibrate for 500 ms
    }
    drawShield(); // Redraw the shield with updated status
  }
});

// Bluetooth connection management
NRF.on('connect', function(addr) {
  Bangle.buzz(); // Vibrate upon connection
  drawShield(); // Draw the shield when Bluetooth connects
});

NRF.on('disconnect', function() {
  Bangle.beep(); // Beep upon disconnection
  drawShield(); // Redraw the shield when Bluetooth disconnects
});

// Initialize GPS power
Bangle.setGPSPower(1);

// Update the display periodically
setInterval(drawShield, 1000); // Update every second

// Initialize the application interface
g.clear();
drawShield();
