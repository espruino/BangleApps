// ble-scanner
// Scan the airwaves every three seconds (which seems safe for a large number of devices)
// Using the menu feature, display a scrollable list of BLE devices on the watch

// Dummy menu item to display until we find something
const NODEVICE = 'No devices found';

const SCAN_INTERVAL = 3000;

const menu = {
};

menu[NODEVICE] = {
  value : "",
  onchange : () => {}
};


function draw() {
  E.showMenu(menu);
}

function scan() {
  NRF.findDevices(devices => {
    for (let device of devices) {

      // Only display devices that advertise a name

      if (device.name) {
        // Remove no devices found message if it is present
        if (menu[NODEVICE]) {
          delete menu[NODEVICE];
        }
        menu[device.name] = {
          value : device.rssi,
          onchange : () => {}
        };
      }
    }
    draw();
  }, { active: true });
}


function waitMessage() {
  E.showMessage('scanning');
}

scan();
waitMessage();

setInterval(scan, SCAN_INTERVAL);
