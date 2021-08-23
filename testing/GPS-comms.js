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
  d.push(a&255,b&255);
  Serial1.write(d);
}
function readGPScmd(cmd, callback) {
  var prefix = String.fromCharCode(0xb5,0x62,cmd[0],cmd[1]);
  function handler(d) {
    if (!d.startsWith(prefix)) return;
    clearInterval(timeout);
    var a = E.toUint8Array(d);
    // cut off id + length 
    a = new Uint8Array(a.buffer,6, a.length-8);
    callback(a);
  }
  Bangle.on('GPS-raw',handler);
  var timeout = setTimeout(function() {
    callback();
    Bangle.removeListener('GPS-raw',handler);
  }, 2000);
  writeGPScmd(cmd);
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
//UBX_CFG_MSG("DTM",false);
// UBX-CFG-HNR (0x06 0x5C) - high rate (up to 30hz)


// GPS 181,98,6,62,60,0,0,32,32,7,0,8,16,0,1,0,1,1,1,1,3,0,0,0,1,1,2,4,8,0,0,0,1,1,3,8,16,0,1,0,1,1,4,0,8,0,0,0,1,3,5,0,3,0,1,0,1,5,6,8,14,0,0,0,1,1,84,27
//GPS ACK

function getUBX_CFG_GNSS() {
  // 
  readGPScmd([0x06,0x3E,0,0], function(a) {
    print("CFG_GNSS",a.join(","), a.length);
    var info = {
      numTrkChHw : a[1],
      numTrkChUse : a[2],
      configs : []
    };
    for (var i=4;i<a.length;i+=8) {
      info.configs.push({
        gnss : ["GPS","SBAS","Galileo","BeiDou","IMES","QZSS","GLONASS"][a[i+0]],
        enabled : a[i+4]&1,
        reservedCh : a[1+1],
        maxCh : a[i+2],
        sigCfgMask : a[i+6],
        flags : [a[i+4],a[i+5],a[i+6],a[i+7]]
      });
    }
    print(info);
  });
}

function getUBX_CFG_NMEA() {
  readGPScmd([0x06,0x17,0,0], function(a) {
    print("CFG_NMEA",a.join(","), a.length);
    var info = {
      filter : a[0],
      nmeaVersion : {0x4b:"4.11",0x41:"4.1",0x40:"4",0x23:"2.3",0x21:"2.1"}[a[1]],
      flags : a[3]
    };
    print(info);
  });
}

function setUBX_MGA_INI_TIME_UTC() {
  var a = new Uint8Array(4+24);
  a.set([0x13,0x40,24,0]);
  a.set([ 0x10, // 0: type
          0,  // 1: version
          0, // 2: ref - none
          0x80] ); // 3: leapsecs - unknown
  var d = new Date();
  d.setTime(d.getTime()+d.getTimezoneOffset()*60000); // get as UTC
  var dv = new DataView(a.buffer, 4);
  dv.setUint16(4, d.getFullYear());
  dv.setUint8(6, d.getMonth()+1);
  dv.setUint8(7, d.getDate());
  dv.setUint8(8, d.getHours());
  dv.setUint8(9, d.getMinutes());
  dv.setUint8(10, d.getSeconds());
  dv.setUint16(16, 10*60); // seconds part of accuracy - 10 minutes
  writeGPScmd([].slice.call(a));
}

setUBX_MGA_INI_TIME_UTC();
Bangle.on('GPS',print);

// UBX-MGA-INI-TIME_UTC looks promising for a start time

