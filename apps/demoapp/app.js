Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);

var scenes = [
  function() {
    y = -100;
    var step = 4;
    var i = setInterval(function() {
      y+=step;
      if (y>70) {
        clearInterval(i);
        
        i = undefined;
      }
      g.clearRect(0,y-(step+1),240,y-1);
      g.drawImage(Bangle.getLogo(),0,y);
    }, 20);
    Bangle.setLCDMode();
    g.clear();
    return function() {
      if (i) clearInterval(i);
    };
  },
  function() {
    var txt = [" ____                 _ \n"+
          "|  __|___ ___ ___ _ _|_|___ ___ \n"+
          "|  __|_ -| . |  _| | | |   | . |\n"+
          "|____|___|  _|_| |___|_|_|_|___|\n"+
          "         |_| espruino.com\n\n",
    "The JavaScript Interpreter for uCs\n",
    "  * On-chip JS Interpreter",
    "  * GPS, Acclerometer, Compass",
    "  * 64 MHz, 64kB RAM, 512kB + 4MB Flash",
    "  * 240x240 IPS LCD",
    "  * Speaker & Vibration motor",
    "  * Bluetooth LE",
    "  * 1 week battery life",
    "",
    "Includes:",
    "  * Tensorflow AI",
    "  * Bluetooth LE central & periph",
    "  * Graphics Library",
    "  * VT100 terminal",
    "","",""
    ];
    var n=0;
    var i = setInterval(function() {
      Terminal.println(txt[n]);
      n++;
      if (n>=txt.length) {
        clearInterval(i);
        i=undefined;
      }
    }, 200);
    Bangle.setLCDMode();
    return function() {


      if (i) clearInterval(i);
    };
  },
  function() {
    Bangle.setLCDMode("120x120");
    var img = require("heatshrink").decompress(atob("oNBxH+5wA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AHGpAAoQKv4ADCBQAeqsrAAejBw9/B4oABqt/IGepHw5CEQspALH5hBC5pAvv4/MAALFkIBWpPI6IHqpAu0Z3GfYOpRYdPQEhALYIp2FBYNVI4JAvvL4LH0yBYAFJAQQQ5Ay1JAFftBAQBYxCDv+qIGiCHIQiGnIBfOv5BJIQRAyIJkrvKEkIBrFBB4qEGIGRCNYsZAQIQV/IZDEiICRCDQVJAUIQVPC4lVIF6yJQYpAZ5t/FYvNIBepqtVIJGjIDoqBDY2pdYo3DfAhBIQLmpvIcDvIrC5oJEIAhTCGQmj5qgEC4t5e7YrBqt5BI6UFBg15v4XHbQwAQb4oAKv7NKABdVRoYATUAwnICqjZFIMdVE4+jXI4XGYCxBFFZN/M5OpCxUrvJ/ZFYmjvNVAAY+KCwpDBC6YAV5vNC9oA/AH4A/AHYA=="));
    g.clear();
    y = 0;
    var step = 4;
    var i = setInterval(function() {
      y+=step;
      g.clear();
      g.drawImage(img,60,60,{rotate:Math.sin(y*0.03)*0.5});
      g.flip();
    }, 20);    
    return function() {
      if (i) clearInterval(i);
    };
  },
  function() {
    var rx = 0, ry = 0;

    // draw a cube
    function draw() {
      var rcx=Math.cos(rx),
        rsx=Math.sin(rx),
        rcy=Math.cos(ry),
        rsy=Math.sin(ry);
      // Project 3D coordinates into 2D
      function p(x,y,z) {
        var t;
        t = x*rcy + z*rsy;
        z = z*rcy - x*rsy;
        x=t;
        t = y*rcx + z*rsx;
        z = z*rcx - y*rsx;
        y=t;
        z += 6;
        return [240 * (0.5 + x/z), 240 * (0.3 + y/z)];
      }

      var a;
      // draw a series of lines to make up our cube
      a = p(-1,-1,-1); g.moveTo(a[0],a[1]);
      a = p(1,-1,-1); g.lineTo(a[0],a[1]);
      a = p(1,1,-1); g.lineTo(a[0],a[1]);
      a = p(-1,1,-1); g.lineTo(a[0],a[1]);
      a = p(-1,-1,-1); g.lineTo(a[0],a[1]);
      a = p(-1,-1,1); g.moveTo(a[0],a[1]);
      a = p(1,-1,1); g.lineTo(a[0],a[1]);
      a = p(1,1,1); g.lineTo(a[0],a[1]);
      a = p(-1,1,1); g.lineTo(a[0],a[1]);
      a = p(-1,-1,1); g.lineTo(a[0],a[1]);
      a = p(-1,-1,-1); g.moveTo(a[0],a[1]);
      a = p(-1,-1,1); g.lineTo(a[0],a[1]);
      a = p(1,-1,-1); g.moveTo(a[0],a[1]);
      a = p(1,-1,1); g.lineTo(a[0],a[1]);
      a = p(1,1,-1); g.moveTo(a[0],a[1]);
      a = p(1,1,1); g.lineTo(a[0],a[1]);
      a = p(-1,1,-1); g.moveTo(a[0],a[1]);
      a = p(-1,1,1); g.lineTo(a[0],a[1]);
    }

    // rotate and redraw the cube
    function step() {
      // rotate
      rx += 0.1;
      ry += 0.11;
      // draw
      g.clear();
      g.setColor(0xFFFF);
      draw();
      g.flip();
    }

    Bangle.setLCDMode("doublebuffered");
    g.clear();g.flip();
    var i = setInterval(step,50);
    return function() {
      clearInterval(i);
    };
  },
  function() {
    var img = require("heatshrink").decompress(atob("oNBxH+5wA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AHGpAAoQKv4ADCBQAeqsrAAejBw9/B4oABqt/IGepHw5CEQspALH5hBC5pAvv4/MAALFkIBWpPI6IHqpAu0Z3GfYOpRYdPQEhALYIp2FBYNVI4JAvvL4LH0yBYAFJAQQQ5Ay1JAFftBAQBYxCDv+qIGiCHIQiGnIBfOv5BJIQRAyIJkrvKEkIBrFBB4qEGIGRCNYsZAQIQV/IZDEiICRCDQVJAUIQVPC4lVIF6yJQYpAZ5t/FYvNIBepqtVIJGjIDoqBDY2pdYo3DfAhBIQLmpvIcDvIrC5oJEIAhTCGQmj5qgEC4t5e7YrBqt5BI6UFBg15v4XHbQwAQb4oAKv7NKABdVRoYATUAwnICqjZFIMdVE4+jXI4XGYCxBFFZN/M5OpCxUrvJ/ZFYmjvNVAAY+KCwpDBC6YAV5vNC9oA/AH4A/AHYA=="));

    g.clear();
    y = 0;
    var step = 4;
    var i = setInterval(function() {
      y+=step;
      g.scroll(0,1);
      g.drawImage(img,Math.random()*240,Math.random()*240,
        {rotate:Math.random()*6.3, scale:0.5+Math.random()});
    }, 1);
    Bangle.setLCDMode();
    return function() {
      if (i) clearInterval(i);
    };
  }

];
var sceneNo = scenes.length-1;

var stop;
function next() {
  sceneNo++;
  if (sceneNo>=scenes.length) sceneNo=0;
  if (stop) stop();
  clearInterval();
  stop = scenes[sceneNo]();
  setTimeout(next, 10000);
}
next()
