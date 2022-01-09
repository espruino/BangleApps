(function(recorders) {
  recorders.bthrm = function() {
    var bpm = 0;
    function onHRM(h) {
        bpm = h.bpm;
    }
    return {
      name : "BTHR",
      fields : ["BT Heartrate"],
      getValues : () => {
        result = [bpm];
        bpm = 0;
        return result;
      },
      start : () => {
        Bangle.on('BTHRM', onHRM);
        Bangle.setBTHRMPower(1,"recorder");
      },
      stop : () => {
        Bangle.removeListener('BTHRM', onHRM);
        Bangle.setBTHRMPower(0,"recorder");
      },
      draw : (x,y) => g.setColor(Bangle.isBTHRMOn()?"#00f":"#88f").drawImage(atob("DAwBAAAAMMeef+f+f+P8H4DwBgAA"),x,y)
    };
  }
})

