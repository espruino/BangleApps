(function(recorders) {
  recorders.coretemp = function() {
    var core = "", skin = "", unit="", hr="", heatflux="", hsi="", battery="", quality="";
    var hasCore = false;
    function onCore(c) {
        core=c.core;
        skin=c.skin;
        hasCore = true;
        unit = c.unit;
        hr = c.hr;
        heatflux = c.heatflux; 
        hsi = c.hsi;
        battery= c.battery;
        quality = c.dataQuality;
    }
    return {
      name : "Core",
      fields : ["Core","Skin","Unit","HeartRate","HeatFlux","HeatStrainIndex","Battery","Quality"],
      getValues : () => {
        var r = [core,skin,unit,hr,heatflux,hsi,battery,quality];
        core = "";
        skin = "";
        unit="";
        hr="";
        heatflux="";
        hsi="";
        battery="";
        quality="";
        return r;
      },
      start : () => {
        hasCore = false;
        Bangle.on('CORESensor', onCore);
      },
      stop : () => {
        hasCore = false;
        Bangle.removeListener('CORESensor', onCore);
      },
      draw : (x,y) => g.setColor(hasCore?"#0f0":"#8f8").drawImage(atob("DAyBAAHh0js3EuDMA8A8AWBnDj9A8A=="),x,y)
    };
  }
})

