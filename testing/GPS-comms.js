/* This code allows you to communicate with the GPS
receiver in Bangle.js in order to set it up.

Protocol spec:

https://cdn.sparkfun.com/assets/0/b/0/f/7/u-blox8-M8_ReceiverDescrProtSpec__UBX-13003221__Public.pdf

*/

Bangle.setGPSPower(1)
//Bangle.on('GPS',print);

Bangle.on('GPS-raw',function (d) {
  if (d[0]=="$") return;
  if (d.startsWith("\xB5\x62\x05\x01")) print("GPS ACK");
  else if (d.startsWith("\xB5\x62\x05\x00")) print("GPS NACK");
  // 181,98 sync chars  
  else print("GPS",E.toUint8Array(d).join(","));
});
function writeGPScmd(cmd) {
  var d = [0xB5,0x62]; // sync chars
  d = d.concat(cmd);
  var a=0,b=0;
  for (var i=2;i<d.length;i++) {
    a += d[i];
    b += a;
  }
  d.push(a,b);
  Serial1.write(d);
}
function UBX_CFG_PMS() {
  // UBX-CFG-PMS - enable power management - Super-E
  writeGPScmd([0x06,0x86, // msg class + type
         8,0,//length
         0x00,0x03/*1hz*/, 0,0, 0,0, 0,0]);  
}
function UBX_CFG_MSG(msg,enable) {
  //  UBX-CFG-MSG,
  var types = {
  DTM:0x0A, // Datum Reference
  GBQ:0x44, // Poll a standard message (if the current Talker ID is GB)
  GBS:0x09, // GNSS Satellite Fault Detection
  GGA:0x00, // Global positioning system fix data
  GLL:0x01, // Latitude and longitude, with time of position fix and status
  GLQ:0x43, // Poll a standard message (if the current Talker ID is GL)
  GNQ:0x42, // Poll a standard message (if the current Talker ID is GN)
  GNS:0x0D, // GNSS fix data
  GPQ:0x40, // Poll a standard message (if the current Talker ID is GP)
  GRS:0x06, // GNSS Range Residuals
  GSA:0x02, // GNSS DOP and Active Satellites
  GST:0x07, // GNSS Pseudo Range Error Statistics
  GSV:0x03, // GNSS Satellites in View
  RMC:0x04, // Recommended Minimum data
  TXT:0x41, // Text Transmission
  VLW:0x0F, // Dual ground/water distance
  VTG:0x05, // Course over ground and Ground speed
  ZDA:0x08, // Time and Date 
  };
  writeGPScmd([0x06,0x01, // msg class + type
         3,0,//length
         0xF0,types[msg],enable?1:0]);  
}

// Enter super-e low power
// UBX_CFG_PMS()
// Disable DTM messages (see UBX_CFG_MSG comments):
UBX_CFG_MSG("DTM",false);