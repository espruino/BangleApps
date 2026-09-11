(function(recorders) {
  recorders.coretemp = function() {
    var core = "", skin = "", unit="", hr="", heatflux="", hsi="", battery="", quality="";
    var hasCore = false;
    function onCore(c) {
        core=c.core;
        skin=c.skin;
        hasCore = true;
        unit = c.unit;
        hr = (c.hr && c.hr > 0) ? c.hr : "";
        heatflux = c.heatflux;
        hsi = c.hsiValid ? c.hsi : "";
        battery= c.battery;
        quality = c.dataQuality;
    }
    return {
      name : "Core",
      fields : ["Core","Skin","Unit","HeartRate","HeatFlux","HeatStrainIndex","Battery","Quality"],
      getValues : () => {
        var r = [core,skin,unit,hr,heatflux,hsi,battery,quality];
        // Recorder polls independently from BLE notifications; clear values
        // after each sample so stale temperatures are not duplicated in logs.
        core = "";
        skin = "";
        unit="";
        hr = "";
        heatflux="";
        hsi="";
        battery="";
        quality="";
        return r;
      },
      start : () => {
        hasCore = false;
        Bangle.on('CORESensor', onCore);
        if (Bangle.setCORESensorPower) Bangle.setCORESensorPower(1, "coretemp.recorder");
      },
      stop : () => {
        hasCore = false;
        Bangle.removeListener('CORESensor', onCore);
        if (Bangle.setCORESensorPower) Bangle.setCORESensorPower(0, "coretemp.recorder");
      },
      draw : (x,y) => g.setColor(hasCore?"#0f0":"#8f8").drawImage(atob("DAyBAAHh0js3EuDMA8A8AWBnDj9A8A=="),x,y)
    };
  }
})
