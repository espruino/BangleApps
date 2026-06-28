exports.CORE_SERVICE_UUID = "00002100-5b1e-4347-b07c-97b514dae121";
exports.CORE_TEMP_UUID = "00002101-5b1e-4347-b07c-97b514dae121";
exports.CORE_CONTROL_POINT_UUID = "00002102-5b1e-4347-b07c-97b514dae121";
exports.HEALTH_THERMOMETER_SERVICE_UUID = "0x1809";
exports.TEMPERATURE_MEASUREMENT_UUID = "0x2a1c";
exports.BATTERY_SERVICE_UUID = "0x180f";
exports.BATTERY_LEVEL_UUID = "0x2a19";

exports.SUPPORTED_SERVICES = [
  exports.CORE_SERVICE_UUID,
  exports.BATTERY_SERVICE_UUID,
  exports.HEALTH_THERMOMETER_SERVICE_UUID
];

exports.SUPPORTED_CHARACTERISTIC_UUIDS = [
  exports.CORE_TEMP_UUID,
  exports.CORE_CONTROL_POINT_UUID,
  exports.TEMPERATURE_MEASUREMENT_UUID,
  exports.BATTERY_LEVEL_UUID
];

exports.OPCODES = {
  RESPONSE: 0x80,

  HRM_CLEAR_ANT: 0x01,
  HRM_PAIR_ANT: 0x02,
  HRM_PAIRED_COUNT: 0x04,
  HRM_PAIRED_ANT_ENTRY: 0x05,

  HRM_SCAN_ANT_START: 0x0A,
  HRM_SCAN_ANT_COUNT: 0x0B,
  HRM_SCAN_ANT_ENTRY: 0x0C,

  HRM_SEND_EXTERNAL_HR: 0x13
};

exports.dataViewToArray = function (dv) {
  var response = [];
  var i;
  if (!dv) return response;
  if (dv.length !== undefined && !dv.getUint8) {
    for (i = 0; i < dv.length; i++) response.push(dv[i]);
    return response;
  }
  for (i = 0; i < dv.byteLength; i++) response.push(dv.getUint8(i));
  return response;
};

exports.parseMeasurement = function (dv, batteryLevel) {
  var index = 0;
  var flags = dv.byteLength > index ? dv.getUint8(index++) : 0;
  var dataQuality;
  var hrState;
  var qualityAndState;
  function hasBytes(count) {
    return index + count <= dv.byteLength;
  }
  var data = {
    flags: flags,
    core: undefined,
    skin: undefined,
    unit: (flags & 0x08) ? "F" : "C",
    hr: 0,
    heatflux: undefined,
    hsiValid: !!(flags & 0x20),
    hsi: undefined,
    battery: batteryLevel || 0,
    dataQuality: undefined,
    hrState: undefined,
    qualityAndStateRaw: undefined
  };

  // CORE's custom characteristic is a compact little-endian packet:
  // flags, core temp, skin temp, heat flux, quality/state, HR, optional HSI.
  // Truncated packets still return partial data so callers can log/debug them.
  if (hasBytes(2)) data.core = dv.getInt16(index, true) / 100;
  index += 2;
  if (hasBytes(2)) data.skin = dv.getInt16(index, true) / 100;
  index += 2;
  if (hasBytes(2)) data.heatflux = dv.getInt16(index, true);
  index += 2;

  if (hasBytes(1)) {
    qualityAndState = dv.getUint8(index++);
    data.qualityAndStateRaw = qualityAndState;
  }
  if (hasBytes(1)) data.hr = dv.getUint8(index++);
  if (data.hsiValid && index < dv.byteLength) {
    data.hsi = dv.getUint8(index) / 10;
  }
  if (qualityAndState !== undefined) {
    // Low bits are CORE data quality; upper nibble carries external HR state.
    dataQuality = qualityAndState & 0x07;
    hrState = (qualityAndState >> 4) & 0x03;
    data.dataQuality = dataQuality;
    data.hrState = hrState;
  }
  return data;
};

exports.parseTemperatureMeasurement = function (dv, batteryLevel) {
  var flags = dv.byteLength > 0 ? dv.getUint8(0) : 0;
  var mantissa;
  var exponent;
  var raw;
  var core;
  if (dv.byteLength >= 5) {
    // Bluetooth Health Thermometer uses IEEE-11073 FLOAT: signed 24-bit
    // mantissa plus signed 8-bit base-10 exponent.
    raw = dv.getUint8(1) | (dv.getUint8(2) << 8) | (dv.getUint8(3) << 16);
    exponent = dv.getUint8(4);
    if (raw === 0x7FFFFF || raw === 0x7FFFFE || raw === 0x800002 || raw === 0x800000) {
      // Reserved NaN/+INF/-INF/NRes values map to the app's existing n/a sentinel.
      core = 327.67;
    } else {
      mantissa = raw & 0x800000 ? raw - 0x1000000 : raw;
      if (exponent & 0x80) exponent = exponent - 0x100;
      core = mantissa * Math.pow(10, exponent);
    }
  }
  return {
    flags: flags,
    core: core,
    skin: undefined,
    unit: (flags & 0x01) ? "F" : "C",
    hr: 0,
    heatflux: undefined,
    hsiValid: false,
    hsi: undefined,
    battery: batteryLevel || 0,
    dataQuality: undefined,
    hrState: undefined,
    qualityAndStateRaw: undefined,
    profile: "health_thermometer"
  };
};

exports.parseBattery = function (dv) {
  return dv.getUint8(0);
};

exports.parseResponse = function (dv) {
  var bytes = exports.dataViewToArray(dv);
  return {
    bytes: bytes,
    opCode: bytes[0],
    requestOpCode: bytes[1],
    resultCode: bytes[2],
    payload: bytes.slice(3)
  };
};

exports.parseCount = function (response) {
  return response && response.payload ? response.payload[0] || 0 : 0;
};

exports.parseAntEntry = function (response, index) {
  var payload = response && response.payload ? response.payload : [];
  return {
    index: index || 0,
    antId: (payload[0] || 0) | ((payload[1] || 0) << 8),
    txType: payload[2] || 0
  };
};

exports.makeAntPairParams = function (id, txType) {
  return [id & 0xFF, (id >> 8) & 0xFF, txType || ((id >> 16) & 0xFF)];
};
