(function() {
  return {
    name: "Bangle",
    items: [
      { name : "Clock",
        get : () => {
          return {
            text : require("locale").time(new Date(),1),
            img : atob("FhaBAAAAAAPwAD/wA8DwHADgYMGDAwMMDAxgMBmAwGYDAZgOBmAcGYA4YwBjDAAMGABgcAOA8DwA/8AA/AAAAAA=")
          };
        },
        show : function() {
          this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
              this.emit("redraw");
            }, 60000);
          }, 60000 - (Date.now() % 60000));
        },
       hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      }
    ]
  };
})
