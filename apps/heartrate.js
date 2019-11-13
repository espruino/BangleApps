Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
Bangle.ioWr(0x80,0)
x=0;
var min=0,max=0;
var wasHigh = 0, wasLow = 0;
var lastHigh = getTime();
var hrmList = [];
var hrm;

function readHRM() {
  var a = analogRead(D29);
  var h = getTime();
  min=Math.min(min*0.97+a*0.03,a);
  max=Math.max(max*0.97+a*0.03,a);
  y = E.clip(170 - (a*960*4),100,230);
  if (x==0) {
    g.clearRect(0,100,239,239);
    g.moveTo(-100,0);
  }
  /*g.setColor(0,1,0);
  var z = 170 - (min*960*4); g.fillRect(x,z,x,z);
  var z = 170 - (max*960*4); g.fillRect(x,z,x,z);*/
  g.setColor(1,1,1);
  g.lineTo(x,y);
  if ((max-min)>0.005) {
    if (4*a > (min+3*max)) { // high
      g.setColor(1,0,0);
      g.fillRect(x,230,x,239);
      g.setColor(1,1,1);
      if (!wasHigh && wasLow) {
        var currentHrm = 60/(h-lastHigh);
        lastHigh = h;
        if (currentHrm<250) {
          while (hrmList.length>12) hrmList.shift();
          hrmList.push(currentHrm);
          // median filter
          var t = hrmList.slice(); // copy
          t.sort();
          // average the middle 3
          var mid = t.length>>1;
          if (mid+2<t.length)
            hrm = (t[mid]+t[mid+1]+t[mid+2])/3;
          else if (mid<t.length)
            hrm = t[mid];
          else
            hrm = 0;
          g.setFontVector(40);
          g.setFontAlign(0,0);
          g.clearRect(0,0,239,100);
          var str = hrm ? Math.round(hrm) : "?";
          var px = 120;
          g.drawString(str,px,40);
          px += g.stringWidth(str)/2;
          g.setFont("6x8");
          g.drawString("BPM",px+20,60);
        }
      }
      wasLow = 0;
      wasHigh = 1;
    } else if (4*a < (max+3*min)) { // low
      wasLow = 1;
    } else { // middle
      g.setColor(0.5,0,0);
      g.fillRect(x,230,x,239);
      g.setColor(1,1,1);
      wasHigh = 0;
    }
  }
  x++;
  if (x>239)x=0;
}

setInterval(readHRM,50);
