(function(recorders) {
  recorders.coretemp = function() {
    var core = "", skin = "";
    var hasCore = false;
    function onCore(c) {
        core=c.core;
        skin=c.skin;
        hasCore = true;
    }
    return {
      name : "Core",
      fields : ["Core","Skin"],
      getValues : () => {
        var r = [core,skin];
        core = "";
        skin = "";
        return r;
      },
      start : () => {
        hasCore = false;
        Bangle.on('CoreTemp', onCore);
      },
      stop : () => {
        hasCore = false;
        Bangle.removeListener('CoreTemp', onCore);
      },
      draw : (x,y) => g.setColor(hasCore?"#0f0":"#8f8").drawImage(atob("DAyBAAHh0js3EuDMA8A8AWBnDj9A8A=="),x,y)
    };
  }
})

