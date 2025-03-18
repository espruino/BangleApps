(function() {
  return {
    name: "Bangle",
    // img: 24x24px image for this list of items. The default "Bangle" list has its own image so this is not needed
    items: [
      { name : "Item1",
        get : function() { return { text : "TextOfItem1",
                       // v : 10, min : 0, max : 100, - optional
                      img : atob("GBiBAAAAAAAAAAAYAAD/AAOBwAYAYAwAMAgAEBgAGBAACBCBCDHDjDCBDBAACBAACBhCGAh+EAwYMAYAYAOBwAD/AAAYAAAAAAAAAA==") }},
        show : function() {},
        hide : function() {},
        // run : function() {} optional (called when tapped)
      }
    ]
  };
}) // must not have a semi-colon!