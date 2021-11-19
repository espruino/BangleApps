(function(){
  var cp = Bangle.setCompassPower;
  Bangle.setCompassPower = () => {
    cp.apply(Bangle, arguments);
    WIDGETS.compass.draw();
  };

  WIDGETS.compass={area:"tr",width:24,draw:function() {
    g.reset();
    if (Bangle.isCompassOn()) {
      g.setColor(g.theme.dark ? "#FC0" : "#F00");
    } else {
      g.setColor(g.theme.dark ? "#333" : "#CCC");
    }
    g.drawImage(atob("FBSBAAH4AH/gHAODgBwwAMYABkAMLAPDwPg8CYPBkDwfA8PANDACYABjAAw4AcHAOAf+AB+A"), 2+this.x, 2+this.var);
  }};
})();
