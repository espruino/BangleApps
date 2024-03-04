Bangle.setLCDMode("doublebuffered");
var img = {
  width : 48, height : 48, bpp : 8,
  transparent : 254,
  buffer : require("heatshrink").decompress(atob("/wA/AH4A/ACl5p9PvIutp9V0YvpFwV553OFlIAC44vnFwtPFwJfnGIl55vNX1dVsQQMvQvdsQADHpd6AYIvnTgd6F4QxbF4gwFfYgvBGAYvbnAyGFwiOBAAVVLzlcrgvEqxeHAAQvdm4vPlYwZF4gHCrguFqxfFF6QWGF44tERw4wSC467DrgOCFxAZGFhhHKGAgxBRoiMEPRItJFxQABwAxDF4VVLBIGCmQuLRpAwFF4i4MLxwvNL4VcvSLEdCaoDF5iODBxQvfRoeAF7wwLRogvgGBYucF47yNF9FVqwuNqoaDeCQvHBQNVFxYbGYDFWfhx8HMCQfRXoowRF5KtBDpbtGMCgdFPpovcDgh7OF7JMGF87cWCY4vPDZZgQlgABF6qaIIhwveYKQvaVp4wYOo59ORioYEDIreOdqwA/AH4A2A"))
};
// ideally we'd just load the image file but it looks like NodeConf
// Bangle.js firmware had bug which meant that transparency in image
// strings wasn't used
//var img = require("Storage").read("*horsey");
var mycounter = 0;
var players = {};
setWatch(x=>{
  mycounter++;
  updateAdvertising();
},BTN1,{repeat:true});

function updateAdvertising() {
  try {
    NRF.setAdvertising({},{
      manufacturer: 0x0590,
      manufacturerData: new Uint8Array([mycounter>>8,mycounter&255]),
      interval: 60
    });
  } catch(e){}
}

function drawPlayers() {
  g.setColor(0,0.3,0);
  g.fillRect(0,0,240,160);
  g.setColor(1,1,1);
  g.setFont("6x8");
  g.setFontAlign(0,0);
  var max = mycounter;
  //var playerCount=0;
  for (var player of players) {
    max = Math.max(player.cnt, mycounter);
    //playerCount++;
  }
  var offset = 0;
  if (max > 200)
    offset = max-200;

  var d = 63 - (offset&63);
  g.fillRect(0,10,240,12);
  for (var x=d;x<240;x+=64)
    g.fillRect(x,12,x+2,12+20);
  var y = 20;
  var p = mycounter-offset;
  g.drawString("You",p-16,y+20);
  g.drawImage(img, p,y);

  //var spacing = (120-20)/(playerCount+1);
  for (var player of players) {
    y+=45;
    var p = player.cnt-offset;
    g.drawString(player.name,p-16,y+20);
    g.drawImage(img, p,y);
  }

  g.fillRect(0,150,240,152);
  for (var x=d;x<240;x+=64)
    g.fillRect(x,152,x+2,160);
  g.flip();
}

function doScan() {
  NRF.findDevices(devs=>{
    devs.forEach(dev => {
      players[dev.id] = {
        name : dev.id.substr(12,5),
        cnt : (dev.manufacturerData[0]<<8)|dev.manufacturerData[1]
      };
    });
    drawPlayers();
    doScan();
  },{timeout : 250, filters : [{ manufacturerData:{0x0590:{}} }] });
}

drawPlayers();
try { NRF.wake(); } catch (e) {}
doScan();
setInterval(drawPlayers, 100);

updateAdvertising();
