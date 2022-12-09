(function() {
  require("Font4x8Numeric").add(Graphics);
  return {
    name: "Bangle",
    items: [
      { name : "Date",
        get : () => {
          let d = new Date();
          let g = Graphics.createArrayBuffer(24,24,1,{msb:true});
          g.drawImage(atob("FhgBDADAMAMP/////////////////////8AADwAAPAAA8AADwAAPAAA8AADwAAPAAA8AADwAAPAAA8AADwAAP///////"),1,0);
          g.setFont("6x15").setFontAlign(0,0).drawString(d.getDate(),11,17);
          return {
            text : require("locale").dow(d,1).toUpperCase(),
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
