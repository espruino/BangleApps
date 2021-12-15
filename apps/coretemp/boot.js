(function() {
    var gatt;
  
    //Would it be better to scan by uuid rather than name?
    NRF.requestDevice({ timeout: 20000, filters: [{ name: 'CORE [a]' }] }).then(function(device) {
    return device.gatt.connect();
    }).then(function(g) {
    gatt = g;
    return gatt.getPrimaryService("1809");
    }).then(function(service) {
    return service.getCharacteristic("2A1C");
    }).then(function(characteristic) {
        characteristic.on('characteristicvaluechanged', function(event) {
        var dv = event.target.value;
        var core = (dv.buffer[2]*256+dv.buffer[1])/100;
        Bangle.emit('Core',{
                temp:core
                });
        });
        return characteristic.startNotifications();
    }).then(function() {
    });
})();
