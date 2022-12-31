(function() {
  let intervalRef = null;
    var v_switch; // show stats
    var v_str_hw=new String();
    if (process.env.BOARD=='BANGLEJS'||process.env.BOARD=='EMSCRIPTEN') var v_font_size=16;
    else  var v_font_size=14;
    if (v_switch == null || v_switch == '') v_switch=0;
    function draw(){    
       if (Bangle.CLOCK) return;

       if (v_switch==0) {         
        // var v_hw=process.env.VERSION;
        v_str_hw="V "+process.env.VERSION.substr(0,6);
        v_switch++; 
       } else if (v_switch==1) {             
          v_str_hw=process.env.BOARD.substr(0,3)+".."+process.env.BOARD.substr(process.env.BOARD.length-3,3);
          v_switch++;
       } 
       else if (v_switch==2) {             
        v_str_hw="Bat "+E.getBattery()+"%";
        v_switch++;
      }        
       else {
            // text prefix has to be 4char
            stor=require("Storage").getStats();        
          if (v_switch==3) { 
              v_str_hw="Fre "+process.memory().free;
              //+"/"+process.memory().total;
              v_switch++;
            }
          else if (v_switch==4) {                      
            v_str_hw="Sto "+stor.freeBytes;
            v_switch++;
          } else if (v_switch==5) {
            v_str_hw="Tra "+stor.trashBytes;
            v_switch++;
              } else if (v_switch==6) {
            v_str_hw="Fil "+stor.fileCount;
            v_switch=0;
          }
          // 4 char are prefix
          if (v_str_hw.length>7) {
            //replace 3 digits by k
            //substring betw x and y
            v_str_hw=v_str_hw.substr(0,v_str_hw.length-3)+"k";
          }
       }    //else storage
  g.reset().setFontVector(v_font_size).setFontAlign(-1, 0); 
  //clean a longer previous string, care with br widgets
  g.drawString("               ", this.x, this.y+11, true);
  g.drawString(v_str_hw, this.x, this.y+11, true);  
  } //end draw

WIDGETS["wdhwbttm"]={area:"bl",width:60,draw:draw};
//{area:"bl",width:Bangle.CLOCK?0:60,draw:draw};
if (Bangle.isLCDOn) intervalRef = setInterval(()=>WIDGETS["wdhwbttm"].draw(), 10*1000);
})()
