(function(){
  if (!Bangle.isHRMOn) return; // old firmware
  var hp = Bangle.setHRMPower;
  Bangle.setHRMPower = () => {
    hp.apply(Bangle, arguments);
    WIDGETS.widhrt.draw();
  };

  WIDGETS.widhrt={area:"tr",width:24,draw:function() {
    g.reset();
    if (Bangle.isHRMOn()) {
      g.setColor("#f00");     // on = red
    } else {
      g.setColor(g.theme.dark ? "#333" : "#CCC"); // off = grey
    }
    g.drawImage(atob("FhaBAAAAAAAAAAAAAcDgD8/AYeGDAwMMDAwwADDAAMOABwYAGAwAwBgGADAwAGGAAMwAAeAAAwAAAAAAAAAAAAA="), 1+this.x, 1+this.y);
  }};
})();
