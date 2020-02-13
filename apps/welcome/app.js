function animate(seq,period) {
  var i = setInterval(function() {
    if (seq.length) {
      var f = seq.shift();
      if (f) f();
    } else clearInterval(i);
  },period);
}

var scenes = [
  function() {
    g.clear(1);
    g.setFont("4x6",2);
    var n=0;
    var i = setInterval(function() {
      n+=0.04;
      g.setColor(n,n,n);
      g.drawImage(Bangle.getLogo(),(240-222)/2,(240-100)/2);
      if (n>=1) {
        clearInterval(i);
        setTimeout(()=>g.drawString("Open",34,144), 500);
        setTimeout(()=>g.drawString("Hackable",34,156), 1000);
        setTimeout(()=>g.drawString("Smart Watch",34,168), 1500);
      }
    },50);
  },function() {
    g.reset();
    g.setBgColor("#6633ff");g.clear();
    g.setFont("6x8",3);
    g.setFontAlign(0,0);
    g.drawString("Welcome.",120,160);
    g.drawImage(require("heatshrink").decompress(atob("ptRxH+AEXMAAwrjJEhQ/JSRO7JaZN2Hg/N5/V6wAD6vOJxG6ywAB3QAEJdvO63XAApPE5oTE4BLCJo5PkJRnW5/NIwoFFJopMHJ0I0F6pKER4wALJtoyESwnWJSIAC3RNqS5PVJSYAB4xMNJrYvE56WD5xLVdCBNaFofNJbgABJhxNSsNhrYAC1IsD6xMCJbSaEJhZNOJIJLFrYrD5xLC6pLa5nGTThLDJhKYC6xLbc6JNKJQhMFv4pC5rkec7hLGw2r2XW1epcoqYeJiJNHJQuH2RBBw7lF56Yg5nGc6yVFJQPX2TmDFIfVTEBMXraWEJQPX1dhJg/W6/VJj/MJiBNEJYerJYhMKcr5MWTAeGJYpMIcwPNc2JMCS4eGRIPX1gIDJg/PJnTkC62GJg+oFIXO67lg4BMWcgeHJYZME0YpC5vWJkhLNJgKYHwpMIv4qD6pMg3RMSrZCC2RMB1ZLEJglbFQfO5pMfcqKZEcoeGJhzoBJb3GJiP+Jg2yJYpNF1LigAAXAJjLlGJgt/JkblTJgeHJhznFcuSZGw5MHJomjcuxMUTURLUJiuoTGpMDsOy6+rJhCalJapNEw5MQ1KYvJYv+rbnC62yJhKajTC6aE1fXwxMO0aY0JgmF2TnKTUHGJbJNEw2ywpMOJrRLDJhhLKJgZNBw6aPv5LX3RLbAANbJoaaKJoupJavAJbqbFABboF1BLYJhZLPTQhNlJZ5KQTSRNG0ZLzJrF/JZu6JZpKVJrKcM/xMEJUBNaDIJJGAARJlJrQYB4wAEJYgAEJD5OVJYpM2TiRLIJoRLtJyBLDJhJNGJlJOMcooAB0hJB0gHEJmBPHJIQADB4eI0mkxAHEy+Wz2eJl4AEJhYACA4mlA4pM4JoZMGAwZM2JotcTJRM/rbeFJhJL2AAWHrmBJn4AJHo4HFcvaSQJfxM/JiJGHcv6TMJf5M/c6gFEJn6aHJf5M/dDRM/JiRK/Jn5NZJP5M/JjBI/JphH/Jn5NYIv5M/Jn5NlIf5MJE8wA==")),(240-77)/2,60);
    setTimeout(function() {
      var n=0;
      var i = setInterval(function() {
        n+=5;
        g.scroll(0,-5);
        if (n>170)
          clearInterval(i);
      },20);
    },3500);

  },function() {
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
  },
  function() {
    g.reset();
    g.setBgColor("#00a8ff");g.clear();
    g.setFontAlign(0,0);
    g.setFont("Vector",48);
    g.drawString("1",200,40);
    g.setFontAlign(-1,-1);
    g.setFont("6x8",2);
    g.drawString("Move up\nin menus\n\nTurn Bangle.js on\nif it was off", 20,40);
  },
  function() {
    g.reset();
    g.setBgColor("#00a8ff");g.clear();
    g.setFontAlign(0,0);
    g.setFont("Vector",48);
    g.drawString("2",200,120);
    g.setFontAlign(-1,-1);
    g.setFont("6x8",2);
    g.drawString("Select menu\nitem\n\nLaunch app\nwhen watch\nis showing", 20,70);
  },
  function() {
    g.reset();
    g.setBgColor("#00a8ff");g.clear();
    g.setFontAlign(0,0);
    g.setFont("Vector",48);
    g.drawString("3",200,200);
    g.setFontAlign(-1,-1);
    g.setFont("6x8",2);
    g.drawString("Move down\nin menus\n\nLong press\nto exit app\nand go back\nto clock", 20,100);
  },
  function() {
    g.reset();
    g.setBgColor("#ff3300");g.clear();
    g.setFontAlign(0,0);
    g.setFont("Vector",48);
    g.drawString("1",200,40);
    g.drawString("2",200,120);
    g.setFontAlign(-1,-1);
    g.setFont("6x8",2);
    g.drawString("If Bangle.js\never stops,\nhold buttons\n1 and 2 for\naround six\nseconds.\n\n\n\nBangle.js will\nthen reboot.", 20,20);
  },
  function() {
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
  },
  function() {
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
  },
  function() {
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
  },
  function() {
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
  ];

var sceneNumber = 0;

function move(dir) {
  sceneNumber = (sceneNumber+dir)%scenes.length;
  if (sceneNumber<0) sceneNumber=0;
  clearInterval();
  scenes[sceneNumber]();
  if (sceneNumber>1) {
    var l = scenes.length;
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
  if (sceneNumber < scenes.length-1)
    setTimeout(next, 5000);
}

function next() {
  move(1);
}

Bangle.on('swipe',move);
setWatch(()=>move(1), BTN3, {repeat:true});
setWatch(()=>{
  // If we're on the last page
  if (sceneNumber == scenes.length-1) {
    try {
      var settings = require("Storage").readJSON('@setting');
      settings.welcomed = true;
      require("Storage").write('@setting',settings);
    } catch (e) {}
    load();
  }
}, BTN2, {repeat:true,edge:"rising"});
setWatch(()=>move(-1), BTN1, {repeat:true});



Bangle.setLCDTimeout(0);
Bangle.setLCDPower(1);
move(0);
