(() => {
  function advertiseBattery() {
    if(Array.isArray(Bangle.bleAdvert)){
      // ensure we're in the cycle
      var found = false;
      for(var ad in Bangle.bleAdvert){
        if(ad[0x180F]){
          ad[0x180F] = [E.getBattery()];
          found = true;
          break;
        }
      }
      if(!found)
        Bangle.bleAdvert.push({ 0x180F: [E.getBattery()] });
    }else{
      // simple object
      Bangle.bleAdvert[0x180F] = [E.getBattery()];
    }

    NRF.setAdvertising(Bangle.bleAdvert);
  }

  if (!Bangle.bleAdvert) Bangle.bleAdvert = {};
  setInterval(advertiseBattery, 60 * 1000);
  advertiseBattery();
})();
