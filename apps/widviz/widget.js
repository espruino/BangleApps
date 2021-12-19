(() => {

  var saved = null;

  function hide(){
    if (!Bangle.isLCDOn() || saved) return;
    saved = [];
    for (var wd of WIDGETS) {
      saved.push({d:wd.draw,a:wd.area});
      wd.draw=()=>{};
      wd.area="";
    }
    g.setColor(0,0,0);
    g.fillRect(0,0,g.getWidth(),23);
  }

  function reveal(){
    if (!Bangle.isLCDOn() || !saved) return;
    for (var wd of WIDGETS) {
      var o = saved.shift();
      wd.draw = o.d;
      wd.area = o.a;
    }
    Bangle.drawWidgets();
    saved=null;
  }

  function draw(){
    g.setColor(0x07ff);
    g.drawImage(atob("GBgBAAAAAAAAAAAAAAAAAH4AAf+AB4HgDgBwHDw4OH4cMOcMYMMGYMMGMOcMOH4cHDw4DgBwB4HgAf+AAH4AAAAAAAAAAAAAAAAA"),this.x,this.y);
  }

  WIDGETS["viz"] ={area:"tl", width:24,draw:draw};

  Bangle.on('swipe',(dir)=>{
    if (dir<0) hide(); else reveal();
  });
})();
