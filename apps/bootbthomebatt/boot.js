var btHomeBatterySequence = 0;

function advertiseBTHomeBattery() {
  var advert = [0x40, 0x00, btHomeBatterySequence, 0x01, E.getBattery()];

  if(Array.isArray(Bangle.bleAdvert)){
    var found = false;
    for(var ad in Bangle.bleAdvert){
      if(ad[0xFCD2]){
        ad[0xFCD2] = advert;
        found = true;
        break;
      }
    }
    if(!found)
      Bangle.bleAdvert.push({ 0xFCD2: advert });
  } else {
    Bangle.bleAdvert[0xFCD2] = advert;
  }
  NRF.setAdvertising(Bangle.bleAdvert);
  btHomeBatterySequence = (btHomeBatterySequence + 1) & 255;
}

if (!Bangle.bleAdvert) Bangle.bleAdvert = {};
setInterval(function() {
  advertiseBTHomeBattery();
}, 300000); // update every 5 min

advertiseBTHomeBattery();
