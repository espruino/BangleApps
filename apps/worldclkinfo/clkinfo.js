(function() {
  return {
    name: "World Clock",
    img: atob("GBiBAAAAAAAAAAAYAAD/AAOBwAYAYAwAMAgAEBgAGBAACBCBCDHDjDCBDBAACBAACBhCGAh+EAwYMAYAYAOBwAD/AAAYAAAAAAAAAA=="),
    items: [
      { name : "London",
        get : function() { return { text : "London \n3:24",
                       // v : 10, min : 0, max : 100, - optional
                      img : atob("") 
      }},
       
        show : function() {},
        hide : function() {},
        // run : function() {} optional (called when tapped)
        // focus : function() {} optional (called when focussed)
        // blur : function() {} optional (called when unfocussed)
      }
    ]
  };
}) // must not have a semi-colon!
