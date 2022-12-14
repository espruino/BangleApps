(function() {
    var v_switch; // show stats
    if (process.env.BOARD=='BANGLEJS'||process.env.BOARD=='EMSCRIPTEN') v_font_size=16
     else  v_font_size=13;
    var v_str_hw=new String();
    if (v_switch == null || v_switch == '') v_switch=0;
    function draw(){      
      if (!Bangle.CLOCK == !this.width) { // if we're the wrong size for if we have a clock or not...
          this.width = Bangle.CLOCK?0:60;
          return setTimeout(Bangle.drawWidgets,1); // widget changed size - redraw
        }
        if (!this.width) return; // if size not right, return

       if (v_switch==0) {
         //var v_hw=process.memory();
         v_str_hw=process.memory().free+"/"+process.memory().total;
         v_switch++;
       } else if (v_switch==1) {
        // var v_hw=process.env.VERSION;
         v_str_hw="V:"+process.env.VERSION;
         v_switch++;
       } else if (v_switch==2) {
            v_str_hw="M:"+process.env.BOARD;
        v_switch++;
           } else {
          stor=require("Storage").getStats();        
          if (v_switch==3) {
            v_str_hw="St:"+stor.freeBytes;
            v_switch++;
          } else if (v_switch==4) {
            v_str_hw="TrB:"+stor.trashBytes;
            v_switch++;
              } else if (v_switch==5) {
            v_str_hw="Fil:"+stor.fileCount;
            v_switch=0;
          }
       }    
  g.reset().setFontVector(v_font_size).setFontAlign(-1, 0).setColor("#0ff");
  //clean a longer previous string
  g.drawString("                        ", this.x, this.y+11, true);
  g.drawString(v_str_hw, this.x, this.y+11, true);  
  } //end draw

WIDGETS["wdhwbttm"]={area:"bl",width:Bangle.CLOCK?0:60,draw:draw};
})()
