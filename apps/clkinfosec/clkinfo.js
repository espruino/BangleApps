(function() {
  return {
    name: "Bangle",
    items: [
      { name : "Seconds",
        get : () => {
          let d = new Date(), s = d.getSeconds(), sr = s*Math.PI/30,
              x = 11+9*Math.sin(sr), y = 11-9*Math.cos(sr),
              g = Graphics.createArrayBuffer(24,24,1,{msb:true});
          g.transparent = 0;
          g.drawImage(atob("GBgBAP4AA/+ABwHAHABwGAAwMAAYYAAMYAAMwAAGwAAGwAAGwAAGwAAGwAAGwAAGYAAMYAAMMAAYGAAwHABwBwHAA/+AAP4AAAAA"));
          g.drawLine(11,11,x,y).drawLine(12,11,x+1,y).drawLine(11,12,x,y+1).drawLine(12,12,x+1,y+1);
          return {
            text : s.toString().padStart(2,0)+"s",
            img : g.asImage("string")
          };
        },
        show : function() {
          this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
              this.emit("redraw");
            }, 1000);
          }, 1000 - (Date.now() % 1000));
        },
       hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      }
    ]
  };
})