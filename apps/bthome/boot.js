// Ensure we have the bleAdvert global (to play well with other stuff)
if (!Bangle.bleAdvert) Bangle.bleAdvert = {};
Bangle.btHomeData = [];
{
  require("BTHome").packetId = 0|(Math.random()*256); // random packet id so new packets show up
  let settings = require("Storage").readJSON("bthome.json",1)||{};
  if (settings.showBattery)
    Bangle.btHomeData.push({
      type : "battery",
      v : E.getBattery()
    });
  // If buttons defined, add events for them
  if (settings.buttons instanceof Array) {
    let n = settings.buttons.reduce((n,b)=>b.n>n?b.n:n,-1);
    for (var i=0;i<=n;i++)
      Bangle.btHomeData.push({type:"button_event",v:"none",n:i});
  }
}

/* Global function to allow advertising BTHome adverts
  extras = array of extra data, see require("BTHome").getAdvertisement - can add {n:0/1/2} for different instances
  options = {
    event : an event - advertise fast, and when connected
  }
*/
Bangle.btHome = function(extras, options) {
  options = options||{};
  // clear any existing events
  Bangle.btHomeData.forEach(d => {if (d.type=="button_event") d.v="none";});
  // update with extras
  if (extras) {
    extras.forEach(extra => {
      var n = Bangle.btHomeData.find(b=>b.type==extra.type && b.n==extra.n);
      if (n) Object.assign(n, extra);
      else Bangle.btHomeData.push(extra);
    });
  }
  var bat = Bangle.btHomeData.find(b=>b.type=="battery");
  if (bat) bat.v = E.getBattery();
  var advert = require("BTHome").getAdvertisement(Bangle.btHomeData)[0xFCD2];
  // Add to the list of available advertising
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
  var advOptions = {};
  var updateTimeout = 10*60*1000; // update every 10 minutes
  if (options.event) { // if it's an event...
    advOptions.interval = 50;
    advOptions.whenConnected = true;
    updateTimeout = 30000; // slow down in 30 seconds
  }
  NRF.setAdvertising(Bangle.bleAdvert, advOptions);
  if (Bangle.btHomeTimeout) clearTimeout(Bangle.btHomeTimeout);
  Bangle.btHomeTimeout = setTimeout(function() {
    delete Bangle.btHomeTimeout;
    // update
    Bangle.btHome();
  }, updateTimeout);
};
