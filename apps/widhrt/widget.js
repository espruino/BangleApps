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
      g.setColor('#f00');     // on = red
    } else {
      g.setColor(g.theme.dark ? '#fff' : '#000'); // off
    }

    // image converter https://www.espruino.com/Image+Converter ; settings to get a fillable image
    // 1 bit bw, transparency? Y, transparent bg, white heart (must be white for color fill)
    g.drawImage(atob("FBSBAAAAAAAAAAAB+fg//8f//n//5//+f//n//5//+P//D//wf/4D/8Af+AB+AAPAABgAAAA"), 1+this.x, 1+this.y);
  }};
})();
