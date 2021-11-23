// exec each function from seq one after the other
function animate(seq,period) {
  var i = setInterval(function() {
    if (seq.length) {
      var f = seq.shift();
      if (f) f();
    } else clearInterval(i);
  },period);
}

// Fade in to FG color with angled lines
function fade(col, callback) {
  var n = 0;
  function f() {"ram"
    g.setColor(col);
    for (var i=n;i<240;i+=10) g.drawLine(i,0,0,i).drawLine(i,240,240,i);
    g.flip();
    n++;
    if (n<10) setTimeout(f,0);
    else callback();
  }
  f();
}


var SCENE_COUNT=11;
function getScene(n) {
  if (n==0) return function() {
    console.log("Start app");
    g.clear(1);
    eval(require("Storage").read("mywelcome.custom.js"));
  }
  if (n==1) return function() {
    g.clear(1);
    g.setFont("4x6",2);
    var n=0;
    var l = Bangle.getLogo();
    var i = setInterval(function() {
      n+=0.04;
      g.setColor(n,n,n);
      g.drawImage(l,(240-222)/2,(240-100)/2);
      if (n>=1) {
        clearInterval(i);
        setTimeout(()=>g.drawString("Open",34,144), 500);
        setTimeout(()=>g.drawString("Hackable",34,156), 1000);
        setTimeout(()=>g.drawString("Smart Watch",34,168), 1500);
      }
    },50);
  };
  if (n==2) return function() {
    var img = require("heatshrink").decompress(atob("ptRxH+qYAfvl70mj5gAC0ekvd8FkAAdz3HJAYAH4+eJXWkJJYAF0hK2vfNJaIAB5t7S3fN5/V6wAD6vOTg9SumXy2W3QAB3eXul2JdnO63XAApPEVYvAJQIACJoRQDzBLoJQ3W5/NIwr4GJohMFAAROgJYvVJQiPGABZNN3bsdvYyESwnWJSIAC3RNM3V1JjZAES4nVJSYAB4xMNJrbkE56WD5xLVdB5NbFofNJbgABJh26qREPrFXrlbAAWjFgfWJgRLaTQhMLy5KNJINhsJLDrYrD5xLC6pLa5nGTR7oLq9bJQJMKTAXWJbbnR3RLJSoRMHv4pC5rkec6SaIrBLGw2r2XW1epcoqYeJiOXJYziEsOH2RBBw7lF56Yg5nGc6FScZOGJQPX2TmDFIfVTEBMSc4hLEw5KB6+rsJMH63X6pMf5hMQzBLCq5LD1ZLEJhTlfJiWXTA2GJYpMIcwPNc2O6TAuGRIPX1igDJg/PJmyYDcgXWwxMH1ApC53XcsHAJiVYcg2HJYZME0YpC5vWJkhLNJgLlDTAeFJhF/FQfVJkG6JiGXcomyJgOrJYhMErYqD53NJj7lRzBMDcoeGJhzoBJb3GJiN1qZBCJgWyJYpNF1LigAAXAJiNSJgzlGJgt/JkZLRy9TJgeHJhznFcuSZGw5MHJomjcuhLBqdcJiSaiTChMV1CYxy5LCqdXIAWy6+rJhCalTCN2JgdYH4WHJiGpTF7kDc43W2RMJTUZLQzBLFc4mr6+GJh2jTFmXJYyaEwuyc5Sag4xLZTQmG2WFJhxNaJYZMLJZSaEJoOHTR9/Ja+6JbdTqRNETRRNF1JLV4BLcAANYI5ToK1BLYJhWYJZwABq5NoJZ91JaAABdAZNS0ZLey9SJaRNYv5KM426JZmXuxKUJrKcL0lTzBLKzBKYJrVXvfGSol7EYWXJI27zF1JLQADq5NUrgYB4wAEEIV0comXI7wAFrCcPJgYWBTIIAETIN2JYmWuhMkdSdYCgOeJgueqRLFyzhfTi9bq4TC45MF49TuuXJlpONcogAC0hKB0gHDvZMEqRMpAANSq9crlbJAYADqwRDxGk0mIA4eCTQOeveXJdYAHqxNFdAeIAAQGCrOI0oHEAGVXTRJMGvgGCwRM7TAZMHwQGCvhM1rBMERIhMGAwdZJmtSqVTwNcwJEDJg19cvIADa4d9JhANDJnSLHJgrl6AAhFFAwpZDegjn7vhMGcvwABrJAFJgjl/TQpBBI4jl/AAN8TQhHDcv4ADcJBMDvpM+IYaeDAAhL+qd9SgycEJn7iEAA18Jf7nEcv4AIrJLIcv6aMcv4ADvhMHrJJ/AAbl/c6ZM/AAt9cv7nSIv7nLcv4AHrLl/TRpJBvgnjA=="));
    g.reset();
    g.setBgColor("#6633ff");
    var y = 240, speed = 5;
    function balloon(callback) {
      y-=speed;
      var x = (240-77)/2;
      g.drawImage(img,x,y);
      g.clearRect(x,y+81,x+77,y+81+speed);
      if (y>60) setTimeout(balloon,0,callback);
      else callback();
    }
    fade("#6633ff", function() {
      balloon(function() {
        g.setColor(-1);
        g.setFont("6x8",3);
        g.setFontAlign(0,0);
        g.drawString("Welcome.",120,160);
      });
    });
    setTimeout(function() {
      var n=0;
      var i = setInterval(function() {
        n+=5;
        g.scroll(0,-5);
        if (n>170)
          clearInterval(i);
      },20);
    },3500);

  };
  if (n==3) return function() {
    g.reset();
    g.setBgColor("#ffa800");g.clear();
    g.setFont("6x8",2);
    g.setFontAlign(0,0);
    var x = 80, y = 35, h=35;
    animate([
      ()=>g.drawString("Your",x,y+=h),
      ()=>g.drawString("Bangle.js",x,y+=h),
      ()=>g.drawString("has",x,y+=h),
      ()=>g.drawString("3 buttons",x,y+=h),
      ()=>{g.setFont("Vector",36);g.drawString("1",200,40);},
      ()=>g.drawString("2",200,120),
      ()=>g.drawString("3",200,200)
    ],200);
  };
  if (n==4) return function() {
    g.reset();
    g.setBgColor("#00a8ff");g.clear();
    g.setFontAlign(0,0);
    g.setFont("Vector",48);
    g.drawString("1",200,40);
    g.setFontAlign(-1,-1);
    g.setFont("6x8",2);
    g.drawString("Move up\nin menus\n\nTurn Bangle.js on\nif it was off", 20,40);
  };
  if (n==5) return function() {
    g.reset();
    g.setBgColor("#00a8ff");g.clear();
    g.setFontAlign(0,0);
    g.setFont("Vector",48);
    g.drawString("2",200,120);
    g.setFontAlign(-1,-1);
    g.setFont("6x8",2);
    g.drawString("Select menu\nitem\n\nLaunch app\nwhen watch\nis showing", 20,70);
  };
  if (n==6) return function() {
    g.reset();
    g.setBgColor("#00a8ff");g.clear();
    g.setFontAlign(0,0);
    g.setFont("Vector",48);
    g.drawString("3",200,200);
    g.setFontAlign(-1,-1);
    g.setFont("6x8",2);
    g.drawString("Move down\nin menus\n\nLong press\nto exit app\nand go back\nto clock", 20,100);
  };
  if (n==7) return function() {
    g.reset();
    g.setBgColor("#ff3300");g.clear();
    g.setFontAlign(0,0);
    g.setFont("Vector",48);
    g.drawString("1",200,40);
    g.drawString("2",200,120);
    g.setFontAlign(-1,-1);
    g.setFont("6x8",2);
    g.drawString("If Bangle.js\never stops,\nhold buttons\n1 and 2 for\naround six\nseconds.\n\n\n\nBangle.js will\nthen reboot.", 20,20);
  };
  if (n==8) return function() {
    g.reset();
    g.setBgColor("#00a8ff");g.clear();
    g.setFont("6x8",2);
    g.setFontAlign(0,0);
    var x = 120, y = 10, h=21;
    animate([
      ()=>{g.drawString("Bangle.js has a",x,y+=h);
        g.drawString("simple touchscreen",x,y+=h);},
      0,0,
      ()=>{g.drawString("It'll detect touch",x,y+=h*2);
        g.drawString("on left and right",x,y+=h);},
      0,0,
      ()=>{g.drawString("Horizontal swipes",x,y+=h*2);
        g.drawString("work too. Try now",x,y+=h);
        g.drawString("to change page.",x,y+=h);}
    ],300);
  };
  if (n==9) return function() {
    g.reset();
    g.setBgColor("#339900");g.clear();
    g.setFont("6x8",2);
    g.setFontAlign(0,0);
    var x = 120, y = 10, h=21;
    animate([
      ()=>{g.drawString("Bangle.js",x,y+=h);
        g.drawString("comes with",x,y+=h);
        g.drawString("a few simple",x,y+=h);
        g.drawString("apps installed",x,y+=h);},
      0,0,
      ()=>{g.drawString("To add more, visit",x,y+=h*2);
        g.drawString("banglejs.com/apps",x,y+=h);
        g.drawString("with a Bluetooth",x,y+=h);
        g.drawString("capable device",x,y+=h);},
    ],400);
  };
  if (n==10) return function() {
    g.reset();
    g.setBgColor("#990066");g.clear();
    g.setFont("6x8",2);
    g.setFontAlign(0,0);
    var x = 120, y = 10, h=21;
    g.drawString("You can also make",x,y+=h);
    g.drawString("your own apps!",x,y+=h);
    y=160;
    g.drawString("Check out",x,y+=h);
    g.drawString("banglejs.com",x,y+=h);

    var rx = 0, ry = 0;
    E.defrag(); // rearrange memory to ensure we have space
    var h = Graphics.createArrayBuffer(96,96,1,{msb:true});
    // draw a cube
    function draw() {
      // rotate
      rx += 0.1;
      ry += 0.11;
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
        z += 4;
        return [96*(0.5+x/z), 96*(0.5+y/z)];
      }

      var a;
      // draw a series of lines to make up our cube
      h.clear();
      a = p(-1,-1,-1); h.moveTo(a[0],a[1]);
      a = p(1,-1,-1); h.lineTo(a[0],a[1]);
      a = p(1,1,-1); h.lineTo(a[0],a[1]);
      a = p(-1,1,-1); h.lineTo(a[0],a[1]);
      a = p(-1,-1,-1); h.lineTo(a[0],a[1]);
      a = p(-1,-1,1); h.moveTo(a[0],a[1]);
      a = p(1,-1,1); h.lineTo(a[0],a[1]);
      a = p(1,1,1); h.lineTo(a[0],a[1]);
      a = p(-1,1,1); h.lineTo(a[0],a[1]);
      a = p(-1,-1,1); h.lineTo(a[0],a[1]);
      a = p(-1,-1,-1); h.moveTo(a[0],a[1]);
      a = p(-1,-1,1); h.lineTo(a[0],a[1]);
      a = p(1,-1,-1); h.moveTo(a[0],a[1]);
      a = p(1,-1,1); h.lineTo(a[0],a[1]);
      a = p(1,1,-1); h.moveTo(a[0],a[1]);
      a = p(1,1,1); h.lineTo(a[0],a[1]);
      a = p(-1,1,-1); h.moveTo(a[0],a[1]);
      a = p(-1,1,1); h.lineTo(a[0],a[1]);
      g.drawImage({width:96,height:96,buffer:h.buffer},(240-96)/2,68);
    }

    setInterval(draw,50);
  };
  if (n==11) return function() {
    g.reset();
    g.setBgColor("#660099");g.clear();
    g.setFontAlign(0,0);
    g.setFont("Vector",36);
    g.drawString("2",200,120);
    g.setFont("6x8",2);

    var x = 90, y = 30, h=21;
    animate([
      ()=>g.drawString("That's it!",x,y+=h),
      ()=>{g.drawString("Press",x,y+=h*3);
        g.drawString("Button 2",x,y+=h);
        g.drawString("to start",x,y+=h);
        g.drawString("Bangle.js",x,y+=h);}
    ],400);
  }
}

var sceneNumber = 0;

function move(dir) {
  if (dir>0 && sceneNumber+1 == SCENE_COUNT) return; // at the end
  sceneNumber = (sceneNumber+dir)%SCENE_COUNT;
  if (sceneNumber<0) sceneNumber=0;
  clearInterval();
  getScene(sceneNumber)();
  if (sceneNumber>2) {
    var l = SCENE_COUNT;
    for (var i=0;i<l-2;i++) {
      var x = 120+(i-(l-2)/2)*12;
      if (i<sceneNumber-1) {
        g.setColor(-1);
        g.fillCircle(x,230,4);
      } else {
        g.setColor(0);
        g.fillCircle(x,230,4);
        g.setColor(-1);
        g.drawCircle(x,230,4);
      }
    }
  }
  if (sceneNumber < SCENE_COUNT-1)
    setTimeout(function() {
      move(1);
    }, (sceneNumber==0) ? 20000 : 5000);
}



Bangle.on('swipe', dir => move(-dir));
setWatch(()=>move(1), BTN3, {repeat:true});
setWatch(()=>{
  // If we're on the last page
  if (sceneNumber == scenes.length-1) {
    load();
  }
}, BTN2, {repeat:true,edge:"falling"});
setWatch(()=>move(-1), BTN1, {repeat:true});

Bangle.setLCDTimeout(0);
Bangle.setLCDPower(1);
move(0);
