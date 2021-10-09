g.clear(); 
let amount = 'global value'; 
function FindFD6FBeacons() { 
NRF.findDevices(function(devices) { 
  g.setFont('Vector', 75); 
  g.setFontAlign(0,0); 
  var amount = devices.length; 
  g.clear(); 
  g.drawString(amount, 125, 100); 
  if (amount == 1) { 
  g.setFont('Vector', 25); 
  g.drawString('FD6F', 125, 150); 
  g.drawString('beacon', 125, 175); 
  g.drawString('nearby', 125, 200); 
  } else{ 
  g.setFont('Vector', 25); 
  g.drawString('FD6F', 125, 150); 
  g.drawString('beacons', 125, 175);
  g.drawString('nearby', 125, 200); 
  }
}, {timeout : 1000, filters : [{services: ['fd6f'] }] }); 
} 
setInterval(FindFD6FBeacons, 2000);
