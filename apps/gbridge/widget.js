(function() {
  var musicState = "stop";
  var musicInfo = {"artist":"","album":"","track":""};
  var scrollPos = 0;
  function gb(j) {
    Bluetooth.println(JSON.stringify(j));
  }
  function show(size,render) {
    var oldMode = Bangle.getLCDMode();
    Bangle.setLCDMode("direct");
    g.setClipRect(0,240,239,319);
    g.setColor("#222222");
    g.fillRect(1,241,238,318);
    render(320-size);
    g.setColor("#ffffff");
    g.fillRect(0,240,1,319);
    g.fillRect(238,240,239,319);
    g.fillRect(2,318,238,319);
    Bangle.setLCDPower(1); // light up
    Bangle.setLCDMode(oldMode); // clears cliprect
    function anim() {
      scrollPos-=2;
      if (scrollPos<-size) scrollPos=-size;
      Bangle.setLCDOffset(scrollPos);
      if (scrollPos>-size) setTimeout(anim,10);
    }
    anim();
  }
  function hide() {
    function anim() {
      scrollPos+=4;
      if (scrollPos>0) scrollPos=0;
      Bangle.setLCDOffset(scrollPos);
      if (scrollPos<0) setTimeout(anim,10);
    }
    anim();
  }

  Bangle.on('touch',function() {
    if (scrollPos) hide();
  });
  Bangle.on('swipe',function(dir) {
    if (musicState=="play") {
      gb({t:"music",n:dir>0?"next":"previous"});
    }
  });
  gb({t:"status",bat:E.getBattery()});

  global.GB = function(j) {
    switch (j.t) {
      case "notify":
        show(80,function(y) {
          // TODO: icon based on src?
          var x = 120;
          g.setFontAlign(0,0);
          g.setFont("6x8",1);
          g.setColor("#40d040");
          g.drawString(j.src,x,y+7);
          g.setColor("#ffffff");
          g.setFont("6x8",2);
          g.drawString(j.title,x,y+25);
          g.setFont("6x8",1);
          g.setColor("#ffffff");
          // split text up a word boundaries
          var txt = j.body.split("\n");
          var MAXCHARS = 38;
          for (var i=0;i<txt.length;i++) {
            txt[i] = txt[i].trim();
            var l = txt[i];
            if (l.length>MAXCHARS) {
              var p = MAXCHARS;
              while (p>MAXCHARS-8 && !" \t-_".includes(l[p]))
                p--;
              if (p==MAXCHARS-8) p=MAXCHARS;
              txt[i] = l.substr(0,p);
              txt.splice(i+1,0,l.substr(p));
            }
          }
          g.setFontAlign(-1,-1);
          g.drawString(txt.join("\n"),10,y+40);
          Bangle.buzz();
        });
      break;
      case "musicinfo":
        musicInfo = j;
        break;
      case "musicstate":
      musicState = j.state;
      if (musicState=="play")
        show(40,function(y) {
          g.setColor("#ffffff");
          g.drawImage(              require("heatshrink").decompress(atob("jEYwILI/EAv/8gP/ARcMgOAASN8h+A/kfwP8n4CD/E/gHgjg/HA=")),8,y+8);
          g.setFontAlign(-1,-1);
          g.setFont("6x8",1);
          var x = 40;
          g.setFont("4x6",2);
          g.setColor("#ffffff");
          g.drawString(musicInfo.artist,x,y+8);
          g.setFont("6x8",1);
          g.setColor("#ffffff");
          g.drawString(musicInfo.track,x,y+22);
        });
      if (musicState=="pause")
        hide();
      break;
    }
  };

function draw() {
  g.setColor(-1);
  if (NRF.getSecurityStatus().connected)
    g.drawImage(require("heatshrink").decompress(atob("i0WwgHExAABCIwJCBYwJEBYkIBQ2ACgvzCwoECx/z/AKDD4WD+YLBEIYKCx//+cvnAKCBwU/mc4/8/HYv//Ev+Y4EEAePn43DBQkzn4rCEIoABBIwKHO4cjmczK42I6mqlqEEBQeIBQaDED4IgDUhi6KaBbmIA==")),this.x+1,this.y+1);
  else
    g.drawImage(require("heatshrink").decompress(atob("i0WwQFC1WgAgYFDAgIFClQFCwEK1W/AoIPB1f+CAMq1f7/WqwQPB/fq1Gq1/+/4dC/2/CAIaB/YbBAAO///qAoX/B4QbBDQQ7BDQQrBAAWoIIIACIIIVC0ECB4cACAZiBAoRtCAoIDBA")),this.x+1,this.y+1);
}
function changed() {
  WIDGETS["gbridgew"].draw();
  g.flip();// turns screen on
}
NRF.on('connected',changed);
NRF.on('disconnected',changed);

WIDGETS["gbridgew"]={area:"tl",width:24,draw:draw};

})();
