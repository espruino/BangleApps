const SERVICE_UUID = "1816";
// UUID of the CSC measurement characteristic
const MEASUREMENT_UUID = "2a5b";

// Wheel revolution present bit mask
const FLAGS_WREV_BM = 0x01;
// Crank revolution present bit mask
const FLAGS_CREV_BM = 0x02;

/**
 * This class communicates with a Bluetooth CSC peripherial using the Espruino NRF library.
 *
 * ## Usage:
 * 1. Register event handlers using the \`on(eventName, handlerFunction)\` method
 *    You can subscribe to the \`wheelEvent\` and \`crankEvent\` events or you can
 *    have raw characteristic values passed through using the \`value\` event.
 * 2. Search and connect to a BLE CSC peripherial by calling the \`connect()\` method
 * 3. To tear down the connection, call the \`disconnect()\` method
 *
 * ## Events
 * - \`wheelEvent\` - the peripharial sends a notification containing wheel event data
 * - \`crankEvent\` - the peripharial sends a notification containing crank event data
 * - \`value\` - the peripharial sends any CSC characteristic notification (including wheel & crank event)
 * - \`disconnect\` - the peripherial ends the connection or the connection is lost
 *
 * Each event can only have one handler. Any call to \`on()\` will
 * replace a previously registered handler for the same event.
 */
class BLECSC {
  constructor() {
    this.device = undefined;
    this.ccInterval = undefined;
    this.gatt = undefined;
    this.handlers = {
      // wheelEvent
      // crankEvent
      // value
      // disconnect
    };
  }

  getDeviceAddress() {
    if (!this.device || !this.device.id)
      return '00:00:00:00:00:00';
    return this.device.id.split(" ")[0];
  }

  checkConnection() {
    if (!this.device)
      console.log("no device");
    // else
      // console.log("rssi: " + this.device.rssi);
  }

  /**
   * Callback for the GATT characteristicvaluechanged event.
   * Consumers must not call this method!
   */
  onValue(event) {
    // Not interested in non-CSC characteristics
    if (event.target.uuid != "0x" + MEASUREMENT_UUID) return;

    // Notify the generic 'value' handler
    if (this.handlers.value) this.handlers.value(event);

    const flags = event.target.value.getUint8(0, true);
    // Notify the 'wheelEvent' handler
    if ((flags & FLAGS_WREV_BM) && this.handlers.wheelEvent) this.handlers.wheelEvent({
      cwr: event.target.value.getUint32(1, true),  // cumulative wheel revolutions
      lwet: event.target.value.getUint16(5, true), // last wheel event time
    });

    // Notify the 'crankEvent' handler
    if ((flags & FLAGS_CREV_BM) && this.handlers.crankEvent) this.handlers.crankEvent({
      ccr: event.target.value.getUint16(7, true),  // cumulative crank revolutions
      lcet: event.target.value.getUint16(9, true), // last crank event time
    });
  }

  /**
   * Callback for the NRF disconnect event.
   * Consumers must not call this method!
   */
  onDisconnect(event) {
    console.log("disconnected");
    if (this.ccInterval)
      clearInterval(this.ccInterval);

    if (!this.handlers.disconnect) return;
    this.handlers.disconnect(event);
  }

  /**
   * Register an event handler.
   *
   * @param  {string} event     wheelEvent|crankEvent|value|disconnect
   * @param  {function} handler function that will receive the event as its first argument
   */
  on(event, handler) {
    this.handlers[event] = handler;
  }

  /**
   * Find and connect to a device which exposes the CSC service.
   *
   * @return {Promise}
   */
  connect() {
    // Register handler for the disconnect event to be passed throug
    NRF.on('disconnect', this.onDisconnect.bind(this));

    // Find a device, then get the CSC Service and subscribe to
    // notifications on the CSC Measurement characteristic.
    // NRF.setLowPowerConnection(true);
    return NRF.requestDevice({
      timeout: 5000,
      filters: [{ services: [SERVICE_UUID] }],
    }).then(device => {
      this.device = device;
      this.device.on('gattserverdisconnected', this.onDisconnect.bind(this));
      this.ccInterval = setInterval(this.checkConnection.bind(this), 2000);
      return device.gatt.connect();
    }).then(gatt => {
      this.gatt = gatt;
      return gatt.getPrimaryService(SERVICE_UUID);
    }).then(service => {
      return service.getCharacteristic(MEASUREMENT_UUID);
    }).then(characteristic => {
      characteristic.on('characteristicvaluechanged', this.onValue.bind(this));
      return characteristic.startNotifications();
    });
  }

  /**
   * Disconnect the device.
   */
  disconnect() {
    if (this.ccInterval)
      clearInterval(this.ccInterval);

    if (!this.gatt) return;
    try {
      this.gatt.disconnect();
    } catch {
      //
    }
  }
}

exports = BLECSC;
