(() => {
  function setupHRMAdvertising() {
    /*
     * This function preparse BLE heart rate Advertisement.
     */
    NRF.setServices({
      0x180D: { // heart_rate
        0x2A37: { // heart_rate_measurement
          notify: true,
          value: [0x06, 0],
        }
      }
    }, { advertise: ['180D'] });

  }

  function updateBLEHeartRate(hrm) {
    /*
     * Send updated heart rate measurement via BLE
     */
    if (hrm === undefined) return;
    try {
      NRF.updateServices({
        '180d': {
          '2a37': {
            value: [
              0x06, //
              hrm
            ],
            notify: true
          }
        }
      });
    } catch (error) {
      // After setupHRMAdvertising() BLE needs to restart.
      // We force a disconnect if the Bangle was connected while setting HRM
      NRF.disconnect();
    }
  }

  setupHRMAdvertising();
  Bangle.on("HRM", function (hrm) { updateBLEHeartRate(hrm.bpm); });
})();
