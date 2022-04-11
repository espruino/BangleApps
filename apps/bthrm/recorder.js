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
      draw : (x,y) => g.setColor((bpm != "")?"#00f":"#88f").drawImage(atob("DAwBAAAAMMeef+f+f+P8H4DwBgAA"),x,y)
    };
  }
})

