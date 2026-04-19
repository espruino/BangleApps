(function() {
  return {
    name: "Bangle",
    items: [
      { name : "Calendar Week",
        get : () => {
          let date = new Date();

          // Calculate calendar week (https://stackoverflow.com/a/6117889)
          const getCW = function(date){
            var d=new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var dayNum = d.getDay() || 7;
            d.setDate(d.getDate() + 4 - dayNum);
            var yearStart = new Date(d.getFullYear(),0,1);
            return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
          };

          let g = Graphics.createArrayBuffer(24,24,1,{msb:true});
          g.transparent = 0;
          g.drawImage(atob("FhgBDADAMAMP/////////////////////8AADwAAPAAA8AADwAAPAAA8AADwAAPAAA8AADwAAPAAA8AADwAAP///////"),1,0);
          g.setFont("6x15").setFontAlign(0,0).drawString(getCW(date),11,17);
          return {
            text : 'CW',
            img : g.asImage("string")
          };
        },
        show : function() {
          this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
              this.emit("redraw");
            }, 86400000);
          }, 86400000 - (Date.now() % 86400000));
        },
       hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      }
    ]
  };
})
