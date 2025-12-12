{
  let timer;try {timer=require("timer");}catch{print("loadscr: need FW 2v29+");}if(timer){
    let o = Graphics.createArrayBuffer(g.getWidth(),g.getHeight(),1);
    let n = 10, gl = g;
    o.transparent = 1;
    o.palette = new Uint16Array(2);//all black
    o.fillCircle(88,88,n);
    Bangle.setLCDOverlay(o,0,0,{id:"loadanim"});
    gl.clear(1).flip(1);
    let id = timer.add({
      type:"EXEC", fn: () => { "ram";
        n+=10;
        if (n>170) done();
        else {
          o.fillCircle(88,88,n);
          gl.flip(1);
        }
      },
      time:100,
      interval:100,
    });
    let done = function() {
      if (id===undefined) return;
      require("timer").remove(id);
      id = undefined;
      Bangle.setLCDOverlay(undefined, {id: "loadanim"});
    };
    setTimeout(done, 0);
  }
}