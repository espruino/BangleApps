(() => {
  function setupHRMAdvertising() {
    /*
     * This function prepares BLE heart rate Advertisement.
     */

    NRF.setServices({
      0x180D: { // heart_rate
        0x2A37: { // heart_rate_measurement
          notify: true,
          value: [0x06, 0],
        }
      }
    }, { advertise: [0x180d] });

  }
  function updateBLEHeartRate(hrm) {
    /*
     * Send updated heart rate measurement via BLE
     */
    if (hrm === undefined || hrm.confidence < 50) return;
    try {
      NRF.updateServices({
        0x180D: {
          0x2A37: {
            value: [
              0x06, //
              hrm.bpm
            ],
            notify: true
          }
        }
      });
    } catch (error) {
      if (error.message.includes("BLE restart")) {
        /*
         * BLE has to restart after service setup.  
         */
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
  Bangle.on("HRM", function (hrm) { updateBLEHeartRate(hrm); });
})();
