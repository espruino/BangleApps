(() => {

  var saved = null;
  
  function hide(){
    if (!Bangle.isLCDOn() || saved) return;
    saved = [];
    for (var wd of WIDGETS) {
      saved.push(wd.draw); 
      wd.draw=()=>{};
    }
    g.setColor(0,0,0);
    g.fillRect(0,0,239,23);
  }
  
  function reveal(){
    if (!Bangle.isLCDOn() || !saved) return;
    for (var wd of WIDGETS) wd.draw = saved.shift();
    Bangle.drawWidgets(); 
    saved=null;
  }
  
  function draw(){
    var img = E.toArrayBuffer(atob("GBgBAAAAAAAAAAAAAAAAAH4AAf+AB4HgDgBwHDw4OH4cMOcMYMMGYMMGMOcMOH4cHDw4DgBwB4HgAf+AAH4AAAAAAAAAAAAAAAAA"));
    g.setColor(0x07ff);
    g.drawImage(img,this.x,this.y);
  }
    
  WIDGETS["viz"] ={area:"tl", width:24,draw:draw};

  Bangle.on('swipe',(dir)=>{
    if (dir<0) hide(); else reveal();
  });    
})();
