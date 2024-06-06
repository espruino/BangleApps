/**
 * This library communicates with a Bluetooth CSC peripherial using the Espruino NRF library.
 *
 * ## Usage:
 * 1. Register event handlers using the \`on(eventName, handlerFunction)\` method
 *    You can subscribe to the \`wheelEvent\` and \`crankEvent\` events or you can
 *    have raw characteristic values passed through using the \`value\` event.
 * 2. Search and connect to a BLE CSC peripherial by calling the \`connect()\` method
 * 3. To tear down the connection, call the \`disconnect()\` method
 *
 * ## Events
 * - \`status\` - string containing connection status
 * - \`data\` - the peripheral sends a notification containing wheel/crank event data
 * - \`disconnect\` - the peripheral ends the connection or the connection is lost
 *
 *  cwr/ccr => wheel/crank cumulative revs
 *  lwet/lcet => wheel/crank last event time in 1/1024s
 *  wrps/crps => calculated wheel/crank revs per second
 *  wdt/cdt => time period in seconds between events
 *  wr => wheel revs
 *  kph => kilometers per hour
 */
class BLECSC {
  constructor() {
    this.reconnect = false; // set when start called
    this.device = undefined; // set when device found
    this.gatt = undefined; // set when connected
    // .on("status",     => string
    // .on("data"
    // .on("disconnect"
    this.resetStats();
    // Set default values and merge with stored values
    this.settings = Object.assign({
      circum: 2068 // circumference in mm
    }, (require('Storage').readJSON('blecsc.json', true) || {}));
  }

  resetStats() {
    this.cwr = undefined;
    this.ccr = undefined;
    this.lwet = undefined;
    this.lcet = undefined;
    this.lastCwr = undefined;
    this.lastCcr = undefined;
    this.lastLwet = undefined;
    this.lastLcet = undefined;
    this.kph = undefined;
    this.wrps = 0; // wheel revs per second
    this.crps = 0; // crank revs per second
    this.widle = 0; // wheel idle counter
    this.cidle = 0; // crank idle counter
    //this.batteryLevel = undefined;
  }

  getDeviceAddress() {
    if (!this.device || !this.device.id)
      return '00:00:00:00:00:00';
    return this.device.id.split(" ")[0];
  }

  status(txt) {
    this.emit("status", txt);
  }

  /**
   * Find and connect to a device which exposes the CSC service.
   *
   * @return {Promise}
   */
  connect() {
    this.status("Scanning");
    // Find a device, then get the CSC Service and subscribe to
    // notifications on the CSC Measurement characteristic.
    // NRF.setLowPowerConnection(true);
    var reconnect = this.reconnect; // auto-reconnect
    return NRF.requestDevice({
      timeout: 5000,
      filters: [{
        services: ["1816"]
      }],
    }).then(device => {
      this.status("Connecting");
      this.device = device;
      this.device.on('gattserverdisconnected', event => {
        this.device = undefined;
        this.gatt = undefined;
        this.resetStats();
        this.status("Disconnected");
        this.emit("disconnect", event);
        if (reconnect) {// auto-reconnect
          reconnect = false;
          setTimeout(() => {
            if (this.reconnect) this.connect().then(() => {}, () => {});
          }, 500);
        }
      });

      return new Promise(resolve => setTimeout(resolve, 150)); // On CooSpo we get a 'Connection Timeout' if we try and connect too soon
    }).then(() => {
      return this.device.gatt.connect();
    }).then(gatt => {
      this.status("Connected");
      this.gatt = gatt;
      return gatt.getPrimaryService("1816");
    }).then(service => {
      return service.getCharacteristic("2a5b"); // UUID of the CSC measurement characteristic
    }).then(characteristic => {
      // register for changes on 2a5b
      characteristic.on('characteristicvaluechanged', event => {
        const flags = event.target.value.getUint8(0);
        var offs = 0;
        var data = {};
        if (flags & 1) { // FLAGS_WREV_BM
          this.lastCwr = this.cwr;
          this.lastLwet = this.lwet;
          this.cwr = event.target.value.getUint32(1, true);
          this.lwet = event.target.value.getUint16(5, true);
          if (this.lastCwr === undefined) this.lastCwr = this.cwr;
          if (this.lastLwet === undefined) this.lastLwet = this.lwet;
          if (this.lwet < this.lastLwet) this.lastLwet -= 65536;
          let secs = (this.lwet - this.lastLwet) / 1024;
          if (secs)
            this.wrps = (this.cwr - this.lastCwr) / secs;
          else {
            if (this.widle<5) this.widle++;
            else this.wrps = 0;
          }
          this.kph = this.wrps * this.settings.circum / 3600;
          Object.assign(data, { // Notify the 'wheelEvent' handler
            cwr: this.cwr, // cumulative wheel revolutions
            lwet: this.lwet, // last wheel event time
            wrps: this.wrps, // wheel revs per second
            wr: this.cwr - this.lastCwr, // wheel revs
            wdt : secs, // time period
            kph : this.kph
          });
          offs += 6;
        }
        if (flags & 2) { // FLAGS_CREV_BM
          this.lastCcr = this.ccr;
          this.lastLcet = this.lcet;
          this.ccr = event.target.value.getUint16(offs + 1, true);
          this.lcet = event.target.value.getUint16(offs + 3, true);
          if (this.lastCcr === undefined) this.lastCcr = this.ccr;
          if (this.lastLcet === undefined) this.lastLcet = this.lcet;
          if (this.lcet < this.lastLcet) this.lastLcet -= 65536;
          let secs = (this.lcet - this.lastLcet) / 1024;
          if (secs)
            this.crps = (this.ccr - this.lastCcr) / secs;
          else {
            if (this.cidle<5) this.cidle++;
            else this.crps = 0;
          }
          Object.assign(data, { // Notify the 'crankEvent' handler
            ccr: this.ccr, // cumulative crank revolutions
            lcet: this.lcet, // last crank event time
            crps: this.crps, // crank revs per second
            cdt : secs, // time period
          });
        }
        this.emit("data",data);
      });
      return characteristic.startNotifications();
/*    }).then(() => {
      return this.gatt.getPrimaryService("180f");
    }).then(service => {
      return service.getCharacteristic("2a19");
    }).then(characteristic => {
      characteristic.on('characteristicvaluechanged', (event)=>{
        this.batteryLevel = event.target.value.getUint8(0);
      });
      return characteristic.startNotifications();*/
    }).then(() => {
      this.status("Ready");
    }, err => {
      this.status("Error: " + err);
      if (reconnect) { // auto-reconnect
        reconnect = false;
        setTimeout(() => {
          if (this.reconnect) this.connect().then(() => {}, () => {});
        }, 500);
      }
      throw err;
    });
  }

  /**
   * Disconnect the device.
   */
  disconnect() {
    if (!this.gatt) return;
    this.gatt.disconnect();
    this.gatt = undefined;
  }

  /* Start trying to connect - will keep searching and attempting to connect*/
  start() {
    this.reconnect = true;
    if (!this.device)
      this.connect().then(() => {}, () => {});
  }

  /* Stop trying to connect, and disconnect */
  stop() {
    this.reconnect = false;
    this.disconnect();
  }
}

// Get an instance of BLECSC or create one if it doesn't exist
BLECSC.getInstance = function() {
  if (!BLECSC.instance) {
    BLECSC.instance = new BLECSC();
  }
  return BLECSC.instance;
};

exports = BLECSC;

/*
var csc = require("blecsc").getInstance();
csc.on("status", txt => {
  print("##", txt);
  E.showMessage(txt);
});
csc.on("data", e => print(e));
csc.start();
*/
