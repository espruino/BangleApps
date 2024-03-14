/**
 * Copyright reelyActive 2017-2022
 * We believe in an open Internet of Things
 *
 * DirAct is jointly developed by reelyActive and Code Blue Consulting
 */

// User-configurable constants
const INSTANCE_ID = [ 0x00, 0x00, 0x00, 0x01 ];
const NAMESPACE_FILTER_ID = [ 0xc0, 0xde, 0xb1, 0x0e, 0x1d,
                              0xd1, 0xe0, 0x1b, 0xed, 0x0c ];
const EXCITER_INSTANCE_IDS = new Uint32Array([ 0xe8c17e45 ]);
const RESETTER_INSTANCE_IDS = new Uint32Array([ 0x4e5e77e4 ]);
const PROXIMITY_RSSI_THRESHOLD = -85;
const PROXIMITY_LED_RSSI_THRESHOLD = -85;
const PROXIMITY_TABLE_SIZE = 8;
const DIGEST_TABLE_SIZE = 32;
const OBSERVE_PERIOD_MILLISECONDS = 400;
const BROADCAST_PERIOD_MILLISECONDS = 1600;
const BROADCAST_DIGEST_PAGE_MILLISECONDS = 400;
const PROXIMITY_PACKET_INTERVAL_MILLISECONDS = 200;
const DIGEST_PACKET_INTERVAL_MILLISECONDS = 100;
const DIGEST_TIME_CYCLE_THRESHOLD = 86400;
const EXCITER_HOLDOFF_SECONDS = 60;
const BLINK_ON_PROXIMITY = true;
const BLINK_ON_DISTANCING = true;
const BLINK_ON_DIGEST = true;
const BLINK_ON_RESET = true;


// Eddystone protocol constants
const EDDYSTONE_UUID = 'feaa';
const EDDYSTONE_UID_FRAME = 0x00;
const EDDYSTONE_NAMESPACE_OFFSET = 2;
const EDDYSTONE_NAMESPACE_LENGTH = 10;
const EDDYSTONE_INSTANCE_OFFSET = 14;


// DirAct constants
const DIRACT_MANUFACTURER_ID = 0x0583;  // Code Blue Consulting
const DIRACT_PROXIMITY_FRAME = 0x01;
const DIRACT_DIGEST_FRAME = 0x11;
const DIRACT_DEFAULT_COUNT_LENGTH = 0x07;
const DIRACT_INSTANCE_LENGTH = 4;
const DIRACT_INSTANCE_OFFSET = 2;
const MAX_NUMBER_STRONGEST = 3;
const MAX_BATTERY_VOLTAGE = 3.3;
const MIN_BATTERY_VOLTAGE = 3.0;
const MAX_RSSI_TO_ENCODE = -28;
const MIN_RSSI_TO_ENCODE = -92;
const MAX_ACCELERATION_TO_ENCODE = 2;
const MAX_ACCELERATION_MAGNITUDE = 0x1f;
const INVALID_ACCELERATION_CODE = 0x20;
const SCAN_OPTIONS = {
    filters: [
      { manufacturerData: { 0x0583: {} } },
      { services: [ EDDYSTONE_UUID ] }
    ]
};


// Other constants
const BITS_PER_BYTE = 8;
const DUMMY_INSTANCE_ID = 0;
const DUMMY_RSSI = MIN_RSSI_TO_ENCODE;


// Global variables
let proximityInstances = new Uint32Array(PROXIMITY_TABLE_SIZE);
let proximityRssis = new Int8Array(PROXIMITY_TABLE_SIZE);
let digestInstances = new Uint32Array(DIGEST_TABLE_SIZE);
let digestCounts = new Uint16Array(DIGEST_TABLE_SIZE);
let digestTime = new Uint8Array([ 0, 0, 0 ]);
let numberOfDigestPages = 0;
let sensorData = [ 0x82, 0x08, 0x3f ];
let cyclicCount = 0;
let encodedBattery = 0;
let lastDigestTime = Math.round(getTime());
let lastResetTime = Math.round(getTime());
let isExciterPresent = false;
let isResetterPresent = false;
let isProximityDetected = false;
let menu = {
  "": { "title": "--  DirAct  --" }
};


/**
 * Initiate observer mode, scanning for devices in proximity.
 */
function observe() { 
  proximityInstances.fill(DUMMY_INSTANCE_ID);         // Reset proximity
  proximityRssis.fill(DUMMY_RSSI);                    //   table data
  isExciterPresent = false;
  isResetterPresent = false;
  
  NRF.setScan(handleDiscoveredDevice, SCAN_OPTIONS);  // Start scanning
  setTimeout(broadcast, OBSERVE_PERIOD_MILLISECONDS); // ...until period end
}


/**
 * Compile the scan results and initiate broadcaster mode, advertising either
 * proximity or digest packets, in consequence.
 */
function broadcast() {
  NRF.setScan();                                     // Stop scanning

  let sortedProximityIndices = getSortedIndices(proximityRssis);

  updateDigestTable(sortedProximityIndices);
  updateSensorData();

  let currentTime = Math.round(getTime());
  let isExcited = isExciterPresent &&
                  ((currentTime - lastDigestTime) > EXCITER_HOLDOFF_SECONDS);

  if(isResetterPresent) {
    if(BLINK_ON_RESET) {
      Bangle.setLCDPower(true);
    }
    lastResetTime = currentTime;
    resetDigest();
    broadcastProximity(sortedProximityIndices);
  }
  else if(isExcited) {
    let sortedDigestIndices = getSortedIndices(digestCounts);
    compileDigest();
    broadcastDigest(sortedDigestIndices, 0);
  }
  else {
    broadcastProximity(sortedProximityIndices);
  }
}


/**
 * Initiate broadcaster mode advertising proximity packets.
 * @param {TypedArray} sortedIndices The sorted proximity table indices.
 */
function broadcastProximity(sortedIndices) {
  let advertisingOptions = {
      interval: PROXIMITY_PACKET_INTERVAL_MILLISECONDS,
      showName: false,
      manufacturer: DIRACT_MANUFACTURER_ID
  };

  advertisingOptions.manufacturerData = compileProximityData(sortedIndices);
  NRF.setAdvertising({}, advertisingOptions);         // Start advertising
  setTimeout(observe, BROADCAST_PERIOD_MILLISECONDS); // ...until period end
}


/**
 * Initiate broadcaster mode advertising digest packets.
 * @param {TypedArray} sortedIndices The sorted digest table indices.
 * @param {Number} pageNumber The page number to broadcast.
 */
function broadcastDigest(sortedIndices, pageNumber) {
  let isLastPage = (pageNumber === (numberOfDigestPages - 1));
  let advertisingOptions = {
      interval: DIGEST_PACKET_INTERVAL_MILLISECONDS,
      showName: false,
      manufacturer: DIRACT_MANUFACTURER_ID
  };

  advertisingOptions.manufacturerData = compileDigestData(sortedIndices,
                                                          pageNumber);
  NRF.setAdvertising({}, advertisingOptions);         // Start advertising

  if(isLastPage) {
    setTimeout(observe, BROADCAST_DIGEST_PAGE_MILLISECONDS);
    if(getTime() > DIGEST_TIME_CYCLE_THRESHOLD) {
      lastResetTime = Math.round(getTime());
      resetDigest();
    }
    if(BLINK_ON_DIGEST) {
      Bangle.setLCDPower(true);
    }
  }
  else {
    setTimeout(broadcastDigest, BROADCAST_DIGEST_PAGE_MILLISECONDS,
               sortedIndices, ++pageNumber);
  }
}


/**
 * Handle the given device discovered on scan and process further if
 * Eddystone-UID or DirAct.
 * @param {BluetoothDevice} device The discovered device.
 */
function handleDiscoveredDevice(device) {
  let isEddystone = (device.hasOwnProperty('services') &&
                     device.hasOwnProperty('serviceData') &&
                     (device.services[0] === EDDYSTONE_UUID));
  let isManufacturer = (device.hasOwnProperty('manufacturer') &&
                        device.manufacturer === DIRACT_MANUFACTURER_ID);
  
  if(isEddystone) {
    let isEddystoneUID = (device.serviceData[EDDYSTONE_UUID][0] ===
                          EDDYSTONE_UID_FRAME);
    if(isEddystoneUID) {
      handleEddystoneUidDevice(device.serviceData[EDDYSTONE_UUID], device.rssi);
    }
  }
  else if(isManufacturer) {
    let isDirAct = ((device.manufacturerData[0] === DIRACT_PROXIMITY_FRAME) ||
                    (device.manufacturerData[0] === DIRACT_DIGEST_FRAME));
    if(isDirAct) {
      handleDirActDevice(device.manufacturerData, device.rssi);
    }
  }
}


/**
 * Handle the given Eddystone-UID device, adding to the devices in range if
 * it meets the filter criteria.
 * @param {Array} serviceData The Eddystone service data.
 * @param {Number} rssi The received signal strength.
 */
function handleEddystoneUidDevice(serviceData, rssi) {
  for(let cByte = 0; cByte < EDDYSTONE_NAMESPACE_LENGTH; cByte++) {
    let namespaceIndex = EDDYSTONE_NAMESPACE_OFFSET + cByte;
    if(serviceData[namespaceIndex] !== NAMESPACE_FILTER_ID[cByte]) {
      return;
    }
  }
  
  let instanceId = 0;
  let bitShift = (DIRACT_INSTANCE_LENGTH - 1) * BITS_PER_BYTE;

  for(let cByte = 0; cByte < DIRACT_INSTANCE_LENGTH; cByte++) {
    let instanceByte = serviceData[EDDYSTONE_INSTANCE_OFFSET + cByte];
    instanceId += instanceByte << bitShift;
    bitShift -= BITS_PER_BYTE;
  }

  let unsignedInstanceId = new Uint32Array([instanceId])[0];

  if(EXCITER_INSTANCE_IDS.indexOf(unsignedInstanceId) >= 0) {
    isExciterPresent = true;
  }
  else if(RESETTER_INSTANCE_IDS.indexOf(unsignedInstanceId) >= 0) {
    isResetterPresent = true;
  }
  else {
    updateProximityTable(instanceId, rssi);
  }
}


/**
 * Handle the given DirAct device, adding to the devices in range if
 * it meets the filter criteria.
 * @param {Array} manufacturerData The DirAct manufacturer data.
 * @param {Number} rssi The received signal strength.
 */
function handleDirActDevice(manufacturerData, rssi) {
  let instanceId = 0;
  let bitShift = (DIRACT_INSTANCE_LENGTH - 1) * BITS_PER_BYTE;
  
  for(let cByte = DIRACT_INSTANCE_OFFSET;
      cByte < DIRACT_INSTANCE_OFFSET + DIRACT_INSTANCE_LENGTH; cByte++) {
    let instanceByte = manufacturerData[cByte];
    instanceId += instanceByte << bitShift;
    bitShift -= BITS_PER_BYTE;
  }
  
  updateProximityTable(instanceId, rssi);
}


/**
 * Update the proximity table with the given instance's RSSI.  If the instance
 * already exists, combine RSSI values in a weighted average.
 * @param {String} instanceId The DirAct 4-byte instance id as a 32-bit integer.
 * @param {Number} rssi The received signal strength.
 */
function updateProximityTable(instanceId, rssi) {
  let instanceIndex = proximityInstances.indexOf(instanceId);
  let isNewInstance = (instanceIndex < 0);

  if(isNewInstance) {
     let nextIndex = proximityInstances.indexOf(DUMMY_INSTANCE_ID);
     if(nextIndex >= 0) {
       proximityInstances[nextIndex] = instanceId;
       proximityRssis[nextIndex] = rssi;
     }
  }
  else {
    proximityRssis[instanceIndex] = (proximityRssis[instanceIndex] + rssi) / 2;
  }
}


/**
 * Update the digest table based on the proximity table and its sorted indices.
 * @param {TypedArray} sortedIndices The sorted proximity table indices.
 */
function updateDigestTable(sortedIndices) {
  for(let cInstance = 0; cInstance < PROXIMITY_TABLE_SIZE; cInstance++) {
    let proximityIndex = sortedIndices[cInstance];

    if(proximityRssis[proximityIndex] >= PROXIMITY_RSSI_THRESHOLD) {
      let instanceId = proximityInstances[proximityIndex];
      let instanceIndex = digestInstances.indexOf(instanceId);
      let isNewInstance = (instanceIndex < 0);

      if(isNewInstance) {
         let nextIndex = digestInstances.indexOf(DUMMY_INSTANCE_ID);
         if(nextIndex >= 0) {
           digestInstances[nextIndex] = instanceId;
           digestCounts[nextIndex] = 1;
         }
      }
      else if(digestCounts[instanceIndex] < 65535) {
        digestCounts[instanceIndex]++;
      }
    }
    else {
      cInstance = PROXIMITY_TABLE_SIZE; // Break
    }
  }
}


/*
 * Compile the digest from the digest table.
 */
function compileDigest() {
  let numberOfEntries = digestCounts.findIndex(count => count === 0);
  let currentTime = Math.round(getTime());
  let elapsedTime = currentTime - lastResetTime;
  if(numberOfEntries < 0) {
    numberOfEntries = DIGEST_TABLE_SIZE;
  }
  digestTime[0] = (elapsedTime >> 16) & 0xff;
  digestTime[1] = (elapsedTime >> 8) & 0xff;
  digestTime[2] = elapsedTime & 0xff;
  numberOfDigestPages = Math.max(1, Math.min(8, Math.ceil(numberOfEntries/3)));
  lastDigestTime = currentTime;
}


/*
 * Clear the digest table.
 */
function resetDigest() {
  digestInstances.fill(DUMMY_INSTANCE_ID);
  digestCounts.fill(0);
}


/**
 * Compile the DirAct proximity data.
 * @param {TypedArray} sortedIndices The sorted proximity table indices.
 */
function compileProximityData(sortedIndices) {
  let data = [
    DIRACT_PROXIMITY_FRAME, DIRACT_DEFAULT_COUNT_LENGTH,
    INSTANCE_ID[0], INSTANCE_ID[1], INSTANCE_ID[2], INSTANCE_ID[3],
    sensorData[0], sensorData[1], sensorData[2]
  ];
  let isNewProximityDetected = false;

  for(let cInstance = 0; cInstance < MAX_NUMBER_STRONGEST; cInstance++) {
    let index = sortedIndices[cInstance];

    if(proximityRssis[index] >= PROXIMITY_RSSI_THRESHOLD) {
      let instanceId = proximityInstances[index];
      data.push((instanceId >> 24) & 0xff, (instanceId >> 16) & 0xff,
                (instanceId >> 8) & 0xff, instanceId & 0xff,
                encodeRssi(proximityRssis[index]));
      if(proximityRssis[index] >= PROXIMITY_LED_RSSI_THRESHOLD) {
        isNewProximityDetected = true;
      }
    }
    else {
      cInstance = PROXIMITY_TABLE_SIZE; // Break
    }
  }

  cyclicCount = (cyclicCount + 1) % 8;
  
  data[1] = (cyclicCount << 5) + (data.length - 2);

  if(isProximityDetected && !isNewProximityDetected && BLINK_ON_DISTANCING) {
    Bangle.setLCDPower(true);
  }
  else if(isNewProximityDetected && BLINK_ON_PROXIMITY) {
    Bangle.setLCDPower(true);
  }
  isProximityDetected = isNewProximityDetected;
  
  return data;
}


/**
 * Compile the DirAct digest data.
 * @param {TypedArray} sortedIndices The sorted digest table indices.
 * @param {Number} digestPage The page of the digest to compile.
 */
function compileDigestData(sortedIndices, digestPage) {
  let isLastPage = (digestPage === (numberOfDigestPages - 1));

  let digestStatus = digestTime[0] & 0x7f;
  if(isLastPage) {
    digestStatus |= 0x80;
  }

  let data = [
    DIRACT_DIGEST_FRAME, DIRACT_DEFAULT_COUNT_LENGTH,
    INSTANCE_ID[0], INSTANCE_ID[1], INSTANCE_ID[2], INSTANCE_ID[3],
    digestStatus, digestTime[1], digestTime[2]
  ];
  let pageIndex = digestPage * 3;

  for(let cInstance = pageIndex; cInstance < (pageIndex + 3); cInstance++) {
    let index = sortedIndices[cInstance];

    if(digestCounts[index] > 0) {
      let instanceId = digestInstances[index];
      let encodedCount = digestCounts[index];
      if(encodedCount > 127) {
        encodedCount = 0x80 | (Math.min((encodedCount >> 8), 0x7f) & 0x7f);
      }
      data.push((instanceId >> 24) & 0xff, (instanceId >> 16) & 0xff,
                (instanceId >> 8) & 0xff, instanceId & 0xff,
                encodedCount);
    }
    else {
      cInstance = pageIndex + 3; // Break
    }
  }

  data[1] = (digestPage << 5) + (data.length - 2);

  return data;
}


/**
 * Encode the given RSSI.
 * @param {Number} rssi The given RSSI.
 * @return {Number} The encoded RSSI.
 */
function encodeRssi(rssi) {
  rssi = Math.round(rssi);
  
  if(rssi >= MAX_RSSI_TO_ENCODE) {
    return 0x3f;
  }
  if(rssi <= MIN_RSSI_TO_ENCODE) {
    return 0x00;
  }
  return rssi - MIN_RSSI_TO_ENCODE;
}


/**
 * Encode the battery percentage.
 * @return {Number} The battery percentage.
 */
function encodeBatteryPercentage() {
  let voltage = NRF.getBattery();

  if(voltage <= MIN_BATTERY_VOLTAGE) {
    return 0x00;
  }
  if(voltage >= MAX_BATTERY_VOLTAGE) {
    return 0x3f;
  }

  return Math.round(0x3f * (voltage - MIN_BATTERY_VOLTAGE) /
         (MAX_BATTERY_VOLTAGE - MIN_BATTERY_VOLTAGE));
}


/**
 * Encode the acceleration.
 * @return {Array} The encoded acceleration [ x, y, z ].
 */
function encodeAcceleration() {
  let encodedAcceleration = { x: INVALID_ACCELERATION_CODE,
                              y: INVALID_ACCELERATION_CODE,
                              z: INVALID_ACCELERATION_CODE };

  let acceleration = { x: Bangle.getAccel().x,
                       y: Bangle.getAccel().y,
                       z: Bangle.getAccel().z };

  for(let axis in acceleration) {
    let magnitude = acceleration[axis];
    let encodedMagnitude = Math.min(MAX_ACCELERATION_MAGNITUDE,
                                    Math.round(MAX_ACCELERATION_MAGNITUDE *
                                               (Math.abs(magnitude) /
                                               MAX_ACCELERATION_TO_ENCODE)));
    if(magnitude < 0) {
      encodedMagnitude = 0x3f - encodedMagnitude;
    }
    encodedAcceleration[axis] = encodedMagnitude;
  }

  return encodedAcceleration;
}


/**
 * Update the sensor data (battery & acceleration) for the advertising packet.
 */
function updateSensorData() {
  
  // Update the battery measurement each time the cyclic count resets
  if(cyclicCount === 0) {
    encodedBattery = encodeBatteryPercentage();
  }

  let encodedAcceleration = encodeAcceleration();

  sensorData[0] = ((encodedAcceleration.x << 2) & 0xfc) |
                  ((encodedAcceleration.y >> 4) & 0x3f);
  sensorData[1] = ((encodedAcceleration.y << 4) & 0xf0) |
                  ((encodedAcceleration.z >> 2) & 0x0f);
  sensorData[2] = ((encodedAcceleration.z << 6) & 0xc0) |
                  (encodedBattery & 0x3f);
}


/**
 * Determine the sorted order of the indices of the given array.
 * @return {Uint8Array} The array of indices sorted in descending order.
 */
function getSortedIndices(unsortedArray) {
  let sortedIndices = new Uint8Array(unsortedArray.length);

  sortedIndices.forEach((value, index) => sortedIndices[index] = index);
  sortedIndices.sort((a, b) => unsortedArray[b] - unsortedArray[a]);

  return sortedIndices;
}


// On start: begin DirAct operation and display the menu
g.clear();
E.showMenu(menu);
observe();
