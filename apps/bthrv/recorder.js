(function(recorders) {
  recorders.bthrv = function() {
    var lastGetValue = 0;
    var lastUpdate = 0;
    var rrHistory = [];
    var hrv = "";
    function onHRM(h) {
      if(!h.rr) return;
      if (lastUpdate + 3000 < Date.now()){
        rrHistory = [];
      }
      rrHistory = rrHistory.concat(h.rr);
      lastUpdate=Date.now();
    }
    return {
      name : "BT HRV",
      fields : ["BT HRV"],
      getValues : () => {
        if (lastGetValue + 10000 < Date.now()){
          lastGetValue = Date.now();
          
          if (rrHistory.length > 0){
            if (rrHistory.length > 1){
              var squaredSum = 0;
              var last = rrHistory[0]
              for (var i = 1; i < rrHistory.length; i++){
                squaredSum += (last - rrHistory[i])*(last - rrHistory[i]);
                last = rrHistory[i];
              }
              hrv = Math.sqrt(squaredSum/rrHistory.length);
            }
          }
        }
        const result = [hrv];
        hrv = "";
        rrHistory = [];
        return result;
      },
      start : () => {
        Bangle.on('BTHRM', onHRM);
        if (Bangle.setBTRHMPower) Bangle.setBTHRMPower(1,"recorder");
      },
      stop : () => {
        Bangle.removeListener('BTHRM', onHRM);
        if (Bangle.setBTRHMPower) Bangle.setBTHRMPower(0,"recorder");
      },
      draw : (x,y) => g.setColor((rrHistory.length > 0)?"#00f":"#008").drawImage(atob("DAwBAAAACECECECEDGClacEEAAAA"),x,y)
    };
  }
})

