const h = g.getHeight();
const w = g.getWidth();



// creates a list of prime factors of n and outputs them as a string, if n is prime outputs "Prime Time!"
function primeFactors(n) {
  const factors = [];
  let divisor = 2;

  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  if (factors.length === 1) {
    return "Prime Time!";
  }
  else
    return factors.toString();
}


// converts time HR:MIN to integer HRMIN e.g. 15:35 => 1535
function timeToInt(t) {
    var arr = t.split(':');
    var intTime = parseInt(arr[0])*100+parseInt(arr[1]);

    return intTime;
}



function draw() {
  var date = new Date();
  var timeStr = require("locale").time(date,1);
  var primeStr = primeFactors(timeToInt(timeStr));

  g.reset();
  g.setColor(0,0,0);
  g.fillRect(Bangle.appRect);

  g.setFont("6x8", w/30);
  g.setFontAlign(0, 0);
  g.setColor(100,100,100);
  g.drawString(timeStr, w/2, h/2);
  g.setFont("6x8", w/60);
  g.drawString(primeStr, w/2, 3*h/4);
  queueDraw();
}

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

g.clear();

// Show launcher when middle button pressed
// Bangle.setUI("clock");
// use  clockupdown as it tests for issue #1249
Bangle.setUI("clockupdown", btn=> {
  draw();
});

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
