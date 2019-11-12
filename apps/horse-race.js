Bangle.setLCDMode("doublebuffered");
var img = require("Storage").read("*horsey");
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
  g.clear(1);
  g.setBgColor(0,0.7,0);
  g.setFont("6x8",2);
  g.setFontAlign(0,0,1);
  var max = mycounter;
  for (var player of players) {
    max = Math.max(player.cnt, mycounter);
  }
  var offset = 0;
  if (max > 220)
    offset = max-220;

  var d = 63 - (offset&63);
  g.fillRect(0,10,240,12);
  for (var x=d;x<240;x+=64)
     g.fillRect(x,12,x+2,12+20);
  var y = 20;
  g.drawImage(img, mycounter-offset,y);

  for (var player of players) {
    y+=45;
    g.drawString(player.name,10,y);
    g.drawImage(img, player.cnt-offset,20);
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
