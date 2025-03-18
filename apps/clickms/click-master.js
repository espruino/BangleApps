var ME = "-= ME =-";
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
      manufacturerData: new Uint8Array([mycounter>>8,mycounter&255])
    });
  } catch(e){}
}

function drawPlayers() {
  g.clear(1);
  g.setFont("6x8",2);
  var l = [{name:ME,cnt:mycounter}];
  for (const p of players) l.push(p);
  l.sort((a,b)=>a.cnt-b.cnt);
  var y=0;
  l.forEach(player=>{
    if (player.name==ME) g.setColor(1,0,0);
    else g.setColor(1,1,1);
    g.drawString(player.name,10,y);
    g.drawString(player.cnt,180,y);
    y+=16;
  });
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
  },{timeout : 1000, filters : [{ manufacturerData:{0x0590:{}} }] });
}

drawPlayers();
try { NRF.wake(); } catch (e) {}
doScan();
updateAdvertising();
