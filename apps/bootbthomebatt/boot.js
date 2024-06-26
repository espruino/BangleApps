var btHomeBatterySequence = 0;

function advertiseBTHomeBattery() {
  var advert = [0x40, 0x00, btHomeBatterySequence, 0x01, E.getBattery()];

  require("ble_advert").set(0xFCD2, advert);
  btHomeBatterySequence = (btHomeBatterySequence + 1) & 255;
}

setInterval(function() {
  advertiseBTHomeBattery();
}, 300000); // update every 5 min

advertiseBTHomeBattery();
