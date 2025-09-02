// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function (back) {
  var settings = {};
  const SETTINGS_FILE = 'coretemp.json'
  var CORECONNECTED = false;
  // creates a function to safe a specific setting, e.g.  save('color')(1)
  function writeSettings(key, value) {
    let s = require('Storage').readJSON(SETTINGS_FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(SETTINGS_FILE, s);
    readSettings();
  }

  function readSettings() {
    settings = Object.assign(
      require('Storage').readJSON(SETTINGS_FILE, true) || {}
    );
  }

  readSettings();
  let log = () => { };
  if (settings.debuglog)
    log = print;

  let supportedServices = [
    "00002100-5b1e-4347-b07c-97b514dae121", // Core Body Temperature Service
    "0x180f", // Battery
    "0x1809", // Health Thermometer Service
  ];

  let supportedCharacteristics = [
    "00002101-5b1e-4347-b07c-97b514dae121", // Core Body Temperature Characteristic
    "00002102-5b1e-4347-b07c-97b514dae121", //Core Temp Control Point (opCode for extra function)
    //"0x2a1c", //Thermometer
    //"0x2a1d", //Sensor Location (CORE)
    "0x2a19", // Battery
  ];

  var characteristicsToCache = function (characteristics) {
    log("Cache characteristics");
    let cache = {};
    if (!cache.characteristics) cache.characteristics = {};
    for (var c of characteristics) {
      log("Saving handle " + c.handle_value + " for characteristic: ", c.uuid);
      cache.characteristics[c.uuid] = {
        "handle": c.handle_value,
        "uuid": c.uuid,
        "notify": c.properties.notify,
        "read": c.properties.read,
        "write": c.properties.write
      };
    }
    writeSettings("cache", cache);
  };

  var controlPointChar;

  let createCharacteristicPromise = function (newCharacteristic) {
    log("Create characteristic promise", newCharacteristic.uuid);
    if (newCharacteristic.uuid === "00002102-5b1e-4347-b07c-97b514dae121") {
      log("Subscribing to CoreTemp Control Point Indications.");
      controlPointChar = newCharacteristic;
      return controlPointChar.writeValue(new Uint8Array([0x02]), {
        type: "command",
        handle: true
      })
        .then(() => {
          log("Indications enabled! Listening for responses...");
          return controlPointChar.startNotifications(); //now we can send opCodes 
        })
        .then(() => log("Finished handling CoreTemp Control Point."))
        .catch(error => {
          log("Error enabling indications:", error);
        });
    }
    return Promise.resolve().then(() => log("Handled characteristic", newCharacteristic.uuid));
  };

  let attachCharacteristicPromise = function (promise, characteristic) {
    return promise.then(() => {
      log("Handling characteristic:", characteristic.uuid);
      return createCharacteristicPromise(characteristic);
    });
  };

  let characteristics;
  let createCharacteristicsPromise = function (newCharacteristics) {
    log("Create characteristics promise ", newCharacteristics.length);
    let result = Promise.resolve();
    for (let c of newCharacteristics) {
      if (!supportedCharacteristics.includes(c.uuid)) continue;
      log("Supporting characteristic", c.uuid);
      characteristics.push(c);

      result = attachCharacteristicPromise(result, c);
    }
    return result.then(() => log("Handled characteristics"));
  };

  let createServicePromise = function (service) {
    log("Create service promise", service.uuid);
    let result = Promise.resolve();
    result = result.then(() => {
      log("Handling service", service.uuid);
      return service.getCharacteristics().then((c) => createCharacteristicsPromise(c));
    });
    return result.then(() => log("Handled service", service.uuid));
  };

  let attachServicePromise = function (promise, service) {
    return promise.then(() => createServicePromise(service));
  };

  function writeToControlPoint(opCode, params) {
    return new Promise((resolve, reject) => {
      let data = new Uint8Array([opCode].concat(params));

      if (!controlPointChar) {
        log("Control Point characteristic not found! Reconnecting...");
        return;
      }
      // Temporary handler to capture the response
      function handleResponse(event) {
        let response = new Uint8Array(event.target.value.buffer);
        //let responseOpCode = response[0];
        let requestOpCode = response[1];  // Matches the sent OpCode
        let resultCode = response[2];     // 0x01 = Success
        controlPointChar.removeListener("characteristicvaluechanged", handleResponse);
        if (requestOpCode === opCode) {
          if (resultCode === 0x01) { //successful
            resolve(response);
          } else {
            reject("Error Code: " + resultCode);
          }
        }
      }

      controlPointChar.on("characteristicvaluechanged", handleResponse);
      controlPointChar.writeValue(data)
        .then(() => log("Sent OpCode:", opCode.toString(16), "Params:", data))
        .catch(error => {
          log("Write error:", error);
          reject(error);
        });
    });
  }
  let gatt;
  function cacheDevice(deviceName) {
    let promise;
    let filters;
    characteristics = [];
    filters = [{ name: deviceName }];
    log("Requesting device with filters", filters);
    promise = NRF.requestDevice({ filters: filters, active: settings.active });
    promise = promise.then((d) => {
      E.showMessage("Found!!\n" + deviceName + "\nConnecting...");
      log("Got device", d);
      gatt = d.gatt;
      log("Connecting...");
      d.on('gattserverdisconnected', function () {
        CORECONNECTED = false;
        log("Disconnected! ");
        gatt = null;
        //setTimeout(() => cacheDevice(deviceName), 5000);  // Retry in 5 seconds
      });
      return gatt.connect().then(function () {
        log("Connected.");
      });
    });
    promise = promise.then(() => {
      log(JSON.stringify(gatt.getSecurityStatus()));
      if (gatt.getSecurityStatus().bonded) {
        log("Already bonded");
        return Promise.resolve();
      } else {
        log("Start bonding");
        return gatt.startBonding()
          .then(() => log("Security status after bonding" + gatt.getSecurityStatus()));
      }
    });
    promise = promise.then(() => {
      log("Getting services");
      return gatt.getPrimaryServices();
    });

    promise = promise.then((services) => {
      log("Got services", services.length);
      let result = Promise.resolve();
      for (let service of services) {
        if (!(supportedServices.includes(service.uuid))) continue;
        log("Supporting service", service.uuid);
        result = attachServicePromise(result, service);
      }
      return result;
    });

    return promise.then(() => {
      log("Connection established, saving cache");
      E.showMessage("Found " + deviceName + "\nConnected!");
      CORECONNECTED = true;
      characteristicsToCache(characteristics);
    });
  }

  function ConnectToDevice(d) {
      E.showMessage("Connecting...");
      let count = 0;
      const successHandler = () => {
        E.showMenu(buildMainMenu());
      };
      const errorHandler = (e) => {
        count++;
        log("ERROR", e);
        if (count <= 10) {
          E.showMessage("Error during caching\nRetry " + count + "/10", e);
          return cacheDevice(d).then(successHandler).catch(errorHandler);
        } else {
          E.showAlert("Error during caching", e).then(() => {
            E.showMenu(buildMainMenu());
          });
        }
      };
      return cacheDevice(d).then(successHandler).catch(errorHandler);
  }
  /*
  function getPairedAntHRM() {
    writeToControlPoint(0x04) // Get paired HRMs
      .then(response => {
        let totalHRMs = response[3]; // HRM count at index 3
        log("📡 PAIRED ANT+:", totalHRMs);
        let promises = [];
        let hrmFound = [];
        for (let i = 0; i < totalHRMs; i++) {
          promises.push(
            writeToControlPoint(0x05, [i]) // Get HRM ID from paired list
              .then(hrmResponse => {
                log("🔍 Response 0x05:", hrmResponse);

                let byte1 = hrmResponse[3]; // LSB
                let byte2 = hrmResponse[4]; // Middle Byte
                let byte3 = hrmResponse[5]; // MSB
                let txType = hrmResponse[5]; // Transmission Type
                let hrmState = hrmResponse[6]; // Connection State
                let pairedAntId = (byte1) | (byte2 << 8) | (byte3 << 16); // ✅ Corrected parsing
                let stateText = ["Closed", "Searching", "Synchronized", "Reserved"][hrmState & 0x03];
                log(`🔗 HRM ${i}: ANT ID = ${pairedAntId}, Tx-Type = ${txType}, State = ${stateText}`);
                hrmFound.push({ index: i, antId: pairedAntId, txType: txType, stateText: stateText });
              })
              .catch(e => log(`❌ Error fetching HRM ${i} ID:`, e))
          );
        }
        return Promise.all(promises).then(() => hrmFound);
      })
      .then(allHRMs => {
        log("Retrieved all paired HRMs:", allHRMs);
        return  // Modified start scanning command
      })
  }
      */
  function clearPairedHRM_ANT() {
    return writeToControlPoint(0x01) // Send OpCode 0x01 to clear list
      .then(response => {
        let resultCode = response[2]; // Check the success flag
        if (resultCode === 0x01) {
          log("ANT+ HRM list cleared successfully.");
          return Promise.resolve();
        } else {
          log("Failed to clear ANT+ HRM list. Error code:", resultCode);
          return Promise.reject(new Error(`Error code: ${resultCode}`));
        }
      })
      .catch(error => {
        log("Error clearing ANT+ HRM list:", error);
        return Promise.reject(error);
      });
  }

  function scanUntilSynchronized(maxRetries, delay) {
    let attempts = 0;
    function checkHRMState() {
      if (attempts >= maxRetries) {
        log("Max scan attempts reached. HRM did not synchronize.");
        E.showAlert("Max scan attempts reached. HRM did not synchronize.").then(() => E.showMenu(HRM_MENU()));
        return;
      }
      log(`Attempt ${attempts + 1}/${maxRetries}: Checking HRM state...`);
      writeToControlPoint(0x05, [0]) // Check paired HRM state
        .then(hrmResponse => {
          log("Sent OpCode: 0x05, response: ", hrmResponse);
          let byte1 = hrmResponse[3]; // LSB of ANT ID
          let byte2 = hrmResponse[4]; // MSB of ANT ID
          let txType = hrmResponse[5]; // Transmission Type
          let hrmState = hrmResponse[6]; // HRM State
          let retrievedAntId = (byte1) | (byte2 << 8) | (txType << 16);
          let stateText = ["Closed", "Searching", "Synchronized", "Reserved"][hrmState & 0x03];
          log(`HRM Status: ANT ID = ${retrievedAntId}, Tx-Type = ${txType}, State = ${stateText}`);
          E.showAlert(`HRM Status\nANT ID = ${retrievedAntId}\nState = ${stateText}`).then(() => E.showMenu(HRM_MENU()));
          if (stateText === "Synchronized") {
            return;
          } else {
            log(`HRM ${retrievedAntId} is not yet synchronized. Scanning again...`);
            // Start scan again
            writeToControlPoint(0x0D)
              .then(() => writeToControlPoint(0x0A, [0xFF]))
              .then(() => {
                attempts++;
                setTimeout(checkHRMState, delay); // Wait and retry
              })
              .catch(error => {
                log("Error restarting scan:", error);
              });
          }
        })
        .catch(error => {
          log("Error checking HRM state:", error);
        });
    }
    log("Starting scan to synchronize HRM...");
    writeToControlPoint(0x0A, [0xFF]) // Start initial scan
      .then(() => {
        setTimeout(checkHRMState, delay); // Wait and check state
      })
      .catch(error => {
        log("Error starting initial scan:", error);
      });
  }

  function scanHRM_ANT() {
    E.showMenu();
    E.showMessage("Scanning for 10 seconds"); // Increased scan time
    writeToControlPoint(0x0A, [0xFF])
      .then(response => {
        log("Received Response for 0x0A:", response);
        return new Promise(resolve => setTimeout(resolve, 10000)); // Extended scan time to 10 seconds
      })
      .then(() => {
        return writeToControlPoint(0x0B); // Get HRM count
      })
      .then(response => {
        let HRMCount = response[3];
        log("HRM Count Response:", HRMCount);
        let hrmFound = [];
        let promises = [];
        for (let i = 0; i < HRMCount; i++) {
          promises.push(
            writeToControlPoint(0x0C, [i]) // Get Scanned HRM IDs
              .then(hrmResponse => {
                log("Response 0x0C:", hrmResponse);
                let byte1 = hrmResponse[3]; // LSB
                let byte2 = hrmResponse[4]; // MSB
                let txType = hrmResponse[5]; // Transmission Type
                let scannedAntId = (byte1) | (byte2 << 8) | (txType << 16); //3 byte ANT+ ID
                log(`HRM ${i} ID Response: ${scannedAntId}`);
                hrmFound.push({ antId: scannedAntId });
              })
              .catch(e => log(`Error fetching HRM ${i} ID:`, e))
          );
        }
        return Promise.all(promises).then(() => {
          if (hrmFound > 0) {
            let submenu_scan = {
              '< Back': function () { E.showMenu(buildMainMenu()); }
            };
            hrmFound.forEach((hrm) => {
              let id = hrm.antId;
              submenu_scan[id] = function () {
                E.showPrompt("Connect to\n" + id + "?", { title: "ANT+ Pairing" }).then((r) => {
                  if (r) {
                    E.showMessage("Connecting...");
                    let byte1 = id & 0xFF; // LSB
                    let byte2 = (id >> 8) & 0xFF; // Middle byte
                    let byte3 = (id >> 16) & 0xFF; // Transmission Type
                    return clearPairedHRM_ANT(). //FIRST CLEAR ALL ANT+ HRM
                      then(() => { writeToControlPoint(0x02, [byte1, byte2, byte3]) }) // Pair the HRM
                      .then(() => {
                        log(`HRM ${id} added to paired list.`);
                        writeSettings("ANT_HRM", hrm);
                        E.showMenu(HRM_MENU());
                      })
                      .catch(e => log(`Error adding HRM ${id} to paired list:`, e));
                  }
                });
              };
            });
            E.showMenu(submenu_scan);
          } else {
            E.showAlert("No ANT+ HRM found.").then(() => E.showMenu(HRM_MENU()));
          }
        });
      })
      .catch(e => log("ERROR:", e));
  }

  function buildMainMenu() {
    let mainmenu = {
      '': { 'title': 'CORE Sensor' },
      '< Back': back,
      'Enable': {
        value: !!settings.enabled,
        onchange: v => {
          writeSettings("enabled", v);
        },
      },
      'Widget': {
        value: !!settings.widget,
        onchange: v => {
          writeSettings("widget", v);
        },
      }
    };
    if (settings.btname || settings.btid) {
      let name = "Clear " + (settings.btname || settings.btid);
      mainmenu[name] = function () {
        E.showPrompt("Clear current device?").then((r) => {
          if (r) {
            writeSettings("btname", undefined);
            writeSettings("btid", undefined);
            writeSettings("cache", undefined);
            if(gatt) gatt.disconnect();
          }
          E.showMenu(buildMainMenu());
        });
      };
      if(!CORECONNECTED){
        let connect = "Connect " + (settings.btname || settings.btid);
        mainmenu[connect] = function () {ConnectToDevice(settings.btname)};
      }else{
        mainmenu['HRM Settings'] = function () { E.showMenu(HRM_MENU()); };
      }
    } else {
      mainmenu['Scan for CORE'] = function () { ScanForCORESensor(); };
    }
    mainmenu['Debug'] = function () { E.showMenu(submenu_debug); };
    return mainmenu;
  }
  let submenu_debug = {
    '': { title: "Debug" },
    '< Back': function () { E.showMenu(buildMainMenu()); },
    'Alert on disconnect': {
      value: !!settings.warnDisconnect,
      onchange: v => {
        writeSettings("warnDisconnect", v);
      }
    },
    'Debug log': {
      value: !!settings.debuglog,
      onchange: v => {
        writeSettings("debuglog", v);
      }
    }
  };

  function HRM_MENU() {
    let menu = {
      '': { 'title': 'CORE: HR' },
      '< Back': function () { E.showMenu(buildMainMenu()); },
      'Scan for ANT+': function () { scanHRM_ANT(); }
    }
    if (settings.btname) {
      menu['ANT+ Status'] = function () { scanUntilSynchronized(10, 3000); },
        menu['Clear ANT+'] = function () {
          E.showPrompt("Clear ANT+ HRs?", { title: "CLear ANT+" }).then((r) => {
            if (r) {
              clearPairedHRM_ANT();
            }
            E.showMenu(HRM_MENU());
          });
        }
    }
    return menu;
  }

  function ScanForCORESensor() {
    E.showMenu();
    E.showMessage("Scanning for 5 seconds");
    let submenu_scan = {
      '< Back': function () { E.showMenu(buildMainMenu()); }
    };
    NRF.findDevices(function (devices) {
      submenu_scan[''] = { title: `Scan (${devices.length} found)` };
      if (devices.length === 0) {
        E.showAlert("No devices found")
          .then(() => E.showMenu(buildMainMenu()));
        return;
      } else {
        devices.forEach((d) => {
          log("Found device", d);
          let shown = (d.name || d.id.substr(0, 17));
          submenu_scan[shown] = function () {
            E.showPrompt("Connect to\n" + shown + "?", { title: "Pairing" }).then((r) => {
              if (r) {
                E.showMessage("Connecting...");
                let count = 0;
                const successHandler = () => {
                  E.showPrompt("Success!", {
                    buttons: { "OK": true }
                  }).then(() => {
                    writeSettings("btid", d.id);
                    writeSettings("btname", d.name); //Seems to only like to connect by name
                    E.showMenu(HRM_MENU());
                  });
                };
                const errorHandler = (e) => {
                  count++;
                  log("ERROR", e);
                  if (count <= 10) {
                    E.showMessage("Error during caching\nRetry " + count + "/10", e);
                    return cacheDevice(d.name).then(successHandler).catch(errorHandler);
                  } else {
                    E.showAlert("Error during caching", e).then(() => {
                      E.showMenu(buildMainMenu());
                    });
                  }
                };
                return cacheDevice(d.name).then(successHandler).catch(errorHandler);
              }
            });
          };
        });
      }
      E.showMenu(submenu_scan);
    }, { timeout: 5000, active: true, filters: [{ services: ["00002100-5b1e-4347-b07c-97b514dae121"] }] });
  }

  function init() {
    E.showMenu();
    E.showMenu(buildMainMenu());
  }
  init();
})