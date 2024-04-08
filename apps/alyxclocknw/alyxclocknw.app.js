const icoHeartBig = [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0]
];

const icoHeartMiddle = [
    [0,0,0,0,0,0,0,0],
    [0,0,1,0,0,1,0,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0]
];

const icoHeartSmall = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
];

const icoResin = [
    [0,0,0,0,1,1,1,1,0,0,0,0],
    [0,0,1,1,0,0,0,0,1,1,0,0],
    [0,1,1,1,1,0,0,1,1,0,1,0],
    [0,1,1,0,0,0,0,0,0,0,1,0],
    [1,1,1,1,1,1,1,1,0,0,0,1],
    [1,1,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,1,0,1],
    [1,1,1,1,1,1,0,0,0,0,1,1],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,1,1,1,1,0,0,0,0]
];

const icoCharging = [
    [0,0,1,1,1,1,1,0,0,0],
    [1,1,1,0,0,0,1,0,0],
    [0,0,1,0,0,0,1,0,0,0],
    [0,0,1,0,0,0,1,1,1,0],
    [0,0,1,0,0,0,1,0,1,0],
    [1,1,1,0,0,0,1,0,1,1],
    [0,0,1,1,1,1,1,0,0,0]
];

const icoLock = [
    [0,0,1,1,0,0],
    [0,1,0,0,1,0],
    [0,1,0,0,1,0],
    [1,1,1,1,1,1],
    [1,1,1,1,1,1],
    [1,1,1,1,1,1],
    [1,1,1,1,1,1]
];

let idTimeout = null;

function icon (icon, x, y, size, gap) {
  const color = g.getColor();
  for (let r=0; r<icon.length; r++) {
    for (let c=0; c<icon[r].length; c++) {
      if (icon[r][c]===1){
        g.setColor(color);
        g.fillRect(c * size + x, r * size + y, (c+1) * size - gap + x, (r+1)*size - gap + y);
        g.setColor('#fff');
        g.drawLine(c * size + x + size/2 - 1, r * size + y + size/2 - 1, c * size + x + size/2 - 1, r * size + y + size/2 - 1 );
      }
    }
  }
  g.setColor(color);
}

function ohmA(x, y) {
  g.setColor('#666');
  g.fillRect(x, y, x+8, y+15);
  g.setColor('#00f');
  g.drawLine(x, y + 4, x + 8, y + 4);
  g.setColor('#f00');
  g.drawLine(x, y + 6, x + 8, y + 6);
  g.setColor('#0f0');
  g.drawLine(x, y + 8, x + 8, y + 8);
}

function ohmB(x, y) {
  g.setColor('#666');
  g.fillRect(x, y, x+15, y+8);
  g.setColor('#00f');
  g.drawLine(x + 4, y + 8, x + 4, y);
  g.setColor('#f00');
  g.drawLine(x + 6, y + 8, x + 6, y);
  g.setColor('#0f0');
  g.drawLine(x + 8, y + 8, x + 8, y);
}

function heartBig (x, y) {
  g.setColor('#000');
  g.fillRect(x-2, y-2, x + 32, y + 28);
  g.setColor('#666');
  g.drawRect(x-2, y-2, x + 32, y + 28);
  g.setColor('#f00');
  icon(icoHeartBig, x, y, 4, 2);
}

function heartMiddle (x, y) {
  g.setColor('#000');
  g.fillRect(x-2, y-2, x + 32, y + 28);
  g.setColor('#666');
  g.drawRect(x-2, y-2, x + 32, y + 28);
  g.setColor('#f00');
  icon(icoHeartMiddle, x, y, 4, 2);
}

function heartSmall (x, y) {
  g.setColor('#000');
  g.fillRect(x-2, y-2, x + 32, y + 28);
  g.setColor('#666');
  g.drawRect(x-2, y-2, x + 32, y + 28);
  g.setColor('#f00');
  icon(icoHeartSmall, x, y, 4, 2);
}

function heartEmpty (x, y) {
  g.setColor('#000');
  g.fillRect(x-2, y-2, x + 32, y + 28);
  g.setColor('#666');
  g.drawRect(x-2, y-2, x + 32, y + 28);
}

function drawCharging (x, y) {
  g.setColor('#6ff');
  icon(icoCharging, x, y, 4, 2);
}

function drawLock (x, y) {
  g.setColor('#666');
  icon(icoLock, x, y, 4, 2);
}

function resin() {
  let d = Date();
  let h = d.getHours();
  let m = d.getMinutes();

  const resinPosX = 25;
  const resinPosY = 130;
  g.setColor('#000');
  g.fillRect(resinPosX - 3, resinPosY - 3, Bangle.appRect.w - resinPosX + 2, resinPosY + 40);
  g.setColor('#666');
  g.drawRect(resinPosX - 3, resinPosY - 3, Bangle.appRect.w - resinPosX + 2, resinPosY + 40);
  g.setColor('#6ff');
  icon(icoResin, resinPosX, resinPosY, 3, 1);
  g.setFont('6x8', 5);
  g.setFontAlign(-1, -1);
  g.drawString('_' + (m<10?'0':'')+m, resinPosX + 40, resinPosY - 5);

  g.setFontAlign(1, -1);
  g.setFont('6x8', 2);
  g.drawString(h, resinPosX + 66, resinPosY);
}

function screw(x, y) {
  g.setColor('#666').fillCircle(x, y, 4).setColor('#000').drawLine(x - 4, y, x + 4, y);
}

function drawBluetoothLeds() {
  var bluetoothStatus = NRF.getSecurityStatus();
  var x = 50;
  var y = 10;
  if (bluetoothStatus.connected) {
    g.setColor('#0f0').fillCircle(x, y, 8).setColor('#fff').fillCircle(x-3, y-3, 3); 
    g.setColor('#0f0').fillCircle(x+20, y, 8).setColor('#fff').fillCircle(x+20-3, y-3, 3); 
  }
  else if (bluetoothStatus.advertising) {
    g.setColor('#0f0').fillCircle(x, y, 8).setColor('#fff').fillCircle(x-3, y-3, 3); 
    g.setColor('#666').fillCircle(x+20, y, 8).setColor('#fff').fillCircle(x+20-3, y-3, 3); 
  }
  else {
    g.setColor('#666').fillCircle(x, y, 8).setColor('#fff').fillCircle(x-3, y-3, 3); 
    g.setColor('#666').fillCircle(x+20, y, 8).setColor('#fff').fillCircle(x+20-3, y-3, 3); 
  }
}

function drawTime() {
  const R = Bangle.appRect;
  g.setBgColor('#000');
  g.clear();
  g.reset();

  // pcb
  g.setColor('#030').fillRect(R.x, R.y, R.x2, R.y2);
  screw(R.x + 8, R.y + 8);
  screw(R.x2 - 8, R.y + 8);
  screw(R.x + 8, R.y2 - 8);
  screw(R.x2 - 8, R.y2 - 8);
  for(let i=0; i<6; i++) {
    g.setColor('#fff');
    g.drawLine(24 + i * 9, 70, 24 + i * 9, 110);
    g.drawLine(24 + i * 9, 110, 54 + i * 9, 140);
  }

  screw(90, 110);
  
  // led / bluetooth
  drawBluetoothLeds();

  // ohm A
  ohmA(29, 90);
  ohmA(56, 90);
  // ohm B
  ohmB(80, 90);
  ohmB(20, R.y + 10);
  ohmB(90, R.y + 2);
  ohmB(90, R.y + 14);
  
  // Hearts
  var battery = E.getBattery();
  if (battery > 90) {
    heartBig(10, 40); //10,50
    heartBig(50, 40);
    heartBig(90, 40);
  }
  else if (battery > 80) {
    heartBig(10, 40);
    heartBig(50, 40);
    heartMiddle(90, 40);
  }
  else if (battery > 70) {
    heartBig(10, 40);
    heartBig(50, 40);
    heartSmall(90, 40);
  }
  else if (battery > 60) {
    heartBig(10, 40);
    heartBig(50, 40);
    heartEmpty(90, 40);
  }
  else if (battery > 50) {
    heartBig(10, 40);
    heartMiddle(50, 40);
    heartEmpty(90, 40);
  }
  else if (battery > 40) {
    heartBig(10, 40);
    heartSmall(50, 40);
    heartEmpty(90, 40);
  }
  else if (battery > 30) {
    heartBig(10, 40);
    heartEmpty(50, 40);
    heartEmpty(90, 40);
  }
  else if (battery > 20) {
    heartMiddle(10, 40);
    heartEmpty(50, 40);
    heartEmpty(90, 40);
  }
  else if (battery < 10) {
    heartSmall(10, 40);
    heartEmpty(50, 40);
    heartEmpty(90, 40);
  }
  else if (battery > 0) {
    heartEmpty(10, 40);
    heartEmpty(50, 40);
    heartEmpty(90, 40);
  }
  
  // Battery
  if (Bangle.isCharging()) {
    drawCharging(130, 40);
  }
  
  // Lock
  if (Bangle.isLocked()) {
    drawLock(135, 2);
  }

  // Chip + Date
  g.setColor('#666');
  for (let i=0; i<6; i++) {
    g.fillCircle(110 + i*10, 80+10, 3);
    g.fillCircle(110 + i*10, 110+10, 3);
  }
  g.setColor('#000');
  g.fillRect(100, 80+10, 170+3, 110+10);
  g.setColor('#666');
  g.drawRect(100, 80+10, 170+3, 110+10);
  g.setFont('6x8',2).setColor('#666').drawString(Date().getDate()+'.'+("0"+(Date().getMonth()+1)).slice(-2), 108, 85+12);

  resin();

  let d = Date();
  let t = d.getSeconds()*1000 + d.getMilliseconds();
  idTimeout = setTimeout(drawTime, 60000 - t); // time till next minute
}

// special function to handle display switch on
Bangle.on('lcdPower', function(on){
  if (on) {
    drawTime();
  } else {
    if(idTimeout) {
      clearTimeout(idTimeout);
    }
  }
});

// beginn charging
Bangle.on('charging',function(charging) {
  if(charging) {
    Bangle.buzz();
    drawCharging(130, 40);
  }
  else {
    drawTime();
  }
});

// get locked
Bangle.on('lock', function(locked) {
  if (locked) {
    drawLock(135, 2);
  }
  else {
      drawTime();
    }
});

// bluetooth
NRF.on('connect', function(connect) {
  if (connect) {
    drawBluetoothLeds();
  }
  else {
    drawTime();
  }
});
NRF.on('disconnect', function(disconnect) {
  if (disconnect) {
    drawBluetoothLeds();
  }
  else {
    drawTime();
  }
});

// Show launcher when button pressed
Bangle.setUI("clock");
drawTime();
