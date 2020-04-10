let menu = {
  "": { "title": "BLE Detector" },
  "RE-SCAN":  () => scan()
};

function showMainMenu() {
  menu["< Back"] =  () => load();
  return E.showMenu(menu);
}

function showDeviceInfo(device){
  console.log(device);
  const deviceMenu = {
    "": { "title": "Device Info" },
    "name": {
      value: device.name
    },
    "rssi": {
      value: device.rssi
    },
    "manufacturer": {
      value: device.manufacturer
    }
  };

  deviceMenu[device.id] = () => {};
  deviceMenu["< Back"] =  () => scan();

  /*for(let key in device){
    deviceMenu[key.substring(0,17)] = {
      value: device[key.substring(0,17)]
    };
  }*/

  return E.showMenu(deviceMenu);
}

function scan() {
  menu = {
    "": { "title": "BLE Detector" },
    "RE-SCAN":  () => scan()
  };

  waitMessage();

  NRF.findDevices(devices => {
      for (let device of devices) {
        let deviceName = device.id.substring(0,17);

        if (device.name) {
          deviceName = device.name;
        }

        menu[deviceName] = () => showDeviceInfo(device);
      }
      showMainMenu(menu);
  }, { active: true });
}

function waitMessage() {
  E.showMenu();
  E.showMessage("scanning");
}

scan();
waitMessage();

