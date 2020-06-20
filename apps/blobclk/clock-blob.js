const buf = Graphics.createArrayBuffer(144,200,1,{msb:true});
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
  g.setColor(1,1,1);
  g.drawImage({width:buf.getWidth(),height:buf.getHeight(),buffer:buf.buffer},55,26);
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

  for (var p = 0;p<25;p++) {
    var px = p%5;
    var py = Math.floor(p/5);
    if (digits[0] === -1 || NUMBERS[newDigits[0]][p] !== NUMBERS[digits[0]][p] ) {
      drawPixel(0,20,px,py,6,NUMBERS[newDigits[0]][p]);
    }
    if (digits[1] === -1 || NUMBERS[newDigits[1]][p] !== NUMBERS[digits[1]][p] ) {
      drawPixel(78,20,px,py,6,NUMBERS[newDigits[1]][p]);
    }
    if (digits[2] === -1 || NUMBERS[newDigits[2]][p] !== NUMBERS[digits[2]][p] ) {
      drawPixel(0,92,px,py,6,NUMBERS[newDigits[2]][p]);
    }
    if (digits[3] === -1 || NUMBERS[newDigits[3]][p] !== NUMBERS[digits[3]][p] ) {
      drawPixel(78,92,px,py,6,NUMBERS[newDigits[3]][p]);
    }
    if (digits[4] === -1 || NUMBERS[newDigits[4]][p] !== NUMBERS[digits[4]][p] ) {
      drawPixel(69,164,px,py,3,NUMBERS[newDigits[4]][p]);
    }
    if (digits[5] === -1 || NUMBERS[newDigits[5]][p] !== NUMBERS[digits[5]][p] ) {
      drawPixel(108,164,px,py,3,NUMBERS[newDigits[5]][p]);
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
  Bangle.drawWidgets();
  intervalRef = setInterval(redraw,1000);
  redraw();
}
Bangle.loadWidgets();
startTimers();
Bangle.on('lcdPower',function(on) {
  if (on) {
    startTimers();
  } else {
    clearTimers();
  }
});
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
