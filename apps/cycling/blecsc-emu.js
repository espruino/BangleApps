// UUID of the Bluetooth CSC Service
//const SERVICE_UUID = "1816";
// UUID of the CSC measurement characteristic
const MEASUREMENT_UUID = "2a5b";

// Wheel revolution present bit mask
const FLAGS_WREV_BM = 0x01;
// Crank revolution present bit mask
const FLAGS_CREV_BM = 0x02;

/**
 * Fake BLECSC implementation for the emulator, where it's hard to test
 * with actual hardware. Generates "random" wheel events (no crank).
 *
 * To upload as a module, paste the entire file in the console using this
 * command: require("Storage").write("blecsc-emu",`<FILE CONTENT HERE>`);
 */
class BLECSCEmulator {
  constructor() {
    this.timeout = undefined;
    this.interval = 500;
    this.ccr = 0;
    this.lwt = 0;
    this.handlers = {
      // value
      // disconnect
      // wheelEvent
      // crankEvent
    };
  }

  getDeviceAddress() {
    return 'fa:ke:00:de:vi:ce';
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
   * Register an event handler.
   *
   * @param  {string} event   value|disconnect
   * @param  {function} handler handler function that receives the event as its first argument
   */
  on(event, handler) {
    this.handlers[event] = handler;
  }

  fakeEvent() {
    this.interval = Math.max(50, Math.min(1000, this.interval + Math.random()*40-20));
    this.lwt = (this.lwt + this.interval) % 0x10000;
    this.ccr++;

    var buffer = new ArrayBuffer(8);
    var view = new DataView(buffer);
    view.setUint8(0, 0x01); // Wheel revolution data present bit
    view.setUint32(1, this.ccr, true); // Cumulative crank revolutions
    view.setUint16(5, this.lwt, true); // Last wheel event time

    this.onValue({
      target: {
        uuid: "0x2a5b",
        value: view,
      },
    });

    this.timeout = setTimeout(this.fakeEvent.bind(this), this.interval);
  }

  /**
   * Find and connect to a device which exposes the CSC service.
   *
   * @return {Promise}
   */
  connect() {
    this.timeout = setTimeout(this.fakeEvent.bind(this), this.interval);
    return Promise.resolve(true);
  }

  /**
   * Disconnect the device.
   */
  disconnect() {
    if (!this.timeout) return;
    clearTimeout(this.timeout);
  }
}

exports = BLECSCEmulator;
