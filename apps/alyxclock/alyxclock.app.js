const icoH = [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
]

const icoR = [
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
    [0,0,0,0,1,1,1,1,0,0,0,0],
]

let idTimeout = null;

function icon (icon, x, y, size, gap) {
  const color = g.getColor();
  for (let r=0; r<icon.length; r++) {
    for (let c=0; c<icon[r].length; c++) {
      if (icon[r][c]===1){
        g.setColor(color);
        g.fillRect(c * size + x, r * size + y, (c+1) * size - gap + x, (r+1)*size - gap + y);
        g.setColor('#fff');
        g.drawLine(c * size + x + size/2 - 1, r * size + y + size/2 - 1, c * size + x + size/2 - 1, r * size + y + size/2 - 1, )
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

function heart (x, y) {
  g.setColor('#000');
  g.fillRect(x-2, y-2, x + 32, y + 32)
  g.setColor('#666');
  g.drawRect(x-2, y-2, x + 32, y + 32)
  g.setColor('#f00');
  icon(icoH, x, y, 4, 2);
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
  icon(icoR, resinPosX, resinPosY, 3, 1);
  g.setFont('6x8', 5);
  g.setFontAlign(-1, -1);
  g.drawString('_' + (m<10?'0':'')+m, resinPosX + 40, resinPosY - 5);

  g.setFontAlign(1, -1);
  g.setFont('6x8', 2);
  g.drawString(h, resinPosX + 66, resinPosY);
}

function screw(x, y) {
  g.setColor('#666').fillCircle(x, y, 4).setColor('#000').drawLine(x - 4, y, x + 4, y)
}

function led(x,y) {
  g.setColor('#0f0').fillCircle(x, y, 8).setColor('#fff').fillCircle(x-3, y-3, 3);
}


function drawTime() {
  const R = Bangle.appRect;
  g.setBgColor('#000');
  g.clear();
  Bangle.drawWidgets();
  g.reset();

  // pcb
  g.setColor('#030').fillRect(R.x, R.y, R.x2, R.y2);
  screw(R.x + 8, R.y + 8)
  screw(R.x2 - 8, R.y + 8)
  screw(R.x + 8, R.y2 - 8)
  screw(R.x2 - 8, R.y2 - 8)
  for(let i=0; i<6; i++) {
    g.setColor('#fff');
    g.drawLine(24 + i * 9, 70, 24 + i * 9, 110);
    g.drawLine(24 + i * 9, 110, 54 + i * 9, 140);
  }
  ohmA(29, 90);
  ohmA(56, 90);
  ohmB(80, 90);
  screw(90, 110)
  // led
  led(50, R.y+10);
  led(70, R.y+10);
  ohmB(20, R.y + 10);
  ohmB(90, R.y + 2);
  ohmB(90, R.y + 14);

  heart(10, 52);
  heart(50, 52);
  heart(90, 52);



  g.setColor('#666');
  for (let i=0; i<6; i++) {
    g.fillCircle(110 + i*10, 80+10, 3);
    g.fillCircle(110 + i*10, 110+10, 3);
  }
  g.setColor('#000');
  g.fillRect(110, 80+10, 170, 110+10);
  g.setColor('#666');
  g.drawRect(110, 80+10, 170, 110+10);
  g.setFont('6x8').setColor('#666').drawString('AH-118080\n0WT 18-001', 112, 85+10);


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

// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
drawTime();
