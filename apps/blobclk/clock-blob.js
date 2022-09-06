let big = g.getHeight() > 200;
const buf = Graphics.createArrayBuffer(big ? 144 : 120, big ? 180 : 150,1,{msb:true});
// TODO: convert these to Polys -> much faster and cleaner!
const NUMBERS = [
  [1,1,1,1,3,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1],//0
  [0,1,1,1,3,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1],//1
  [1,1,1,1,3,0,0,1,1,1,2,1,1,1,4,1,1,1,0,0,1,1,1,1,1],//2
  [1,1,1,1,3,0,0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1],//3
  [1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,5,1,1,1,1,0,0,1,1,1],//4
  [1,1,1,1,1,1,1,1,0,0,5,1,1,1,3,0,0,1,1,1,1,1,1,1,1],//5
  [1,1,1,1,1,1,1,1,0,0,1,1,1,1,3,1,1,0,1,1,1,1,1,1,1],//6
  [1,1,1,1,3,0,0,1,1,1,0,2,1,1,1,0,1,1,1,0,0,1,1,1,0],//7
  [1,1,1,1,3,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],//8
  [1,1,1,1,3,1,1,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1] //9
];
let intervalRef = null;
let digits = [-1,-1,-1,-1,-1,-1];
function flip() {
  g.reset();
  g.drawImage({width:buf.getWidth(),height:buf.getHeight(),buffer:buf.buffer},
              (g.getWidth() - buf.getWidth())/2,
              26 + (g.getHeight() - (buf.getHeight()+24))/2);
}
function drawPixel(ox,oy,x,y,r,p) {
  let x1 = ox+x*(r*2);
  let y1 = oy+y*(r*2);
  let xmid = x1+r;
  let ymid = y1+r;
  let x2 = xmid+r;
  let y2 = ymid+r;
  if (p > 0) {
    if (p > 1) {
      buf.setColor(0,0,0);
      buf.fillPoly([x1,y1,x2,y1,x2,y2,x1,y2]);
    }
    buf.setColor(1,1,1);
  } else {
    buf.setColor(0,0,0);
  }
  if (p < 2) {
    buf.fillPoly([x1,y1,x2,y1,x2,y2,x1,y2]);
  } else if (p === 2) {
    buf.fillPoly([xmid,y1,x2,y1,x2,y2,x1,y2,x1,ymid]);
  } else if (p === 3) {
    buf.fillPoly([x1,y1,xmid,y1,x2,ymid,x2,y2,x1,y2]);
  } else if (p === 4) {
    buf.fillPoly([x1,y1,x2,y1,x2,ymid,xmid,y2,x1,y2]);
  } else if (p === 5) {
    buf.fillPoly([x1,y1,x2,y1,x2,y2,xmid,y2,x1,ymid]);
  }
}
function redraw() {
  let time = new Date();
  let hours = time.getHours();
  let mins = time.getMinutes();
  let secs = time.getSeconds();

  let newDigits = [Math.floor(hours/10),hours%10,Math.floor(mins/10),mins%10,Math.floor(secs/10),secs%10];

  let s = big?6:5; // size of main digits
  let y2 = big?72:55;
  let y3 = big?144:110;


  for (var p = 0;p<25;p++) {
    var px = p%5;
    var py = Math.floor(p/5);
    if (digits[0] === -1 || NUMBERS[newDigits[0]][p] !== NUMBERS[digits[0]][p] ) {
      drawPixel(0,0,px,py,s,NUMBERS[newDigits[0]][p]);
    }
    if (digits[1] === -1 || NUMBERS[newDigits[1]][p] !== NUMBERS[digits[1]][p] ) {
      drawPixel(13*s,0,px,py,s,NUMBERS[newDigits[1]][p]);
    }
    if (digits[2] === -1 || NUMBERS[newDigits[2]][p] !== NUMBERS[digits[2]][p] ) {
      drawPixel(0,y2,px,py,s,NUMBERS[newDigits[2]][p]);
    }
    if (digits[3] === -1 || NUMBERS[newDigits[3]][p] !== NUMBERS[digits[3]][p] ) {
      drawPixel(13*s,y2,px,py,s,NUMBERS[newDigits[3]][p]);
    }
    if (digits[4] === -1 || NUMBERS[newDigits[4]][p] !== NUMBERS[digits[4]][p] ) {
      drawPixel(17*s - 3*12,y3,px,py,3,NUMBERS[newDigits[4]][p]);
    }
    if (digits[5] === -1 || NUMBERS[newDigits[5]][p] !== NUMBERS[digits[5]][p] ) {
      drawPixel(17*s,y3,px,py,3,NUMBERS[newDigits[5]][p]);
    }
  }
  digits = newDigits;
  flip();
}
function clearTimers() {
  if(intervalRef) {
    clearInterval(intervalRef);
    intervalRef = undefined;
  }
}
function startTimers() {
  g.clear();
  redraw();
  Bangle.drawWidgets();
  intervalRef = setInterval(redraw,1000);
}

// Show launcher when button pressed
Bangle.setUI("clock");

Bangle.loadWidgets();
startTimers();
Bangle.on('lcdPower',function(on) {
  if (on) {
    startTimers();
  } else {
    clearTimers();
  }
});
