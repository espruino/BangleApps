(() => {
  function advertiseBattery() {
    Bangle.bleAdvert[0x180f] = [E.getBattery()];
    NRF.setAdvertising(Bangle.bleAdvert);
  }

  if (!Bangle.bleAdvert) Bangle.bleAdvert = {};
  setInterval(advertiseBattery, 60 * 1000);
  advertiseBattery();
})();
