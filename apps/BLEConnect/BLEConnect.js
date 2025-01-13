let menu = {
    "": { "title": "BLECONNECT" },
    "RE-SCAN":  () => scan()
  };
  
  function showMainMenu() {
   menu["< Back"] =  () => load();
    Bangle.drawWidgets();
    return E.showMenu(menu);
  }
  
  function showDeviceInfo(device){
    const deviceMenu = {
      "": { "title": "Device Info" },
      "name": {
        value: device.name
      },
      "Signal-Str(dBm)": {
        value: device.rssi
        // Very strong connection -30 to -60
        //strong -60 to -70
        //Moderate -70 to -80
      },
      "manufacturer": {
        value: device.manufacturer===undefined ? "-" : device.manufacturer
      },
        "CONNECT": () => connectDevice(device),  // connect to a BLE device //
  
      "< Back": () => showMainMenu()  //  show a back button if wrong BLE selected //
    };
  
    return E.showMenu(deviceMenu);
  }
  
  function connectDevice(device) {
    E.showMessage("Connecting...");
  
    NRF.connect(device.id)
      .then(() => {
        E.showMessage("Connected!");
        // Handle the connected device, for example, interact with its services
      })
      .catch(err => {
        E.showMessage("Failed to connect");
        console.log("Connection error: ", err);
      });
  }
  
  function scan() {
    menu = {
      "": { "title": "BLE Detector" },
      "RE-SCAN":  () => scan()
    };
  
    waitMessage();
  
    NRF.findDevices(devices => {
      devices.forEach(device => {
        let deviceName = device.id.substring(0,17);
  
        if (device.name) {
          deviceName = device.name;
        }
  
        // Add a menu entry for each device
        menu[deviceName] = () => showDeviceInfo(device);
      });
      showMainMenu();
    }, { active: true });
  }
  
  function waitMessage() {
    E.showMenu();
    E.showMessage("scanning");
  }
  
  Bangle.loadWidgets();
  scan();
  waitMessage();
  
  // check error code status 

  /*Please change your own errors for BLE machines */

  function checkForErrorCode(status) {
    if (status === "Auto Run") return;
    if (status === "E-Stp") showErrorMessage("Emergency stop detected. Please check the machine.");
    if (status === "Blocked") showErrorMessage("Machine blocked. Please inspect for obstructions.");
    if (status === "Other") return;
      // (other) showErrorMessage("Unknown error. Please investigate the issue.");
  }
  
  // Show error message and allow Button 1 to confirm resolution
  function showErrorMessage(status) {
    Bangle.buzz();
    E.showMessage("Error Code: " + status + "\nDevice down! Please check");
  
    // Wait for 3 seconds, then show the confirmation message
    setTimeout(() => {
      E.showMessage("Press Button 1 to confirm issue fixed");
      // Listen for Button 1 press to confirm issue fixed
      setButtonWatch();
    }, 3000);
  }
  
  // Wait for Button 1 press to confirm issue fixed
  function setButtonWatch() {
    // Button 1 is typically on the top-left of the Bangle.js (button 1 is the topmost button)
    setWatch(() => {
      confirmIssueFixed();  // Call the function to confirm issue has been fixed
    }, BTN1, {repeat: false, edge: "falling"});
  }
  
