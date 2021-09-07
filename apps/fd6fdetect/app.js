//Bangle.setLCDPower(1); //debugging purposes
//Bangle.setLCDTimeout(0); // debugging purposes
g.clear(); // clear screen
let amount = 'global value'; // make amount global
function FindFD6FBeacons() { // function for finding COVID beacons
NRF.findDevices(function(devices) { // function for searching for devices with the UUID of FD6F
  g.setFont('Vector', 75); // set size of font to 75x
  g.setFontAlign(0,0); // align font
  var amount = devices.length; // get amount of devices matching FD6F
  g.clear(); // clear screen
  g.drawString(amount, 125, 100); // draw amount of devices matching FD6F
  if (amount == 1) { // check to see if we need to use the word users or user
  g.setFont('Vector', 25); // set size of font to 25x
  g.drawString('FD6F', 125, 150); // draw string
  g.drawString('beacon', 125, 175); // draw string
  g.drawString('nearby', 125, 200); // draw string
  } else{ // if more than one change user to users
  g.setFont('Vector', 25); // set size of font to 25x
  g.drawString('FD6F', 125, 150); // draw string
  g.drawString('beacons', 125, 175); // draw string
  g.drawString('nearby', 125, 200); // draw string
  }
}, {timeout : 1000, filters : [{services: ['fd6f'] }] }); // set filters to target only FD6F beacons
} 
setInterval(FindFD6FBeacons, 2000); // poll for new devices
