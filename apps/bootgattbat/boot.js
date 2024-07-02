(() => {
  function advertiseBattery() {
    require("ble_advert").set(0x180F, [E.getBattery()]);
  }

  setInterval(advertiseBattery, 60 * 1000);
  advertiseBattery();
})();
