const latLonToGridSquare=function(o,a){var t,e,n,s,l,i,r,h,M,f=-100,g=0,u="ABCDEFGHIJKLMNOPQRSTUVWX",d=u.toLowerCase();function N(o){return"number"==typeof o?o:"string"==typeof o?parseFloat(o):"function"==typeof o?parseFloat(o()):void E.showMessage("can't convert \ninput: "+o)}return"object"==typeof o?2===o.length?(f=N(o[0]),g=N(o[1])):"lat"in o&&"lon"in o?(f=N(o.lat),g=N(o.lon)):"latitude"in o&&"longitude"in o?(f=N(o.latitude),g=N(o.longitude)):E.showMessage("can't convert \nobject "+o):(f=N(o),g=N(a)),isNaN(f)&&E.showMessage("lat is NaN"),isNaN(g)&&E.showMessage("lon is NaN"),90===Math.abs(f)&&E.showMessage("grid invalid \nat N/S"),90<Math.abs(f)&&E.showMessage("invalid lat: \n"+f),180<Math.abs(g)&&E.showMessage("invalid lon: \n"+g),t=f+90,e=g+180,n=u[Math.floor(t/10)],s=u[Math.floor(e/20)],l=""+Math.floor(t%10),i=""+Math.floor(e/2%10),h=60*(t-Math.floor(t)),M=60*(e-2*Math.floor(e/2)),r=d[Math.floor(h/2.5)],s+n+i+l+d[Math.floor(M/5)]+r};

Bangle.setGPSPower(1);
var fix;
Bangle.removeAllListeners();
Bangle.on('GPS',function(f) {
  fix=f;
  g.clear();
  g.setFontAlign(0,0);
  if (!f.fix) {
    g.setFont("6x8",3);
    g.drawString("Waiting for",120,70);
    g.drawString("GPS Fix",120,110);
    g.setFont("6x8",2);
    g.drawString(f.satellites+" satellites",120,170);
  } else {
    g.setFont("6x8",5);
    var maidenhead = latLonToGridSquare(fix.lat,fix.lon);
    g.drawString(maidenhead,120,120);
  }
});
