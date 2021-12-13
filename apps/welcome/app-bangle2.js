// exec each function from seq one after the other
function animate(seq,period) {
  var c = g.getColor();
  var i = setInterval(function() {
    if (seq.length) {
      var f = seq.shift();
      g.setColor(c);
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


var SCENE_COUNT=10;
function getScene(n) {
  if (n==0) return function() {
    g.reset().setBgColor(0).clearRect(0,0,176,176);
    g.setFont("6x15");
    var n=0;
    var l = Bangle.getLogo();
    var im = g.imageMetrics(l);
    var i = setInterval(function() {
      n+=0.1;
      g.setColor(n,n,n);
      g.drawImage(l,(176-im.width)/2,(176-im.height)/2);
      if (n>=1) {
        clearInterval(i);
        setTimeout(()=>g.drawString("Open",44,104), 500);
        setTimeout(()=>g.drawString("Hackable",44,116), 1000);
        setTimeout(()=>g.drawString("Smart Watch",44,128), 1500);
      }
    },50);
  };
  if (n==1) return function() {
    var img = require("heatshrink").decompress(atob("ptR4n/j/4gH+8H5wl+jOukVVoHZ8dt/n//n37OtgH9sHhwHp4H5xmkGiH72MRje/LL/7iIAEE7sPEgoAC+AlagIlIiMQErPxDwUYxAABwIHCj8N7nOl3uEqa6BEggnFjfM5nCkUil3gEq5KDAAQmC6QmBE4JxSEhIABiQmB8QmSXoQlCYRMdEwIlCAAIlNhYlOiO85nNEyMPEoZwIAAcsYIYmPXoYlMiKaFExX/u9VEqLBBOYrCH+czmtVqJyDEpiaCOYsgSYszmc3qtTEqMR7hzG8AlGmd1OQglOOY6aEgYlCmmZoJMCTBrnD6SaIEoU/zOUuolSjbnBJgqaCEoU5zOXX4RyQYBBzCS4X5zNDqqZCJiERJg5zBEoVJEoM1JgYlQjhMHc4JLEmZMEEp6ZIJgPzS4WTmZMVTILmFYAK+BmglCmd1JgUYJiPNEorABEIOZygDBm5MCiJMQlhMH8ByBXwIlBJgUxJiMd5nOTIzlBTAK+BAANVq4jPAAS/HJgJyCTATAEACC/B4S/IJgIlCYAgAPiS/Kn5yEYANTEyPc5niOQxMB/LlCOapyJJgbpBYAZzROQK/Gl0ATIWfEoZzBc6IlB6SYGgBJBJgpzSlhyH8EAh5MBTIjnCuIlOjjlHTAJzC/LmDTSSYIEoTABOYIlETSKYHXwIABOYM0yYmETSCYHEobnDOYqaBExu8TAwlEc4U5EoiaCmK+NTAolFEwX0TQzBMXwXiEpTBCAAomNEoS+EEo4mIYIImKEoS+EEpDoBEyUbEo3gEo4mJdAImIJY4lJEycdEoPOOBYmPuIlE+HcJYhKKTZ1fhYkB2EAhnNcYMuEhomMr8A3YABEoJyB5gjOAAYmHm9VgELEoJMBEoXAEyXzE45YBJgXwEqx1I+ByDOYJyVJw5yCgEB3cQGgJMWJwQnCu6/CgFBigDB13S/glVAAf1qomCglEoADB1QDBADEPEoNVqEAolEgEKolKErJMDYAJMD0lE0AmaEoNaAgJMCFIYAahV/IgIiDOTgABNYJMEOToiCIoJMCOTzfCN4RMBOTxsDJIRyfIwZMBKQZzfJgRyfOYZMBOUBzCJgNKOT5zDJgLoCADxKBOAIABOT6aCAARyfOYRyjOYRyjOYlKEsBzEEsBzEOUJzDOUIABOUiaDOURzCOUZzCEscKCiY"));
    var im = g.imageMetrics(img);
    g.reset();
    g.setBgColor("#ff00ff");
    var y = 176, speed = 5;
    function balloon(callback) {
      y-=speed;
      var x = (176-im.width)/2;
      g.drawImage(img,x,y);
      g.clearRect(x,y+81,x+77,y+81+speed);
      if (y>30) setTimeout(balloon,0,callback);
      else callback();
    }
    fade("#ff00ff", function() {
      balloon(function() {
        g.setColor(-1).setFont("6x15:2").setFontAlign(0,0);
        g.drawString("Welcome.",88,130);
      });
    });
    setTimeout(function() {
      var n=0;
      var i = setInterval(function() {
        n+=4;
        g.scroll(0,-4);
        if (n>150)
          clearInterval(i);
      },20);
    },3500);

  };
  if (n==2) return function() {
    g.reset();
    g.setBgColor("#ffff00").setColor(0).clear();
    g.setFont("12x20").setFontAlign(0,0);
    var x = 70, y = 25, h=25;
    animate([
      ()=>g.drawString("Your",x,y+=h),
      ()=>g.drawString("Bangle.js",x,y+=h),
      ()=>g.drawString("has one",x,y+=h),
      ()=>g.drawString("button",x,y+=h),
      ()=>{g.setFont("12x20:2").setFontAlign(0,0,1).drawString("HERE!",150,88);}
    ],200);
  };
  if (n==3) return function() {
    g.reset();
    g.setBgColor("#00ffff").setColor(0).clear();
    g.setFontAlign(0,0).setFont("6x15:2");
    g.drawString("Press",88,40).setFontAlign(0,-1);
    g.setFont("12x20");
    g.drawString("To wake the\nscreen up, or to\nselect", 88,60);
  };
  if (n==4) return function() {
    g.reset();
    g.setBgColor("#00ffff").setColor(0).clear();
    g.setFontAlign(0,0).setFont("6x15:2");
    g.drawString("Long Press",88,40).setFontAlign(0,-1);
    g.setFont("12x20");
    g.drawString("To go back to\nthe clock", 88,60);
  };
  if (n==5) return function() {
    g.reset();
    g.setBgColor("#ff0000").setColor(0).clear();
    g.setFontAlign(0,0).setFont("12x20");
    g.drawString("If Bangle.js ever\nstops, hold the\nbutton for\nten seconds.\n\nBangle.js will\nthen reboot.", 88,78);
  };
  if (n==6) return function() {
    g.reset();
    g.setBgColor("#0000ff").setColor(-1).clear();
    g.setFont("12x20").setFontAlign(0,0);
    var x = 88, y = -20, h=60;
    animate([
      ()=>{g.drawString("Bangle.js has a\nfull touchscreen",x,y+=h);},
      0,0,
      ()=>{g.drawString("Drag up and down\nto scroll and\ntap to select",x,y+=h);},
    ],300);
  };
  if (n==7) return function() {
    g.reset();
    g.setBgColor("#00ff00").setColor(0).clear();
    g.setFont("12x20").setFontAlign(0,0);
    var x = 88, y = -35, h=80;
    animate([
      ()=>{g.drawString("Bangle.js comes\nwith a few\napps installed",x,y+=h);},
      0,0,
      ()=>{g.drawString("To add more, visit\nbanglejs.com/apps",x,y+=h);},
    ],400);
  };
  if (n==8) return function() {
    g.reset();
    g.setBgColor("#ff0000").setColor(0).clear();
    g.setFont("12x20").setFontAlign(0,0);
    var x = 88;
    g.drawString("You can also make\nyour own apps!",x,30);
    g.drawString("Check out\nbanglejs.com",x,130);

    var rx = 0, ry = 0;
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
        return [88 + 60*x/z, 78+ 60*y/z];
      }

      var a;
      // draw a series of lines to make up our cube
      var s = 30;
      g.clearRect(88-s,78-s,88+s,78+s);
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

    setInterval(draw,50);
  };
  if (n==9) return function() {
    g.reset();
    g.setBgColor("#ffffff");g.clear();
    g.setFontAlign(0,0);
    g.setFont("12x20");

    var x = 88, y = 10, h=21;
    animate([
      ()=>g.drawString("That's it!",x,y+=h),
      ()=>{g.drawString("Press",x,y+=h*2);
        g.drawString("the button",x,y+=h);
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
  if (sceneNumber>1) {
    var l = SCENE_COUNT;
    for (var i=0;i<l-2;i++) {
      var x = 88+(i-(l-2)/2)*12;
      if (i<sceneNumber-1) {
        g.setColor(-1).fillCircle(x,166,4);
      } else {
        g.setColor(0).fillCircle(x,166,4);
        g.setColor(-1).drawCircle(x,166,4);
      }
    }
  }
  if (sceneNumber < SCENE_COUNT-1)
    setTimeout(function() {
      move(1);
    }, 5000);
}



Bangle.on('swipe', dir => move(dir));
setWatch(()=>{
  if (sceneNumber == SCENE_COUNT-1)
    load();
  else
    move(1);
}, BTN1, {repeat:true});

Bangle.setLCDTimeout(0);
Bangle.setLocked(0);
Bangle.setLCDPower(1);
move(0);
