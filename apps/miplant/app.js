
function getImgHum() {
  return require("heatshrink").decompress(atob("jUoxH+AEtlsoYYDS4ZYDAYaVDLAYFDSQYHDSIZYDBIaPDLAYLDRoZYDBoaLDLAYPDRIZYDCIaHDLAYTDQoZYDCoaDDOQYXAA+JxIYX1utDSwYBAAIzYGiwZUTgpODQpzPGGgY3OdI4aRDIIaMDJIYCDIztDGRwaJP5oaWDAwaRDBAbOC5YcKB5I="));
}
function getImgTemp() {
  return require("heatshrink").decompress(atob("iUqxH+AA2sAAQLHCBASMCAoSLCPOBAAQRfI/5Hn3YACy4ACCL4ADCL5H/I/AQHCRAQJCQwQLCQgQNCQYRQCB4A/ADaPjYqTpSCRYQGCZALFA"));
}
function getImgFert() {
  return require("heatshrink").decompress(atob("kklxH+AC+FwtbDbAfFAAVbEbgiGEbYiHEbQiEsIjiEQYjeEQiPdEQrXdEdKnTAAJsMD6QlJFZAAIGAIkPEaIkCrdhEaR9MT4gkLFAyjMYoojNUZ4jFEoxrGEBCJDEZSWEEZdhCwpsKJQiJFAgYgGEQwjLD4QjFCRD+KCAylGQ4gjXVhAiPEhAKDJIwiQEowIEEQo2GERgAKEYwAcEUQkDEL9VAAgHFETgAIDJwePEZwdTE5ggdMJt6AAQEEqwRMABYQDAAwkBF5AkKEBQAPEUR6ESAQicJIX+A=="));
}

var deviceInfo = {};

function parseDevice(device) {
  var d = new DataView(device.serviceData["fe95"]);
  var frame = d.getUint16(0,true);
  var offset = 5;
  if (frame&16) offset+=6; // mac address
  if (frame&32) offset+=1; // capabilitities
  if (frame&64) { // event
    var l = d.getUint8(offset+2);
    var code = d.getUint16(offset,true);
    if (!deviceInfo[device.id]) deviceInfo[device.id]={id:device.id};
    let event = deviceInfo[device.id];
    switch (code) {
      case 0x1004: event.temperature = d.getInt16(offset+3,true)/10; break;
      case 0x1006: event.humidity = d.getInt16(offset+3)/10; break;
      case 0x100D:
        event.temperature = d.getInt16(offset+3,true)/10;
        event.humidity = d.getInt16(offset+5)/10; break;
      case 0x1008: event.moisture = d.getUint8(offset+3); break;
      case 0x1009: event.fertility = d.getUint16(offset+3,true)/10; break;
      // case 0x1007: break; // 3 bytes? got 84,0,0 or 68,0,0
      default: event.code = code;
        event.raw = new Uint8Array(d.buffer, offset+3, l);
        break;
    }
    //print(event);
    show(event);
  }
}

/*
eg. {
  "id": "c4:7c:8d:6a:ac:79 public",
  "temperature": 16.6, "code": 4103,
  "raw": new Uint8Array([246, 0, 0]),
  "moisture": 46, "fertility": 20.8 }
*/
function show(event) {
  g.reset().setFont("6x8");
  var y = 45 + 55*Object.keys(deviceInfo).indexOf(event.id);

  g.drawString(event.id.substr(0,17),0,y);
  g.drawImage(getImgHum(),0,y+10);
  g.setFont("6x8",2);
  var t = (event.moisture===undefined) ? "?" : event.moisture;
  g.drawString((t+"   ").substr(0,3),35,y+20,true);
  g.drawImage(getImgFert(),80,y+10);
  t = Math.round(event.fertility) || "?";
  g.drawString((t+"   ").substr(0,3), 120, y+20, true);
  g.drawImage(getImgTemp(),160,y+10);
  t = Math.round(event.temperature) || "?";
  g.drawString((t+"   ").substr(0,3), 180, y+20, true);
  g.flip();
}

g.clear();
g.setFont("6x8",2).setFontAlign(0,-1).drawString("Scanning...",120,24);

Bangle.loadWidgets()
Bangle.drawWidgets()

NRF.setScan(parseDevice, { filters: [{serviceData:{"fe95":{}}}], timeout: 2000 });
