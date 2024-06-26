(() => {
  var btHomeSequenceNo = 0;
  function advertiseBTHomeBattery() {
    require("ble_advert").set(0xFCD2, [0x40,0x00,btHomeSequenceNo,0x01,E.getBattery()]);
    btHomeSequenceNo = (btHomeSequenceNo + 1) & 255;
  }

  setInterval(advertiseBTHomeBattery, 5 * 60 * 1000);
  advertiseBattery();
})();
