(function() {
  return {
    name: "Bangle",
    items: [
      { name : "FW",
        get : () => {
          let d = new Date();
          let g = Graphics.createArrayBuffer(24,24,1,{msb:true});
          g.drawImage(atob("GBjC////AADve773VWmmmmlVVW22nnlVVbLL445VVwAAAADVWAAAAAAlrAAAAAA6sAAAAAAOWAAAAAAlrAD//wA6sANVVcAOWANVVcAlrANVVcA6rANVVcA6WANVVcAlsANVVcAOrAD//wA6WAAAAAAlsAAAAAAOrAAAAAA6WAAAAAAlVwAAAADVVbLL445VVW22nnlVVWmmmmlV"),1,0);
          return {
            text : process.env.VERSION,
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
