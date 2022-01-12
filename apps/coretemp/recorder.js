(function(recorders) {
  recorders.temp = function() {
    var core = 0, skin = 0;
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

