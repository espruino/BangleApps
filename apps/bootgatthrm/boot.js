(() => {
  function setupHRMAdvertising() {
    /*
     * This function prepares BLE heart rate Advertisement.
     */

    NRF.setAdvertising(
      {
        0x180d: undefined
      },
      {
        // We need custom Advertisement settings for Apps like OpenTracks
        connectable: true,
        discoverable: true,
        scannable: true,
        whenConnected: true,
      }
    );

    NRF.setServices({
      0x180D: { // heart_rate
        0x2A37: { // heart_rate_measurement
          notify: true,
          value: [0x06, 0],
        },
        0x2A38: { // Sensor Location: Wrist
          value: 0x02,
        }
      }
    });

  }

  const keepConnected = (require("Storage").readJSON("gatthrm.settings.json", 1) || {}).keepConnected;

  function updateBLEHeartRate(hrm) {
    /*
     * Send updated heart rate measurement via BLE
     */
    if (hrm === undefined || hrm.confidence < 50) return;
    try {
      NRF.updateServices({
        0x180D: {
          0x2A37: {
            value: [0x06, hrm.bpm],
            notify: true
          },
          0x2A38: {
            value: 0x02,
          }
        }
      });
    } catch (error) {
      if (error.message.includes("BLE restart")) {
        /*
         * BLE has to restart after service setup.
         */
        if(!keepConnected)
          NRF.disconnect();
      }
      else if (error.message.includes("UUID 0x2a37")) {
        /*
         * Setup service if it wasn't setup correctly for some reason
         */
        setupHRMAdvertising();
      } else {
        console.log("[bootgatthrm]: Unexpected error occured while updating HRM over BLE! Error: " + error.message);
      }
    }
  }

  setupHRMAdvertising();
  Bangle.on("HRM", updateBLEHeartRate);
})();
