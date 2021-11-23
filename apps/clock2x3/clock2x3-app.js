
const big = g.getWidth()>200;
const ox=10; // x offset
const oy=big ? 80 : 70;
const pw=big ? 20 : 14; // pixel width
const ps=big ? 5 : 3; // pixel spacing
const ds=big ? 10 : 8; // digit spacing
const ms=20; // middle space

const x00=ox; // digit 0, pixel 0, x position
const x01=x00+pw+ps;
const x10=x01+pw+ds;
const x11=x10+pw+ps;
const x20=x11+pw+ms;
const x21=x20+pw+ps;
const x30=x21+pw+ds;
const x31=x30+pw+ps;
const xSpace=[[x00,x01], // all pixel x spacing
  [x10,x11],
  [x20,x21],
  [x30,x31]];

const y0=oy; // y spacing
const y1=y0+pw+ps;
const y2=y1+pw+ps;
const ySpace=[y0, y1, y2];

const pixels =  [[[0,0], // digit on/off pixels
  [1,1],
  [1,1]],
[[0,1], // digit 1
  [0,1],
  [0,1]],
[[0,1],
  [1,0],
  [1,1]],
[[1,1],
  [0,1],
  [1,1]],
[[1,0],
  [1,1],
  [0,1]],
[[1,1],
  [1,0],
  [0,1]],
[[1,0],
  [1,1],
  [1,1]],
[[1,1],
  [0,1],
  [0,1]],
[[1,1],
  [1,1],
  [1,1]],
[[1,1],
  [1,1],
  [0,1]]];

let idTimeout = null;

function drawTime() {
  g.clear(1);
  Bangle.drawWidgets();
  g.reset();
  let d = Date();
  let h = d.getHours();
  let m = d.getMinutes();
  let digits = [Math.floor(h/10), h%10, Math.floor(m/10), m%10]; // time digits

  for (let id=0; id<4; id++){
    for (let xp=0; xp<2; xp++){
      for (let yp=0; yp<3; yp++){
        if (pixels[digits[id]][yp][xp]==1){
          g.fillRect(xSpace[id][xp], ySpace[yp], xSpace[id][xp]+pw, ySpace[yp]+pw);
        }
      }
    }
  }

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
