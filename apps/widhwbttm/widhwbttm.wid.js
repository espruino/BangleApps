(function() {
    //let intervalRef = null;
    var v_count; // show stats
    var v_str_hw=new String();
    //if (process.env.BOARD=='BANGLEJS'||process.env.BOARD=='EMSCRIPTEN')    var v_bfont_size=2;     
    var v_bfont_size=2;     
    if (g.theme.dark==true) var v_color=0xFFFF; //white
      else var v_color=0x0000; //black
    if (v_count == null || v_count == '') v_count=0;

    function draw(){    
      // if (Bangle.CLOCK) return; //to remove from a clock
       if (v_count==0) {   
        v_str_hw=process.env.VERSION.substr(0,6);
        v_count++; 
       } else if (v_count==1) {             
          v_str_hw=process.env.BOARD.substr(0,3)+".."+process.env.BOARD.substr(process.env.BOARD.length-3,3);
          v_count++;
       }  else if (v_count==2) {             
        v_str_hw="Bat "+E.getBattery()+"%";
        v_count++;
       } 
       else if (v_count==3 && process.env.BOARD.substr(0,6)=='BANGLE') {             
        v_str_hw="Tmp "+E.getTemperature();
          v_count++;
         }
       else {
            // text prefix has to be 4char
            const stor=require("Storage").getStats();        
            if (v_count==4) { 
              v_str_hw="Fre "+process.memory().free;
              //+"/"+process.memory().total;
              v_count++;
            }
            else if (v_count==5) {                      
              v_str_hw="Sto "+stor.freeBytes;
              v_count++;
            } else if (v_count==6) {
              v_str_hw="Tra "+stor.trashBytes;
              v_count++;
            } else if (v_count==7) {
            v_str_hw="Fil "+stor.fileCount;
            v_count=0;
            }
            // 4 char are prefix
            if (v_str_hw.length>7) {
              //replace 3 digits by k
              v_str_hw=v_str_hw.substr(0,v_str_hw.length-3)+"k";
            }
      }    //end else storage
      g.reset().setColor(v_color).setFont("6x8",v_bfont_size).setFontAlign(-1, 0); 
      //clean a longer previous string, care with br widgets
      g.drawString("               ", this.x, this.y+11, true);
      g.drawString(v_str_hw, this.x, this.y+11, true);  
    } //end draw

WIDGETS["wdhwbttm"]={area:"bl",width:100,draw:draw};
if (Bangle.isLCDOn) /*intervalRef =*/ setInterval(()=>WIDGETS["wdhwbttm"].draw(), 10*1000);
})()
