(function(recorders) {
  recorders.bthrm = function() {
    var bpm = "";
    var bat = "";
    var energy = "";
    var contact = "";
    var rr= "";
    function onHRM(h) {
      bpm = h.bpm;
      bat = h.bat;
      energy = h.energy;
      contact = h.contact;
      if (h.rr) rr = h.rr.join(";");
    }
    return {
      name : "BT HR",
      fields : ["BT Heartrate", "BT Battery", "Energy expended", "Contact", "RR"],
      getValues : () => {
        result = [bpm,bat,energy,contact,rr];
        bpm = "";
        rr = "";
        bat = "";
        energy = "";
        contact = "";
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
      draw : (x,y) => g.setColor((Bangle.isBTHRMActive && Bangle.isBTHRMActive())?"#00f":"#88f").drawImage(atob("DAwBAAAAMMeef+f+f+P8H4DwBgAA"),x,y)
    };
  };
  recorders.hrmint = function() {
    var active = false;
    var bpmTimeout;
    var bpm = "", bpmConfidence = "", src="";
    function onHRM(h) {
      bpmConfidence = h.confidence;
      bpm = h.bpm;
      srv = h.src;
      if (h.bpm > 0){
        active = true;
        print("active" + h.bpm);
        if (bpmTimeout) clearTimeout(bpmTimeout);
        bpmTimeout = setTimeout(()=>{
          print("inactive");
          active = false;
        },3000);
      }
    }
    return {
      name : "HR int",
      fields : ["Heartrate", "Confidence"],
      getValues : () => {
        var r = [bpm,bpmConfidence,src];
        bpm = ""; bpmConfidence = ""; src="";
        return r;
      },
      start : () => {
        Bangle.origOn('HRM', onHRM);
        if (Bangle.origSetHRMPower) Bangle.origSetHRMPower(1,"recorder");
      },
      stop : () => {
        Bangle.removeListener('HRM', onHRM);
        if (Bangle.origSetHRMPower) Bangle.origSetHRMPower(0,"recorder");
      },
      draw : (x,y) => g.setColor(( Bangle.origIsHRMOn && Bangle.origIsHRMOn() && active)?"#0f0":"#8f8").drawImage(atob("DAwBAAAAMMeef+f+f+P8H4DwBgAA"),x,y)
    };
  };
})

